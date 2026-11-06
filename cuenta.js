// GEOMAGNI · cuentas de usuario y licencias de TRAMA (Firebase Authentication + Firestore)
// Guía de configuración: FIREBASE.md

// ================= CONFIGURACIÓN =================
// Pegue aquí la configuración web de su proyecto Firebase
// (Consola de Firebase › Configuración del proyecto › Tus apps › SDK de Firebase › Configuración).
// Estos valores identifican el proyecto y pueden ser públicos; la seguridad la dan las reglas de firestore.rules.
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC82TKGq1keu-hpFquCLjNoxI9GxhXT0dY",
  authDomain: "usuarios-geomagni.firebaseapp.com",
  projectId: "usuarios-geomagni",
  // Activar cuando Storage esté configurado y los instaladores subidos:
  // storageBucket: "usuarios-geomagni.firebasestorage.app",
  storageBucket: "",
  appId: "1:1008376057828:web:a7d38ebc53b046322741f1"
};
const DIAS_PRUEBA = 7;
// Archivos de TRAMA en Firebase Storage (carpeta «instaladores»). Solo se entregan con licencia vigente (storage.rules).
const INSTALADORES = [
  { ruta: "instaladores/Instalar-TRAMA-1.5.703.exe", texto: "Descargar instalador", detalle: "Windows 10/11 · 46,5 MB" },
  { ruta: "instaladores/TRAMA-1.5.703-portable.zip", texto: "Descargar versión portátil", detalle: "Sin instalar · 46,4 MB" }
];
// Dominios aceptados para la licencia estudiantil (correo institucional).
const CORREO_ACADEMICO = /\.edu(\.[a-z]{2})?$/i;
// Proveedores de correo personal: nunca valen para la licencia estudiantil.
const CORREO_PERSONAL = /@(gmail|googlemail|hotmail|outlook|live|msn|yahoo|ymail|icloud|me|mac|aol|proton|protonmail|gmx|zoho|yandex|mail)\./i;
// Pasarela de pagos (PAG-001). Mientras «iniciar» sea null los botones dicen «Pago en línea próximamente».
// Al elegir la pasarela se completa esta función: recibe el pedido ya guardado en Firestore
// ({ id, plan, nombre, periodo, valor, moneda, correo }) y lleva al cliente a pagar con «id» como referencia.
// La licencia la crea Firebase (functions/index.js) cuando la pasarela confirma el pago.
const PASARELA = { nombre: "", iniciar: null };
// =================================================

const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const configurado = !!(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);

const ERRORES = {
  "auth/email-already-in-use": "Ya existe una cuenta con ese correo. Inicie sesión o recupere su contraseña.",
  "auth/invalid-email": "El correo no es válido.",
  "auth/weak-password": "La contraseña debe tener al menos 8 caracteres.",
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/wrong-password": "Correo o contraseña incorrectos.",
  "auth/user-not-found": "Correo o contraseña incorrectos.",
  "auth/too-many-requests": "Demasiados intentos. Espere unos minutos e inténtelo de nuevo.",
  "auth/network-request-failed": "Sin conexión. Revise su internet.",
  "permission-denied": "La solicitud no cumple las condiciones de la licencia."
};
const mensajeError = (e) => ERRORES[e && e.code] || "No fue posible completar la operación. Inténtelo de nuevo.";

function avisar(form, texto, clase) {
  const n = $(".formulario__nota", form) || $("#estadoCuenta");
  if (!n) return;
  n.textContent = texto;
  n.className = (n.id === "estadoCuenta" ? "" : "formulario__nota") + (clase ? " " + clase : "");
}
function ocupado(form, si) { $$("button", form).forEach((b) => (b.disabled = si)); }

