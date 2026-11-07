# -*- coding: utf-8 -*-
"""Genera las páginas del sitio de GEOMAGNI con cabecera y pie comunes.

Uso:  python construir.py
Edite aquí el menú, el pie o el contenido y vuelva a ejecutar.
"""
import os

RAIZ = os.path.dirname(os.path.abspath(__file__))
URL = "https://jucarcapu-png.github.io/geomagni/"
CORREO = "jucarcapu@gmail.com"
TEL = "+57 311 722 7083"
TEL_ENLACE = "+573117227083"

# ---------------------------------------------------------------- ilustraciones propias (SVG)
ICONOS = {
    "gestion": '<path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>',
    "bim": '<path d="M12 2 21 7v10l-9 5-9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/>',
    "estructura": '<path d="M4 20V8m16 12V8M2 8h20M4 14h16M8 8l4-5 4 5"/>',
    "coordinacion": '<circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="12" cy="18" r="3"/><path d="M8.5 7.5l2 8M15.5 7.5l-2 8M9 6h6"/>',
    "software": '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
    "consultoria": '<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20h8M12 16v4M7 9h4M7 12h7"/>',
    "descarga": '<path d="M12 3v12M7 10l5 5 5-5M4 19h16"/>',
    "pdf": '<path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5M9 13h6M9 17h6"/>',
    "marca": '<path d="M12 2 20 7v10l-8 5-8-5V7z"/><path d="M9 9h6v6H9z"/>',
    "caja": '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    "tarjeta": '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    "banco": '<path d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>',
    "movil": '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    "transferencia": '<path d="M4 8h14l-4-4M20 16H6l4 4"/>',
}

def icono(nombre):
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONOS[nombre] + '</svg>'

# Ilustraciones isométricas dibujadas para este sitio
def iso_bloques():
    return ('<svg viewBox="0 0 320 180" aria-hidden="true">'
            '<path d="M70 110 120 81 170 110 120 139Z" fill="#A583C2"/><path d="M70 110 120 139V170L70 141Z" fill="#7A4AA8"/><path d="M120 139 170 110V141L120 170Z" fill="#3A195B"/>'
            '<path d="M140 60 190 31 240 60 190 89Z" fill="#A583C2"/><path d="M140 60 190 89V150L140 121Z" fill="#7A4AA8"/><path d="M190 89 240 60V121L190 150Z" fill="#3A195B"/>'
            '<path d="M200 120 225 105 250 120 225 135Z" fill="#FFB273"/><path d="M200 120 225 135V160L200 145Z" fill="#FF7400"/><path d="M225 135 250 120V145L225 160Z" fill="#C54F00"/></svg>')

def iso_estructura():
    lineas = ''.join('<path d="M%d 150V70" stroke="#5B2A86" stroke-width="5"/>' % x for x in (70, 130, 190, 250))
    vigas = ''.join('<path d="M60 %d H260" stroke="#7A4AA8" stroke-width="5"/>' % y for y in (70, 110))
    return ('<svg viewBox="0 0 320 180" aria-hidden="true"><path d="M40 150H280" stroke="#262329" stroke-width="4"/>'
            + lineas + vigas +
            '<path d="M70 70 130 110M130 70 190 110M190 70 250 110" stroke="#FF7400" stroke-width="2.5" stroke-dasharray="6 5"/>'
            '<path d="M60 40H260" stroke="#FF7400" stroke-width="2"/><path d="M60 34V46M260 34V46" stroke="#FF7400" stroke-width="2"/>'
            '<text x="160" y="32" text-anchor="middle" font-family="Sora,Arial" font-size="13" font-weight="600" fill="#C54F00">18,00 m</text></svg>')

def iso_red():
    return ('<svg viewBox="0 0 320 180" aria-hidden="true">'
            '<g stroke="#A583C2" stroke-width="2.5"><path d="M160 90 80 50M160 90 240 50M160 90 80 140M160 90 240 140M80 50 240 50"/></g>'
            '<circle cx="160" cy="90" r="22" fill="#5B2A86"/><circle cx="80" cy="50" r="14" fill="#7A4AA8"/><circle cx="240" cy="50" r="14" fill="#7A4AA8"/>'
            '<circle cx="80" cy="140" r="14" fill="#FF7400"/><circle cx="240" cy="140" r="14" fill="#7A4AA8"/>'
            '<path d="M152 90h16M160 82v16" stroke="#fff" stroke-width="3"/></svg>')

def iso_codigo():
    return ('<svg viewBox="0 0 320 180" aria-hidden="true"><rect x="50" y="25" width="220" height="130" rx="10" fill="#262329"/>'
            '<rect x="50" y="25" width="220" height="22" rx="10" fill="#3A3540"/><circle cx="66" cy="36" r="4" fill="#FF7400"/>'
            '<g stroke-width="7" stroke-linecap="round"><path d="M72 70h50" stroke="#A583C2"/><path d="M132 70h70" stroke="#FFB273"/>'
            '<path d="M90 90h90" stroke="#7A4AA8"/><path d="M90 110h40" stroke="#A583C2"/><path d="M140 110h60" stroke="#FF7400"/><path d="M72 130h80" stroke="#7A4AA8"/></g></svg>')

def iso_planos():
    return ('<svg viewBox="0 0 320 180" aria-hidden="true"><rect x="60" y="20" width="200" height="140" fill="#fff" stroke="#262329" stroke-width="2"/>'
            '<rect x="200" y="130" width="56" height="26" fill="none" stroke="#5B2A86" stroke-width="2"/>'
            '<path d="M90 50h80v60H90z M130 50v60 M90 80h40" fill="none" stroke="#5B2A86" stroke-width="3"/>'
            '<path d="M90 125h80" stroke="#FF7400" stroke-width="2"/><path d="M90 120v10M170 120v10" stroke="#FF7400" stroke-width="2"/>'
            '<circle cx="215" cy="70" r="22" fill="none" stroke="#A583C2" stroke-width="3"/><path d="M215 48v44M193 70h44" stroke="#A583C2" stroke-width="2"/></svg>')

def iso_ensenanza():
    return ('<svg viewBox="0 0 320 180" aria-hidden="true"><path d="M160 30 270 75 160 120 50 75Z" fill="#5B2A86"/>'
            '<path d="M95 95v35c0 14 30 25 65 25s65-11 65-25V95l-65 25z" fill="#7A4AA8"/>'
            '<path d="M250 83v45" stroke="#FF7400" stroke-width="4"/><circle cx="250" cy="134" r="7" fill="#FF7400"/></svg>')

def ventana_trama():
    """Ilustración original de la interfaz de un programa BIM (no es una captura)."""
    return ('<div class="ventana"><div class="ventana__barra"><i></i><i></i><i></i></div>'
            '<svg viewBox="0 0 520 300" aria-label="Ilustración de la interfaz de TRAMA">'
            '<rect width="520" height="300" fill="#1B181E"/><rect width="520" height="34" fill="#5B2A86"/>'
            '<g fill="#fff" opacity=".85"><rect x="14" y="12" width="44" height="10" rx="2"/><rect x="70" y="12" width="44" height="10" rx="2"/><rect x="126" y="12" width="44" height="10" rx="2"/></g>'
            '<rect x="0" y="34" width="110" height="266" fill="#262329"/>'
            '<g fill="#68616D"><rect x="14" y="52" width="80" height="8" rx="2"/><rect x="24" y="70" width="64" height="8" rx="2"/><rect x="24" y="88" width="56" height="8" rx="2"/><rect x="14" y="110" width="80" height="8" rx="2"/><rect x="24" y="128" width="60" height="8" rx="2"/></g>'
            '<rect x="24" y="86" width="70" height="12" rx="2" fill="#FF7400" opacity=".25"/>'
            '<g transform="translate(150 50)"><path d="M90 120 170 74 250 120 170 166Z" fill="#A583C2"/><path d="M90 120 170 166V230L90 184Z" fill="#7A4AA8"/><path d="M170 166 250 120V184L170 230Z" fill="#3A195B"/>'
            '<path d="M30 130 80 101 130 130 80 159Z" fill="#A583C2" opacity=".9"/><path d="M30 130 80 159V190L30 161Z" fill="#7A4AA8"/><path d="M80 159 130 130V161L80 190Z" fill="#3A195B"/>'
            '<path d="M120 74 170 45 220 74" fill="none" stroke="#FF7400" stroke-width="2" stroke-dasharray="5 4"/></g>'
            '<g transform="translate(470 54)"><rect x="-22" y="-14" width="40" height="40" rx="4" fill="#3A3540"/><text x="-2" y="11" text-anchor="middle" font-family="Sora,Arial" font-size="10" fill="#fff">3D</text></g>'
            '<rect x="0" y="282" width="520" height="18" fill="#262329"/><rect x="10" y="287" width="90" height="8" rx="2" fill="#68616D"/>'
            '</svg></div>')

# ---------------------------------------------------------------- piezas comunes
SIMBOLO_BLANCO = ('<svg viewBox="0 0 512 512" width="40" height="40" aria-hidden="true">'
    '<mask id="ranurasPie" maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512"><rect width="512" height="512" fill="#fff"/>'
    '<g stroke="#000" stroke-width="18"><line x1="274" y1="171" x2="302.3" y2="38.2"/><line x1="341" y1="213.5" x2="454" y2="156.9"/></g></mask>'
    '<g mask="url(#ranurasPie)"><path fill="#FFFFFF" fill-rule="evenodd" d="M298.6 55.5 439.3 164.3 442 342.2 304.6 455.2 130.7 418.3 51 259.1 125.7 97.8ZM171 171V341H341V171Z"/>'
    '<path fill="#FF7400" d="M298.6 55.5 439.3 164.3 341 213.5 274 171Z"/></g></svg>')

AVISO_TRAMA = """
  <section class="seccion seccion--aviso">
    <div class="contenedor">
      <div class="aviso-desarrollo" role="note">
        <strong>TRAMA está en desarrollo</strong>
        <p>Todavía no está a la venta y aún no es un programa funcional: se encuentra en etapa de pruebas y es posible que no sea compatible con su sistema operativo. Muy pronto lo lanzaremos al mercado en una versión beta.</p>
      </div>
    </div>
  </section>"""

MENU = [
    ("planes.html", "Planes"),
    ("descargas.html", "Descargas"),
    ("nosotros.html", "Nosotros"),
    ("contacto.html", "Contacto"),
]

DESPLEGABLE = """
        <div class="desplegable" id="desplegableProductos">
          <a class="destacado" href="productos.html#trama"><strong>TRAMA</strong><span>Plataforma BIM y gestión integral de proyectos</span></a>
          <h4>Servicios</h4>
          <a href="productos.html#gestion"><strong>Gestión de proyectos</strong><span>Alcance, cronograma, costos y control</span></a>
          <a href="productos.html#bim"><strong>Modelación BIM</strong><span>Modelos coordinados de arquitectura y estructura</span></a>
          <a href="productos.html#estructural"><strong>Diseño estructural</strong><span>Análisis, diseño y memorias de cálculo</span></a>
          <a href="productos.html#coordinacion"><strong>Coordinación técnica</strong><span>Interferencias, incidencias y disciplinas</span></a>
          <a href="productos.html#software"><strong>Software a la medida</strong><span>Herramientas y automatización para el sector</span></a>
          <a href="productos.html#capacitacion"><strong>Consultoría y capacitación</strong><span>Adopción de flujos digitales y BIM</span></a>
        </div>"""

