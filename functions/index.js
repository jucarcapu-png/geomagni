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

// ---------------------------------------------------------------- Wompi (Colombia)
// Dos funciones:
//  · firmarPagoWompi (la llama la página de planes): calcula el valor desde precios.json y la firma de
//    integridad SHA-256(referencia + centavos + moneda + secreto de integridad) que exige el checkout.
//  · avisoWompi (la llama Wompi): recibe el evento transaction.updated, verifica su checksum con el
//    secreto de eventos y resuelve el pedido. Su dirección se registra en Wompi como «URL de eventos».
// Secretos (firebase functions:secrets:set …): WOMPI_INTEGRIDAD y WOMPI_EVENTOS, de Wompi › Desarrolladores.

const crypto = require("crypto");
const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const WOMPI_INTEGRIDAD = defineSecret("WOMPI_INTEGRIDAD");
const WOMPI_EVENTOS = defineSecret("WOMPI_EVENTOS");

const sha256 = (texto) => crypto.createHash("sha256").update(texto, "utf8").digest("hex");

function igualesSeguro(a, b) {
  const x = Buffer.from(String(a).toLowerCase()), y = Buffer.from(String(b).toLowerCase());
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

exports.firmarPagoWompi = onCall({ secrets: [WOMPI_INTEGRIDAD], enforceAppCheck: false }, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Inicie sesión para comprar.");
  const id = String((req.data && req.data.pedido) || "");
  if (!/^[A-Za-z0-9]{10,40}$/.test(id)) throw new HttpsError("invalid-argument", "Pedido no válido.");
  const sp = await db.collection("pedidos").doc(id).get();
  if (!sp.exists) throw new HttpsError("not-found", "El pedido no existe.");
  const p = sp.data();
  if (p.uid !== req.auth.uid) throw new HttpsError("permission-denied", "El pedido no es suyo.");
  if (p.estado !== "pendiente") throw new HttpsError("failed-precondition", "El pedido ya fue resuelto.");
  const precios = await leerPrecios();
  const plan = precios.planes[p.plan];
  const valor = plan && !plan.gratis ? plan[p.periodo] : null;
  if (precios.muestra || !valor || p.valor !== valor || precios.moneda !== "COP")
    throw new HttpsError("failed-precondition", "El pago en línea todavía no está disponible para este plan.");
  const centavos = Math.round(valor * 100);
  return { centavos, moneda: "COP", firma: sha256(id + centavos + "COP" + WOMPI_INTEGRIDAD.value()) };
});

// Valor de una ruta «transaction.id» dentro de data del evento.
function valorEn(obj, ruta) {
  return ruta.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

exports.avisoWompi = onRequest({ secrets: [WOMPI_EVENTOS] }, async (req, res) => {
  if (req.method !== "POST") { res.status(405).send("Método no permitido"); return; }
  const ev = req.body || {};
  const firma = ev.signature || {};
  if (!Array.isArray(firma.properties) || !firma.checksum || ev.timestamp == null || !ev.data) {
    res.status(400).send("Evento incompleto"); return;
  }
  const cadena = firma.properties.map((r) => String(valorEn(ev.data, r))).join("") + ev.timestamp + WOMPI_EVENTOS.value();
  if (!igualesSeguro(sha256(cadena), firma.checksum)) {
    logger.warn("Aviso de Wompi con firma inválida", { evento: ev.event });
    res.status(401).send("Firma inválida"); return;
  }
  const t = ev.data.transaction;
  if (ev.event !== "transaction.updated" || !t || !t.reference) { res.status(200).send("ignorado"); return; }
  if (t.status === "PENDING") { res.status(200).send("pendiente"); return; }
  await resolverPedido(t.reference, {
    aprobado: t.status === "APPROVED",
    valor: Number(t.amount_in_cents) / 100,
    moneda: t.currency,
    pasarela: "Wompi",
    transaccion: t.id
  });
  res.status(200).send("ok");
});

// resolverPedido no se exporta: Firebase solo publica funciones con disparador.
