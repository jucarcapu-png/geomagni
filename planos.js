// GEOMAGNI · plataforma de planos (WEB-035): proyectos y miembros.
// Usa la sesión de Firebase que abre cuenta.js (eventos «geomagni-sesion» y «geomagni-usuario»).
// La seguridad la dan las reglas de Firestore (colección «proyectos»): aquí solo se arma la vista.
// Crea proyectos quien tiene licencia de pago vigente (incluye cortesía); a los invitados les basta
// una cuenta GEOMAGNI con correo confirmado y ven el proyecto al ingresar con ese correo.

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (t) => String(t || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MIEMBROS = 50;
const FUNCIONES = { admins: "Administrador", editores: "Editor", lectores: "Lector" };
const DESCRIPCION_FUNCION = {
  admins: "Invita, cambia funciones y quita miembros",
  editores: "Podrá subir y anotar planos",
  lectores: "Solo consulta los planos"
};

let S = null;           // { app, auth, db, F }
let usuario = null;
let proyectos = [];     // { id, ...datos }
let actual = null;      // id del proyecto abierto
let puedeCrear = false;

const yo = () => (usuario && usuario.email ? usuario.email.toLowerCase() : "");
const funcionDe = (p, correo) => Object.keys(FUNCIONES).find((k) => (p[k] || []).includes(correo)) || null;
const soyAdmin = (p) => (p.admins || []).includes(yo());
const puedeSubir = (p) => soyAdmin(p) || (p.editores || []).includes(yo());
const naturales = (a, b) => String(a).localeCompare(String(b), "es", { numeric: true, sensitivity: "base" });
const fecha = (t) => (t && t.toDate ? t.toDate() : t ? new Date(t) : null);

function estado(texto, clase) {
  const n = $("#estadoPlanos");
  if (!n) return;
  n.textContent = texto || "";
  n.className = "planos-estado" + (clase ? " " + clase : "");
}

function errorTexto(err) {
  if (err && err.code === "permission-denied") return "No tiene permiso para esta acción.";
  if (err && err.code === "unavailable") return "Sin conexión. Revise su internet.";
  return "No fue posible completar la operación. Inténtelo de nuevo.";
}

async function licenciaDePago() {
  try {
    const s = await S.F.getDoc(S.F.doc(S.db, "licencias", usuario.uid));
    if (!s.exists()) return false;
    const l = s.data();
    const vence = fecha(l.vence);
    return l.tipo === "pago" && !!vence && vence > new Date();
  } catch (e) { return false; }
}

async function cargar() {
  const q = S.F.query(S.F.collection(S.db, "proyectos"), S.F.where("correos", "array-contains", yo()));
  const s = await S.F.getDocs(q);
  proyectos = s.docs.map((d) => Object.assign({ id: d.id }, d.data()))
    .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), "es"));
  if (actual && !proyectos.some((p) => p.id === actual)) actual = null;
  if (!actual && proyectos.length) actual = proyectos[0].id;
}

function pintarLista() {
  const caja = $("#listaProyectos");
  if (!proyectos.length) {
    caja.innerHTML = `<p class="planos-vacio">${puedeCrear ? "Aún no tiene proyectos. Cree el primero aquí abajo." : "Todavía no lo han invitado a ningún proyecto."}</p>`;
    return;
  }
  caja.innerHTML = proyectos.map((p) => {
    const f = funcionDe(p, yo());
    return `<button type="button" class="planos-proyecto${p.id === actual ? " activo" : ""}" data-pid="${esc(p.id)}" aria-pressed="${p.id === actual}">
      <strong>${esc(p.nombre)}</strong>
      <span>${esc(FUNCIONES[f] || "")} · ${(p.correos || []).length} ${(p.correos || []).length === 1 ? "miembro" : "miembros"}</span>
    </button>`;
  }).join("");
}

