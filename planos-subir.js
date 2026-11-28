// GEOMAGNI · plataforma de planos (WEB-036): asistente para subir PDF y separarlos en hojas.
// Cuatro pasos, como Autodesk Construction Cloud: archivos → conjunto de versiones → números → títulos y disciplina.
// PDF.js lee cada página en el navegador y propone número y título; el usuario confirma antes de publicar.
// Los PDF van a Storage proyectos/{pid}/conjuntos/{cid}/ (máx. 100 MB c/u, storage.rules);
// el conjunto y sus hojas a Firestore proyectos/{pid}/conjuntos y proyectos/{pid}/hojas (firestore.rules).

const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/";
const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
const BUCKET = "gs://usuarios-geomagni.firebasestorage.app";
const MAX_MB = 100;
const MAX_ARCHIVOS = 20;
const MAX_HOJAS = 2000;
export const DISCIPLINAS = ["General", "Arquitectura", "Estructural", "Hidrosanitario", "Eléctrico", "Mecánico", "Paisajismo", "Topografía", "Otra"];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (t) => String(t || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const mb = (b) => b < 1048576
  ? Math.max(1, Math.round(b / 1024)).toLocaleString("es-CO") + " KB"
  : (b / 1048576).toLocaleString("es-CO", { maximumFractionDigits: 1 }) + " MB";
const hoyISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };

