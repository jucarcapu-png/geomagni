# Activar las cuentas y licencias (Firebase)

Las páginas `inscripcion.html`, `ingresar.html` y `cuenta.html` ya están hechas. Funcionan cuando exista un proyecto de Firebase y su configuración esté en `cuenta.js`. Mientras tanto muestran «Inscripción disponible pronto».

El plan gratuito de Firebase (Spark) alcanza para empezar. No hace falta tarjeta de crédito.

## 1. Crear el proyecto

1. Entre a https://console.firebase.google.com con la cuenta de Google de la empresa.
2. «Crear un proyecto» › nombre `geomagni` › puede desactivar Google Analytics › Crear.

## 2. Activar el inicio de sesión con correo

1. Menú **Compilación › Authentication** › «Comenzar».
2. Pestaña **Método de acceso** › **Correo electrónico/contraseña** › Habilitar › Guardar.
3. Pestaña **Configuración › Dominios autorizados** › «Agregar dominio» › `jucarcapu-png.github.io`.
4. Pestaña **Plantillas** › cambie el idioma a español. Si quiere, personalice el remitente como «GEOMAGNI TECNOLOGÍAS».

## 3. Crear la base de datos

1. Menú **Compilación › Firestore Database** › «Crear base de datos».
2. Ubicación: `southamerica-east1 (São Paulo)`, la más cercana a Colombia. Modo de producción.
3. Pestaña **Reglas** › borre el contenido, pegue todo el archivo `firestore.rules` de esta carpeta › **Publicar**.

Las reglas impiden que alguien se dé a sí mismo una licencia más larga, que cambie una licencia ya creada o que lea datos de otras personas. Además, solo dan licencia estudiantil a correos institucionales `.edu` o `.edu.co` confirmados, nunca a correos personales.

## 4. Guardar los instaladores protegidos (Storage)

TRAMA no está en el sitio público: solo se descarga desde «Mi cuenta» con licencia vigente.

1. Menú **Compilación › Storage** › «Comenzar». Firebase pide pasar al plan **Blaze** (pago por uso) para usar Storage en proyectos nuevos. Requiere una tarjeta, pero incluye una cuota sin costo: 5 GB guardados y unos 100 GB de descargas al mes, lo que alcanza para unas 2.000 descargas de TRAMA. Le recomiendo poner una alerta de presupuesto de USD 1 en Google Cloud › Facturación › Presupuestos.
2. Ubicación: la misma de Firestore.
3. Cree la carpeta `instaladores` y suba los dos archivos de la carpeta `Instaladores TRAMA privados` sin cambiarles el nombre:
   - `Instalar-TRAMA-1.5.703.exe`
   - `TRAMA-1.5.703-portable.zip`
4. Pestaña **Reglas** › pegue todo el archivo `storage.rules` › **Publicar**.

Mientras Storage no esté configurado, «Mi cuenta» muestra «La descarga se habilitará muy pronto» y nadie puede descargar TRAMA.

## 5. Copiar la configuración al sitio

1. Rueda dentada › **Configuración del proyecto** › «Tus apps» › icono web `</>`.
2. Apodo `sitio-web` › Registrar app (no hace falta Firebase Hosting).
3. Copie los valores `apiKey`, `authDomain`, `projectId`, `storageBucket` y `appId` en `FIREBASE_CONFIG`, al comienzo de `cuenta.js`.
4. Suba el cambio al repositorio. Estos valores pueden ser públicos: la seguridad la dan las reglas.

Si prefiere, envíeme los cinco valores y yo los pongo y subo el cambio.

## 6. Pagos y licencias de pago (PAG-001)

Piezas ya preparadas:

- `precios.json`: única fuente de precios. Mientras tenga `"muestra": true`, la página los marca como valores de muestra y Firebase **no activa** ninguna licencia.
- Página de planes (`cuenta.js`, sección «Planes y compra»): pide iniciar sesión y correo confirmado, guarda un pedido `pendiente` en `pedidos/{id}` y llama a `PASARELA.iniciar(pedido)`. Mientras `PASARELA.iniciar` sea `null`, los botones dicen «Pago en línea próximamente».
- `firestore.rules`: el cliente solo puede crear su pedido pendiente; nadie puede marcarlo como pagado desde el navegador. Las licencias `pago` solo las escribe Firebase.
- `functions/index.js`: `resolverPedido()` compara el valor pagado con `precios.json` y crea o extiende `licencias/{uid}` con `tipo: "pago"`, `plan`, `periodo`, `equipos` y `vence`. Un valor que no coincide deja el pedido «en revisión».
- TRAMA (desde 1.5.987) acepta licencias `pago` y vence en la fecha `vence`.

Pasarela elegida: **Wompi** (07/11/2026). El código está escrito y apagado:

- `cuenta.js`: `WOMPI_LLAVE_PUBLICA` (vacía = botones «Pago en línea próximamente») e `iniciarWompi()`, que pide la firma a Firebase y lleva al checkout `checkout.wompi.co/p/` con el id del pedido como referencia; al terminar, Wompi devuelve a `cuenta.html?pago=…` («Mis compras»).
- `functions/index.js`: `firmarPagoWompi` (calcula valor en centavos desde `precios.json` y la firma de integridad) y `avisoWompi` (verifica el checksum del evento `transaction.updated` y llama a `resolverPedido()`).

Pasos que faltan, en este orden (primero todo en **modo de pruebas** de Wompi, sin dinero real):

1. El usuario crea la cuenta de comercio en Wompi (RUT, Cámara de Comercio, cuenta bancaria de GEOMAGNI). En Wompi › Desarrolladores, con el modo **Pruebas** activo, copia: llave pública `pub_test_…`, **secreto de integridad** y **secreto de eventos**. Las dos últimas no se envían por chat ni se pegan en el sitio.
2. Instalar Node.js 20 y las herramientas de Firebase (`npm install -g firebase-tools`), `firebase login`, y guardar los secretos: `firebase functions:secrets:set WOMPI_INTEGRIDAD` y `firebase functions:secrets:set WOMPI_EVENTOS` (los pega el usuario cuando la consola los pide).
3. Publicar desde esta carpeta: `firebase deploy --only functions`.
4. En Wompi › Desarrolladores › **URL de eventos** (pruebas): `https://us-central1-usuarios-geomagni.cloudfunctions.net/avisoWompi`.
5. Pegar la llave pública en `WOMPI_LLAVE_PUBLICA` y publicar el sitio.
6. Poner precios de prueba en `precios.json` con `"muestra": false` y comprar con las tarjetas de prueba de Wompi: una aprobada (debe crear la licencia de pago) y una rechazada (pedido «rechazado», sin licencia).
7. Al aprobar las pruebas: repetir 1, 2 y 4 con las llaves de **producción** (`pub_prod_…`), poner los precios reales y publicar.

## Cómo funciona

| Paso | Qué pasa |
|---|---|
| Inscripción | Se crea la cuenta (correo y contraseña) y el perfil en `usuarios/{uid}`. Llega un correo de confirmación. |
| Confirmación | La persona abre el enlace del correo y vuelve a «Mi cuenta». |
| Activar licencia | Se crea `licencias/{uid}` con la fecha del servidor. Prueba: vence a los 7 días. Estudiante: vence en la fecha de inicio más la duración de la carrera. |
| TRAMA | El programa inicia sesión con la misma cuenta y lee `licencias/{uid}` para saber si puede abrir. Esa parte está registrada en el backlog como LIC-001, pendiente. |

Cada cuenta puede tener una sola licencia. Para ver los inscritos: Firestore Database › colección `usuarios`.

## Límites

- Cualquiera puede crear varias cuentas con correos distintos para repetir la prueba de 7 días. Impedirlo del todo requiere un servidor (Cloud Functions, plan de pago) o validar por equipo en TRAMA.
- Se acepta como institucional cualquier correo `.edu` o `.edu.co` confirmado. Para limitarlo a universidades concretas, se puede cambiar la lista en `cuenta.js` y `firestore.rules`.

## 7. App Check y alerta de presupuesto (WEB-027)

1. Firebase ya no acepta reCAPTCHA v3 clásico («reCAPTCHA Classic está obsoleto», 07/11/2026). Cree una clave de **Fraud Defense (reCAPTCHA Enterprise)** en Google Cloud › Seguridad › reCAPTCHA (proyecto usuarios-geomagni): plataforma **Sitio web**, dominio `jucarcapu-png.github.io`, sin desafío de casilla. Copie el **ID de la clave**.
2. Consola de Firebase › **App Check** › Apps › geomagni-web › **Fraud Defense** › pegue el ID de la clave y guarde. El uso tiene una cuota mensual gratuita; confirme el precio vigente en la página de reCAPTCHA de Google Cloud y tenga activa la alerta de presupuesto (paso 6).
3. Pegue la clave del sitio en `cuenta.js`, constante `RECAPTCHA_CLAVE`, y publique (Claude lo hace al recibir la clave).
4. Deje App Check en **modo de supervisión** unos días. En App Check › APIs revise que las solicitudes salgan «verificadas».
5. Aplique la obligación solo a **Storage** (descargas). No la aplique a Firestore mientras el contador de visitas use la API REST sin token: dejaría de registrar visitas.
6. Google Cloud › Facturación › **Presupuestos y alertas** › Crear presupuesto de USD 5 mensuales con avisos al 50 %, 90 % y 100 % a jucarcapu@gmail.com.