function pintarDetalle() {
  const caja = $("#detalleProyecto");
  const p = proyectos.find((x) => x.id === actual);
  if (!p) {
    caja.innerHTML = `<div class="planos-sin-seleccion"><h2>Planos</h2><p>${puedeCrear
      ? "Cree un proyecto e invite a su equipo por correo. Cada miembro tiene una función: administrador, editor o lector."
      : "Aquí verá los proyectos a los que lo inviten. Para crear sus propios proyectos necesita un plan de pago de TRAMA."}</p>
      ${puedeCrear ? "" : '<p><a class="boton boton--naranja" href="planes.html">Ver planes</a></p>'}</div>`;
    return;
  }
  const admin = soyAdmin(p);
  const propio = p.propietario === usuario.uid;
  const miembros = Object.keys(FUNCIONES).flatMap((k) => (p[k] || []).map((c) => ({ correo: c, funcion: k })));
  const creado = fecha(p.creado);
  caja.innerHTML = `
    <div class="planos-cabeza">
      <div>
        <p class="planos-etiqueta">Proyecto</p>
        <h2>${esc(p.nombre)}</h2>
        ${p.descripcion ? `<p class="planos-descripcion">${esc(p.descripcion)}</p>` : ""}
        <p class="planos-meta">Creado por ${esc(p.propietarioCorreo)}${creado ? " el " + creado.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }) : ""} · Su función: <strong>${esc(FUNCIONES[funcionDe(p, yo())] || "")}</strong></p>
      </div>
      ${admin ? '<button class="boton boton--contorno-oscuro planos-renombrar" type="button">Cambiar nombre</button>' : ""}
    </div>

    <section class="planos-hojas" aria-labelledby="tituloHojas">
      <div class="planos-hojas__cabeza">
        <h3 id="tituloHojas" class="planos-subtitulo">Hojas de planos</h3>
        ${puedeSubir(p) ? '<button class="boton boton--morado planos-subir" type="button">Subir planos</button>' : ""}
      </div>
      <div id="listaHojas"><p class="planos-vacio">Cargando hojas…</p></div>
    </section>

    <h3 class="planos-subtitulo">Miembros <span>(${miembros.length} de ${MAX_MIEMBROS})</span></h3>
    <div class="tabla-envoltura">
      <table class="tabla tabla--admin planos-miembros">
        <thead><tr><th>Correo</th><th>Función</th>${admin ? "<th></th>" : ""}</tr></thead>
        <tbody>${miembros.map((m) => {
          const esProp = m.correo === p.propietarioCorreo;
          const editable = admin && !esProp;
          return `<tr data-correo="${esc(m.correo)}">
            <td>${esc(m.correo)}${m.correo === yo() ? " <small>(usted)</small>" : ""}${esProp ? ' <span class="insignia insignia--morada">Propietario</span>' : ""}</td>
            <td>${editable
              ? `<select class="planos-funcion" aria-label="Función de ${esc(m.correo)}">${Object.keys(FUNCIONES).map((k) => `<option value="${k}"${k === m.funcion ? " selected" : ""}>${FUNCIONES[k]}</option>`).join("")}</select>`
              : esc(FUNCIONES[m.funcion])}</td>
            ${admin ? `<td>${editable ? '<button class="boton-texto planos-quitar" type="button">Quitar</button>' : ""}</td>` : ""}
          </tr>`;
        }).join("")}</tbody>
      </table>
    </div>

    ${admin ? `
    <form class="formulario planos-invitar" id="formInvitar" novalidate>
      <h3>Invitar a un miembro</h3>
      <div class="planos-fila">
        <div class="campo"><label for="invCorreo">Correo electrónico</label><input id="invCorreo" name="correo" type="email" autocomplete="off" required></div>
        <div class="campo"><label for="invFuncion">Función</label>
          <select id="invFuncion" name="funcion">${Object.keys(FUNCIONES).map((k) => `<option value="${k}"${k === "lectores" ? " selected" : ""}>${FUNCIONES[k]} · ${DESCRIPCION_FUNCION[k]}</option>`).join("")}</select></div>
        <button class="boton boton--morado" type="submit">Invitar</button>
      </div>
      <p class="formulario__nota" role="status">La persona verá el proyecto en «Planos» al ingresar con una cuenta GEOMAGNI de ese correo, ya confirmado. Si no tiene cuenta, puede <a href="inscripcion.html">inscribirse</a> sin costo.</p>
    </form>` : ""}

    ${propio ? `<p class="planos-borrar"><button class="boton-texto planos-eliminar" type="button">Eliminar proyecto</button></p>` : ""}`;
}

