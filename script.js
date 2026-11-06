// GEOMAGNI TECNOLOGÍAS · comportamiento del sitio
(function () {
  "use strict";

  // ================= CONFIGURACIÓN =================
  var CORREO = "jucarcapu@gmail.com";

  // Contador de visitas: servicio gratuito Abacus (abacus.jasoncameron.dev, sin cuenta).
  // Suma una visita por sesión del navegador. Para desactivarlo deje CONTADOR_SERVICIO vacío.
  var CONTADOR_SERVICIO = "https://abacus.jasoncameron.dev";
  var CONTADOR_CLAVE = "geomagni-tecnologias/visitas";

  // Pagos en línea: pegue aquí el enlace de pago de cada plan creado en su pasarela
  // (Wompi «Links de pago», Mercado Pago o PayU). Vacío = botón «Próximamente».
  // =================================================

  var quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tactil = window.matchMedia && window.matchMedia("(hover: none)").matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  $$(".anio").forEach(function (e) { e.textContent = new Date().getFullYear(); });

  // ---------- Cabecera, progreso y menú ----------
  var cabecera = $("#cabecera");
  var progreso = document.createElement("div");
  progreso.className = "progreso";
  document.body.appendChild(progreso);
  function alDesplazar() {
    if (cabecera) cabecera.classList.toggle("con-sombra", window.scrollY > 8);
    var alto = document.documentElement.scrollHeight - window.innerHeight;
    progreso.style.transform = "scaleX(" + (alto > 0 ? Math.min(1, window.scrollY / alto) : 0) + ")";
  }
  window.addEventListener("scroll", alDesplazar, { passive: true });
  alDesplazar();

  function medirCabecera() {
    if (!cabecera) return;
    var r = cabecera.getBoundingClientRect();
    document.documentElement.style.setProperty("--alto-cabecera", Math.max(0, r.bottom) + "px");
  }
  window.addEventListener("resize", medirCabecera);
  window.addEventListener("scroll", medirCabecera, { passive: true });
  medirCabecera();

  var boton = $("#menuBoton"), menu = $("#menu");
  var abrirProd = $("#abrirProductos"), desplegable = $("#desplegableProductos");
  function cerrarDesplegable() {
    if (!desplegable) return;
    desplegable.classList.remove("abierto");
    abrirProd.setAttribute("aria-expanded", "false");
  }
  function cerrarMenu() {
    if (!menu) return;
    menu.classList.remove("abierto");
    boton.setAttribute("aria-expanded", "false");
    cerrarDesplegable();
  }
  if (boton) boton.addEventListener("click", function () {
    medirCabecera();
    var abierto = menu.classList.toggle("abierto");
    boton.setAttribute("aria-expanded", abierto ? "true" : "false");
  });
  if (abrirProd) abrirProd.addEventListener("click", function (e) {
    e.stopPropagation();
    var abierto = desplegable.classList.toggle("abierto");
    abrirProd.setAttribute("aria-expanded", abierto ? "true" : "false");
  });
  document.addEventListener("click", function (e) {
    if (desplegable && !desplegable.contains(e.target) && e.target !== abrirProd) cerrarDesplegable();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { cerrarMenu(); } });
  if (menu) $$("a", menu).forEach(function (a) { a.addEventListener("click", cerrarMenu); });

  // ---------- Aparición escalonada ----------
  if ("IntersectionObserver" in window && !quieto) {
    var obs = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("visible"); obs.unobserve(en.target); } });
    }, { threshold: 0.12 });
    var grupos = {};
    $$(".tarjeta, .ilustrada, .pasos li, .ficha, .trama__pilares, .formulario, .plan, .descarga, .publico, .valor, .area, .pago, .persona, .cifra, .franja, .linea-tiempo li").forEach(function (el) {
      var padre = el.parentElement, k = padre ? (padre.__id || (padre.__id = Math.random())) : 0;
      grupos[k] = (grupos[k] || 0) + 1;
      el.style.setProperty("--retraso", Math.min(grupos[k] - 1, 6) * 0.08 + "s");
      el.classList.add("revelar");
      obs.observe(el);
    });
  }

  // ---------- Palabra rotativa del titular ----------
  var rot = $(".rotativa");
  if (rot && !quieto) {
    var palabras = (rot.getAttribute("data-palabras") || "").split("|"), i = 0;
    setInterval(function () {
      rot.classList.remove("entrando");
      rot.classList.add("cambiando");
      setTimeout(function () {
        i = (i + 1) % palabras.length;
        rot.textContent = palabras[i];
        rot.classList.remove("cambiando");
        rot.classList.add("entrando");
      }, 350);
    }, 2800);
  }

  // ---------- Portada: partículas y paralaje ----------
  var portada = $(".portada");
  if (portada && !quieto) {
    for (var p = 0; p < 14; p++) {
      var d = document.createElement("span");
      d.className = "particula";
      d.style.left = (Math.random() * 100) + "%";
      d.style.bottom = "-20px";
      var t = 6 + Math.random() * 10;
      d.style.width = d.style.height = (6 + Math.random() * 10) + "px";
      d.style.animationDuration = (14 + Math.random() * 14) + "s";
      d.style.animationDelay = (-Math.random() * 20) + "s";
      d.setAttribute("aria-hidden", "true");
      portada.appendChild(d);
    }
    var iso = $(".isometria", portada);
    if (iso && !tactil) portada.addEventListener("mousemove", function (e) {
      var r = portada.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      iso.style.transform = "rotateY(" + (x * 14) + "deg) rotateX(" + (-y * 10) + "deg) translate(" + (x * 12) + "px," + (y * 12) + "px)";
    });
  }

  // ---------- Brillo en secciones oscuras ----------
  if (!quieto && !tactil) $$(".seccion--oscura").forEach(function (s) {
    s.addEventListener("mousemove", function (e) {
      var r = s.getBoundingClientRect();
      s.style.setProperty("--px", (e.clientX - r.left) + "px");
      s.style.setProperty("--py", (e.clientY - r.top) + "px");
    });
  });

  // ---------- Tarjetas que se inclinan ----------
  if (!quieto && !tactil) $$(".ilustrada, .plan").forEach(function (c) {
    c.classList.add("inclinable");
    c.addEventListener("mousemove", function (e) {
      var r = c.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      c.style.transform = "perspective(800px) rotateX(" + (-y * 6) + "deg) rotateY(" + (x * 6) + "deg) translateY(-4px)";
    });
    c.addEventListener("mouseleave", function () { c.style.transform = ""; });
  });

  // ---------- Cifras que cuentan ----------
  function contar(el, fin) {
    if (quieto) { el.textContent = fin.toLocaleString("es-CO"); return; }
    var ini = performance.now(), dur = 1400;
    (function paso(ahora) {
      var k = Math.min(1, (ahora - ini) / dur), v = Math.round(fin * (1 - Math.pow(1 - k, 3)));
      el.textContent = v.toLocaleString("es-CO");
      if (k < 1) requestAnimationFrame(paso);
    })(ini);
  }
  var obsCifras = "IntersectionObserver" in window ? new IntersectionObserver(function (ents) {
    ents.forEach(function (en) {
      if (en.isIntersecting && en.target.hasAttribute("data-fin")) {
        contar(en.target, parseInt(en.target.getAttribute("data-fin"), 10) || 0);
        obsCifras.unobserve(en.target);
      }
    });
  }, { threshold: 0.4 }) : null;
  function vigilarCifra(el) { if (obsCifras) obsCifras.observe(el); else el.textContent = el.getAttribute("data-fin"); }
  $$("[data-fin]").forEach(vigilarCifra);

  // ---------- Contador de visitantes ----------
  if (CONTADOR_SERVICIO && window.fetch && /^https?:$/.test(location.protocol)) {
    var yaContada = false;
    try { yaContada = sessionStorage.getItem("geomagni-visita") === "1"; } catch (e) {}
    fetch(CONTADOR_SERVICIO + (yaContada ? "/get/" : "/hit/") + CONTADOR_CLAVE, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        var n = parseInt(d && (d.count != null ? d.count : d.value), 10);
        if (!(n >= 0)) return;
        try { sessionStorage.setItem("geomagni-visita", "1"); } catch (e) {}
        $$(".visitas-numero").forEach(function (el) {
          el.setAttribute("data-fin", n);
          var cont = el.closest("[hidden]");
          if (cont) cont.hidden = false;
          if (el.closest(".cifra")) vigilarCifra(el); else el.textContent = n.toLocaleString("es-CO");
        });
      })
      .catch(function () { /* sin conexión al servicio: el contador queda oculto */ });
  }

  // ---------- Pestañas ----------
  $$("[role=tablist]").forEach(function (lista) {
    var tabs = $$("[role=tab]", lista);
    var resalte = $(".resalte");
    function activar(tab, enfocar) {
      tabs.forEach(function (t) {
        var si = t === tab;
        t.setAttribute("aria-selected", si ? "true" : "false");
        t.tabIndex = si ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !si;
      });
      if (resalte && tab.dataset.zona) {
        var z = tab.dataset.zona.split(",");
        resalte.style.left = z[0] + "%"; resalte.style.top = z[1] + "%";
        resalte.style.width = z[2] + "%"; resalte.style.height = z[3] + "%";
      }
      if (enfocar) tab.focus();
    }
    tabs.forEach(function (t, n) {
      t.addEventListener("click", function () { activar(t); detener(); });
      t.addEventListener("keydown", function (e) {
        var j = e.key === "ArrowRight" ? n + 1 : e.key === "ArrowLeft" ? n - 1 : null;
        if (j !== null) { e.preventDefault(); activar(tabs[(j + tabs.length) % tabs.length], true); detener(); }
      });
    });
    activar(tabs[0]);
    var auto = quieto ? null : setInterval(function () {
      var n = tabs.findIndex(function (t) { return t.getAttribute("aria-selected") === "true"; });
      activar(tabs[(n + 1) % tabs.length]);
    }, 5000);
    function detener() { if (auto) { clearInterval(auto); auto = null; } }
  });

  // Planes, precios y compra: cuenta.js (lee precios.json).

  // ---------- Formularios: se guardan en Firebase (cuenta.js); si no es posible, abren el correo ----------
  var correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var asuntoUrl = new URLSearchParams(location.search).get("asunto");
  var selMotivo = $("#servicio");
  if (asuntoUrl && selMotivo && $('option[value="' + asuntoUrl + '"]', selMotivo)) selMotivo.value = asuntoUrl;

  // Solo contacto y postulación (llevan data-asunto). Ingresar e inscripción los maneja cuenta.js.
  $$("form.formulario[data-asunto]").forEach(function (form) {
    var nota = $(".formulario__nota", form);
    function avisar(t, c) { nota.textContent = t; nota.className = "formulario__nota" + (c ? " " + c : ""); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var primero = null;
      $$("[required]", form).forEach(function (c) {
        var malo = c.type === "checkbox" ? !c.checked : c.type === "email" ? !correoValido.test(c.value.trim()) : !c.value.trim();
        c.classList.toggle("invalido", malo);
        c.setAttribute("aria-invalid", malo ? "true" : "false");
        if (malo && !primero) primero = c;
      });
      if (primero) {
        avisar(primero.type === "checkbox" ? "Para enviar debe autorizar el tratamiento de sus datos." : "Revise los campos marcados.", "error");
        primero.focus();
        return;
      }
      var lineas = [];
      $$("input, select, textarea", form).forEach(function (c) {
        if (c.type === "checkbox" || c.type === "hidden" || !c.name || c.name === "mensaje") return;
        var et = form.querySelector('label[for="' + c.id + '"]');
        var valor = c.tagName === "SELECT" ? c.options[c.selectedIndex].text : c.value.trim();
        lineas.push((et ? et.childNodes[0].textContent.trim() : c.name) + ": " + (valor || "-"));
      });
      var msj = form.querySelector('[name="mensaje"]');
      var motivo = form.querySelector("select");
      var asunto = (form.dataset.asunto || "Mensaje web") + (motivo ? ": " + motivo.options[motivo.selectedIndex].text : "");
      function abrirCorreo() {
        var cuerpo = lineas.join("\n") + "\n\n" + (msj ? msj.value.trim() : "");
        window.location.href = "mailto:" + CORREO + "?subject=" + encodeURIComponent(asunto) + "&body=" + encodeURIComponent(cuerpo);
        avisar("Se abrió su programa de correo con el mensaje listo. Si no se abrió, escríbanos a " + CORREO + ".", "exito");
      }
      var datos = {};
      $$("input, select, textarea", form).forEach(function (c) {
        if (c.name && c.type !== "checkbox" && c.type !== "hidden") datos[c.name] = c.value.trim();
      });
      if (typeof window.geomagniGuardarMensaje !== "function") { abrirCorreo(); return; }
      var boton = form.querySelector('[type="submit"]');
      boton.disabled = true;
      avisar("Enviando…");
      window.geomagniGuardarMensaje(form.dataset.tipo || "contacto", asunto, datos).then(function () {
        form.reset();
        avisar(form.dataset.tipo === "interes" ? "¡Listo! Le avisaremos a su correo cuando pueda comprar."
          : "¡Recibido! Le responderemos pronto a su correo. Si es urgente, escríbanos por WhatsApp.", "exito");
      }).catch(abrirCorreo).then(function () { boton.disabled = false; });
    });
  });
})();