def cabecera(activa):
    enlaces = []
    for href, texto in MENU:
        clase = ' class="activo" aria-current="page"' if href == activa else ''
        enlaces.append('      <a href="%s"%s>%s</a>' % (href, clase, texto))
    activo_prod = ' activo' if activa == "productos.html" else ''
    return """<div class="aviso-prueba" role="note"><strong>TRAMA está en desarrollo.</strong> Aún no está a la venta ni es un programa funcional; está en etapa de pruebas y puede no ser compatible con su sistema operativo. Muy pronto, versión beta.</div>
<header class="cabecera" id="cabecera">
  <div class="contenedor cabecera__fila">
    <a class="marca" href="index.html" aria-label="GEOMAGNI TECNOLOGÍAS, inicio">
      <img src="img/geomagni-firma.svg" alt="GEOMAGNI TECNOLOGÍAS" width="200" height="50">
    </a>
    <button class="menu-boton" id="menuBoton" aria-expanded="false" aria-controls="menu" aria-label="Abrir menú">
      <span></span><span></span><span></span>
    </button>
    <nav class="menu" id="menu" aria-label="Principal">
      <div class="menu__grupo">
        <button class="menu__abrir%s" id="abrirProductos" aria-expanded="false" aria-controls="desplegableProductos">Productos</button>%s
      </div>
%s
      <a class="enlace-cuenta" href="cuenta.html">Mi cuenta</a>
      <a class="boton boton--naranja" href="inscripcion.html">Inscribirse</a>
    </nav>
  </div>
</header>
""" % (activo_prod, DESPLEGABLE, "\n".join(enlaces))

PIE = """<footer class="pie">
  <div class="contenedor">
    <div class="pie__columnas">
      <div>
        <div class="pie__marca">%(simbolo)s
          <div><strong>GEOMAGNI TECNOLOGÍAS S.A.S.</strong><span>NIT 902.113.610-0</span></div>
        </div>
        <p class="pie__descripcion">Ingeniería, BIM y software para proyectos de construcción e infraestructura. Cartagena de Indias, Colombia.</p>
      </div>
      <div>
        <h4>Productos</h4>
        <ul>
          <li><a href="productos.html#trama">TRAMA</a></li>
          <li><a href="productos.html#bim">Modelación BIM</a></li>
          <li><a href="productos.html#estructural">Diseño estructural</a></li>
          <li><a href="productos.html#software">Software a la medida</a></li>
        </ul>
      </div>
      <div>
        <h4>Recursos</h4>
        <ul>
          <li><a href="planes.html">Planes y precios</a></li>
          <li><a href="planes.html#pagos">Formas de pago</a></li>
          <li><a href="descargas.html">Descargas</a></li>
          <li><a href="planes.html#preguntas">Preguntas frecuentes</a></li>
          <li><a href="inscripcion.html">Inscripción</a></li>
          <li><a href="ayuda.html">Centro de ayuda</a></li>
          <li><a href="novedades.html">Novedades de TRAMA</a></li>
        </ul>
      </div>
      <div>
        <h4>Empresa</h4>
        <ul>
          <li><a href="nosotros.html">Nosotros</a></li>
          <li><a href="trabaja.html">Trabaja con nosotros</a></li>
          <li><a href="contacto.html">Contacto</a></li>
          <li><a href="privacidad.html">Tratamiento de datos</a></li>
          <li><a href="terminos.html">Términos de uso</a></li>
        </ul>
      </div>
    </div>
    <div class="pie__fila">
      <p class="pie__copy" style="margin:0">© <span class="anio">2026</span> GEOMAGNI TECNOLOGÍAS S.A.S. Todos los derechos reservados. · Sitio de prueba.
        <span class="visitas-pie" hidden> · <b class="visitas-numero">0</b> visitas</span></p>
      <p class="pie__lema">La medida da forma.</p>
    </div>
  </div>
</footer>
<a class="whatsapp" href="https://wa.me/%(wa)s?text=%(wa_texto)s" target="_blank" rel="noopener" aria-label="Escríbanos por WhatsApp">
  <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C8.8 3 3 8.6 3 15.5c0 2.5.8 4.9 2.1 6.9L3.6 29l6.8-1.7c1.7.9 3.6 1.4 5.6 1.4 7.2 0 13-5.6 13-12.5S23.2 3 16 3z" fill="currentColor"/><path d="M11.6 9.8c.3 0 .6 0 .8.6l1.1 2.6c.1.3 0 .6-.1.8l-.8 1c-.2.2-.2.5 0 .8.8 1.4 2.1 2.6 3.6 3.3.3.1.6.1.8-.1l1-1.2c.2-.3.5-.3.8-.2l2.5 1.2c.3.1.5.4.4.8-.2 1.3-1.4 2.4-2.8 2.4-4.4-.3-8.6-4.3-8.9-8.6 0-1.4 1-2.7 2.3-3h.3z" fill="#fff"/></svg>
  <span>¿Hablamos?</span>
</a>
<script src="script.js"></script>
</body>
</html>
""" % {"simbolo": SIMBOLO_BLANCO, "wa": TEL_ENLACE.lstrip("+"),
       "wa_texto": "Hola%20GEOMAGNI%2C%20quiero%20informaci%C3%B3n%20sobre%20TRAMA"}

def documento(archivo, titulo, descripcion, cuerpo, extra_head=""):
    canon = URL + ("" if archivo == "index.html" else archivo)
    html = """<!doctype html>
<html lang="es-CO">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>%(titulo)s</title>
  <meta name="description" content="%(desc)s">
  <meta name="theme-color" content="#5B2A86">
  <link rel="canonical" href="%(canon)s">
  <link rel="icon" type="image/svg+xml" href="img/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="img/favicon-32.png">
  <link rel="apple-touch-icon" href="img/apple-touch-icon.png">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_CO">
  <meta property="og:site_name" content="GEOMAGNI TECNOLOGÍAS">
  <meta property="og:title" content="%(titulo)s">
  <meta property="og:description" content="%(desc)s">
  <meta property="og:url" content="%(canon)s">
  <meta property="og:image" content="%(url)simg/og-geomagni.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="estilos.css">
  <link rel="stylesheet" href="paginas.css">
  <link rel="stylesheet" href="dinamico.css">%(extra)s
</head>
<body>
<a class="saltar" href="#contenido">Saltar al contenido</a>
""" % {"titulo": titulo, "desc": descripcion, "canon": canon, "url": URL, "extra": extra_head}
    html += cabecera(archivo) + '\n<main id="contenido">\n' + cuerpo + '\n</main>\n\n' + PIE
    with open(os.path.join(RAIZ, archivo), "w", encoding="utf-8", newline="\n") as f:
        f.write(html)
    print("  ", archivo)

def encabezado(miga, etiqueta, titulo, texto):
    return """  <section class="encabezado">
    <div class="contenedor">
      <p class="migas"><a href="index.html">Inicio</a> / %s</p>
      <p class="etiqueta">%s</p>
      <h1>%s</h1>
      <p>%s</p>
    </div>
  </section>
""" % (miga, etiqueta, titulo, texto)

FRANJA = """  <section class="seccion">
    <div class="contenedor">
      <div class="franja">
        <div><h2>¿Tiene un proyecto en mente?</h2><p>Cuéntenos el alcance y le enviamos una propuesta de trabajo.</p></div>
        <a class="boton boton--naranja" href="contacto.html">Hablemos</a>
      </div>
    </div>
  </section>
"""

FORM_CASILLA = """        <div class="trampa" aria-hidden="true"><label>No llene este campo <input name="sitio_web" tabindex="-1" autocomplete="off"></label></div>
        <div class="campo campo--casilla">
          <input type="checkbox" id="%(id)s" name="autorizo" required>
          <label for="%(id)s">Autorizo a GEOMAGNI TECNOLOGÍAS S.A.S. a tratar mis datos para responder esta solicitud, según su <a href="privacidad.html">política de tratamiento de datos</a>.</label>
        </div>"""

JSON_LD = """
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "GEOMAGNI TECNOLOGÍAS S.A.S.",
    "alternateName": "GEOMAGNI",
    "slogan": "La medida da forma.",
    "url": "%s",
    "logo": "%simg/geomagni-simbolo.svg",
    "taxID": "902113610-0",
    "email": "%s",
    "telephone": "%s",
    "founder": { "@type": "Person", "name": "Juan Carlos Camacho Puello", "jobTitle": "Ingeniero Civil" },
    "foundingDate": "2026-08-31",
    "address": { "@type": "PostalAddress", "addressLocality": "Cartagena", "addressRegion": "Bolívar", "addressCountry": "CO" },
    "areaServed": "CO",
    "knowsAbout": ["Gestión de proyectos", "Modelación BIM", "Análisis y diseño estructural", "Coordinación técnica", "Desarrollo de software"]
  }
  </script>""" % (URL, URL, CORREO, TEL)

