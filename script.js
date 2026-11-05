// GEOMAGNI TECNOLOGÍAS · comportamiento del sitio
(function () {
  "use strict";

  var CORREO = "jucarcapu@gmail.com";

  // Año del pie
  var anio = document.getElementById("anio");
  if (anio) anio.textContent = new Date().getFullYear();

  // Sombra de la cabecera al desplazar
  var cabecera = document.getElementById("cabecera");
  function sombra() { cabecera.classList.toggle("con-sombra", window.scrollY > 8); }
  window.addEventListener("scroll", sombra, { passive: true });
  sombra();

  // Menú móvil
  var boton = document.getElementById("menuBoton");
  var menu = document.getElementById("menu");
  function cerrar() { menu.classList.remove("abierto"); boton.setAttribute("aria-expanded", "false"); }
  boton.addEventListener("click", function () {
    var abierto = menu.classList.toggle("abierto");
    boton.setAttribute("aria-expanded", abierto ? "true" : "false");
  });
  menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", cerrar); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrar(); });

  // Enlace activo según la sección visible y aparición suave
  if ("IntersectionObserver" in window) {
    var enlaces = {};
    menu.querySelectorAll('a[href^="#"]:not(.boton)').forEach(function (a) { enlaces[a.getAttribute("href").slice(1)] = a; });
    var obsSecciones = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        var a = enlaces[en.target.id];
        if (a && en.isIntersecting) {
          Object.keys(enlaces).forEach(function (k) { enlaces[k].classList.remove("activo"); });
          a.classList.add("activo");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { obsSecciones.observe(s); });

    var obsRevelar = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); obsRevelar.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".tarjeta, .pasos li, .ficha, .trama__pilares, .formulario").forEach(function (el) {
      el.classList.add("revelar");
      obsRevelar.observe(el);
    });
  }

  // Formulario: valida; en Netlify envía al servidor (Netlify Forms); si no hay servidor, abre el correo.
  var form = document.getElementById("formulario");
  var nota = document.getElementById("formNota");
  var botonEnviar = form.querySelector('button[type="submit"]');
  var correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function avisar(texto, clase) {
    nota.textContent = texto;
    nota.className = "formulario__nota" + (clase ? " " + clase : "");
  }
  function marcar(campo, malo) {
    campo.classList.toggle("invalido", malo);
    campo.setAttribute("aria-invalid", malo ? "true" : "false");
  }
  function abrirCorreo(d) {
    var asunto = "Solicitud web: " + d.get("servicio");
    var cuerpo = "Nombre: " + d.get("nombre") + "\n" +
      "Organización: " + (d.get("organizacion") || "-") + "\n" +
      "Correo: " + d.get("correo") + "\n" +
      "Teléfono: " + (d.get("telefono") || "-") + "\n" +
      "Servicio: " + d.get("servicio") + "\n\n" + d.get("mensaje");
    window.location.href = "mailto:" + CORREO + "?subject=" + encodeURIComponent(asunto) + "&body=" + encodeURIComponent(cuerpo);
    avisar("Se abrió su programa de correo con el mensaje listo. Si no se abrió, escríbanos a " + CORREO + ".");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var primero = null;
    [["nombre", function (v) { return v; }], ["correo", function (v) { return correoValido.test(v); }], ["mensaje", function (v) { return v; }]].forEach(function (par) {
      var campo = document.getElementById(par[0]);
      var malo = !par[1](campo.value.trim());
      marcar(campo, malo);
      if (malo && !primero) primero = campo;
    });
    var autorizo = document.getElementById("autorizo");
    marcar(autorizo, !autorizo.checked);
    if (primero) { avisar("Revise su nombre, un correo válido y el mensaje.", "error"); primero.focus(); return; }
    if (!autorizo.checked) { avisar("Para enviar el mensaje debe autorizar el tratamiento de sus datos.", "error"); autorizo.focus(); return; }

    var d = new FormData(form);
    if (!/^https?:$/.test(location.protocol)) { abrirCorreo(d); return; }

    botonEnviar.disabled = true;
    avisar("Enviando…");
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(d).toString()
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      form.reset();
      avisar("¡Gracias! Recibimos su mensaje y le responderemos pronto.", "exito");
    }).catch(function () {
      abrirCorreo(d);
    }).then(function () { botonEnviar.disabled = false; });
  });
})();
