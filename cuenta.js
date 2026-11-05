// GEOMAGNI · cuentas de usuario y licencias de TRAMA (Firebase Authentication + Firestore)
// Guía de configuración: FIREBASE.md

// ================= CONFIGURACIÓN =================
// Pegue aquí la configuración web de su proyecto Firebase
// (Consola de Firebase › Configuración del proyecto › Tus apps › SDK de Firebase › Configuración).
// Estos valores identifican el proyecto y pueden ser públicos; la seguridad la dan las reglas de firestore.rules.
const FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  appId: ""
};
const DIAS_PRUEBA = 7;
// Dominios aceptados para la licencia estudiantil (correo institucional).
const CORREO_ACADEMICO = /\.edu(\.[a-z]{2})?$/i;
// Proveedores de correo personal: nunca valen para la licencia estudiantil.
const CORREO_PERSONAL = /@(gmail|googlemail|hotmail|outlook|live|msn|yahoo|ymail|icloud|me|mac|aol|proton|protonmail|gmx|zoho|yandex|mail)\./i;
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
    const t = primero.type === "checkbox" ? "Debe aceptar la política de tratamiento de datos."
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
        location.href = "cuenta.html";
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
          <h3>${l.tipo === "estudiante" ? "Licencia estudiantil" : "Licencia de prueba"} de TRAMA</h3>
          <p>${vigente ? "Vence el " + vence.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }) + " · quedan " + dias + " días" : "Venció el " + vence.toLocaleDateString("es-CO")}</p>
          ${l.tipo === "estudiante" && u.universidad ? "<p>" + esc(u.programa) + " · " + esc(u.universidad) + "</p>" : ""}</div>
        <dl><dt>Cuenta para TRAMA</dt><dd>${esc(user.email)}</dd><dt>Código de licencia</dt><dd class="codigo">${user.uid.slice(0, 4).toUpperCase()}-${user.uid.slice(4, 8).toUpperCase()}-${user.uid.slice(8, 12).toUpperCase()}</dd></dl>
      </div>
      <p>Para usar TRAMA, descárguelo e inicie sesión en el programa con este correo y su contraseña.</p>
      <a class="boton boton--morado" href="descargas.html">Descargar TRAMA</a>
      ${vigente ? "" : ' <a class="boton boton--naranja" href="planes.html">Ver planes</a>'}`;
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

iniciar().catch(() => sinConfigurar());