# ---------------------------------------------------------------- INICIO
def p_inicio():
    tarjetas = [
        ("productos.html#trama", iso_bloques(), "TRAMA", "Plataforma BIM propia para modelar, documentar y gestionar el proyecto en un mismo entorno."),
        ("productos.html#bim", iso_planos(), "Modelación BIM", "Modelos coordinados con niveles, ejes, vistas y planos listos para construir."),
        ("productos.html#estructural", iso_estructura(), "Diseño estructural", "Análisis y diseño de estructuras con memorias de cálculo trazables."),
        ("productos.html#coordinacion", iso_red(), "Coordinación técnica", "Disciplinas integradas e incidencias con origen, estado y responsable."),
        ("productos.html#software", iso_codigo(), "Software a la medida", "Automatización e intercambio de datos CAD y BIM para su equipo."),
        ("productos.html#capacitacion", iso_ensenanza(), "Consultoría y capacitación", "Acompañamiento para adoptar flujos de trabajo digitales y BIM."),
    ]
    cards = "\n".join("""        <article class="ilustrada">
          <div class="ilustrada__img">%s</div>
          <div class="ilustrada__cuerpo"><h3>%s</h3><p>%s</p><a class="enlace-flecha" href="%s">Conocer más</a></div>
        </article>""" % (svg, t, d, h) for h, svg, t, d in tarjetas)
    cuerpo = """  <section class="portada" id="inicio">
    <div class="contenedor portada__fila">
      <div class="portada__texto">
        <p class="etiqueta">La medida da forma</p>
        <h1>Ingeniería, BIM y software para <span class="rotativa" data-palabras="construcción|infraestructura|estructuras|su proyecto">construcción</span></h1>
        <p class="portada__bajada">GEOMAGNI conecta geometría, datos y decisiones para que los proyectos puedan comprenderse y gestionarse como un solo sistema.</p>
        <div class="portada__acciones">
          <a class="boton boton--naranja" href="productos.html">Ver productos y servicios</a>
          <a class="boton boton--contorno" href="productos.html#trama">Conozca TRAMA</a>
        </div>
      </div>
      <div class="portada__grafico" aria-hidden="true">
        <svg viewBox="0 0 480 480" class="isometria">
          <defs><pattern id="malla" width="40" height="23.09" patternUnits="userSpaceOnUse" patternTransform="skewX(-30)"><path d="M0 0H40M0 0V23.09" stroke="rgba(255,255,255,.10)" stroke-width="1" fill="none"/></pattern></defs>
          <rect width="480" height="480" fill="url(#malla)"/>
          <g class="bloque b1"><path d="M150 250 210 215 270 250 210 285Z" fill="#A583C2"/><path d="M150 250 210 285V365L150 330Z" fill="#7A4AA8"/><path d="M210 285 270 250V330L210 365Z" fill="#3A195B"/></g>
          <g class="bloque b2"><path d="M230 170 290 135 350 170 290 205Z" fill="#A583C2"/><path d="M230 170 290 205V315L230 280Z" fill="#7A4AA8"/><path d="M290 205 350 170V280L290 315Z" fill="#3A195B"/></g>
          <g class="bloque b3"><path d="M290 300 330 277 370 300 330 323Z" fill="#FFB273"/><path d="M290 300 330 323V363L290 340Z" fill="#FF7400"/><path d="M330 323 370 300V340L330 363Z" fill="#C54F00"/></g>
          <g class="cota" stroke="#FF7400" stroke-width="2" fill="none"><path d="M120 262 120 342"/><path d="M114 262H126M114 342H126"/></g>
          <text x="96" y="306" class="cota__texto" transform="rotate(-90 96 306)">3,00 m</text>
          <circle cx="290" cy="135" r="6" fill="#FF7400" class="nodo"/><circle cx="150" cy="250" r="5" fill="#fff" class="nodo n2"/>
          <path d="M290 135 L150 250" stroke="rgba(255,255,255,.35)" stroke-dasharray="4 6" class="enlace"/>
        </svg>
      </div>
    </div>
  </section>

  <div class="cinta" aria-hidden="true"><div class="cinta__pista">%(cinta)s</div></div>

  <section class="seccion">
    <div class="contenedor">
      <header class="seccion__cabeza">
        <p class="etiqueta etiqueta--morada">Productos y servicios</p>
        <h2>Todo lo que su proyecto necesita, conectado</h2>
        <p>Software propio y servicios de ingeniería que trabajan sobre la misma información.</p>
      </header>
      <div class="rejilla rejilla--3">
%(cards)s
      </div>
    </div>
  </section>

  <section class="seccion seccion--oscura">
    <div class="contenedor producto">
      <div>
        <img src="img/trama-invertido.svg" alt="TRAMA" class="trama__logo" width="300" height="80">
        <p class="trama__firma">Una plataforma de GEOMAGNI</p>
        <h2>El proyecto como un solo sistema</h2>
        <div class="pestanas" role="tablist" aria-label="Funciones de TRAMA">
          <button role="tab" id="t1" aria-controls="p1" data-zona="20,10,78,72">Modelado 3D</button>
          <button role="tab" id="t2" aria-controls="p2" data-zona="0,10,22,82">Vistas y niveles</button>
          <button role="tab" id="t3" aria-controls="p3" data-zona="0,0,100,14">Planos</button>
          <button role="tab" id="t4" aria-controls="p4" data-zona="84,10,15,18">Interoperabilidad</button>
        </div>
        <div class="panel-pestana" role="tabpanel" id="p1" aria-labelledby="t1"><h3>Geometría que obedece a las medidas</h3><p>Sólidos, vacíos y componentes paramétricos con cotas que gobiernan la forma.</p></div>
        <div class="panel-pestana" role="tabpanel" id="p2" aria-labelledby="t2" hidden><h3>Todo el proyecto organizado</h3><p>Niveles, ejes, plantas, alzados, secciones y cajas de sección en un navegador de vistas.</p></div>
        <div class="panel-pestana" role="tabpanel" id="p3" aria-labelledby="t3" hidden><h3>De modelo a plano</h3><p>Composición de planos con formatos, rótulos y vistas colocadas a escala.</p></div>
        <div class="panel-pestana" role="tabpanel" id="p4" aria-labelledby="t4" hidden><h3>Trabaje con lo que ya tiene</h3><p>Importación y exportación de archivos DWG y DXF, con capas y colores.</p></div>
        <div class="portada__acciones">
          <a class="boton boton--naranja" href="inscripcion.html">Pruebe 7 días gratis</a>
          <a class="boton boton--contorno" href="planes.html">Ver planes</a>
        </div>
      </div>
      <div class="producto__visual">%(ventana)s<span class="resalte" aria-hidden="true"></span></div>
    </div>
  </section>

  <section class="seccion">
    <div class="contenedor">
      <div class="cifras cifras--grandes">
        <div class="cifra"><strong><span data-fin="6">0</span></strong><span>servicios de ingeniería y tecnología</span></div>
        <div class="cifra"><strong><span data-fin="1">0</span></strong><span>plataforma BIM propia, hecha en Colombia</span></div>
        <div class="cifra"><strong><span data-fin="100">0</span><small>%%</small></strong><span>información trazable de principio a fin</span></div>
        <div class="cifra cifra--visitas" hidden><strong><span class="visitas-numero">0</span></strong><span>visitas a este sitio</span></div>
      </div>
    </div>
  </section>

  <section class="seccion">
    <div class="contenedor">
      <header class="seccion__cabeza">
        <p class="etiqueta etiqueta--morada">Para quién trabajamos</p>
        <h2>Información útil para cada responsable del proyecto</h2>
      </header>
      <div class="rejilla rejilla--4">
        <article class="publico"><h3>Propietarios y dirección</h3><p>Vea el proyecto como un sistema conectado, con información y responsabilidades identificables para decidir con confianza.</p></article>
        <article class="publico"><h3>Gerencia de proyectos y PMO</h3><p>Convierta información dispersa en una estructura común y trazable de alcance, avance, decisiones y responsables.</p></article>
        <article class="publico"><h3>Coordinación BIM</h3><p>Conecte el modelo con la información que le da contexto: datos, incidencias y disciplinas en un mismo lugar.</p></article>
        <article class="publico"><h3>Construcción y obra</h3><p>Lleve a campo la información vigente: qué cambió, qué aplica y quién responde.</p></article>
      </div>
    </div>
  </section>

  <section class="seccion seccion--suave">
    <div class="contenedor">
      <header class="seccion__cabeza">
        <p class="etiqueta etiqueta--morada">Método</p>
        <h2>Cómo trabajamos</h2>
      </header>
      <ol class="pasos">
        <li><span class="pasos__num">01</span><h3>Entender</h3><p>Escuchamos la necesidad, revisamos la información existente y definimos alcance y criterios de aceptación.</p></li>
        <li><span class="pasos__num">02</span><h3>Estructurar</h3><p>Organizamos el proyecto: modelo, disciplinas, responsables, cronograma y entregables.</p></li>
        <li><span class="pasos__num">03</span><h3>Desarrollar</h3><p>Modelamos, calculamos y coordinamos con revisiones periódicas y control de versiones.</p></li>
        <li><span class="pasos__num">04</span><h3>Verificar y entregar</h3><p>Comprobamos contra los criterios acordados y entregamos información trazable y lista para usar.</p></li>
      </ol>
    </div>
  </section>
%(franja)s"""
    palabras = ["Modelación BIM", "Diseño estructural", "Gestión de proyectos", "Coordinación técnica", "Software a la medida", "DWG y DXF", "Planos y documentación", "Capacitación"]
    cinta = "".join("<span>%s</span>" % w for w in palabras * 2)
    cuerpo = cuerpo % {"cards": cards, "ventana": ventana_trama(), "franja": FRANJA, "cinta": cinta}
    documento("index.html", "GEOMAGNI TECNOLOGÍAS · Ingeniería, BIM y software para proyectos",
              "GEOMAGNI TECNOLOGÍAS S.A.S., Cartagena, Colombia. Plataforma BIM TRAMA, modelación BIM, diseño estructural, coordinación técnica y software especializado para construcción e infraestructura.",
              cuerpo, JSON_LD)

# ---------------------------------------------------------------- PRODUCTOS
def p_productos():
    servicios = [
        ("gestion", "gestion", iso_red(), "Consultoría y gestión de proyectos",
         "Planeación, control y seguimiento de proyectos de construcción e infraestructura con criterios claros.",
         ["Definición de alcance y estructura de desglose del trabajo", "Programación y control de avance", "Presupuesto y control de costos", "Matriz de responsables e informes de estado"]),
        ("bim", "bim", iso_planos(), "Modelación BIM",
         "Modelos de información de arquitectura y estructura listos para revisar, cuantificar y construir.",
         ["Modelos 3D por disciplina", "Niveles, ejes, plantas, alzados y secciones", "Planos y cuadros de cantidades", "Intercambio con archivos DWG y DXF"]),
        ("estructural", "estructura", iso_estructura(), "Análisis y diseño estructural",
         "Diseño de estructuras con memorias de cálculo trazables, conforme a la normativa colombiana aplicable.",
         ["Modelación y análisis estructural", "Diseño de elementos en concreto y acero", "Memorias de cálculo y planos", "Revisión de diseños existentes"]),
        ("coordinacion", "coordinacion", iso_red(), "Coordinación técnica",
         "Integración de disciplinas para que cada cambio tenga origen, estado y responsable.",
         ["Detección de interferencias", "Gestión de incidencias", "Reuniones de coordinación con actas", "Control de versiones de la información"]),
        ("software", "software", iso_codigo(), "Software a la medida",
         "Herramientas para el sector diseñadas a partir de su forma de trabajar.",
         ["Automatización de tareas repetitivas", "Conversión e intercambio de datos CAD/BIM", "Aplicaciones técnicas de escritorio", "Integración con sus herramientas actuales"]),
        ("capacitacion", "consultoria", iso_ensenanza(), "Consultoría tecnológica y capacitación",
         "Acompañamiento para que su equipo adopte flujos de trabajo digitales y BIM.",
         ["Diagnóstico de procesos", "Estándares y plantillas", "Capacitación del equipo", "Acompañamiento en el primer proyecto"]),
    ]
    bloques = []
    for i, (ancla, ico, svg, titulo, texto, items) in enumerate(servicios):
        lista = "".join("<li>%s</li>" % x for x in items)
        fondo = " seccion--suave" if i % 2 == 0 else ""
        bloques.append("""  <section class="seccion%s" id="%s">
    <div class="contenedor producto">
      <div>
        <div class="tarjeta__icono">%s</div>
        <h2>%s</h2>
        <p>%s</p>
        <ul class="lista-chequeo lista-chequeo--clara">%s</ul>
        <a class="boton boton--morado" href="contacto.html?asunto=%s">Solicitar propuesta</a>
      </div>
      <div class="ilustrada"><div class="ilustrada__img" style="aspect-ratio:4/3">%s</div></div>
    </div>
  </section>""" % (fondo, ancla, icono(ico), titulo, texto, lista, ancla, svg))
    cuerpo = encabezado("Productos y servicios", "Productos y servicios",
                        "Software propio e ingeniería sobre la misma información",
                        "Conozca TRAMA, nuestra plataforma BIM, y los servicios con los que acompañamos cada etapa del proyecto.")
    cuerpo += AVISO_TRAMA
    cuerpo += """
  <section class="seccion seccion--oscura" id="trama">
    <div class="contenedor producto">
      <div>
        <img src="img/trama-invertido.svg" alt="TRAMA" class="trama__logo" width="300" height="80">
        <p class="trama__firma">Una plataforma de GEOMAGNI <span class="insignia insignia--naranja">En desarrollo</span></p>
        <h2>El proyecto como un solo sistema</h2>
        <p style="color:rgba(255,255,255,.82)">TRAMA reúne en un mismo entorno el modelo tridimensional, sus vistas y planos, y la información que le da contexto.</p>
        <ul class="lista-chequeo">
          <li>Modelado 3D de sólidos, componentes paramétricos y cotas que gobiernan la geometría.</li>
          <li>Niveles, ejes, plantas, alzados, secciones y cajas de sección.</li>
          <li>Composición de planos con formatos y rótulos.</li>
          <li>Importación y exportación de archivos CAD (DXF y DWG).</li>
          <li>Recorridos de cámara y renderizado del modelo.</li>
        </ul>
        <div class="portada__acciones">
          <a class="boton boton--naranja" href="inscripcion.html">Pruebe 7 días gratis</a>
          <a class="boton boton--contorno" href="planes.html">Planes</a>
        </div>
      </div>
      <div class="producto__visual">%s</div>
    </div>
  </section>
%s
%s""" % (ventana_trama(), "\n".join(bloques), FRANJA)
    documento("productos.html", "Productos y servicios · GEOMAGNI TECNOLOGÍAS",
              "TRAMA, plataforma BIM de GEOMAGNI, y servicios de gestión de proyectos, modelación BIM, diseño estructural, coordinación técnica y software a la medida.", cuerpo)

