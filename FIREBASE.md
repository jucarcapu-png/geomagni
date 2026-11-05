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

## 4. Copiar la configuración al sitio

1. Rueda dentada › **Configuración del proyecto** › «Tus apps» › icono web `</>`.
2. Apodo `sitio-web` › Registrar app (no hace falta Firebase Hosting).
3. Copie los valores `apiKey`, `authDomain`, `projectId` y `appId` en `FIREBASE_CONFIG`, al comienzo de `cuenta.js`.
4. Suba el cambio al repositorio. Estos valores pueden ser públicos: la seguridad la dan las reglas.

Si prefiere, envíeme los cuatro valores y yo los pongo y subo el cambio.

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
