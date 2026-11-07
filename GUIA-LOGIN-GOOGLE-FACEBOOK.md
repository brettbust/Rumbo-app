# Activar login con Google y Facebook en Rumbo

El login con email y contraseña ya funciona sin configurar nada más.
Para que funcionen los botones de **Google** y **Facebook**, hay que crear
una app en cada plataforma y pegar unas claves en Supabase. Aquí están los
pasos. No hace falta tocar código: todo se hace en webs.

Primero necesitas un dato de Supabase que usarás en ambos:

- Entra a tu proyecto en Supabase > **Authentication** > **URL Configuration**.
- Ahí verás tu **Callback URL** (o "Redirect URL"). Tiene esta forma:
  `https://xdjixzfqkcpscjmwbqeq.supabase.co/auth/v1/callback`
- Cópiala, la vas a pegar en Google y en Facebook.

---

## 1) GOOGLE

1. Entra a **console.cloud.google.com** e inicia sesión con tu cuenta de Google.
2. Arriba, crea un proyecto nuevo (botón de proyectos > "New Project"). Ponle "Rumbo".
3. En el menú lateral: **APIs y servicios** > **Pantalla de consentimiento de OAuth**.
   - Tipo de usuario: **Externo**. Pulsa Crear.
   - Rellena lo mínimo: nombre de la app ("Rumbo"), tu email de soporte y tu email
     de contacto. Guarda y continúa hasta publicar (puedes dejar el resto por defecto).
4. En el menú: **APIs y servicios** > **Credenciales** > **Crear credenciales** >
   **ID de cliente de OAuth**.
   - Tipo de aplicación: **Aplicación web**.
   - Nombre: "Rumbo Web".
   - En **URIs de redireccionamiento autorizados**, pega la **Callback URL** de Supabase
     (la de arriba, la que termina en `/auth/v1/callback`).
   - Pulsa Crear.
5. Google te muestra un **Client ID** y un **Client Secret**. Cópialos.
6. Ve a Supabase > **Authentication** > **Providers** > **Google**.
   - Actívalo (Enable).
   - Pega el **Client ID** y el **Client Secret**.
   - Guarda (Save).

Listo Google.

---

## 2) FACEBOOK

1. Entra a **developers.facebook.com** e inicia sesión.
2. Arriba a la derecha: **Mis apps** > **Crear app**.
   - Elige el caso de uso **"Autenticar y solicitar datos de usuarios con Facebook Login"**
     (o "Consumer"/"Consumidor" según la versión).
   - Ponle nombre "Rumbo" y crea la app.
3. En el panel de la app, añade el producto **Facebook Login** (botón "Configurar").
4. En el menú lateral: **Facebook Login** > **Configuración**.
   - En **URI de redirección de OAuth válidos**, pega la **Callback URL** de Supabase
     (la que termina en `/auth/v1/callback`).
   - Guarda.
5. En el menú: **Configuración** > **Básica**.
   - Ahí verás el **Identificador de la app** (App ID) y la **Clave secreta de la app**
     (App Secret, pulsa "Mostrar"). Cópialos.
6. Ve a Supabase > **Authentication** > **Providers** > **Facebook**.
   - Actívalo (Enable).
   - Pega el **App ID** (como "Client ID") y el **App Secret** (como "Client Secret").
   - Guarda.
7. Importante: en Facebook, tu app empieza en "modo desarrollo" y solo funciona
   para ti. Para que funcione con cualquier usuario, tienes que **publicar la app**
   (pasarla a "Modo activo") en el panel de Facebook, lo que requiere completar
   algunos datos (política de privacidad, etc.). Mientras tanto, puedes probarla
   con tu propia cuenta.

Listo Facebook.

---

## Nota sobre "Borrar mi cuenta"

El botón "Borrar mi cuenta" de la app borra todas las metas y el perfil del usuario
de la nube y cierra la sesión. El registro de la cuenta en sí (el email/usuario) se
borra de forma completa desde el panel de Supabase (**Authentication** > **Users**) o
con una función de servidor. Para la mayoría de apps esto es suficiente para empezar;
si quieres el borrado 100% automático del usuario, más adelante montamos una función
"Edge Function" en Supabase que lo haga. Dímelo cuando llegue el momento.

---

## Mientras no configures Google/Facebook

Los botones aparecerán en la pantalla de login, pero si el usuario los pulsa sin que
estén configurados, Supabase dará un error. Si quieres, puedo ocultarlos hasta que
los tengas listos, y los mostramos cuando me confirmes que ya están activos. Solo dímelo.