# ---------------------------------------------------------------- PLANES Y PAGOS
def p_planes():
    planes = [
        ("estudiante", "Estudiante", "Para aprender y hacer proyectos académicos.", False,
         ["TRAMA para un equipo", "Modelado 3D, vistas y planos", "Importación DWG y DXF", "Comunidad y tutoriales", "Uso no comercial"]),
        ("profesional", "Profesional", "Para profesionales independientes y pequeños equipos.", True,
         ["Todo lo del plan Estudiante", "Uso comercial", "Componentes paramétricos", "Exportación DWG y DXF", "Renderizado y recorridos", "Soporte por correo"]),
        ("empresa", "Empresa", "Para organizaciones con varios proyectos y equipos.", False,
         ["Todo lo del plan Profesional", "Licencias para varios usuarios", "Gestión de portafolio y programas", "Capacitación del equipo", "Soporte prioritario", "Acompañamiento en la implementación"]),
    ]
    tarjetas = []
    for clave, nombre, para, recom, items in planes:
        sello = '<span class="plan__sello">Recomendado</span>' if recom else ''
        lista = "".join("<li>%s</li>" % x for x in items)
        tarjetas.append("""        <article class="plan%s">
          %s<h3>%s</h3>
          <p class="plan__para">%s</p>
          <p class="plan__precio">Por anunciar</p>
          <p class="plan__periodo">Precio por usuario</p>
          <ul>%s</ul>
          <button class="boton %s boton-pago" type="button" data-plan="%s">Comprar</button>
        </article>""" % (" plan--recomendado" if recom else "", sello, nombre, para, lista,
                         "boton--naranja" if recom else "boton--morado", clave))
    filas = [
        ("Modelado 3D, vistas y planos", 1, 1, 1),
        ("Importación DWG y DXF", 1, 1, 1),
        ("Uso comercial", 0, 1, 1),
        ("Componentes paramétricos", 0, 1, 1),
        ("Renderizado y recorridos", 0, 1, 1),
        ("Varios usuarios", 0, 0, 1),
        ("Gestión de portafolio y programas", 0, 0, 1),
        ("Capacitación incluida", 0, 0, 1),
        ("Soporte", "Comunidad", "Correo", "Prioritario"),
    ]
    def celda(v):
        if v == 1: return '<td class="si" aria-label="Incluido">✓</td>'
        if v == 0: return '<td class="no" aria-label="No incluido">—</td>'
        return '<td>%s</td>' % v
    tabla = "\n".join("            <tr><td>%s</td>%s</tr>" % (f[0], "".join(celda(v) for v in f[1:])) for f in filas)
    pagos = [
        ("tarjeta", "Tarjetas", "Crédito y débito Visa, Mastercard y American Express"),
        ("banco", "PSE", "Débito desde su cuenta en cualquier banco colombiano"),
        ("movil", "Nequi", "Pago desde la aplicación"),
        ("transferencia", "Transferencia", "Bancaria, para planes empresariales y servicios"),
    ]
    medios = "\n".join('        <div class="pago">%s<strong>%s</strong><span>%s</span></div>' % (icono(i), t, d) for i, t, d in pagos)
    cuerpo = encabezado("Planes", "Planes y precios", "Elija el plan de TRAMA para su forma de trabajar",
                        "TRAMA todavía no está a la venta. Los precios que ve son valores de muestra; los definitivos se anunciarán con el lanzamiento de la versión beta.")
    cuerpo += AVISO_TRAMA
    cuerpo += """
  <section class="seccion">
    <div class="contenedor" style="text-align:center">
      <div class="conmutador" role="group" aria-label="Periodo de pago">
        <button type="button" data-periodo="mensual" aria-pressed="true">Mensual</button>
        <button type="button" data-periodo="anual" aria-pressed="false">Anual <small>ahorre</small></button>
      </div>
    </div>
    <div class="contenedor">
      <div class="planes" style="text-align:left">
%s
      </div>
      <p class="nota-centro" id="notaPago" role="status">Para comprar necesita una cuenta GEOMAGNI con el correo confirmado; la licencia se activa sola al aprobarse el pago. TRAMA todavía no está a la venta: los pagos en línea se activarán con el lanzamiento de la versión beta.</p>
    </div>
  </section>
<!--INTERES-->

  <section class="seccion seccion--suave">
    <div class="contenedor">
      <header class="seccion__cabeza"><p class="etiqueta etiqueta--morada">Comparación</p><h2>Qué incluye cada plan</h2></header>
      <div class="tabla-envoltura">
        <table class="tabla">
          <thead><tr><th scope="col">Función</th><th scope="col">Estudiante</th><th scope="col">Profesional</th><th scope="col">Empresa</th></tr></thead>
          <tbody>
%s
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="seccion" id="pagos">
    <div class="contenedor">
      <header class="seccion__cabeza">
        <p class="etiqueta etiqueta--morada">Formas de pago</p>
        <h2>Pague como prefiera</h2>
        <p>Los pagos en línea se procesarán a través de una pasarela de pagos colombiana certificada. GEOMAGNI no almacena los datos de su tarjeta.</p>
      </header>
      <div class="pagos">
%s
      </div>
    </div>
  </section>

  <section class="seccion seccion--suave" id="preguntas">
    <div class="contenedor" style="max-width:820px">
      <header class="seccion__cabeza"><p class="etiqueta etiqueta--morada">Preguntas frecuentes</p><h2>Antes de elegir</h2></header>
      <div class="faq">
        <details><summary>¿Ya puedo comprar o usar TRAMA?</summary><p>Todavía no. TRAMA está en desarrollo y en etapa de pruebas: no está a la venta y aún no es un programa funcional para trabajar en proyectos reales. Muy pronto lo lanzaremos en una versión beta. Si quiere recibir el aviso, déjenos su correo en «Avíseme cuando pueda comprar».</p></details>
        <details><summary>¿Cuándo se publican los precios?</summary><p>Con el lanzamiento de la versión beta de TRAMA. Si quiere recibir el aviso, escríbanos desde la página de contacto.</p></details>
        <details><summary>¿Qué necesito para instalarlo?</summary><p>Un equipo con Windows 10 u 11 de 64 bits. Los requisitos completos están en la página de descargas.</p></details>
        <details><summary>¿Emiten factura electrónica?</summary><p>Sí. GEOMAGNI TECNOLOGÍAS S.A.S. está registrada en Colombia con NIT 902.113.610-0 y factura cada compra.</p></details>
        <details><summary>¿Ofrecen planes para universidades o empresas grandes?</summary><p>Sí. Para licencias por volumen, instituciones educativas o servicios de implementación, solicite una cotización.</p></details>
      </div>
    </div>
  </section>
%s""" % ("\n".join(tarjetas), tabla, medios, FRANJA)
    cuerpo = cuerpo.replace("<!--INTERES-->", SECCION_INTERES % {"casilla": FORM_CASILLA % {"id": "n-autorizo"}})
    documento("planes.html", "Planes, precios y formas de pago · GEOMAGNI TECNOLOGÍAS",
              "Planes Estudiante, Profesional y Empresa de TRAMA, comparación de funciones, formas de pago (tarjeta, PSE, Nequi, transferencia) y preguntas frecuentes.", cuerpo, MODULO_CUENTA)

# ---------------------------------------------------------------- DESCARGAS
# TRAMA no se publica en el sitio: se descarga desde «Mi cuenta» con licencia vigente
# (archivos en Firebase Storage, protegidos por storage.rules). Tamaño y huella de la versión vigente:
INSTALADORES = [
    ("descarga", "Instalador de TRAMA para Windows",
     "Versión 1.5.703. Instala TRAMA con sus accesos en el escritorio y el menú Inicio.",
     "46,5 MB · SHA-256: 33B4C04C3AAC17D61761D5FEF6D61A160822093A79F99D800AFA18DB071B77BB"),
    ("caja", "TRAMA portátil",
     "La misma versión en un archivo comprimido que se ejecuta sin instalar. Descomprima y abra IniciarTRAMA.exe.",
     "46,4 MB · SHA-256: 0238665BFA65F9070A272CF2917BBCB04BCE01BAD2099830E761D9C004339F59"),
]

DESCARGAS = [
    # (icono, titulo, insignia, descripcion, archivo, texto boton)
    ("pdf", "Portafolio de servicios", ("PDF", "morada"),
     "Presentación de GEOMAGNI: servicios, método de trabajo y datos de contacto.",
     "descargas/GEOMAGNI-portafolio-de-servicios.pdf", "Descargar PDF"),
    ("pdf", "Ficha técnica de TRAMA", ("PDF", "morada"),
     "Funciones, requisitos del sistema y formatos compatibles de la plataforma.",
     "descargas/TRAMA-ficha-tecnica.pdf", "Descargar PDF"),
    ("marca", "Kit de marca GEOMAGNI", ("ZIP", "morada"),
     "Símbolo, firma e icono en SVG y PNG, colores corporativos y tipografías Sora e Inter con sus licencias.",
     "descargas/GEOMAGNI-kit-de-marca.zip", "Descargar kit"),
]