function validar(form) {
  let primero = null;
  const correo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  $$("[required]", form).forEach((c) => {
    let malo = c.type === "checkbox" ? !c.checked : c.type === "email" ? !correo.test(c.value.trim()) : !c.value.trim();
    if (!malo && c.name === "clave" && c.value.length < 8) malo = true;
    if (!malo && c.name === "clave2") malo = c.value !== form.clave.value;
    c.classList.toggle("invalido", malo);
    c.setAttribute("aria-invalid", malo ? "true" : "false");
    if (malo && !primero) primero = c;
  });
  if (primero) {
    const t = primero.type === "checkbox"
      ? (primero.name === "terminos" ? "Debe aceptar los términos y condiciones de uso." : "Debe aceptar la política de tratamiento de datos.")
      : primero.name === "clave" ? "La contraseña debe tener al menos 8 caracteres."
      : primero.name === "clave2" ? "Las contraseñas no coinciden." : "Revise los campos marcados.";
    avisar(form, t, "error");
    primero.focus();
    return false;
  }
  return true;
}

// Fecha de vencimiento de una licencia (misma regla que aplica TRAMA)
export function vencimiento(lic) {
  if (lic.tipo === "pago") return lic.vence && lic.vence.toDate ? lic.vence.toDate() : new Date(lic.vence);
  const creado = lic.creado && lic.creado.toDate ? lic.creado.toDate() : new Date(lic.creado);
  if (lic.tipo === "estudiante") {
    const ini = lic.inicio.toDate ? lic.inicio.toDate() : new Date(lic.inicio);
    const v = new Date(ini);
    v.setFullYear(v.getFullYear() + Number(lic.duracionAnios));
    return v;
  }
  return new Date(creado.getTime() + DIAS_PRUEBA * 86400000);
}

function sinConfigurar() {
  $$("[data-cuenta]").forEach((el) => (el.hidden = el.dataset.cuenta !== "pronto"));
}