let pdfjs = null;
async function cargarPdfjs() {
  if (pdfjs) return pdfjs;
  pdfjs = await import(PDFJS + "pdf.min.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.mjs";
  return pdfjs;
}

// ---------- Propuesta de número, título y disciplina ----------
// Número de plano: letras de disciplina + número (A-101, E-01, ARQ-02, IH-3.1). Se prefiere el que está
// en el rótulo (abajo a la derecha) y con letra más grande.
const PATRON_NUMERO = /^[A-Z]{1,4}[-. ]?\d{1,4}(?:[.-]\d{1,3})?[A-Z]?$/;
const ETIQUETAS = /^(ESCALA|FECHA|HOJA|PLANO|DIBUJ|REVIS|APROB|PROYECT|CONTIENE|CONTENIDO|CLIENTE|PROPIETARIO|DISEÑ|DISENO|N[°ºO.]|NO\.|CODIGO|CÓDIGO|ARCHIVO|NOTAS?)\b/i;

function lineas(items, vp) {
  // Agrupa los fragmentos de texto por renglón (misma altura aproximada).
  const filas = [];
  items.forEach((it) => {
    const s = (it.str || "").trim();
    if (!s) return;
    const [a, b, , , e, f] = it.transform;
    const alto = Math.hypot(a, b) || Math.abs(it.height) || 1;
    const fila = filas.find((r) => Math.abs(r.y - f) < alto * 0.5);
    const pieza = { s, x: e, alto };
    if (fila) { fila.piezas.push(pieza); fila.alto = Math.max(fila.alto, alto); }
    else filas.push({ y: f, alto, piezas: [pieza] });
  });
  return filas.map((r) => {
    r.piezas.sort((p, q) => p.x - q.x);
    return { texto: r.piezas.map((p) => p.s).join(" ").replace(/\s+/g, " ").trim(), x: r.piezas[0].x / vp.width,
             y: r.y / vp.height, alto: r.alto, piezas: r.piezas };
  });
}

export function proponer(items, vp) {
  // Número: cada fragmento (y cada renglón) que parezca código de plano, puntuado por posición y tamaño.
  let mejor = null;
  items.forEach((it) => {
    const s = (it.str || "").trim().toUpperCase();
    if (!PATRON_NUMERO.test(s) || !/[A-Z]/.test(s) || /^\d/.test(s)) return;
    const [a, b, , , e, f] = it.transform;
    const alto = Math.hypot(a, b) || 1;
    const x = e / vp.width, y = f / vp.height;
    const puntos = alto * (1 + (x > 0.55 ? 1.5 : 0) + (y < 0.3 ? 1.5 : 0));
    if (!mejor || puntos > mejor.puntos) mejor = { s: s.replace(/\s+/, "-"), puntos, x, y };
  });
  // Título: el renglón de letra más grande del rótulo (o de la hoja), sin etiquetas ni el número.
  const ls = lineas(items, vp).filter((l) => {
    const letras = (l.texto.match(/[A-Za-zÁÉÍÓÚÑáéíóúñ]/g) || []).length;
    return letras >= 5 && l.texto.length <= 120 && !ETIQUETAS.test(l.texto) && (!mejor || l.texto.toUpperCase() !== mejor.s);
  });
  const enRotulo = ls.filter((l) => l.x > 0.5 && l.y < 0.35);
  const fuente = enRotulo.length ? enRotulo : ls;
  fuente.sort((p, q) => q.alto - p.alto || q.texto.length - p.texto.length);
  const titulo = fuente.length ? fuente[0].texto.replace(/^[:\-–\s]+/, "") : "";
  const numero = mejor ? mejor.s : "";
  return { numero, titulo, disciplina: disciplinaDe(numero) };
}

export function disciplinaDe(numero) {
  const p = (String(numero).toUpperCase().match(/^[A-Z]+/) || [""])[0];
  if (!p) return "General";
  if (/^(A|AR|ARQ)$/.test(p)) return "Arquitectura";
  if (/^(E|ES|EST|S)$/.test(p)) return "Estructural";
  if (/^(H|HS|IH|HID|P?SAN|AC|AL)$/.test(p)) return "Hidrosanitario";
  if (/^(EL|IE|ELE)$/.test(p)) return "Eléctrico";
  if (/^(M|ME|MEC|AA|HVAC)$/.test(p)) return "Mecánico";
  if (/^(PA|PAI|L)$/.test(p)) return "Paisajismo";
  if (/^(T|TO|TOP)$/.test(p)) return "Topografía";
  if (/^(G|GE|GEN)$/.test(p)) return "General";
  return "Otra";
}

// ---------- Asistente ----------
export async function abrirAsistente({ S, proyecto, correo, alTerminar }) {
  let dlg = $("#asistentePlanos");
  if (!dlg) {
    dlg = document.createElement("dialog");
    dlg.id = "asistentePlanos";
    dlg.className = "asistente";
    dlg.setAttribute("aria-labelledby", "asistenteTitulo");
    document.body.appendChild(dlg);
  }
  const estado = { paso: 1, archivos: [], hojas: [], nombre: "", fecha: hoyISO(), subiendo: false };
  const PASOS = ["Archivos", "Conjunto", "Números", "Títulos y disciplina"];

  function marco(cuerpo, pie) {
    dlg.innerHTML = `
      <div class="asistente__cabeza">
        <h2 id="asistenteTitulo">Subir planos · ${esc(proyecto.nombre)}</h2>
        <button type="button" class="asistente__cerrar" aria-label="Cerrar" data-acc="cerrar">×</button>
      </div>
      <ol class="asistente__pasos">${PASOS.map((p, i) => `<li class="${i + 1 === estado.paso ? "activo" : i + 1 < estado.paso ? "hecho" : ""}"><span>${i + 1}</span>${p}</li>`).join("")}</ol>
      <div class="asistente__cuerpo">${cuerpo}</div>
      <p class="asistente__nota" role="status"></p>
      <div class="asistente__pie">${pie}</div>`;
  }
  const nota = (t, clase) => { const n = $(".asistente__nota", dlg); n.textContent = t || ""; n.className = "asistente__nota" + (clase ? " " + clase : ""); };
  const atras = '<button type="button" class="boton boton--contorno-oscuro" data-acc="atras">Atrás</button>';

  function paso1() {
    marco(`
      <p>Elija uno o varios PDF del mismo conjunto de planos (hasta ${MAX_ARCHIVOS} archivos de ${MAX_MB} MB cada uno). Cada página será una hoja.</p>
      <label class="asistente__soltar">
        <input type="file" accept="application/pdf,.pdf" multiple data-acc="archivos">
        <strong>Elegir archivos PDF</strong><span>o arrástrelos aquí</span>
      </label>
      <ul class="asistente__archivos">${estado.archivos.map((a, i) => `<li><span>${esc(a.file.name)}</span><small>${mb(a.file.size)}${a.paginas ? " · " + a.paginas + (a.paginas === 1 ? " hoja" : " hojas") : ""}</small><button type="button" class="boton-texto" data-quitar="${i}">Quitar</button></li>`).join("")}</ul>`,
      `<span></span><button type="button" class="boton boton--morado" data-acc="siguiente"${estado.archivos.length ? "" : " disabled"}>Siguiente</button>`);
  }

  function paso2() {
    const total = estado.hojas.length;
    marco(`
      <p>Un conjunto agrupa los planos que se publican juntos, por ejemplo «Para licencia» o «Para construcción». Se detectaron <strong>${total} ${total === 1 ? "hoja" : "hojas"}</strong>.</p>
      <div class="campo"><label for="conjNombre">Nombre del conjunto</label><input id="conjNombre" maxlength="120" value="${esc(estado.nombre)}" required></div>
      <div class="campo"><label for="conjFecha">Fecha del conjunto</label><input id="conjFecha" type="date" value="${esc(estado.fecha)}" required></div>`,
      atras + '<button type="button" class="boton boton--morado" data-acc="siguiente">Siguiente</button>');
  }

  function paso3() {
    marco(`
      <p>Revise el número de cada hoja. Lo propusimos a partir del texto del plano; corríjalo si hace falta.</p>
      <div class="asistente__tabla"><table class="tabla">
        <thead><tr><th>Hoja</th><th>Archivo</th><th>Número</th></tr></thead>
        <tbody>${estado.hojas.map((h, i) => `<tr>
          <td><canvas class="asistente__mini" data-mini="${i}" width="96" height="68" aria-label="Miniatura de la página ${h.pagina}"></canvas></td>
          <td><small>${esc(h.archivo.file.name)}</small><br>Página ${h.pagina}</td>
          <td><input class="asistente__entrada" data-numero="${i}" maxlength="40" value="${esc(h.numero)}" aria-label="Número de la hoja ${i + 1}"></td></tr>`).join("")}</tbody>
      </table></div>`,
      atras + '<button type="button" class="boton boton--morado" data-acc="siguiente">Siguiente</button>');
    miniaturas();
  }

  function paso4() {
    marco(`
      <p>Revise el título y la disciplina de cada hoja. La disciplina se propone según las letras del número.</p>
      <div class="asistente__tabla"><table class="tabla">
        <thead><tr><th>Número</th><th>Título</th><th>Disciplina</th></tr></thead>
        <tbody>${estado.hojas.map((h, i) => `<tr>
          <td><strong>${esc(h.numero)}</strong></td>
          <td><input class="asistente__entrada" data-titulo="${i}" maxlength="200" value="${esc(h.titulo)}" aria-label="Título de ${esc(h.numero)}"></td>
          <td><select class="asistente__entrada" data-disciplina="${i}" aria-label="Disciplina de ${esc(h.numero)}">${DISCIPLINAS.map((d) => `<option${d === h.disciplina ? " selected" : ""}>${d}</option>`).join("")}</select></td></tr>`).join("")}</tbody>
      </table></div>
      <div class="asistente__progreso" hidden><div></div></div>`,
      atras + `<button type="button" class="boton boton--naranja" data-acc="publicar">Publicar ${estado.hojas.length} ${estado.hojas.length === 1 ? "hoja" : "hojas"}</button>`);
  }

  const pintar = () => [paso1, paso2, paso3, paso4][estado.paso - 1]();

  async function miniaturas() {
    const obs = new IntersectionObserver((entradas) => entradas.forEach(async (en) => {
      if (!en.isIntersecting) return;
      obs.unobserve(en.target);
      const h = estado.hojas[Number(en.target.dataset.mini)];
      try {
        const pagina = await h.archivo.doc.getPage(h.pagina);
        const vp0 = pagina.getViewport({ scale: 1 });
        const escala = Math.min(96 / vp0.width, 68 / vp0.height);
        const vp = pagina.getViewport({ scale: escala });
        const c = en.target;
        c.width = Math.round(vp.width); c.height = Math.round(vp.height);
        await pagina.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
      } catch (e) { /* sin miniatura */ }
    }), { root: $(".asistente__cuerpo", dlg) });
    $$("[data-mini]", dlg).forEach((c) => obs.observe(c));
  }

  async function agregarArchivos(lista) {
    const pdf = await cargarPdfjs();
    for (const file of lista) {
      if (estado.archivos.length >= MAX_ARCHIVOS) { nota(`Máximo ${MAX_ARCHIVOS} archivos por conjunto.`, "error"); break; }
      if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") { nota(`«${file.name}» no es un PDF.`, "error"); continue; }
      if (file.size > MAX_MB * 1048576) { nota(`«${file.name}» pesa ${mb(file.size)}; el máximo es ${MAX_MB} MB.`, "error"); continue; }
      if (estado.archivos.some((a) => a.file.name === file.name && a.file.size === file.size)) continue;
      nota(`Leyendo «${file.name}»…`);
      try {
        const doc = await pdf.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
        estado.archivos.push({ file, doc, paginas: doc.numPages });
        nota("");
      } catch (e) { nota(`No se pudo leer «${file.name}». ¿Está dañado o protegido con contraseña?`, "error"); }
      pintar();
    }
  }

  async function leerHojas() {
    const total = estado.archivos.reduce((n, a) => n + a.paginas, 0);
    if (total > MAX_HOJAS) { nota(`Son ${total} hojas; el máximo por conjunto es ${MAX_HOJAS}.`, "error"); return false; }
    const previas = new Map(estado.hojas.map((h) => [h.archivo.file.name + "#" + h.pagina, h]));
    const hojas = [];
    let n = 0;
    for (const a of estado.archivos) {
      for (let p = 1; p <= a.paginas; p++) {
        n++;
        const clave = a.file.name + "#" + p;
        if (previas.has(clave)) { hojas.push(previas.get(clave)); continue; }
        nota(`Leyendo hoja ${n} de ${total}…`);
        let prop = { numero: "", titulo: "", disciplina: "General" };
        try {
          const pagina = await a.doc.getPage(p);
          const vp = pagina.getViewport({ scale: 1 });
          const texto = await pagina.getTextContent();
          prop = proponer(texto.items, vp);
        } catch (e) { /* sin texto: el usuario escribe */ }
        hojas.push({ archivo: a, pagina: p, numero: prop.numero || String(n).padStart(2, "0"), titulo: prop.titulo,
                     disciplina: prop.disciplina, propuesto: !!prop.numero });
      }
    }
    estado.hojas = hojas;
    nota("");
    return true;
  }

  async function publicar() {
    if (estado.subiendo) return;
    estado.subiendo = true;
    $$("button, input, select", dlg).forEach((b) => (b.disabled = true));
    const barra = $(".asistente__progreso", dlg);
    barra.hidden = false;
    const avance = (f) => ($("div", barra).style.width = Math.round(f * 100) + "%");
    try {
      // window.geomagniStoragePrueba: solo para las pruebas locales (simula Storage); en el sitio no existe.
      const St = window.geomagniStoragePrueba || await import(SDK + "firebase-storage.js");
      const storage = St.getStorage(S.app, BUCKET);
      const F = S.F;
      const cid = F.doc(F.collection(S.db, "proyectos", proyecto.id, "conjuntos")).id;
      const totalBytes = estado.archivos.reduce((n, a) => n + a.file.size, 0);
      let enviados = 0;
      const rutas = new Map();
      const usados = new Set();
      for (const a of estado.archivos) {
        let base = a.file.name.replace(/\.pdf$/i, "").normalize("NFD").replace(/[̀-ͯ]/g, "")
          .replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80) || "planos";
        let nombre = base + ".pdf", k = 2;
        while (usados.has(nombre)) nombre = base + "_" + k++ + ".pdf";
        usados.add(nombre);
        const ruta = `proyectos/${proyecto.id}/conjuntos/${cid}/${nombre}`;
        nota(`Subiendo «${a.file.name}»…`);
        const tarea = St.uploadBytesResumable(St.ref(storage, ruta), a.file, { contentType: "application/pdf" });
        await new Promise((ok, mal) => tarea.on("state_changed",
          (s) => avance(0.9 * (enviados + s.bytesTransferred) / totalBytes), mal, ok));
        enviados += a.file.size;
        rutas.set(a, ruta);
      }
      nota("Guardando las hojas…");
      await F.setDoc(F.doc(S.db, "proyectos", proyecto.id, "conjuntos", cid), {
        nombre: estado.nombre, fecha: estado.fecha, hojas: estado.hojas.length, creadoPor: correo,
        archivos: estado.archivos.map((a) => ({ nombre: a.file.name, ruta: rutas.get(a), tamano: a.file.size, paginas: a.paginas })),
        creado: F.serverTimestamp()
      });
      const col = F.collection(S.db, "proyectos", proyecto.id, "hojas");
      for (let i = 0; i < estado.hojas.length; i += 10) {
        await Promise.all(estado.hojas.slice(i, i + 10).map((h) => F.addDoc(col, {
          conjunto: cid, conjuntoNombre: estado.nombre, fecha: estado.fecha, archivo: rutas.get(h.archivo), pagina: h.pagina,
          numero: h.numero, titulo: h.titulo, disciplina: h.disciplina, creadoPor: correo, creado: F.serverTimestamp()
        })));
        avance(0.9 + 0.1 * Math.min(1, (i + 10) / estado.hojas.length));
      }
      avance(1);
      dlg.close();
      alTerminar && alTerminar(`Se publicaron ${estado.hojas.length} ${estado.hojas.length === 1 ? "hoja" : "hojas"} en el conjunto «${estado.nombre}».`);
    } catch (err) {
      estado.subiendo = false;
      $$("button, input, select", dlg).forEach((b) => (b.disabled = false));
      nota(err && (err.code === "storage/unauthorized" || err.code === "permission-denied")
        ? "No tiene permiso para subir planos a este proyecto (solo administradores y editores)."
        : "No fue posible publicar. Revise su conexión e inténtelo de nuevo.", "error");
    }
  }

  function guardarEntradas() {
    $$("[data-numero]", dlg).forEach((i) => (estado.hojas[i.dataset.numero].numero = i.value.trim()));
    $$("[data-titulo]", dlg).forEach((i) => (estado.hojas[i.dataset.titulo].titulo = i.value.trim()));
    $$("[data-disciplina]", dlg).forEach((s) => (estado.hojas[s.dataset.disciplina].disciplina = s.value));
    const n = $("#conjNombre", dlg), f = $("#conjFecha", dlg);
    if (n) estado.nombre = n.value.trim();
    if (f) estado.fecha = f.value;
  }

  dlg.onclick = async (e) => {
    const q = e.target.closest("[data-quitar]");
    if (q) { estado.archivos.splice(Number(q.dataset.quitar), 1); estado.hojas = []; pintar(); return; }
    const acc = e.target.closest("[data-acc]");
    if (!acc || acc.tagName === "INPUT") return;
    guardarEntradas();
    if (acc.dataset.acc === "cerrar") {
      if (estado.subiendo) return;
      if (estado.archivos.length && !confirm("¿Cerrar sin publicar? Se perderá lo que preparó.")) return;
      dlg.close(); return;
    }
    if (acc.dataset.acc === "atras") { estado.paso--; pintar(); return; }
    if (acc.dataset.acc === "publicar") {
      const sinTitulo = estado.hojas.filter((h) => !h.titulo).length;
      if (sinTitulo && !confirm(`${sinTitulo} ${sinTitulo === 1 ? "hoja no tiene" : "hojas no tienen"} título. ¿Publicar de todas formas?`)) return;
      publicar(); return;
    }
    if (acc.dataset.acc !== "siguiente") return;
    if (estado.paso === 1) {
      acc.disabled = true;
      if (!(await leerHojas())) { acc.disabled = false; return; }
      if (!estado.nombre) estado.nombre = "Conjunto del " + new Date(estado.fecha + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
    } else if (estado.paso === 2) {
      if (!estado.nombre) { nota("Escriba el nombre del conjunto.", "error"); $("#conjNombre", dlg).focus(); return; }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(estado.fecha)) { nota("Elija la fecha del conjunto.", "error"); return; }
    } else if (estado.paso === 3) {
      const vacia = estado.hojas.findIndex((h) => !h.numero);
      if (vacia >= 0) { nota(`La hoja ${vacia + 1} no tiene número.`, "error"); $(`[data-numero="${vacia}"]`, dlg).focus(); return; }
      const vistos = new Map();
      for (const h of estado.hojas) {
        const k = h.numero.toUpperCase();
        if (vistos.has(k)) { nota(`El número «${h.numero}» está repetido. Cada hoja del conjunto debe tener un número distinto.`, "error"); return; }
        vistos.set(k, true);
      }
      estado.hojas.forEach((h) => { if (!h.disciplinaManual) h.disciplina = disciplinaDe(h.numero); });
    }
    estado.paso++;
    pintar();
  };
  dlg.onchange = (e) => {
    if (e.target.matches("[data-acc=archivos]")) agregarArchivos(Array.from(e.target.files || []));
    if (e.target.matches("[data-disciplina]")) estado.hojas[e.target.dataset.disciplina].disciplinaManual = true;
  };
  dlg.ondragover = (e) => { if (estado.paso === 1) { e.preventDefault(); } };
  dlg.ondrop = (e) => {
    if (estado.paso !== 1) return;
    e.preventDefault();
    agregarArchivos(Array.from(e.dataTransfer.files || []));
  };
  dlg.oncancel = (e) => { if (estado.subiendo) e.preventDefault(); };

  pintar();
  dlg.showModal();
}
