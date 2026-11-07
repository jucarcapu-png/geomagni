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
// App Check (WEB-027): pegue aquí la «clave del sitio» de reCAPTCHA v3 registrada en Firebase › App Check.
// Vacía = App Check apagado. Activar la aplicación obligatoria en la consola solo después de ver métricas «verificadas».
// Firebase ya no admite reCAPTCHA v3 clásico (07/11/2026): la clave es de Fraud Defense / reCAPTCHA Enterprise.
const RECAPTCHA_CLAVE = "6Lf10xQuAAAAAPl1nDAUSsdT9myNfJoxF5W4ivJ5";
// Descarga de TRAMA (WEB-030): false hasta el lanzamiento de la beta. El archivo se muestra, pero no se descarga.
// Al lanzarla, cambiar a true y publicar storage.rules con la lectura de «instaladores» habilitada.
const DESCARGA_HABILITADA = false;
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
// Wompi (Bancolombia): llave PÚBLICA de Wompi › Desarrolladores (pub_test_… en pruebas, pub_prod_… en producción).
// Vacía = pago apagado. La llave de integridad y el secreto de eventos NUNCA van aquí: se guardan como
// secretos de Firebase (WOMPI_INTEGRIDAD, WOMPI_EVENTOS) y los usa functions/index.js.
const WOMPI_LLAVE_PUBLICA = "";
const PASARELA = { nombre: "Wompi", iniciar: WOMPI_LLAVE_PUBLICA ? iniciarWompi : null };
// Administrador del sitio (debe coincidir con la función admin() de firestore.rules).
const ADMIN_CORREO = "jucarcapu@gmail.com";
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
  if (RECAPTCHA_CLAVE) {
    try {
      const C = await import(SDK + "firebase-app-check.js");
      C.initializeAppCheck(app, { provider: new C.ReCaptchaEnterpriseProvider(RECAPTCHA_CLAVE), isTokenAutoRefreshEnabled: true });
    } catch (e) { console.warn("App Check no disponible", e); }
  }
  const auth = A.getAuth(app);
  auth.languageCode = "es";
  const db = F.getFirestore(app);
  sesion = { app, auth, db, F };

  // Formularios de contacto, postulación y lista de interesados (WEB-010, WEB-014).
  // Los lee solo el administrador (firestore.rules, colección «mensajes»).
  const CAMPOS_MENSAJE = ["nombre", "correo", "telefono", "organizacion", "servicio", "area", "plan", "mensaje"];
  window.geomagniGuardarMensaje = (tipo, asunto, datos) => {
    const m = { tipo, asunto: String(asunto).slice(0, 160), pagina: location.pathname.split("/").pop() || "index.html",
                estado: "nuevo", creado: F.serverTimestamp() };
    CAMPOS_MENSAJE.forEach((k) => { if (datos[k]) m[k] = String(datos[k]).slice(0, k === "mensaje" ? 4000 : 200); });
    if (m.correo) m.correo = m.correo.toLowerCase();
    return F.addDoc(F.collection(db, "mensajes"), m);
  };
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
      if (d.sitio_web) { avisar(fIns, "Creando su cuenta…"); return; } // WEB-022: campo trampa
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
        const volver = new URLSearchParams(location.search).get("volver");
        location.href = volver === "planes" ? "planes.html" : volver === "admin" ? "admin.html" : "cuenta.html";
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
    if (user && $("#panelAdmin")) { await panelAdmin(user); return; }
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

  // ---------- Panel de administración (WEB-012) ----------
  // La seguridad la dan las reglas de Firestore (función admin()); aquí solo se arma la vista.
  async function panelAdmin(user) {
    const est = $("#estadoAdmin");
    if (user.email !== ADMIN_CORREO || !user.emailVerified) { est.textContent = "Esta página es solo para el administrador del sitio."; return; }
    let datos;
    try {
      const leerTodo = async (c) => (await F.getDocs(F.collection(db, c))).docs.map((d) => Object.assign({ id: d.id }, d.data()));
      const [usuarios, licencias, equipos, pedidos, mensajes] = await Promise.all(
        ["usuarios", "licencias", "equipos", "pedidos", "mensajes"].map(leerTodo));
      const porId = (l) => Object.fromEntries(l.map((x) => [x.id, x]));
      datos = { usuarios, lic: porId(licencias), eq: porId(equipos), pedidos, mensajes };
    } catch (err) {
      est.textContent = "No se pudieron leer los datos. Revise que las reglas de Firestore con la función admin() estén publicadas.";
      est.className = "error";
      return;
    }
    est.textContent = "";
    $("#contenidoAdmin").hidden = false;
    const fecha = (ts) => (ts && ts.toDate ? ts.toDate().toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "");
    const hoy = new Date();
    const vigentes = datos.usuarios.filter((u) => datos.lic[u.id] && vencimiento(datos.lic[u.id]) > hoy).length;
    const nuevos = datos.mensajes.filter((m) => m.estado === "nuevo").length;
    $("#cifrasAdmin").innerHTML = [["Inscritos", datos.usuarios.length], ["Licencias vigentes", vigentes],
      ["Mensajes nuevos", nuevos], ["Compras", datos.pedidos.length]]
      .map(([t, n]) => `<div><strong>${n}</strong><span>${t}</span></div>`).join("");
    let vista = "inscritos";
    const pintar = () => {
      const q = $("#buscarAdmin").value.trim().toLowerCase();
      const coincide = (...v) => !q || v.join(" ").toLowerCase().includes(q);
      const caja = $("#vistaAdmin");
      if (vista === "inscritos") {
        const filas = datos.usuarios.filter((u) => coincide(u.nombre, u.correo, u.ciudad, u.pais, u.empresa))
          .sort((a, b) => (b.creado ? b.creado.toMillis() : 0) - (a.creado ? a.creado.toMillis() : 0));
        caja.innerHTML = filas.length ? `<div class="tabla-envoltura"><table class="tabla tabla--admin"><thead><tr>
          <th>Inscrito</th><th>Perfil</th><th>Licencia</th><th>Equipos</th><th>Asignar licencia de cortesía</th></tr></thead><tbody>
          ${filas.map((u) => {
            const l = datos.lic[u.id], e = datos.eq[u.id];
            const v = l ? vencimiento(l) : null;
            const tipo = !l ? "Sin licencia" : l.tipo === "pago" ? "Plan " + nombrePlan(l.plan) : l.tipo === "estudiante" ? "Estudiantil" : "Prueba";
            const nEq = e && e.huellas ? e.huellas.split(";").length : 0;
            const sugerida = new Date(Math.max(hoy, v || 0) + 30 * 86400000).toISOString().slice(0, 10);
            return `<tr><td><strong>${esc(u.nombre)}</strong><br><small>${esc(u.correo)} · ${esc(u.ciudad)}, ${esc(u.pais)} · ${fecha(u.creado)}</small></td>
              <td>${esc(u.perfil)}${u.empresa ? "<br><small>" + esc(u.empresa) + "</small>" : ""}${u.universidad ? "<br><small>" + esc(u.universidad) + "</small>" : ""}</td>
              <td>${tipo}${v ? `<br><small class="${v > hoy ? "" : "vencida"}">${v > hoy ? "Vence" : "Venció"} el ${v.toLocaleDateString("es-CO")}</small>` : ""}</td>
              <td>${nEq} de ${l && l.equipos ? l.equipos : 1}<br><small>${e && e.nombres ? esc(e.nombres.split(";").join(", ")) : ""}</small></td>
              <td><div class="admin-acciones" data-uid="${u.id}">
                <input type="date" value="${sugerida}" aria-label="Nuevo vencimiento">
                <select aria-label="Equipos">${[1, 2, 3, 5, 10].map((n) => `<option ${n === (l && l.equipos ? l.equipos : 1) ? "selected" : ""}>${n}</option>`).join("")}</select>
                <button class="boton boton--morado admin-asignar" type="button">Asignar</button>
                ${l && v > hoy ? '<button class="boton-texto admin-desactivar" type="button">Desactivar</button>' : ""}
              </div></td></tr>`;
          }).join("")}</tbody></table></div>` : '<p class="ayuda">No hay inscritos que coincidan.</p>';
      } else if (vista === "mensajes") {
        const filas = datos.mensajes.filter((m) => coincide(m.nombre, m.correo, m.asunto, m.mensaje, m.tipo))
          .sort((a, b) => (b.creado ? b.creado.toMillis() : 0) - (a.creado ? a.creado.toMillis() : 0));
        const tipos = { contacto: "Contacto", postulacion: "Postulación", interes: "Interesado" };
        caja.innerHTML = filas.length ? `<ul class="lista-equipos">${filas.map((m) => `<li><span>
          <strong>${tipos[m.tipo] || esc(m.tipo)} · ${esc(m.nombre)}</strong>
          <small>${fecha(m.creado)} · <a href="mailto:${esc(m.correo)}">${esc(m.correo)}</a>${m.telefono ? " · " + esc(m.telefono) : ""}${m.plan ? " · plan " + esc(m.plan) : ""}${m.organizacion ? " · " + esc(m.organizacion) : ""}</small>
          <small>${esc(m.asunto)}</small>${m.mensaje ? `<p style="margin:6px 0 0">${esc(m.mensaje)}</p>` : ""}</span>
          ${m.estado === "nuevo" ? `<button class="boton boton--contorno-oscuro admin-atendido" type="button" data-id="${m.id}">Marcar atendido</button>` : '<span class="insignia insignia--morada">Atendido</span>'}</li>`).join("")}</ul>`
          : '<p class="ayuda">No hay mensajes.</p>';
      } else if (vista === "visitas") {
        caja.innerHTML = '<p class="ayuda">Cargando visitas…</p>';
        pintarVisitas(caja);
      } else {
        const filas = datos.pedidos.filter((p) => coincide(p.correo, p.plan, p.estado))
          .sort((a, b) => (b.creado ? b.creado.toMillis() : 0) - (a.creado ? a.creado.toMillis() : 0));
        caja.innerHTML = filas.length ? `<ul class="lista-equipos">${filas.map((p) => `<li><span><strong>${esc(p.correo)} · Plan ${esc(nombrePlan(p.plan))} ${esc(p.periodo)}</strong>
          <small>${fecha(p.creado)} · ${pesos(p.valor)} ${esc(p.moneda)} · Pedido ${esc(p.id.slice(0, 8).toUpperCase())}</small></span>
          <span class="insignia ${p.estado === "aprobado" ? "insignia--morada" : "insignia--naranja"}">${esc(p.estado)}</span></li>`).join("")}</ul>`
          : '<p class="ayuda">Todavía no hay compras.</p>';
      }
    };
    // Visitas de los últimos 30 días (WEB-024), agrupadas en el navegador.
    let visitas = null;
    async function pintarVisitas(caja) {
      try {
        if (!visitas) {
          const desde = F.Timestamp.fromDate(new Date(Date.now() - 30 * 86400000));
          const s = await F.getDocs(F.query(F.collection(db, "visitas"), F.where("creado", ">=", desde)));
          visitas = s.docs.map((d) => d.data());
        }
      } catch (err) { caja.innerHTML = '<p class="ayuda">No se pudieron leer las visitas. Revise que las reglas de «visitas» estén publicadas.</p>'; return; }
      if (vista !== "visitas") return;
      const contar = (campo) => Object.entries(visitas.reduce((m, v) => { const k = v[campo] || "(directo)"; m[k] = (m[k] || 0) + 1; return m; }, {}))
        .sort((a, b) => b[1] - a[1]);
      const barras = (lista, max) => lista.slice(0, 12).map(([k, n]) =>
        `<li><span class="barra__nombre">${esc(k)}</span><span class="barra"><span style="width:${Math.max(4, 100 * n / max)}%"></span></span><b>${n}</b></li>`).join("");
      const dias = contar("dia").sort((a, b) => a[0] < b[0] ? 1 : -1);
      const paginas = contar("pagina"), origenes = contar("origen"), disp = contar("dispositivo");
      const max = (l) => Math.max(1, ...l.map((x) => x[1]));
      caja.innerHTML = !visitas.length ? '<p class="ayuda">Todavía no hay visitas registradas en los últimos 30 días.</p>' : `
        <p><strong>${visitas.length}</strong> páginas vistas en los últimos 30 días · ${disp.map(([k, n]) => esc(k) + " " + Math.round(100 * n / visitas.length) + " %").join(" · ")}</p>
        <div class="visitas-grid">
          <div><h3>Por día</h3><ul class="barras">${barras(dias, max(dias))}</ul></div>
          <div><h3>Páginas</h3><ul class="barras">${barras(paginas, max(paginas))}</ul></div>
          <div><h3>De dónde llegan</h3><ul class="barras">${barras(origenes, max(origenes))}</ul></div>
        </div>`;
    }

    $$("[data-admin]").forEach((b) => b.addEventListener("click", () => {
      vista = b.dataset.admin;
      $$("[data-admin]").forEach((o) => o.setAttribute("aria-selected", o === b ? "true" : "false"));
      pintar();
    }));
    $("#buscarAdmin").addEventListener("input", () => { if (vista !== "visitas") pintar(); });
    $("#vistaAdmin").addEventListener("click", async (ev) => {
      const b = ev.target.closest("button");
      if (!b) return;
      if (b.classList.contains("admin-atendido")) {
        b.disabled = true;
        try { await F.updateDoc(F.doc(db, "mensajes", b.dataset.id), { estado: "atendido" });
              datos.mensajes.find((m) => m.id === b.dataset.id).estado = "atendido"; pintar(); }
        catch (err) { b.disabled = false; alert("No se pudo actualizar el mensaje."); }
        return;
      }
      const caja = b.closest(".admin-acciones");
      if (!caja) return;
      const uid = caja.dataset.uid, u = datos.usuarios.find((x) => x.id === uid);
      const desactivar = b.classList.contains("admin-desactivar");
      const vence = desactivar ? new Date() : new Date($("input", caja).value + "T23:59:59-05:00");
      const equipos = Number($("select", caja).value);
      if (!desactivar && !(vence > new Date())) { alert("Elija una fecha futura."); return; }
      const texto = desactivar ? `¿Desactivar la licencia de ${u.nombre}? TRAMA se cerrará en su próxima verificación.`
        : `¿Asignar a ${u.nombre} una licencia de cortesía hasta el ${vence.toLocaleDateString("es-CO")} con ${equipos} equipo(s)? Reemplaza su licencia actual.`;
      if (!confirm(texto)) return;
      b.disabled = true;
      const lic = { tipo: "pago", plan: "cortesia", periodo: "manual", equipos, vence: F.Timestamp.fromDate(vence),
                    creado: F.serverTimestamp(), pedido: "admin" };
      try { await F.setDoc(F.doc(db, "licencias", uid), lic); datos.lic[uid] = Object.assign({}, lic, { vence: F.Timestamp.fromDate(vence) }); pintar(); }
      catch (err) { b.disabled = false; alert("No se pudo guardar la licencia: " + mensajeError(err)); }
    });
    pintar();
  }

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
            (DESCARGA_HABILITADA
              ? `<button class="boton ${i ? "boton--contorno-oscuro" : "boton--morado"} descargar-trama" type="button" data-ruta="${f.ruta}">${f.texto}<small>${f.detalle}</small></button>`
              : `<button class="boton boton--bloqueado" type="button" disabled aria-disabled="true">${f.texto}<small>${f.detalle} · disponible con la beta</small></button>`)).join("")}</div>
           <p class="ayuda" id="estadoDescarga">${DESCARGA_HABILITADA ? "Al abrir TRAMA, inicie sesión con este correo y su contraseña." : "TRAMA está en etapa de pruebas: la descarga se habilitará con el lanzamiento de la versión beta. Le avisaremos a su correo."}</p>
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
    if (!DESCARGA_HABILITADA || !FIREBASE_CONFIG.storageBucket) { est.textContent = "La descarga se habilitará muy pronto. Le avisaremos a su correo."; return; }
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
const nombrePlan = (c) => c === "cortesia" ? "de cortesía" : (PRECIOS && PRECIOS.planes[c] && PRECIOS.planes[c].nombre) || (c ? c.charAt(0).toUpperCase() + c.slice(1) : "");

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

// Lleva al cliente al checkout de Wompi. El valor y la firma de integridad los calcula Firebase
// (firmarPagoWompi) a partir de precios.json: el navegador nunca decide cuánto se cobra.
async function iniciarWompi(p) {
  const Fn = await import(SDK + "firebase-functions.js");
  const firmar = Fn.httpsCallable(Fn.getFunctions(sesion.app), "firmarPagoWompi");
  const { data } = await firmar({ pedido: p.id });
  const volver = new URL("cuenta.html?pago=" + encodeURIComponent(p.id), location.href).href;
  const q = [["public-key", WOMPI_LLAVE_PUBLICA], ["currency", data.moneda], ["amount-in-cents", data.centavos],
             ["reference", p.id], ["signature:integrity", data.firma], ["redirect-url", volver],
             ["customer-data:email", p.correo]]
    .map(([k, v]) => k + "=" + encodeURIComponent(String(v))).join("&");
  location.href = "https://checkout.wompi.co/p/?" + q;
}

planes().then(() => { if (PRECIOS && $(".planes")) pintarPlanes(); });
iniciar().catch(() => sinConfigurar());
