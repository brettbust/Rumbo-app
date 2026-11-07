# Cómo llevar Rumbo a Google Play

Esta carpeta es una PWA (aplicación web progresiva) completa. Para publicarla en Google
Play se "envuelve" en un paquete Android usando una herramienta gratuita. No necesitas
saber programar Android. Aquí tienes el camino paso a paso.

## Resumen del proceso

1. Subir esta carpeta a un enlace web con HTTPS (GitHub Pages, Netlify, etc.).
2. Generar el paquete Android (.aab) con PWABuilder o Bubblewrap.
3. Crear una cuenta de Google Play Console (pago único de 25 USD).
4. Subir el .aab, completar la ficha y publicar.

---

## Paso 1 - Publicar la PWA en un enlace HTTPS

La app debe estar en internet con https:// (no vale abrirla como archivo local).

Opción recomendada: GitHub Pages (gratis)
- Crea un repositorio en github.com y sube TODOS los archivos de esta carpeta
  (index.html, app.js, manifest.json, sw.js y los tres iconos .png).
- En Settings > Pages, activa Pages sobre la rama principal.
- Obtendrás una dirección tipo https://tuusuario.github.io/rumbo/

Comprueba que funciona: ábrela en Chrome de tu móvil; debería poder "instalarse"
(menú > Añadir a pantalla de inicio).

---

## Paso 2 - Generar el paquete Android (.aab)

La forma más fácil, sin instalar nada: PWABuilder (de Microsoft, gratis).

1. Entra a https://www.pwabuilder.com
2. Pega la URL de tu PWA (la del Paso 1) y pulsa Start.
3. Te dará una puntuación y detectará el manifest. Pulsa "Package for stores".
4. Elige Android > "Generate Package".
5. Descargarás un .zip que incluye:
   - el archivo .aab (esto es lo que sube a Play Store)
   - una clave de firma (signing key) - GUÁRDALA, la necesitarás para futuras
     actualizaciones. Si la pierdes, no podrás actualizar la app.
   - instrucciones de "Digital Asset Links" para vincular tu dominio con la app
     (PWABuilder te explica cómo; sirve para que la app abra a pantalla completa
     sin la barra del navegador).

Alternativa por línea de comandos: Bubblewrap (https://github.com/GoogleChromeLabs/bubblewrap).
Requiere Node.js y Java. PWABuilder es más sencillo para empezar.

---

## Paso 3 - Cuenta de Google Play Console

1. Entra a https://play.google.com/console
2. Regístrate como desarrollador. Hay un pago único de 25 USD.
3. Verifica tu identidad (te pueden pedir documento). Puede tardar unas horas o días.

---

## Paso 4 - Crear la ficha y publicar

Dentro de Play Console:

1. "Crear app". Nombre: Rumbo. Idioma: Español. Tipo: App. Gratis.
2. Completa el cuestionario de contenido (clasificación por edades). Rumbo no tiene
   contenido sensible, así que será apta para todos los públicos.
3. Política de privacidad: es OBLIGATORIA. Como la app guarda todo en el dispositivo
   y no envía datos a ningún servidor, tu política puede ser muy simple. Tienes un
   texto de ejemplo en el archivo POLITICA-DE-PRIVACIDAD.md de esta carpeta. Súbelo
   a una página web (puede ser otra página de tu GitHub Pages) y pega el enlace.
4. Sección "Seguridad de los datos": declara que la app NO recopila ni comparte datos
   (es el caso de Rumbo, todo es local).
5. Sube el archivo .aab en la sección de producción (o prueba interna primero).
6. Añade las capturas de pantalla (mínimo 2), un icono de 512x512 (ya lo tienes:
   icon-512.png) y un gráfico de cabecera de 1024x500 px.
7. Envía a revisión. Google suele tardar de unas horas a unos días.

---

## Consejos

- Empieza con un "canal de prueba interna" antes que producción: puedes instalarla
  tú mismo desde Play para verificar que todo va bien.
- Guarda la clave de firma en un lugar seguro y con copia. Es lo único irremplazable.
- Cada vez que quieras actualizar la app: cambias los archivos en tu enlace HTTPS,
  vuelves a generar el .aab en PWABuilder con la MISMA clave, subes la nueva versión
  a Play Console con un número de versión mayor.

## Qué NO cubre esta PWA por sí sola (si algún día lo quieres)

- Sincronización entre dispositivos (requiere un servidor/cuenta de usuario).
- Notificaciones push cuando la app está cerrada (requiere un servidor de mensajería).
  El recordatorio incluido funciona mientras la app está abierta.
- Compras dentro de la app.

Estos son pasos avanzados y opcionales. La versión actual ya es una app completa,
instalable y publicable.