// Hojas del proyecto abierto (WEB-036). La lista completa con búsqueda y filtros es WEB-037.
const hojasPorProyecto = new Map();
async function cargarHojas(pid, forzar) {
  const caja = $("#listaHojas");
  if (!caja) return;
  try {
    if (forzar || !hojasPorProyecto.has(pid)) {
      const s = await S.F.getDocs(S.F.collection(S.db, "proyectos", pid, "hojas"));
      hojasPorProyecto.set(pid, s.docs.map((d) => Object.assign({ id: d.id }, d.data())));
    }
  } catch (err) { if (pid === actual && $("#listaHojas")) $("#listaHojas").innerHTML = `<p class="planos-vacio">${esc(errorTexto(err))}</p>`; return; }
  if (pid !== actual || !$("#listaHojas")) return;
  const hojas = hojasPorProyecto.get(pid).slice().sort((a, b) => naturales(a.numero, b.numero) || naturales(b.fecha, a.fecha));
  const p = proyectos.find((x) => x.id === pid);
  if (!hojas.length) {
    $("#listaHojas").innerHTML = `<p class="planos-vacio">${p && puedeSubir(p)
      ? "Todavía no hay planos. Pulse «Subir planos» para cargar un PDF y separarlo en hojas."
      : "Todavía no hay planos en este proyecto."}</p>`;
    return;
  }
  const conjuntos = new Set(hojas.map((h) => h.conjunto)).size;
  $("#listaHojas").innerHTML = `<p class="planos-meta">${hojas.length} ${hojas.length === 1 ? "hoja" : "hojas"} en ${conjuntos} ${conjuntos === 1 ? "conjunto" : "conjuntos"}</p>
    <div class="tabla-envoltura"><table class="tabla tabla--admin planos-tabla-hojas">
      <thead><tr><th>Número</th><th>Título</th><th>Disciplina</th><th>Conjunto</th></tr></thead>
      <tbody>${hojas.map((h) => `<tr><td><strong>${esc(h.numero)}</strong></td><td>${esc(h.titulo) || "<small>Sin título</small>"}</td>
        <td>${esc(h.disciplina)}</td><td>${esc(h.conjuntoNombre)}<br><small>${esc(h.fecha)}</small></td></tr>`).join("")}</tbody>
    </table></div>`;
}

async function subirPlanos(p) {
  try {
    const m = await import("./planos-subir.js");
    await m.abrirAsistente({ S, proyecto: p, correo: yo(), alTerminar: async (texto) => {
      estado(texto, "ok");
      await cargarHojas(p.id, true);
    } });
  } catch (err) { estado("No se pudo abrir el asistente. Revise su conexión.", "error"); }
}

function pintar() {
  pintarLista();
  pintarDetalle();
  if (actual) cargarHojas(actual);
  $("#bloqueCrear").hidden = !puedeCrear;
  $("#avisoSinPlan").hidden = puedeCrear;
}

// Guarda las listas de miembros de un proyecto (solo administradores; las reglas lo comprueban).
async function guardarMiembros(p, cambios) {
  const d = Object.assign({ admins: p.admins || [], editores: p.editores || [], lectores: p.lectores || [] }, cambios);
  d.correos = [...d.admins, ...d.editores, ...d.lectores];
  const datos = Object.assign({}, d, { actualizado: S.F.serverTimestamp() });
  await S.F.updateDoc(S.F.doc(S.db, "proyectos", p.id), datos);
  Object.assign(p, d);
}

function sinCorreo(p, correo) {
  const r = {};
  Object.keys(FUNCIONES).forEach((k) => (r[k] = (p[k] || []).filter((c) => c !== correo)));
  return r;
}

async function invitar(form) {
  const p = proyectos.find((x) => x.id === actual);
  const nota = $(".formulario__nota", form);
  const correo = form.correo.value.trim().toLowerCase();
  const funcion = form.funcion.value;
  if (!CORREO.test(correo)) { nota.textContent = "Escriba un correo válido."; nota.className = "formulario__nota error"; form.correo.focus(); return; }
  if ((p.correos || []).includes(correo)) { nota.textContent = "Esa persona ya es miembro del proyecto."; nota.className = "formulario__nota error"; return; }
  if ((p.correos || []).length >= MAX_MIEMBROS) { nota.textContent = "El proyecto ya tiene el máximo de " + MAX_MIEMBROS + " miembros."; nota.className = "formulario__nota error"; return; }
  $$("button", form).forEach((b) => (b.disabled = true));
  try {
    const c = sinCorreo(p, correo);
    c[funcion] = [...c[funcion], correo];
    await guardarMiembros(p, c);
    pintar();
    const n = $("#formInvitar .formulario__nota");
    if (n) { n.textContent = `Listo: ${correo} ahora es ${FUNCIONES[funcion].toLowerCase()} del proyecto.`; n.className = "formulario__nota ok"; }
  } catch (err) {
    nota.textContent = errorTexto(err); nota.className = "formulario__nota error";
    $$("button", form).forEach((b) => (b.disabled = false));
  }
}