def tamano(ruta):
    p = os.path.join(RAIZ, ruta)
    if not os.path.exists(p): return "pendiente"
    b = os.path.getsize(p)
    return ("%.1f MB" % (b / 1048576)).replace(".", ",") if b > 1048576 else ("%d KB" % max(1, b // 1024))

def sha256(ruta):
    import hashlib
    p = os.path.join(RAIZ, ruta)
    if not os.path.exists(p): return ""
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""): h.update(b)
    return h.hexdigest().upper()

def p_descargas():
    items = []
    for ico, titulo, desc, meta in INSTALADORES:
        items.append("""        <article class="descarga">
          <div class="descarga__icono">%s</div>
          <div><h3>%s <span class="insignia insignia--naranja">Disponible con la beta</span></h3><p>%s</p><p class="descarga__meta">%s</p></div>
          <div class="descarga__acciones"><button class="boton boton--bloqueado" type="button" disabled aria-disabled="true">Descarga no disponible</button><a class="boton-texto" href="planes.html#interes">Avisarme del lanzamiento</a></div>
        </article>""" % (icono(ico), titulo, desc, meta))
    for ico, titulo, (ins, color), desc, archivo, boton in DESCARGAS:
        meta = tamano(archivo)
        if archivo.endswith((".exe", ".zip")) and "TRAMA" in archivo:
            meta += " · SHA-256: " + sha256(archivo)
        items.append("""        <article class="descarga">
          <div class="descarga__icono">%s</div>
          <div><h3>%s <span class="insignia insignia--%s">%s</span></h3><p>%s</p><p class="descarga__meta">%s</p></div>
          <a class="boton boton--morado" href="%s" download>%s</a>
        </article>""" % (icono(ico), titulo, color, ins, desc, meta, archivo, boton))
    cuerpo = encabezado("Descargas", "Descargas", "Software, documentos y material de marca",
                        "Documentos de la empresa, kit de marca y la versión de pruebas de TRAMA, que todavía no es funcional.")
    cuerpo += AVISO_TRAMA
    cuerpo += """
  <section class="seccion">
    <div class="contenedor">
      <div class="aviso-licencia">
        <strong>La descarga de TRAMA estará disponible con el lanzamiento de la versión beta.</strong>
        Mientras tanto mostramos aquí los archivos de la versión de pruebas, pero no se pueden descargar. Inscríbase o déjenos su correo y le avisaremos en cuanto se habilite; entonces la descarga quedará en «Mi cuenta» y TRAMA le pedirá iniciar sesión con esa cuenta al abrir.
      </div>
      <div class="descargas">
%s
      </div>
      <p class="formulario__nota" style="margin-top:20px">La versión de pruebas de TRAMA no es todavía un programa funcional: se entrega solo para evaluación, sin garantía, sujeta a cambios y puede no ser compatible con su sistema operativo. Puede comprobar la integridad del archivo con su huella SHA-256.</p>
    </div>
  </section>

  <section class="seccion seccion--suave" id="requisitos">
    <div class="contenedor" style="max-width:880px">
      <header class="seccion__cabeza"><p class="etiqueta etiqueta--morada">Requisitos</p><h2>Requisitos previstos para TRAMA</h2></header>
      <div class="requisitos">
        <dl>
          <dt>Sistema operativo</dt><dd>Windows 10 u 11 de 64 bits (en pruebas: la compatibilidad no está garantizada)</dd>
          <dt>Procesador</dt><dd>Doble núcleo de 2 GHz o superior</dd>
          <dt>Memoria</dt><dd>8 GB de RAM (16 GB recomendados para modelos grandes)</dd>
          <dt>Tarjeta gráfica</dt><dd>Compatible con OpenGL; sin tarjeta dedicada funciona en modo compatible por procesador</dd>
          <dt>Espacio en disco</dt><dd>500 MB libres</dd>
          <dt>Formatos</dt><dd>Proyectos .ptrm, componentes .ctrm, importación y exportación DWG y DXF</dd>
        </dl>
      </div>
    </div>
  </section>

  <section class="seccion">
    <div class="contenedor" style="max-width:820px">
      <header class="seccion__cabeza"><p class="etiqueta etiqueta--morada">Instalación</p><h2>Cómo instalar TRAMA</h2></header>
      <ol class="pasos" style="grid-template-columns:repeat(3,1fr)">
        <li><span class="pasos__num">01</span><h3>Inscríbase</h3><p>Cree su cuenta, confirme su correo y active su licencia en «Mi cuenta».</p></li>
        <li><span class="pasos__num">02</span><h3>Descargue e instale</h3><p>Con el lanzamiento de la beta, descargue el instalador desde «Mi cuenta» y ábralo. Si Windows muestra un aviso, elija «Más información» y «Ejecutar de todas formas»: el instalador aún no tiene firma digital. Más detalles en el <a href="ayuda.html">centro de ayuda</a>.</p></li>
        <li><span class="pasos__num">03</span><h3>Inicie sesión</h3><p>Abra TRAMA e ingrese con el correo y la contraseña de su cuenta.</p></li>
      </ol>
    </div>
  </section>
%s""" % ("\n".join(items), FRANJA)
    documento("descargas.html", "Descargas · GEOMAGNI TECNOLOGÍAS",
              "Versión de pruebas de TRAMA (en desarrollo, aún no funcional), portafolio de servicios, la ficha técnica y el kit de marca de GEOMAGNI.", cuerpo)

# ---------------------------------------------------------------- NOSOTROS
def p_nosotros():
    valores = [
        ("Rigor", "Tratamos la información técnica con método y criterio, y diferenciamos datos, supuestos y resultados verificados."),
        ("Trazabilidad", "Cada dato y decisión conserva el contexto para saber de dónde viene y cómo cambió."),
        ("Integración", "Conectamos disciplinas sin borrar sus diferencias ni sustituir el conocimiento especializado."),
        ("Claridad", "Explicamos lo necesario con precisión: la complejidad no justifica una comunicación confusa."),
        ("Colaboración responsable", "La tecnología organiza el trabajo; las personas conservan el criterio y la responsabilidad."),
        ("Innovación útil", "Adoptamos tecnología por el valor que aporta, no por novedad."),
    ]
    vals = "\n".join('        <div class="valor"><h3>%s</h3><p>%s</p></div>' % v for v in valores)
    cuerpo = encabezado("Nosotros", "Nosotros", "Una empresa colombiana de ingeniería y tecnología",
                        "Unimos la práctica de la ingeniería civil con el desarrollo de software para que la información de los proyectos sea comprensible, conectada y verificable.")
    cuerpo += """
  <section class="seccion">
    <div class="contenedor empresa">
      <div class="empresa__texto">
        <p class="etiqueta etiqueta--morada">Propósito</p>
        <h2>Información conectada para decidir con confianza</h2>
        <p>GEOMAGNI TECNOLOGÍAS S.A.S. nace en Cartagena de Indias en 2026. Creemos que un proyecto se gestiona mejor cuando su geometría, sus datos y sus responsables forman una misma estructura.</p>
        <p><strong>Misión.</strong> Hacer que la información de los proyectos sea comprensible, conectada y verificable, para que las personas puedan coordinarse y decidir con mayor confianza.</p>
        <p><strong>Visión.</strong> Impulsar una forma de gestionar proyectos en la que cada dato tenga contexto, cada decisión pueda rastrearse y cada disciplina contribuya a una visión común.</p>
      </div>
      <div>
        <p class="etiqueta etiqueta--morada">Historia</p>
        <ol class="linea-tiempo">
          <li><time>Agosto de 2026</time><h3>Constitución</h3><p>Se constituye GEOMAGNI TECNOLOGÍAS S.A.S. en Cartagena.</p></li>
          <li><time>Octubre de 2026</time><h3>Registro mercantil</h3><p>Matrícula 10019603 en la Cámara de Comercio de Cartagena.</p></li>
          <li><time>2026</time><h3>TRAMA</h3><p>Desarrollo de la plataforma BIM propia y primera versión de prueba.</p></li>
        </ol>
      </div>
    </div>
  </section>

  <section class="seccion seccion--suave" id="fundadores">
    <div class="contenedor">
      <header class="seccion__cabeza"><p class="etiqueta etiqueta--morada">Fundadores</p><h2>Quién está detrás de GEOMAGNI</h2></header>
      <article class="persona">
        <div class="persona__foto" aria-hidden="true">JC</div>
        <div>
          <h3 style="font-size:1.5rem">Juan Carlos Camacho Puello</h3>
          <p class="persona__cargo">Fundador y representante legal · Ingeniero Civil</p>
          <p>Fundó GEOMAGNI para llevar la experiencia de la ingeniería civil y la dirección de proyectos al desarrollo de herramientas digitales para el sector de la construcción.</p>
        </div>
      </article>
      <p style="margin-top:28px">¿Quiere hacer parte del equipo? <a class="enlace-flecha" href="trabaja.html">Trabaja con nosotros</a></p>
    </div>
  </section>

  <section class="seccion">
    <div class="contenedor">
      <header class="seccion__cabeza"><p class="etiqueta etiqueta--morada">Valores</p><h2>Cómo trabajamos</h2></header>
      <div class="valores">
%s
      </div>
    </div>
  </section>

  <section class="seccion seccion--suave">
    <div class="contenedor empresa">
      <div class="empresa__texto">
        <p class="etiqueta etiqueta--morada">Empresa formal</p>
        <h2>Datos de registro</h2>
        <p>Somos una sociedad por acciones simplificada registrada en Colombia. Puede verificar estos datos en el Registro Único Empresarial y Social (RUES).</p>
      </div>
      <aside class="ficha" aria-label="Datos de registro">
        <dl>
          <dt>Razón social</dt><dd>GEOMAGNI TECNOLOGÍAS S.A.S.</dd>
          <dt>NIT</dt><dd>902.113.610-0</dd>
          <dt>Matrícula mercantil</dt><dd>10019603 · Cámara de Comercio de Cartagena</dd>
          <dt>Domicilio</dt><dd>Cartagena, Bolívar, Colombia</dd>
          <dt>Actividades (CIIU)</dt><dd>6201 Desarrollo de software · 5820 Edición de programas · 6202 Consultoría informática · 7490 Otras actividades profesionales y técnicas</dd>
        </dl>
      </aside>
    </div>
  </section>
%s""" % (vals, FRANJA)
    documento("nosotros.html", "Nosotros · GEOMAGNI TECNOLOGÍAS",
              "Propósito, historia, fundador, valores y datos de registro de GEOMAGNI TECNOLOGÍAS S.A.S., empresa colombiana de ingeniería y tecnología.", cuerpo)

# ---------------------------------------------------------------- TRABAJA CON NOSOTROS
def p_trabaja():
    areas = [("Ingeniería", "Diseño estructural, gestión y coordinación de proyectos"),
             ("Modelación BIM", "Modelado, documentación y coordinación"),
             ("Desarrollo de software", "Programación de TRAMA y herramientas técnicas"),
             ("Diseño y comunicación", "Experiencia de usuario, marca y contenidos")]
    ar = "\n".join('        <div class="area"><strong>%s</strong><span>%s</span></div>' % a for a in areas)
    cuerpo = encabezado("Trabaja con nosotros", "Trabaja con nosotros", "Construyamos juntos la forma de gestionar proyectos",
                        "Buscamos personas rigurosas y curiosas que quieran unir ingeniería y tecnología.")
    cuerpo += """
  <section class="seccion">
    <div class="contenedor">
      <header class="seccion__cabeza"><p class="etiqueta etiqueta--morada">Áreas</p><h2>Dónde puede aportar</h2></header>
      <div class="areas">
%s
      </div>
    </div>
  </section>

  <section class="seccion seccion--suave">
    <div class="contenedor">
      <header class="seccion__cabeza"><p class="etiqueta etiqueta--morada">Vacantes</p><h2>Ofertas abiertas</h2></header>
      <div class="vacio">
        <h3>En este momento no hay vacantes publicadas</h3>
        <p style="margin:0">Envíenos su hoja de vida y la tendremos en cuenta para próximas oportunidades.</p>
      </div>
    </div>
  </section>

  <section class="seccion" id="postulacion">
    <div class="contenedor contacto">
      <div class="contacto__texto">
        <p class="etiqueta etiqueta--morada">Postulación</p>
        <h2>Envíenos su hoja de vida</h2>
        <p>Complete el formulario. Se abrirá su programa de correo con el mensaje listo: <strong>adjunte allí su hoja de vida en PDF</strong> antes de enviarlo.</p>
      </div>
      <form class="formulario" data-asunto="Postulación" data-tipo="postulacion" novalidate>
        <div class="campo"><label for="t-nombre">Nombre completo</label><input id="t-nombre" name="nombre" autocomplete="name" required></div>
        <div class="campo"><label for="t-correo">Correo electrónico</label><input id="t-correo" name="correo" type="email" autocomplete="email" required></div>
        <div class="campo"><label for="t-tel">Teléfono <span class="opcional">(opcional)</span></label><input id="t-tel" name="telefono" type="tel" autocomplete="tel"></div>
        <div class="campo"><label for="t-area">Área de interés</label><select id="t-area" name="area"><option>Ingeniería</option><option>Modelación BIM</option><option>Desarrollo de software</option><option>Diseño y comunicación</option><option>Otra</option></select></div>
        <div class="campo"><label for="t-perfil">Cuéntenos sobre usted</label><textarea id="t-perfil" name="mensaje" rows="5" required></textarea></div>
%s
        <button class="boton boton--morado" type="submit">Preparar correo</button>
        <p class="formulario__nota" role="status">Sus datos se usan solo para el proceso de selección.</p>
      </form>
    </div>
  </section>
""" % (ar, FORM_CASILLA % {"id": "t-autorizo"})
    documento("trabaja.html", "Trabaja con nosotros · GEOMAGNI TECNOLOGÍAS",
              "Áreas de trabajo, vacantes y postulación para trabajar en GEOMAGNI TECNOLOGÍAS, Cartagena, Colombia.", cuerpo, MODULO_CUENTA)

# ---------------------------------------------------------------- CONTACTO
def p_contacto():
    cuerpo = encabezado("Contacto", "Contacto", "Cuéntenos sobre su proyecto",
                        "Escríbanos y le responderemos con una propuesta de alcance y tiempos.")
    cuerpo += """
  <section class="seccion">
    <div class="contenedor contacto">
      <div class="contacto__texto">
        <h2>Canales de atención</h2>
        <ul class="datos">
          <li><span>Teléfono y WhatsApp</span><a href="tel:%(tel_e)s">%(tel)s</a></li>
          <li><span>Correo</span><a href="mailto:%(correo)s">%(correo)s</a></li>
          <li><span>Ciudad</span>Cartagena de Indias, Colombia</li>
          <li><span>Horario</span>Lunes a viernes, 8:00 a. m. a 6:00 p. m.</li>
        </ul>
        <a class="boton boton--whatsapp" href="https://wa.me/573117227083?text=Hola%%20GEOMAGNI%%2C%%20quiero%%20informaci%%C3%%B3n%%20sobre%%20sus%%20servicios." target="_blank" rel="noopener">Escribir por WhatsApp</a>
      </div>
      <form class="formulario" id="formulario" data-asunto="Solicitud web" data-tipo="contacto" novalidate>
        <div class="campo"><label for="nombre">Nombre</label><input id="nombre" name="nombre" autocomplete="name" required></div>
        <div class="campo"><label for="organizacion">Empresa u organización</label><input id="organizacion" name="organizacion" autocomplete="organization"></div>
        <div class="campo"><label for="correo">Correo electrónico</label><input id="correo" name="correo" type="email" autocomplete="email" required></div>
        <div class="campo"><label for="telefono">Teléfono <span class="opcional">(opcional)</span></label><input id="telefono" name="telefono" type="tel" autocomplete="tel"></div>
        <div class="campo"><label for="servicio">Motivo</label>
          <select id="servicio" name="servicio">
            <option value="demostracion">Demostración de TRAMA</option>
            <option value="planes">Planes y precios de TRAMA</option>
            <option value="gestion">Consultoría y gestión de proyectos</option>
            <option value="bim">Modelación BIM</option>
            <option value="estructural">Análisis y diseño estructural</option>
            <option value="coordinacion">Coordinación técnica</option>
            <option value="software">Software a la medida</option>
            <option value="capacitacion">Consultoría y capacitación</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div class="campo"><label for="mensaje">Mensaje</label><textarea id="mensaje" name="mensaje" rows="5" required></textarea></div>
%(casilla)s
        <button class="boton boton--morado" type="submit">Enviar mensaje</button>
        <p class="formulario__nota" role="status">Se abrirá su programa de correo con el mensaje listo para enviar.</p>
      </form>
    </div>
  </section>
""" % {"tel": TEL, "tel_e": TEL_ENLACE, "correo": CORREO, "casilla": FORM_CASILLA % {"id": "autorizo"}}
    documento("contacto.html", "Contacto · GEOMAGNI TECNOLOGÍAS",
              "Teléfono, WhatsApp, correo y formulario de contacto de GEOMAGNI TECNOLOGÍAS S.A.S., Cartagena, Colombia.", cuerpo, MODULO_CUENTA)

# Lista de interesados (WEB-014): se guarda en Firestore «mensajes» con tipo «interes».
SECCION_INTERES = """
  <section class="seccion seccion--suave" id="interes">
    <div class="contenedor contacto">
      <div class="contacto__texto">
        <p class="etiqueta etiqueta--morada">Lanzamiento</p>
        <h2>Avíseme cuando pueda comprar</h2>
        <p>Deje su correo y el plan que le interesa. Le escribiremos cuando el pago en línea esté disponible, con las condiciones de lanzamiento.</p>
      </div>
      <form class="formulario" data-asunto="Interés en un plan" data-tipo="interes" novalidate>
        <div class="campo"><label for="n-nombre">Nombre</label><input id="n-nombre" name="nombre" autocomplete="name" required maxlength="120"></div>
        <div class="campo"><label for="n-correo">Correo electrónico</label><input id="n-correo" name="correo" type="email" autocomplete="email" required maxlength="160"></div>
        <div class="campo"><label for="n-plan">Plan que le interesa</label>
          <select id="n-plan" name="plan"><option value="profesional">Profesional</option><option value="empresa">Empresa</option><option value="estudiante">Estudiante</option></select></div>
%(casilla)s
        <button class="boton boton--naranja" type="submit">Avisarme</button>
        <p class="formulario__nota" role="status"></p>
      </form>
    </div>
  </section>
"""

# ---------------------------------------------------------------- PRIVACIDAD (conserva el texto legal existente)
def p_privacidad():
    import re
    ruta = os.path.join(RAIZ, "privacidad.html")
    html = open(ruta, encoding="utf-8").read()
    art = re.search(r'(<article class="contenedor legal">.*?</article>)', html, re.S).group(1)
    cuerpo = '  <section class="seccion">\n    ' + art + '\n  </section>\n'
    documento("privacidad.html", "Política de tratamiento de datos · GEOMAGNI TECNOLOGÍAS",
              "Política de tratamiento de datos personales de GEOMAGNI TECNOLOGÍAS S.A.S., conforme a la Ley 1581 de 2012.", cuerpo)

# ---------------------------------------------------------------- TERMINOS DE USO
ARTICULO_TERMINOS = """    <article class="contenedor legal">
    <p class="etiqueta etiqueta--morada">Información legal</p>
    <h1>Términos y condiciones de uso</h1>
    <p class="legal__fecha">Vigentes desde el 6 de noviembre de 2026 · Versión de prueba del sitio</p>

    <h2>1. Quiénes somos y qué regulan estos términos</h2>
    <p><strong>GEOMAGNI TECNOLOGÍAS S.A.S.</strong>, NIT 902.113.610-0, con domicilio en Cartagena, Bolívar, Colombia («GEOMAGNI»), es la titular de este sitio web y del software <strong>TRAMA</strong>. Estos términos regulan el uso del sitio, de la cuenta GEOMAGNI y de las licencias de TRAMA. Al crear una cuenta, descargar o usar TRAMA, usted declara haberlos leído y aceptado. Si no está de acuerdo, no use el sitio ni el software.</p>

    <h2>2. Cuenta GEOMAGNI</h2>
    <ul>
      <li>Para descargar y usar TRAMA necesita una cuenta con su correo confirmado y una licencia vigente.</li>
      <li>Los datos que registra deben ser verdaderos y estar actualizados. La cuenta es personal: no comparta su contraseña.</li>
      <li>Usted responde por lo que se haga con su cuenta. Si sospecha un uso no autorizado, cambie su contraseña y avísenos.</li>
      <li>Debe ser mayor de edad o contar con autorización de su representante legal.</li>
    </ul>

    <h2>3. Licencias de TRAMA</h2>
    <p>Al obtener TRAMA, gratis o mediante un plan de pago, usted adquiere una <strong>licencia de uso</strong> y no la propiedad del programa, que sigue siendo de GEOMAGNI. Pagar un plan le da derecho a usar TRAMA en las condiciones de ese plan; no le transfiere el software, su código ni el derecho a copiarlo, revenderlo o cederlo. La licencia es <strong>personal, no exclusiva, intransferible y revocable</strong>, en los términos de la modalidad que tenga activa:</p>
    <ul>
      <li><strong>Licencia de prueba:</strong> gratuita, una por cuenta, por 7 días calendario desde su activación, para evaluar el programa.</li>
      <li><strong>Licencia estudiantil:</strong> gratuita, para estudiantes con correo institucional de su universidad, hasta la fecha estimada de grado que declaró. Es solo para fines académicos: no puede usarse en trabajos remunerados ni en proyectos comerciales.</li>
      <li><strong>Licencias de pago:</strong> se regirán por el plan contratado cuando estén disponibles.</li>
    </ul>
    <p>Cada licencia permite usar TRAMA en <strong>un equipo a la vez</strong>, salvo que haya adquirido más equipos para su cuenta. Si inicia sesión en otro equipo, el anterior queda desconectado. TRAMA comprueba la licencia con nuestros servidores al menos cada 7 días; sin esa comprobación, o al vencer la licencia, el programa se cierra. Guarde su trabajo con frecuencia.</p>

    <h2>4. Usos no permitidos</h2>
    <ul>
      <li>Copiar, vender, alquilar, sublicenciar o distribuir TRAMA o sus instaladores.</li>
      <li>Descompilar, desensamblar o aplicar ingeniería inversa, salvo en lo que la ley lo permita expresamente.</li>
      <li>Eludir o alterar la verificación de licencia, la identificación de equipos o cualquier medida técnica de protección.</li>
      <li>Crear varias cuentas para obtener nuevas licencias de prueba, o registrar datos académicos falsos.</li>
      <li>Usar el sitio o el software para actividades ilícitas o que afecten a terceros o a nuestros servidores.</li>
    </ul>
    <p>El incumplimiento permite a GEOMAGNI suspender o cancelar la cuenta y la licencia, sin perjuicio de las acciones legales que procedan.</p>

    <h2>5. Propiedad intelectual</h2>
    <p>TRAMA, su código, sus interfaces, la marca GEOMAGNI, sus logotipos y los contenidos de este sitio son propiedad de GEOMAGNI y están protegidos por la Decisión Andina 351 de 1993, la Ley 23 de 1982 y las demás normas de derecho de autor y propiedad industrial. Los proyectos, modelos y archivos que usted cree con TRAMA son suyos.</p>

    <h2>6. Versiones de prueba y garantía</h2>
    <p>TRAMA está en desarrollo y en etapa de pruebas: todavía no está a la venta, aún no es un programa funcional y es posible que no sea compatible con su sistema operativo. Será lanzado al mercado en una versión beta. Este sitio también es una versión de prueba. El software se entrega «tal como está». Aunque trabajamos para que sea confiable, puede contener errores. Revise los resultados de sus diseños y cálculos antes de usarlos en obra y conserve copias de seguridad de sus archivos.</p>

    <h2>7. Responsabilidad</h2>
    <p>En la medida en que la ley lo permita, GEOMAGNI no responde por lucro cesante, pérdida de datos ni daños indirectos derivados del uso o de la imposibilidad de usar TRAMA o el sitio. Esta limitación no afecta los derechos que le reconoce el Estatuto del Consumidor (Ley 1480 de 2011) ni la responsabilidad que no pueda excluirse legalmente.</p>

    <h2>8. Datos personales</h2>
    <p>Tratamos sus datos según nuestra <a href="privacidad.html">política de tratamiento de datos</a>, conforme a la Ley 1581 de 2012. Para verificar la licencia, TRAMA envía a nuestros servidores su cuenta, el nombre del equipo y una huella cifrada del equipo; no envía sus proyectos ni sus archivos.</p>

    <h2>9. Cambios, terminación y ley aplicable</h2>
    <p>Podemos modificar estos términos; publicaremos la nueva versión en esta página con su fecha. Si sigue usando el sitio o TRAMA después del cambio, se entiende que la acepta. Usted puede cerrar su cuenta cuando quiera escribiéndonos. Estos términos se rigen por las leyes de la República de Colombia.</p>

    <h2>10. Contacto</h2>
    <p>Correo: <a href="mailto:jucarcapu@gmail.com">jucarcapu@gmail.com</a> · Teléfono: <a href="tel:+573117227083">+57 311 722 7083</a> · Cartagena, Colombia.</p>
    </article>
"""

def p_terminos():
    cuerpo = '  <section class="seccion">\n' + ARTICULO_TERMINOS + '  </section>\n'
    documento("terminos.html", "Términos y condiciones de uso · GEOMAGNI TECNOLOGÍAS",
              "Términos y condiciones de uso del sitio, de la cuenta GEOMAGNI y de las licencias de TRAMA.", cuerpo)

FORM_TERMINOS = """        <div class="campo campo--casilla">
          <input type="checkbox" id="i-terminos" name="terminos" required>
          <label for="i-terminos">Acepto los <a href="terminos.html" target="_blank" rel="noopener">términos y condiciones de uso</a> de GEOMAGNI y de la licencia de TRAMA.</label>
        </div>"""

# ---------------------------------------------------------------- CUENTAS
MODULO_CUENTA = '\n  <script type="module" src="cuenta.js"></script>'
PRONTO = """      <div class="vacio" data-cuenta="pronto" hidden>
        <h3>Inscripción disponible pronto</h3>
        <p style="margin:0">Estamos preparando las cuentas de usuario. Si necesita una demostración de TRAMA, <a href="contacto.html?asunto=demostracion">escríbanos</a>.</p>
      </div>"""

def p_inscripcion():
    cuerpo = encabezado("Inscripción", "Cuenta GEOMAGNI", "Inscríbase y pruebe TRAMA",
                        "Cree su cuenta y active una licencia de prueba de 7 días. Si es estudiante, obtenga una licencia estudiantil por la duración de su carrera.")
    cuerpo += AVISO_TRAMA
    cuerpo += """
  <section class="seccion">
    <div class="contenedor contacto">
      <div class="contacto__texto">
        <h2>Qué recibe</h2>
        <ul class="lista-chequeo lista-chequeo--clara">
          <li><strong>Licencia de prueba:</strong> 7 días para evaluar la versión de pruebas de TRAMA, que todavía está en desarrollo y no es funcional.</li>
          <li><strong>Licencia estudiantil:</strong> válida hasta la fecha estimada de grado, con su correo institucional.</li>
          <li>Acceso a las descargas y a las novedades de TRAMA.</li>
        </ul>
        <p>¿Ya tiene cuenta? <a href="ingresar.html">Inicie sesión</a>.</p>
      </div>
      <div>
%(pronto)s
      <form class="formulario" id="formInscripcion" data-cuenta="fuera" novalidate>
        <fieldset class="perfiles">
          <legend>Me inscribo como</legend>
          <label><input type="radio" name="perfil" value="profesional" checked> Profesional independiente</label>
          <label><input type="radio" name="perfil" value="empresa"> Empresa</label>
          <label><input type="radio" name="perfil" value="estudiante"> Estudiante</label>
        </fieldset>
        <div class="campo"><label for="i-nombre">Nombre completo</label><input id="i-nombre" name="nombre" autocomplete="name" required maxlength="120"></div>
        <div class="campo"><label for="i-correo">Correo electrónico</label><input id="i-correo" name="correo" type="email" autocomplete="email" required maxlength="160">
          <small class="ayuda" id="ayudaCorreo">Le enviaremos un enlace para confirmarlo.</small></div>
        <div class="dos">
          <div class="campo"><label for="i-clave">Contraseña</label><input id="i-clave" name="clave" type="password" autocomplete="new-password" required minlength="8"></div>
          <div class="campo"><label for="i-clave2">Repita la contraseña</label><input id="i-clave2" name="clave2" type="password" autocomplete="new-password" required></div>
        </div>
        <div class="dos">
          <div class="campo"><label for="i-empresa">Empresa u organización <span class="opcional">(opcional)</span></label><input id="i-empresa" name="empresa" autocomplete="organization" maxlength="120"></div>
          <div class="campo"><label for="i-cargo">Cargo <span class="opcional">(opcional)</span></label><input id="i-cargo" name="cargo" autocomplete="organization-title" maxlength="120"></div>
        </div>
        <div class="campo"><label for="i-tel">Teléfono <span class="opcional">(opcional)</span></label><input id="i-tel" name="telefono" type="tel" autocomplete="tel" maxlength="40"></div>
        <div class="dos">
          <div class="campo"><label for="i-pais">País</label><input id="i-pais" name="pais" autocomplete="country-name" required maxlength="80" value="Colombia"></div>
          <div class="campo"><label for="i-ciudad">Ciudad</label><input id="i-ciudad" name="ciudad" autocomplete="address-level2" required maxlength="80"></div>
        </div>
        <div id="bloqueEstudiante" class="bloque-estudiante" hidden>
          <p class="bloque-estudiante__titulo">Datos académicos</p>
          <div class="campo"><label for="i-uni">Universidad o institución</label><input id="i-uni" name="universidad" maxlength="160"></div>
          <div class="campo"><label for="i-prog">Programa que estudia</label><input id="i-prog" name="programa" maxlength="160" placeholder="Por ejemplo: Ingeniería Civil"></div>
          <div class="dos">
            <div class="campo"><label for="i-ini">Fecha de inicio de los estudios</label><input id="i-ini" name="inicio" type="date"></div>
            <div class="campo"><label for="i-dur">Duración de la carrera</label>
              <select id="i-dur" name="duracion"><option value="1">1 año</option><option value="2">2 años</option><option value="3">3 años</option><option value="4">4 años</option><option value="5" selected>5 años</option><option value="6">6 años</option><option value="7">7 años</option></select></div>
          </div>
          <p class="ayuda">La licencia vence en la fecha estimada de grado (inicio + duración). Solo se acepta el correo institucional de su universidad; no se aceptan correos personales.</p>
        </div>
%(casilla)s
%(terminos)s
        <button class="boton boton--naranja" type="submit">Crear cuenta</button>
        <p class="formulario__nota" role="status">Al crear la cuenta le enviaremos un correo para confirmar su dirección.</p>
      </form>
      <div class="vacio" data-cuenta="dentro" hidden><h3>Ya inició sesión</h3><p style="margin:0"><a href="cuenta.html">Ir a mi cuenta</a></p></div>
      </div>
    </div>
  </section>
""" % {"pronto": PRONTO, "casilla": FORM_CASILLA % {"id": "i-autorizo"}, "terminos": FORM_TERMINOS}
    documento("inscripcion.html", "Inscripción · GEOMAGNI TECNOLOGÍAS",
              "Cree su cuenta GEOMAGNI y active una licencia de prueba de TRAMA por 7 días o una licencia estudiantil.", cuerpo, MODULO_CUENTA)

def p_ingresar():
    cuerpo = encabezado("Ingresar", "Cuenta GEOMAGNI", "Inicie sesión", "Entre con el correo y la contraseña de su cuenta.")
    cuerpo += """
  <section class="seccion">
    <div class="contenedor" style="max-width:520px">
%(pronto)s
      <form class="formulario" id="formIngresar" data-cuenta="fuera" novalidate>
        <div class="campo"><label for="g-correo">Correo electrónico</label><input id="g-correo" name="correo" type="email" autocomplete="email" required></div>
        <div class="campo"><label for="g-clave">Contraseña</label><input id="g-clave" name="clave" type="password" autocomplete="current-password" required></div>
        <button class="boton boton--morado" type="submit">Ingresar</button>
        <button class="boton-texto" id="olvideClave" type="button">Olvidé mi contraseña</button>
        <p class="formulario__nota" role="status">¿No tiene cuenta? <a href="inscripcion.html">Inscríbase gratis</a>.</p>
      </form>
      <div class="vacio" data-cuenta="dentro" hidden><h3>Ya inició sesión</h3><p style="margin:0"><a href="cuenta.html">Ir a mi cuenta</a></p></div>
    </div>
  </section>
""" % {"pronto": PRONTO}
    documento("ingresar.html", "Ingresar · GEOMAGNI TECNOLOGÍAS", "Inicie sesión en su cuenta GEOMAGNI.", cuerpo, MODULO_CUENTA)

# ---------------------------------------------------------------- NOVEDADES (WEB-026)
NOVEDADES = [
    ("En desarrollo", "Próxima versión", "Cuenta GEOMAGNI y licencias", [
        "TRAMA pide iniciar sesión con la cuenta del sitio y comprueba la licencia: prueba de 7 días, estudiantil o plan.",
        "Una cuenta por equipo, con la opción de desconectar un equipo desde «Mi cuenta» o desde el propio TRAMA.",
        "La licencia se comprueba con el servidor cada 7 días; sin conexión, TRAMA sigue funcionando hasta entonces.",
        "Editor de perfiles y secciones en 3D: dibujo desde vistas frontal y oblicua, con guardado y reapertura sin perder geometría."]),
    ("1.5.703", "31 de octubre de 2026", "Referencias CAD, Revit y niveles", [
        "Importación de planos DWG y DXF por capas, con visibilidad de capas por vista, incluso en proyectos grandes.",
        "Complemento TRAMA para Revit: exporta componentes con sus parámetros, tipos, fórmulas y geometría.",
        "Navegador de proyecto organizado por categorías, con iconos nuevos para cada tipo de vista.",
        "Niveles con tipos, simbología propia y cabeceras alineadas; marca de alzado con sus cuatro lados, como en Revit.",
        "Recorrido «Paseo» con movimiento suave y cursores rediseñados."]),
]

def p_novedades():
    bloques = []
    for ver, fecha, titulo, items in NOVEDADES:
        lista = "".join("<li>%s</li>" % x for x in items)
        bloques.append("""      <article class="novedad">
        <div class="novedad__cabeza"><span class="insignia %s">%s</span><span class="novedad__fecha">%s</span></div>
        <h3>%s</h3>
        <ul class="lista-chequeo lista-chequeo--clara">%s</ul>
      </article>""" % ("insignia--naranja" if ver == "En desarrollo" else "insignia--morada",
                      ver if ver == "En desarrollo" else "Versión " + ver, fecha, titulo, lista))
    cuerpo = encabezado("Novedades", "TRAMA", "Novedades de TRAMA", "Lo que trae cada versión y lo que estamos preparando.")
    cuerpo += AVISO_TRAMA
    cuerpo += """
  <section class="seccion">
    <div class="contenedor novedades">
%s
      <p class="nota-centro">Muy pronto, la versión beta. <a href="planes.html#interes">Déjenos su correo</a> y le avisamos.</p>
    </div>
  </section>
""" % "\n".join(bloques)
    documento("novedades.html", "Novedades de TRAMA · GEOMAGNI TECNOLOGÍAS",
              "Novedades de cada versión de TRAMA, el software BIM de GEOMAGNI TECNOLOGÍAS.", cuerpo)

def p_admin():
    cuerpo = encabezado("Administración", "Solo administrador", "Panel de administración", "Inscritos, licencias, equipos, compras y mensajes del sitio.")
    cuerpo += """
  <section class="seccion">
    <div class="contenedor">
%(pronto)s
      <div class="vacio" data-cuenta="fuera" hidden>
        <h3>Inicie sesión con la cuenta de administrador</h3>
        <p><a class="boton boton--morado" href="ingresar.html?volver=admin">Ingresar</a></p>
      </div>
      <div id="panelAdmin" data-cuenta="dentro" hidden>
        <p id="estadoAdmin" role="status">Cargando…</p>
        <div id="contenidoAdmin" hidden>
          <div class="admin-cifras" id="cifrasAdmin"></div>
          <div class="pestanas pestanas--claras" role="tablist">
            <button type="button" role="tab" aria-selected="true" data-admin="inscritos">Inscritos</button>
            <button type="button" role="tab" aria-selected="false" data-admin="mensajes">Mensajes</button>
            <button type="button" role="tab" aria-selected="false" data-admin="pedidos">Compras</button>
            <button type="button" role="tab" aria-selected="false" data-admin="visitas">Visitas</button>
          </div>
          <input class="admin-buscar" id="buscarAdmin" type="search" placeholder="Buscar por nombre, correo o ciudad" aria-label="Buscar">
          <div id="vistaAdmin"></div>
        </div>
      </div>
    </div>
  </section>
""" % {"pronto": PRONTO}
    documento("admin.html", "Administración · GEOMAGNI TECNOLOGÍAS", "Panel privado de administración.", cuerpo,
              '\n  <meta name="robots" content="noindex, nofollow">' + MODULO_CUENTA)

def p_cuenta():
    cuerpo = encabezado("Mi cuenta", "Cuenta GEOMAGNI", "Mi cuenta", "Consulte su licencia de TRAMA y sus datos.")
    cuerpo += AVISO_TRAMA
    cuerpo += """
  <section class="seccion">
    <div class="contenedor" style="max-width:880px">
%(pronto)s
      <div class="vacio" data-cuenta="fuera" hidden>
        <h3>Inicie sesión para ver su cuenta</h3>
        <p><a class="boton boton--morado" href="ingresar.html">Ingresar</a> <a class="boton boton--naranja" href="inscripcion.html">Inscribirme</a></p>
      </div>
      <div id="panelCuenta" data-cuenta="dentro" hidden>
        <div class="cuenta-cabeza">
          <div class="persona__foto persona__foto--chica" aria-hidden="true">◆</div>
          <div><h2 id="cuentaNombre" style="margin:0"></h2><p id="cuentaCorreo" style="margin:0;color:var(--gris-600)"></p></div>
          <button class="boton boton--contorno-oscuro cerrar-sesion" type="button">Cerrar sesión</button>
        </div>
        <p id="estadoCuenta" role="status"></p>
        <div id="bloqueVerificar" class="vacio" hidden>
          <h3>Confirme su correo</h3>
          <p>Le enviamos un enlace de confirmación. Ábralo y vuelva aquí para activar su licencia. Revise también la carpeta de correo no deseado.</p>
          <p><button class="boton boton--morado" id="yaConfirme" type="button">Ya lo confirmé</button> <button class="boton-texto" id="reenviarVerificacion" type="button">Reenviar correo</button></p>
        </div>
        <div id="bloqueLicencia" hidden>
          <h2>Mi licencia de TRAMA</h2>
          <div id="licencia"><p>Cargando…</p></div>
        </div>
      </div>
    </div>
  </section>
""" % {"pronto": PRONTO}
    documento("cuenta.html", "Mi cuenta · GEOMAGNI TECNOLOGÍAS", "Licencia de TRAMA y datos de su cuenta GEOMAGNI.", cuerpo, MODULO_CUENTA)

# ---------------------------------------------------------------- CENTRO DE AYUDA (WEB-028)
def p_ayuda():
    cuerpo = encabezado("Ayuda", "TRAMA", "Centro de ayuda",
                        "Requisitos, instalación, primer inicio de sesión y respuestas a los problemas más comunes.")
    cuerpo += AVISO_TRAMA
    cuerpo += """
  <section class="seccion">
    <div class="contenedor" style="max-width:880px">
      <nav class="ayuda-indice" aria-label="Contenido">
        <a href="#requisitos">Requisitos</a><a href="#instalar">Instalación</a><a href="#sesion">Primer inicio de sesión</a><a href="#equipos">Equipos y licencia</a><a href="#problemas">Problemas frecuentes</a><a href="#reportar">Reportar un error</a>
      </nav>

      <h2 id="requisitos">Requisitos previstos</h2>
      <p>La versión de pruebas se está evaluando en estos equipos; la compatibilidad con su sistema todavía no está garantizada.</p>
      <ul class="lista-chequeo lista-chequeo--clara">
        <li>Windows 10 u 11 de 64 bits.</li>
        <li>Procesador de doble núcleo de 2 GHz o superior y 8 GB de memoria (16 GB para modelos grandes).</li>
        <li>Tarjeta gráfica compatible con OpenGL. Sin tarjeta dedicada, TRAMA usa el modo compatible por procesador, más lento.</li>
        <li>500 MB libres en disco y conexión a internet para iniciar sesión.</li>
      </ul>

      <h2 id="instalar">Instalación paso a paso</h2>
      <ol class="ayuda-pasos">
        <li><strong>Inscríbase</strong> en <a href="inscripcion.html">Inscripción</a> con su nombre, correo y una contraseña.</li>
        <li><strong>Confirme su correo</strong> con el enlace que le enviamos y vuelva a «Mi cuenta». Si no lo ve, revise la carpeta de correo no deseado.</li>
        <li><strong>Active su licencia</strong> en <a href="cuenta.html">Mi cuenta</a>: prueba de 7 días o estudiantil, si tiene correo institucional.</li>
        <li><strong>Descargue</strong> el instalador desde «Mi cuenta» (la descarga se habilitará con el lanzamiento de la versión beta y solo con licencia vigente).</li>
        <li><strong>Ábralo.</strong> El instalador aún no tiene firma digital: si Windows muestra «Windows protegió su PC», elija «Más información» y «Ejecutar de todas formas».</li>
        <li>Al terminar, TRAMA queda en el escritorio y en el menú Inicio. La versión portátil se descomprime y se abre con <code>IniciarTRAMA.exe</code>.</li>
      </ol>

      <h2 id="sesion">Primer inicio de sesión</h2>
      <p>Al abrir TRAMA aparece la ventana de inicio de sesión. Escriba el mismo correo y la misma contraseña de su cuenta del sitio. TRAMA comprueba su licencia y registra el equipo a su nombre; puede verlo en «Mi cuenta», en la lista de equipos.</p>

      <h2 id="equipos">Equipos y licencia</h2>
      <ul class="lista-chequeo lista-chequeo--clara">
        <li>Cada licencia admite un equipo, salvo que su plan incluya más. Si abre TRAMA en otro equipo, el programa le pedirá desconectar uno; también puede hacerlo en «Mi cuenta».</li>
        <li>TRAMA comprueba la licencia con nuestros servidores al menos cada 7 días. Sin conexión sigue funcionando hasta esa fecha.</li>
        <li>Cuando la licencia vence, TRAMA se cierra. Guarde su trabajo con frecuencia.</li>
      </ul>

      <h2 id="problemas">Problemas frecuentes</h2>
      <div class="faq">
        <details><summary>No me llega el correo de confirmación</summary><p>Revise las carpetas de correo no deseado y promociones. En «Mi cuenta» puede pedir que se lo enviemos de nuevo. Si sigue sin llegar, escríbanos.</p></details>
        <details><summary>Olvidé mi contraseña</summary><p>En <a href="ingresar.html">Ingresar</a>, escriba su correo y pulse «Olvidé mi contraseña». La contraseña nueva sirve en el sitio y en TRAMA.</p></details>
        <details><summary>No puedo descargar TRAMA</summary><p>La descarga se habilitará con el lanzamiento de la versión beta; hasta entonces el archivo se muestra, pero no se puede descargar. Después solo se entrega con el correo confirmado y una licencia vigente. Revise el estado de su licencia en «Mi cuenta».</p></details>
        <details><summary>Windows no deja abrir el instalador</summary><p>Elija «Más información» y luego «Ejecutar de todas formas». Si su antivirus lo bloquea, escríbanos antes de desactivarlo: le confirmamos que el archivo es el original.</p></details>
        <details><summary>TRAMA dice que mi licencia venció o que el equipo no está registrado</summary><p>Revise en «Mi cuenta» la fecha de su licencia y la lista de equipos. Si el equipo fue desconectado, vuelva a iniciar sesión en TRAMA.</p></details>
        <details><summary>TRAMA se ve lento o no abre las vistas 3D</summary><p>En equipos sin tarjeta gráfica dedicada TRAMA trabaja en modo compatible por procesador y es más lento. Como está en etapa de pruebas, cuéntenos qué equipo usa: nos ayuda a mejorar la compatibilidad.</p></details>
      </div>

      <h2 id="reportar">Reportar un error</h2>
      <p>TRAMA está en pruebas y sus comentarios son muy valiosos. Escríbanos desde <a href="contacto.html">Contacto</a> o por WhatsApp con: qué estaba haciendo, qué esperaba que pasara, qué pasó, la versión de TRAMA y su versión de Windows. Si puede, adjunte una captura de pantalla.</p>
    </div>
  </section>
%s""" % FRANJA
    documento("ayuda.html", "Centro de ayuda · GEOMAGNI TECNOLOGÍAS",
              "Requisitos, instalación, primer inicio de sesión y solución de problemas de TRAMA.", cuerpo)

# ---------------------------------------------------------------- MAPA DEL SITIO (WEB-013)
PAGINAS_PUBLICAS = ["index.html", "productos.html", "planes.html", "descargas.html", "novedades.html", "ayuda.html", "nosotros.html",
                    "trabaja.html", "contacto.html", "inscripcion.html", "terminos.html", "privacidad.html"]

def mapa_del_sitio():
    import datetime
    hoy = datetime.date.today().isoformat()
    urls = "".join("  <url><loc>%s</loc><lastmod>%s</lastmod></url>\n" % (URL + ("" if a == "index.html" else a), hoy)
                   for a in PAGINAS_PUBLICAS)
    with open(os.path.join(RAIZ, "sitemap.xml"), "w", encoding="utf-8", newline="\n") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + "</urlset>\n")
    with open(os.path.join(RAIZ, "robots.txt"), "w", encoding="utf-8", newline="\n") as f:
        f.write("User-agent: *\nAllow: /\nDisallow: /_gestion/\n\nSitemap: " + URL + "sitemap.xml\n")
    print("   sitemap.xml, robots.txt")

if __name__ == "__main__":
    print("Generando páginas:")
    p_inicio(); p_productos(); p_planes(); p_descargas(); p_nosotros(); p_trabaja(); p_contacto(); p_privacidad(); p_terminos()
    p_inscripcion(); p_ingresar(); p_cuenta(); p_admin(); p_novedades(); p_ayuda()
    mapa_del_sitio()
    print("Listo.")