async function iniciar() {
  if (!configurado) { sinConfigurar(); return; }
  const [{ initializeApp }, A, F] = await Promise.all([
    import(SDK + "firebase-app.js"), import(SDK + "firebase-auth.js"), import(SDK + "firebase-firestore.js")
  ]);
  const app = initializeApp(FIREBASE_CONFIG);
  const auth = A.getAuth(app);
  auth.languageCode = "es";
  const db = F.getFirestore(app);
  sesion = { auth, db, F };
  const urlCuenta = new URL("cuenta.html", location.href).href;

  // ---------- Inscripción ----------
  const fIns = $("#formInscripcion");
  if (fIns) {
    const esEst = () => fIns.perfil.value === "estudiante";
    const bloqueEst = $("#bloqueEstudiante");
    const actualizar = () => {
      bloqueEst.hidden = !esEst();
      $$("input, select", bloqueEst).forEach((c) => (c.required = esEst()));
      $("#ayudaCorreo").textContent = esEst()
        ? "Use su correo institucional (termina en .edu o .edu.co): así validamos que es estudiante."
        : "Le enviaremos un enlace para confirmarlo.";
    };
    $$('[name="perfil"]', fIns).forEach((r) => r.addEventListener("change", actualizar));
    if (new URLSearchParams(location.search).get("perfil") === "estudiante") fIns.perfil.value = "estudiante";
    actualizar();

    fIns.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validar(fIns)) return;
      const d = Object.fromEntries(new FormData(fIns));
      d.correo = d.correo.trim().toLowerCase();
      if (esEst()) {
        if (CORREO_PERSONAL.test(d.correo)) { avisar(fIns, "Como estudiante no puede inscribirse con un correo personal. Use el correo institucional que le asignó su universidad (.edu o .edu.co).", "error"); fIns.correo.focus(); return; }
        if (!CORREO_ACADEMICO.test(d.correo)) { avisar(fIns, "Para la licencia estudiantil use su correo institucional (.edu o .edu.co).", "error"); fIns.correo.focus(); return; }
        const fin = new Date(d.inicio); fin.setFullYear(fin.getFullYear() + Number(d.duracion));
        if (fin <= new Date()) { avisar(fIns, "Según la fecha de inicio y la duración, la carrera ya terminó.", "error"); return; }
      }
      ocupado(fIns, true);
      avisar(fIns, "Creando su cuenta…");
      try {
        const { user } = await A.createUserWithEmailAndPassword(auth, d.correo, d.clave);
        await A.updateProfile(user, { displayName: d.nombre.trim() });
        const perfil = {
          nombre: d.nombre.trim(), correo: d.correo, empresa: (d.empresa || "").trim(), cargo: (d.cargo || "").trim(),
          telefono: (d.telefono || "").trim(), pais: d.pais.trim(), ciudad: d.ciudad.trim(), perfil: d.perfil,
          creado: F.serverTimestamp()
        };
        if (esEst()) Object.assign(perfil, {
          universidad: d.universidad.trim(), programa: d.programa.trim(),
          inicio: F.Timestamp.fromDate(new Date(d.inicio + "T00:00:00")), duracionAnios: Number(d.duracion)
        });
        await F.setDoc(F.doc(db, "usuarios", user.uid), perfil);
        await A.sendEmailVerification(user, { url: urlCuenta });
        location.href = "cuenta.html?nueva=1";
      } catch (err) {
        avisar(fIns, mensajeError(err), "error");
        ocupado(fIns, false);
      }
    });
  }

  // ---------- Inicio de sesión ----------
  const fIng = $("#formIngresar");
  if (fIng) {
    fIng.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validar(fIng)) return;
      ocupado(fIng, true);
      avisar(fIng, "Ingresando…");
      try {
        await A.signInWithEmailAndPassword(auth, fIng.correo.value.trim(), fIng.clave.value);
        location.href = new URLSearchParams(location.search).get("volver") === "planes" ? "planes.html" : "cuenta.html";
      } catch (err) { avisar(fIng, mensajeError(err), "error"); ocupado(fIng, false); }
    });
    const olvido = $("#olvideClave");
    if (olvido) olvido.addEventListener("click", async () => {
      const c = fIng.correo.value.trim();
      if (!c) { avisar(fIng, "Escriba su correo y vuelva a pulsar «Olvidé mi contraseña».", "error"); fIng.correo.focus(); return; }
      try { await A.sendPasswordResetEmail(auth, c, { url: new URL("ingresar.html", location.href).href }); }
      catch (err) { /* no revelar si la cuenta existe */ }
      avisar(fIng, "Si el correo está inscrito, recibirá un enlace para crear una contraseña nueva.", "exito");
    });
  }

  // ---------- Panel de la cuenta ----------
  const panel = $("#panelCuenta");
  A.onAuthStateChanged(auth, async (user) => {
    $$("[data-cuenta]").forEach((el) => (el.hidden = el.dataset.cuenta !== (user ? "dentro" : "fuera")));
    $$(".enlace-cuenta").forEach((a) => (a.textContent = user ? "Mi cuenta" : "Ingresar"));
    if (!panel || !user) return;
    $("#cuentaNombre").textContent = user.displayName || user.email;
    $("#cuentaCorreo").textContent = user.email;
    const est = $("#estadoCuenta");

    if (!user.emailVerified) {
      $("#bloqueVerificar").hidden = false;
      $("#bloqueLicencia").hidden = true;
      if (new URLSearchParams(location.search).get("nueva")) est.textContent = "Cuenta creada. Le enviamos un correo para confirmar su dirección.";
      return;
    }
    $("#bloqueVerificar").hidden = true;
    $("#bloqueLicencia").hidden = false;
    await pintarLicencia(user);
  });

  async function pintarLicencia(user) {
    const caja = $("#licencia");
    const [snapU, snapL] = await Promise.all([F.getDoc(F.doc(db, "usuarios", user.uid)), F.getDoc(F.doc(db, "licencias", user.uid))]);
    const u = snapU.exists() ? snapU.data() : {};
    if (!snapL.exists()) {
      const est = u.perfil === "estudiante";
      caja.innerHTML = `<p>Su correo está confirmado. Active su licencia ${est ? "estudiantil" : "de prueba de " + DIAS_PRUEBA + " días"}.</p>
        <button class="boton boton--naranja" id="activarLicencia" type="button">Activar licencia ${est ? "estudiantil" : "de prueba"}</button>`;
      $("#activarLicencia").addEventListener("click", () => activar(user, u));
      return;
    }
    const l = snapL.data();
    const vence = vencimiento(l), hoy = new Date();
    const dias = Math.ceil((vence - hoy) / 86400000);
    const vigente = dias > 0;
    caja.innerHTML = `
      <div class="licencia ${vigente ? "" : "licencia--vencida"}">
        <div><span class="insignia ${vigente ? "insignia--morada" : "insignia--naranja"}">${vigente ? "Vigente" : "Vencida"}</span>
          <h3>${l.tipo === "pago" ? "Plan " + esc(nombrePlan(l.plan)) : l.tipo === "estudiante" ? "Licencia estudiantil" : "Licencia de prueba"} de TRAMA</h3>
          <p>${vigente ? "Vence el " + vence.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }) + " · quedan " + dias + " días" : "Venció el " + vence.toLocaleDateString("es-CO")}</p>
          ${l.tipo === "estudiante" && u.universidad ? "<p>" + esc(u.programa) + " · " + esc(u.universidad) + "</p>" : ""}</div>
        <dl><dt>Cuenta para TRAMA</dt><dd>${esc(user.email)}</dd><dt>Código de licencia</dt><dd class="codigo">${user.uid.slice(0, 4).toUpperCase()}-${user.uid.slice(4, 8).toUpperCase()}-${user.uid.slice(8, 12).toUpperCase()}</dd></dl>
      </div>
      ${vigente
        ? `<h3>Descargar TRAMA</h3><div class="botones-descarga">${INSTALADORES.map((f, i) =>
            `<button class="boton ${i ? "boton--contorno-oscuro" : "boton--morado"} descargar-trama" type="button" data-ruta="${f.ruta}">${f.texto}<small>${f.detalle}</small></button>`).join("")}</div>
           <p class="ayuda" id="estadoDescarga">Al abrir TRAMA, inicie sesión con este correo y su contraseña.</p>
           <h3 style="margin-top:28px">Equipos conectados</h3>
           <div id="equiposCuenta"><p class="ayuda">Cargando…</p></div>`
        : `<p>Su licencia venció: ya no puede descargar ni usar TRAMA. ${l.tipo === "pago" ? "Renueve su plan" : "Conozca los planes"} para continuar.</p><a class="boton boton--naranja" href="planes.html">${l.tipo === "pago" ? "Renovar plan" : "Ver planes"}</a>`}
      <h3 style="margin-top:28px">Mis compras</h3>
      <div id="comprasCuenta"><p class="ayuda">Cargando…</p></div>`;
    $$(".descargar-trama").forEach((b) => b.addEventListener("click", () => descargar(b)));
    if (vigente) await pintarEquipos(user, Number(l.equipos) || 1);
    await pintarCompras(user);
  }

  // Pedidos de la cuenta (PAG-001). Solo los lee su dueño; los aprueba Firebase al confirmarse el pago.
  async function pintarCompras(user) {
    const caja = $("#comprasCuenta");
    if (!caja) return;
    let pedidos = [];
    try {
      const s = await F.getDocs(F.query(F.collection(db, "pedidos"), F.where("uid", "==", user.uid)));
      pedidos = s.docs.map((d) => Object.assign({ id: d.id }, d.data()))
        .sort((a, b) => (b.creado ? b.creado.toMillis() : 0) - (a.creado ? a.creado.toMillis() : 0));
    } catch (err) { caja.innerHTML = '<p class="ayuda">No se pudo leer el historial de compras.</p>'; return; }
    if (!pedidos.length) { caja.innerHTML = '<p class="ayuda">Todavía no ha comprado ningún plan. <a href="planes.html">Ver planes</a>.</p>'; return; }
    const estados = { pendiente: "Pendiente de pago", aprobado: "Pagado", rechazado: "Rechazado", revisar: "En revisión" };
    caja.innerHTML = `<ul class="lista-equipos">${pedidos.map((p) => `<li><span><strong>Plan ${esc(nombrePlan(p.plan))} · ${p.periodo === "anual" ? "anual" : "mensual"}</strong>
      <small>${p.creado ? p.creado.toDate().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }) : ""} · ${pesos(p.valor)} ${esc(p.moneda)} · Pedido ${esc(p.id.slice(0, 8).toUpperCase())}</small></span>
      <span class="insignia ${p.estado === "aprobado" ? "insignia--morada" : "insignia--naranja"}">${estados[p.estado] || esc(p.estado)}</span></li>`).join("")}</ul>`;
  }

  // Equipos donde la cuenta usa TRAMA (los registra el programa al iniciar sesión).
  async function pintarEquipos(user, cupo) {
    const caja = $("#equiposCuenta");
    if (!caja) return;
    const ref = F.doc(db, "equipos", user.uid);
    let d = { huellas: "", nombres: "", desde: "" };
    try { const s = await F.getDoc(ref); if (s.exists()) d = Object.assign(d, s.data()); }
    catch (err) { caja.innerHTML = '<p class="ayuda">No se pudo leer la lista de equipos.</p>'; return; }
    const lista = (t) => (t ? String(t).split(";") : []);
    const H = lista(d.huellas), N = lista(d.nombres), D = lista(d.desde);
    const limite = `Su licencia permite usar TRAMA en ${cupo === 1 ? "un solo equipo" : cupo + " equipos"} a la vez.`;
    if (!H.length) {
      caja.innerHTML = `<p>Todavía no ha abierto TRAMA en ningún equipo. ${limite}</p>`;
      return;
    }
    caja.innerHTML = `<p class="ayuda">${limite} Si abre TRAMA en otro equipo, el programa le pedirá desconectar uno.</p>
      <ul class="lista-equipos">${H.map((h, i) => {
        const f = D[i] ? new Date(D[i]).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }) : "";
        return `<li><span><strong>${esc(N[i] || "Equipo")}</strong>${f ? "<small>Conectado desde el " + f + "</small>" : ""}</span>
          <button class="boton boton--contorno-oscuro quitar-equipo" type="button" data-i="${i}">Desconectar</button></li>`;
      }).join("")}</ul>`;
    $$(".quitar-equipo", caja).forEach((b) => b.addEventListener("click", async () => {
      const i = Number(b.dataset.i);
      if (!confirm(`¿Desconectar «${N[i]}»? Ese equipo ya no podrá abrir TRAMA con esta cuenta hasta que vuelva a iniciar sesión.`)) return;
      b.disabled = true;
      const quitar = (arr) => arr.filter((_, j) => j !== i).join(";");
      try {
        await F.setDoc(ref, { huellas: quitar(H), nombres: quitar(N), desde: quitar(D) });
        await pintarEquipos(user, cupo);
      } catch (err) { b.disabled = false; alert("No fue posible desconectar el equipo. Inténtelo de nuevo."); }
    }));
  }

  async function descargar(boton) {
    const est = $("#estadoDescarga");
    if (!FIREBASE_CONFIG.storageBucket) { est.textContent = "La descarga se habilitará muy pronto. Le avisaremos a su correo."; return; }
    boton.disabled = true;
    est.textContent = "Preparando la descarga…";
    try {
      const S = await import(SDK + "firebase-storage.js");
      const url = await S.getDownloadURL(S.ref(S.getStorage(app), boton.dataset.ruta));
      location.href = url;
      est.textContent = "La descarga comenzó. Al abrir TRAMA, inicie sesión con este correo y su contraseña.";
    } catch (err) {
      est.textContent = err && err.code === "storage/unauthorized"
        ? "Su licencia no está vigente o su correo no está confirmado."
        : "No fue posible iniciar la descarga. Inténtelo de nuevo en unos minutos.";
    } finally { boton.disabled = false; }
  }

  async function activar(user, u) {
    const est = $("#estadoCuenta");
    try {
      await user.getIdToken(true); // refresca «correo verificado» en el token
      const lic = { tipo: u.perfil === "estudiante" ? "estudiante" : "prueba", creado: F.serverTimestamp() };
      if (lic.tipo === "estudiante") Object.assign(lic, { inicio: u.inicio, duracionAnios: u.duracionAnios });
      await F.setDoc(F.doc(db, "licencias", user.uid), lic);
      est.textContent = "Licencia activada.";
      await pintarLicencia(user);
    } catch (err) { est.textContent = mensajeError(err); est.className = "error"; }
  }

  const reenviar = $("#reenviarVerificacion");
  if (reenviar) reenviar.addEventListener("click", async () => {
    try { await A.sendEmailVerification(auth.currentUser, { url: urlCuenta }); $("#estadoCuenta").textContent = "Le enviamos de nuevo el correo de confirmación."; }
    catch (err) { $("#estadoCuenta").textContent = mensajeError(err); }
  });
  const yaConfirme = $("#yaConfirme");
  if (yaConfirme) yaConfirme.addEventListener("click", async () => { await auth.currentUser.reload(); location.reload(); });
  $$(".cerrar-sesion").forEach((b) => b.addEventListener("click", async () => { await A.signOut(auth); location.href = "index.html"; }));
}

