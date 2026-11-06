// GEOMAGNI · activación automática de licencias de pago (PAG-001)
//
// Flujo: la página de planes guarda un pedido «pendiente» en Firestore (pedidos/{id}) y lleva al
// cliente a la pasarela con ese id como referencia. Cuando la pasarela confirma el resultado, su
// aviso llega a una función de este archivo, que comprueba la firma del aviso y llama a
// resolverPedido(). Esta compara el valor pagado con precios.json y, si coincide, crea o extiende
// la licencia de pago en licencias/{uid}. Las reglas de Firestore impiden hacer eso desde el
// navegador: solo este programa puede marcar un pedido como pagado.
//
// Publicación: ver FIREBASE.md, sección «Pagos».

const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp, FieldValue } = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");

initializeApp();
const db = getFirestore();

// Misma fuente de precios que muestra la página de planes.
const PRECIOS_URL = "https://jucarcapu-png.github.io/geomagni/precios.json";

async function leerPrecios() {
  const r = await fetch(PRECIOS_URL, { cache: "no-store" });
  if (!r.ok) throw new Error("No se pudo leer precios.json (" + r.status + ")");
  return r.json();
}

function sumarPeriodo(desde, periodo) {
  const d = new Date(desde.getTime());
  if (periodo === "anual") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}

/**
 * Aprueba o rechaza un pedido con el resultado que confirmó la pasarela. Es idempotente: si la
 * pasarela repite el aviso, un pedido ya resuelto no se vuelve a tocar.
 * @param {string} pedidoId  referencia enviada a la pasarela (id del documento pedidos/{id})
 * @param {{aprobado: boolean, valor: number, moneda: string, pasarela: string, transaccion: string}} pago
 * @returns {Promise<string>} resultado, para el registro
 */
async function resolverPedido(pedidoId, pago) {
  const precios = await leerPrecios();
  const refPedido = db.collection("pedidos").doc(String(pedidoId));
  const resultado = await db.runTransaction(async (tx) => {
    const sp = await tx.get(refPedido);
    if (!sp.exists) return "pedido inexistente";
    const p = sp.data();
    if (p.estado !== "pendiente") return "ya resuelto (" + p.estado + ")";
    const refLic = db.collection("licencias").doc(p.uid);
    const sl = await tx.get(refLic); // todas las lecturas antes de escribir

    const comun = { pasarela: pago.pasarela, transaccion: String(pago.transaccion || ""), resuelto: FieldValue.serverTimestamp() };
    if (!pago.aprobado) {
      tx.update(refPedido, Object.assign({ estado: "rechazado" }, comun));
      return "rechazado";
    }
    const plan = precios.planes[p.plan];
    const esperado = plan && !plan.gratis ? plan[p.periodo] : null;
    if (precios.muestra || !esperado || p.valor !== esperado || Number(pago.valor) !== esperado || pago.moneda !== precios.moneda) {
      // Nunca se activa una licencia con un valor distinto al publicado: queda para revisión manual.
      tx.update(refPedido, Object.assign({ estado: "revisar", motivo: "El valor o el plan no coinciden con precios.json" }, comun));
      return "revisar";
    }
    // Si ya tiene un plan vigente, el periodo nuevo se suma a partir de su vencimiento.
    const ahora = new Date();
    const actual = sl.exists ? sl.data() : null;
    const base = actual && actual.tipo === "pago" && actual.vence && actual.vence.toDate() > ahora ? actual.vence.toDate() : ahora;
    tx.set(refLic, {
      tipo: "pago",
      plan: p.plan,
      periodo: p.periodo,
      equipos: plan.equipos || 1,
      vence: Timestamp.fromDate(sumarPeriodo(base, p.periodo)),
      creado: FieldValue.serverTimestamp(),
      pedido: refPedido.id
    });
    tx.update(refPedido, Object.assign({ estado: "aprobado" }, comun));
    return "aprobado";
  });
  logger.info("Pedido " + pedidoId + ": " + resultado, { pasarela: pago.pasarela, transaccion: pago.transaccion });
  return resultado;
}

// ---------------------------------------------------------------- Avisos de la pasarela
// Cada pasarela envía su aviso (webhook) con un formato y una firma propios. Cuando se elija la
// pasarela se agrega aquí su función, por ejemplo:
//
//   const { onRequest } = require("firebase-functions/v2/https");
//   const { defineSecret } = require("firebase-functions/params");
//   const SECRETO = defineSecret("PASARELA_SECRETO_EVENTOS");
//   exports.avisoPasarela = onRequest({ secrets: [SECRETO] }, async (req, res) => {
//     // 1. Verificar la firma del aviso con SECRETO.value(); si no coincide, responder 401.
//     // 2. Leer la referencia (id del pedido), el estado, el valor y la moneda de la transacción.
//     // 3. await resolverPedido(referencia, { aprobado, valor, moneda, pasarela: "...", transaccion });
//     res.status(200).send("ok");
//   });
//
// La dirección de esa función se registra en el panel de la pasarela como «URL de eventos».

module.exports = { resolverPedido };
