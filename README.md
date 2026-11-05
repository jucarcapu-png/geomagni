# GEOMAGNI TECNOLOGÍAS S.A.S.

Sitio web de la compañía: ingeniería, BIM y software para proyectos de construcción e infraestructura. Cartagena, Colombia.

**Sitio:** https://jucarcapu-png.github.io/geomagni/ — *sitio de prueba, en construcción.*

## Páginas

| Archivo | Contenido |
|---|---|
| `index.html` | Inicio: portada, productos y servicios, TRAMA, cifras, públicos y método |
| `productos.html` | TRAMA y los seis servicios |
| `planes.html` | Planes de TRAMA, comparación, formas de pago y preguntas frecuentes |
| `descargas.html` | Información de TRAMA (la descarga exige cuenta con licencia, desde «Mi cuenta»), PDF y kit de marca |
| `nosotros.html` | Propósito, historia, fundador, valores y datos de registro |
| `trabaja.html` | Áreas, vacantes y postulación |
| `contacto.html` | Canales y formulario |
| `inscripcion.html`, `ingresar.html`, `cuenta.html` | Cuentas de usuario y licencias de prueba o estudiantiles (Firebase; ver `FIREBASE.md`) |
| `privacidad.html` | Política de tratamiento de datos (Ley 1581 de 2012) |

## Editar

Las páginas se generan con `construir.py` (cabecera, menú y pie comunes):

```
python construir.py
```

Configuración en `script.js`:
- `CORREO`: correo que reciben los formularios.
- `ENLACES_PAGO`: enlaces de pago de cada plan (Wompi, Mercado Pago o PayU). Vacíos = «Pago en línea próximamente».
- `CONTADOR_SERVICIO`: contador de visitas (Abacus). Vacío = sin contador.

Cualquier cambio confirmado en `main` se publica en GitHub Pages en uno o dos minutos.

## Diseño

Diseño, textos e ilustraciones propios de GEOMAGNI. Tipografías Sora e Inter con licencia SIL Open Font License (ver `fuentes/`).

© 2026 GEOMAGNI TECNOLOGÍAS S.A.S. · NIT 902.113.610-0