async function crear(form) {
  const nota = $(".formulario__nota", form);
  const nombre = form.nombre.value.trim();
  const descripcion = form.descripcion.value.trim();
  if (nombre.length < 2) { nota.textContent = "Escriba el nombre del proyecto."; nota.className = "formulario__nota error"; form.nombre.focus(); return; }
  $$("button", form).forEach((b) => (b.disabled = true));
  nota.textContent = "Creando proyecto…"; nota.className = "formulario__nota";
  try {
    const ahora = S.F.serverTimestamp();
    const ref = await S.F.addDoc(S.F.collection(S.db, "proyectos"), {
      nombre: nombre.slice(0, 120), descripcion: descripcion.slice(0, 500),
      propietario: usuario.uid, propietarioCorreo: yo(),
      admins: [yo()], editores: [], lectores: [], correos: [yo()],
      creado: ahora, actualizado: ahora
    });
    actual = ref.id;
    form.reset();
    nota.textContent = "";
    await cargar();
    pintar();
  } catch (err) {
    nota.textContent = err && err.code === "permission-denied"
      ? "Para crear proyectos necesita un plan de pago vigente." : errorTexto(err);
    nota.className = "formulario__nota error";
  }
  $$("button", form).forEach((b) => (b.disabled = false));
}

function enlazar() {
  $("#listaProyectos").addEventListener("click", (e) => {
    const b = e.target.closest("[data-pid]");
    if (!b) return;
    actual = b.dataset.pid;
    pintar();
  });
  $("#formCrear").addEventListener("submit", (e) => { e.preventDefault(); crear(e.target); });
  const det = $("#detalleProyecto");
  det.addEventListener("submit", (e) => { if (e.target.id === "formInvitar") { e.preventDefault(); invitar(e.target); } });
  det.addEventListener("change", async (e) => {
    const sel = e.target.closest(".planos-funcion");
    if (!sel) return;
    const p = proyectos.find((x) => x.id === actual);
    const correo = sel.closest("tr").dataset.correo;
    const nueva = sel.value;
    sel.disabled = true;
    try {
      const c = sinCorreo(p, correo);
      c[nueva] = [...c[nueva], correo];
      await guardarMiembros(p, c);
      estado(`${correo} ahora es ${FUNCIONES[nueva].toLowerCase()}.`, "ok");
      pintar();
    } catch (err) { estado(errorTexto(err), "error"); pintar(); }
  });
  det.addEventListener("click", async (e) => {
    const p = proyectos.find((x) => x.id === actual);
    if (!p) return;
    if (e.target.closest(".planos-subir")) { subirPlanos(p); return; }
    if (e.target.closest(".planos-quitar")) {
      const correo = e.target.closest("tr").dataset.correo;
      if (!confirm(`¿Quitar a ${correo} del proyecto «${p.nombre}»? Dejará de verlo.`)) return;
      try { await guardarMiembros(p, sinCorreo(p, correo)); estado(`${correo} ya no es miembro.`, "ok"); pintar(); }
      catch (err) { estado(errorTexto(err), "error"); }
    } else if (e.target.closest(".planos-renombrar")) {
      const nombre = (prompt("Nombre del proyecto", p.nombre) || "").trim();
      if (!nombre || nombre === p.nombre) return;
      if (nombre.length < 2) { estado("El nombre debe tener al menos 2 caracteres.", "error"); return; }
      try {
        await S.F.updateDoc(S.F.doc(S.db, "proyectos", p.id), { nombre: nombre.slice(0, 120), actualizado: S.F.serverTimestamp() });
        p.nombre = nombre.slice(0, 120);
        estado("Nombre actualizado.", "ok"); pintar();
      } catch (err) { estado(errorTexto(err), "error"); }
    } else if (e.target.closest(".planos-eliminar")) {
      if (!confirm(`¿Eliminar el proyecto «${p.nombre}»? Sus miembros dejarán de verlo. Esta acción no se puede deshacer.`)) return;
      try {
        await S.F.deleteDoc(S.F.doc(S.db, "proyectos", p.id));
        actual = null; await cargar(); estado("Proyecto eliminado.", "ok"); pintar();
      } catch (err) { estado(errorTexto(err), "error"); }
    }
  });
}

let enlazado = false;
async function arrancar() {
  if (!S || !usuario || !$("#panelPlanos")) return;
  if (!usuario.emailVerified) {
    $("#contenidoPlanos").hidden = true;
    estado("Confirme primero su correo desde «Mi cuenta» para usar Planos.", "error");
    return;
  }
  estado("Cargando sus proyectos…");
  try {
    [puedeCrear] = await Promise.all([licenciaDePago(), cargar()]);
  } catch (err) {
    estado("No se pudieron leer sus proyectos. " + errorTexto(err), "error");
    return;
  }
  estado("");
  $("#contenidoPlanos").hidden = false;
  if (!enlazado) { enlazar(); enlazado = true; }
  pintar();
}

window.addEventListener("geomagni-sesion", (e) => { S = e.detail; arrancar(); });
window.addEventListener("geomagni-usuario", (e) => { usuario = e.detail; arrancar(); });
if (window.geomagniSesion) S = window.geomagniSesion;
if (window.geomagniUsuario) { usuario = window.geomagniUsuario; arrancar(); }