function esc(t) { return String(t || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

// ---------- Planes y compra (PAG-001) ----------
// Los precios salen de precios.json, la misma fuente con la que Firebase comprueba cada pago.
let PRECIOS = null, periodo = "mensual", sesion = null;
const pesos = (v) => "$" + Number(v || 0).toLocaleString("es-CO");
const nombrePlan = (c) => (PRECIOS && PRECIOS.planes[c] && PRECIOS.planes[c].nombre) || (c ? c.charAt(0).toUpperCase() + c.slice(1) : "");

async function planes() {
  try { PRECIOS = await (await fetch("precios.json", { cache: "no-cache" })).json(); } catch (err) { return; }
  if (!$(".planes")) return;
  $$(".conmutador button").forEach((b) => b.addEventListener("click", () => {
    periodo = b.dataset.periodo;
    $$(".conmutador button").forEach((o) => o.setAttribute("aria-pressed", o === b ? "true" : "false"));
    pintarPlanes();
  }));
  $$(".boton-pago").forEach((b) => b.addEventListener("click", () => comprar(b.dataset.plan, b)));
  pintarPlanes();
}

function pintarPlanes() {
  $$(".plan").forEach((tarjeta) => {
    const b = $(".boton-pago", tarjeta);
    const p = b && PRECIOS.planes[b.dataset.plan];
    if (!p) return;
    const precio = $(".plan__precio", tarjeta), per = $(".plan__periodo", tarjeta);
    const eq = p.equipos === 1 ? "1 equipo" : p.equipos + " equipos";
    if (p.gratis) {
      precio.textContent = "Gratis";
      per.textContent = "Con correo institucional · " + eq;
      b.disabled = false; b.textContent = "Obtener licencia estudiantil";
      return;
    }
    precio.innerHTML = pesos(p[periodo]) + " <small>" + esc(PRECIOS.moneda) + "</small>";
    per.textContent = (periodo === "anual" ? "Por año" : "Por mes") + " · " + eq + (PRECIOS.muestra ? " · valor de muestra" : "");
    b.disabled = !PASARELA.iniciar;
    b.textContent = PASARELA.iniciar ? "Comprar" : "Pago en línea próximamente";
  });
}

async function comprar(plan, boton) {
  const p = PRECIOS && PRECIOS.planes[plan];
  const nota = $("#notaPago");
  if (!p) return;
  if (p.gratis) { location.href = "inscripcion.html?perfil=estudiante"; return; }
  if (!PASARELA.iniciar || PRECIOS.muestra) { nota.textContent = "El pago en línea todavía no está disponible."; return; }
  if (!sesion) { nota.textContent = "Cargando su sesión… vuelva a pulsar en un momento."; return; }
  const user = sesion.auth.currentUser;
  if (!user) { location.href = "ingresar.html?volver=planes"; return; }
  if (!user.emailVerified) { nota.textContent = "Confirme primero su correo desde «Mi cuenta» para poder comprar."; return; }
  boton.disabled = true;
  nota.textContent = "Preparando su pedido…";
  try {
    const pedido = { uid: user.uid, correo: user.email, plan, periodo, valor: p[periodo], moneda: PRECIOS.moneda,
                     estado: "pendiente", creado: sesion.F.serverTimestamp() };
    const ref = await sesion.F.addDoc(sesion.F.collection(sesion.db, "pedidos"), pedido);
    await PASARELA.iniciar({ id: ref.id, plan, nombre: p.nombre, periodo, valor: p[periodo], moneda: PRECIOS.moneda, correo: user.email });
  } catch (err) {
    nota.textContent = "No fue posible iniciar el pago. Inténtelo de nuevo.";
    boton.disabled = false;
  }
}

planes().then(() => { if (PRECIOS && $(".planes")) pintarPlanes(); });
iniciar().catch(() => sinConfigurar());
