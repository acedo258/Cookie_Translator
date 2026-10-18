## ENGLISH
## 1. What a cookie is and why it matters
**For non-technical readers.** A cookie is a very small text file that a website saves in your browser. It lets the website remember you. Without cookies, every time you moved to another page the website would treat you like a stranger: you would have to log in again and your shopping cart would empty. Up to here they are useful and harmless.
  The problem starts when a cookie isn't set by the website you visit, but by an outside company, such as an advertising network. That company can recognize you across hundreds of different websites and, by putting together what you do on each one, build a profile about you: what you're interested in, what you buy, where you are, which devices you use. That profile is used to show you tailored ads, but it can also be sold or shared with third parties. That is why cookies matter: they are the main tool used to track people on the internet.

**For technical readers.** A cookie is a key-value pair that the server sends in the `Set-Cookie` header and that the browser sends back with every later request to the same domain. The key distinction is between first-party cookies (the domain you visit) and third-party cookies (another domain loaded inside the page). Third-party cookies make it possible to correlate the activity of the same user across sites. Moreover, modern tracking doesn't depend only on cookies: it also uses identifiers derived from the device (fingerprinting), from the email (EUID) or from the network (Utiq). That is why consent banners talk about "storing or accessing information on the device" and not just about cookies.


## 2. Why we should read and understand before accepting or rejecting
**For non-technical readers.** European law (GDPR and ePrivacy) requires that you be asked for permission for cookies that aren't essential, and that this permission be informed. Informed means that you know what you are saying yes to. In practice almost nobody reads the banners, and designers know it: the "Accept all" button is usually big and eye-catching, and the information is made too technical and heavy to be tiring to read, while rejecting or configuring takes more steps. If you accept without reading, you may be authorizing things like creating profiles for ads or linking your devices together.
It isn't a good idea to reject without understanding either. Rejecting the optional almost never breaks the website, but if you block something you do need (for example, the login) the page may fail. Understanding what each category does lets you choose with judgment: accept what benefits you, reject what only benefits third parties.
The practical problem is that every website explains it differently and with a lot of words. Lidl lists 16 uses in industry jargon, Siemens Energy lists tools named after companies and Garmin says almost nothing. The extension exists to put all of that in plain, comparable language.

**For technical readers.** Valid consent must be freely given, specific, informed and unambiguous. Two nuances that the extension takes into account: `source: "implied"` in the consent object indicates that the state is the default and not a choice you made, and a website can declare purposes without anyone verifying what it actually does. What the extension shows is the website's declaration, not an audit of the real traffic.


## 3. Types of cookies
**For non-technical readers.** Almost all banners group cookies into four families:

**Necessary or essential** cookies make the website work: keeping the session, remembering the cart, protecting against bots (like Google Captcha). They don't require permission and have little effect on your privacy.
**Functional or preference** cookies remember your settings, such as language, country or embedded videos (Brightcove, for example). They improve convenience. Be careful: some services of this type load third-party content that can also identify you.
**Statistics or analytics** cookies count visits and measure how the website is used (Adobe Analytics, for example). They are normally used to improve the site, although some can be linked to your identity.
**Marketing or advertising** cookies are the most sensitive: they follow you across websites to show you personalized ads and build profiles.

**For technical readers.** In the IAB TCF v2.2 standard these families are broken down into numbered purposes (for example, 3 is creating profiles for personalized advertising, and there are measurement purposes and device storage purposes), plus "special features" such as precise geolocation (SF1) and "features" such as linking devices (F2) or identifying devices by their characteristics (F3). Banners that don't use TCF employ their own categories, such as `essential`, `functional` and `marketing` in Usercentrics, plus custom categories.


## 4. How the extension detects what each website asks for
**For non-technical readers.** The extension doesn't guess by reading the banner text, because that fails as soon as the language or the design changes. Instead, it asks the banner's program directly, which stores the list of what the website declares. Then it translates it into simple sentences. There are three cases:

If the banner is from **OneTrust**, the extension gets the full list of uses, with a numeric code that identifies each one regardless of language. That way it recognizes "ad profiles" or "GPS" even if the banner is in German, and shows the original name underneath.
If it is from **Usercentrics**, it gets the list of services with their category. When the category is specific to that website and doesn't mean anything in general, the extension infers it from the service name: "Adobe Analytics" is classified as statistics.
If it is from **TrustArc**, all that can be known is that the necessary category has been accepted. Since there is no list of categories, the extension tells you so and gives you a general summary, without alarming you.

There is one limitation: on Lidl, the identifiers Utiq (created from your IP and mobile carrier) and EUID (your email turned into a code) appear mixed in with test groups and for now they are not shown, even though they are among the most serious items in the banner.

**For technical readers.**
**OneTrust.** The groups of the banner object are read and the `OptanonGroupId` field is used as the main key. With TCF, that ID carries the official number from the standard: `IAB2V2_3` is purpose 3, `ISF2V2_1` is special feature 1 and `IFE2V2_2` is feature 2. Since it's a code and not text, it is language-independent. The visible names serve only as a fallback when there is no code and to show them as a subtitle. Technical and test groups are filtered out (`Test_1 Kaufland App`…).
**Usercentrics.** `getServicesBaseInfo()` returns a promise, so it must be awaited with `await`; without that it doesn't return the list. Each service comes with a name (`n`) and a category (`c`). `essential`, `functional` and `marketing` are translated directly. The `customcategory-<id>` ones are resolved by heuristic according to the service name, which can fail with little-known services.
**TrustArc.** Only `consentDecision` is available, an array of indexes of accepted categories. `[0]` is equivalent to the necessary category, so no warning is raised. The API doesn't expose the catalog, which is why the generic summary is used.




## SPANISH
## 1. Qué es una cookie y por qué importa
**Para no técnicos.** Una cookie es un archivo de texto muy pequeño que una web guarda en tu navegador. Sirve para que la web se acuerde de ti. Sin cookies, cada vez que cambiaras de página la web te trataría como un desconocido: tendrías que iniciar sesión otra vez y el carrito de la compra se vaciaría. Hasta aquí son útiles e inofensivas.
  El problema empieza cuando una cookie no la pone la web que visitas, sino una empresa externa, como una red publicitaria. Esa empresa puede reconocerte en cientos de webs distintas y, juntando lo que haces en cada una, construir un perfil sobre ti: qué te interesa, qué compras, dónde estás, qué dispositivos usas. Con ese perfil se te muestran anuncios a medida, pero también se puede vender o compartir con terceros. Por eso las cookies importan: son la herramienta principal con la que se rastrea a la gente en internet.

**Para técnicos.** Una cookie es un par clave-valor que el servidor envía en la cabecera `Set-Cookie` y que el navegador devuelve en cada petición posterior al mismo dominio. La distinción clave es entre cookies de primera parte (el dominio que visitas) y de terceros (otro dominio cargado dentro de la página). Las de terceros permiten correlacionar la actividad de un mismo usuario entre sitios. Además, el rastreo moderno no depende solo de cookies: también usa identificadores derivados del dispositivo (huella digital), del email (EUID) o de la red (Utiq). Por eso los bancos de consentimiento hablan de "almacenar o acceder a información en el dispositivo" y no solo de cookies.


## 2. Por qué debemos leer y entender antes de aceptar o denegar
**Para no técnicos.** La ley europea (RGPD y ePrivacy) exige que te pidan permiso para las cookies que no son imprescindibles, y que ese permiso sea informado. Informado significa que sepas a qué estás diciendo que sí. En la práctica casi nadie lee los bancos, y los diseñadores lo saben: el botón de "Aceptar todo" suele ser grande y llamativo además de poner la información demasiado técnica y pesada para que sea cansado de leer, mientras que rechazar o configurar cuesta más pasos. Si aceptas sin leer, puedes estar autorizando decisiones como crear perfiles para anuncios o vincular tus dispositivos entre sí.
Tampoco conviene rechazar sin entender. Rechazar lo opcional casi nunca rompe la web, pero si bloqueas algo que sí necesitas (por ejemplo, el login) la página puede fallar. Entender qué hace cada categoría te permite elegir con criterio: aceptar lo que te beneficia, rechazar lo que solo beneficia a terceros.
El problema práctico es que cada web lo cuenta de forma distinta y con muchas palabras. Lidl lista 16 usos con terminología de la industria, Siemens Energy enumera herramientas con nombre de empresa y Garmin casi no dice nada. La extensión existe para poner todo eso en lenguaje claro y comparable.

**Para técnicos.** El consentimiento válido debe ser libre, específico, informado e inequívoco. Dos matices que la extensión tiene en cuenta: `source: "implied"` en el objeto de consentimiento indica que el estado es el predeterminado y no una elección tuya, y una web puede declarar finalidades sin que nadie verifique lo que hace realmente. Lo que muestra la extensión es la declaración de la web, no una auditoría del tráfico real.


## 3. Tipos de cookies
**Para no técnicos.** Casi todos los bancos agrupan las cookies en cuatro familias:

Las **necesarias o esenciales** hacen que la web funcione: mantener la sesión, recordar el carrito, proteger contra bots (como Google Captcha). No requieren permiso y afectan poco a tu privacidad.
Las **funcionales o de preferencias** recuerdan tus ajustes, como idioma, país o vídeos incrustados (Brightcove, por ejemplo). Mejoran la comodidad. Ojo: algunos servicios de este tipo cargan contenido de terceros que también puede identificarte.
Las **de estadística o análisis** cuentan visitas y miden cómo se usa la web (Adobe Analytics, por ejemplo). Normalmente se usan para mejorar el sitio, aunque algunas pueden vincularse a tu identidad.
Las **de marketing o publicidad** son las más delicadas: te siguen entre webs para mostrarte anuncios personalizados y construir perfiles.

**Para técnicos.** En el estándar IAB TCF v2.2 estas familias se desglosan en propósitos numerados (por ejemplo, el 3 es crear perfiles para publicidad personalizada, y hay propósitos de medición y de almacenamiento en el dispositivo), más "funciones especiales" como la geolocalización precisa (SF1) y "funciones" como vincular dispositivos (F2) o identificar dispositivos por sus características (F3). Los bancos que no usan TCF emplean sus propias categorías, como `essential`, `functional` y `marketing` en Usercentrics, más categorías personalizadas.


## 4. Cómo detecta la extensión lo que pide cada web
**Para no técnicos.** La extensión no adivina leyendo el texto del banner, porque eso falla en cuanto cambia el idioma o el diseño. En su lugar le pregunta directamente al programa del banner, que guarda la lista de lo que la web declara. Luego la traduce a frases sencillas. Hay tres casos:

Si el banner es de **OneTrust**, la extensión obtiene la lista completa de usos, con un código numérico que identifica cada uno sin importar el idioma. Así reconoce "perfiles para anuncios" o "GPS" aunque el banner esté en alemán, y muestra debajo el nombre original.
Si es de **Usercentrics**, obtiene la lista de servicios con su categoría. Cuando la categoría es propia de esa web y no significa nada en general, la extensión la deduce por el nombre del servicio: "Adobe Analytics" se clasifica como estadística.
Si es de **TrustArc**, solo se puede saber que se ha aceptado la categoría necesaria. Como no hay lista de categorías, la extensión te lo dice y te da un resumen general, sin alarmar.

Hay una limitación: en Lidl, los identificadores Utiq (creado con tu IP y operador móvil) y EUID (tu email convertido en código) aparecen mezclados con grupos de prueba y por ahora no se muestran, aunque son de lo más serio del banner.

**Para técnicos.**
**OneTrust.** Se leen los grupos del objeto del banner y se usa el campo `OptanonGroupId` como clave principal. Con TCF, ese ID lleva el número oficial del estándar: `IAB2V2_3` es el propósito 3, `ISF2V2_1` la función especial 1 e `IFE2V2_2` la función 2. Al ser un código y no texto, es independiente del idioma. Los nombres visibles solo sirven de respaldo cuando no hay código y para mostrarlos como subtítulo. Se filtran grupos técnicos y de prueba (`Test_1 Kaufland App`…).
**Usercentrics.** `getServicesBaseInfo()` devuelve una promesa, así que debe esperarse con `await`; sin eso no devuelve la lista. Cada servicio trae nombre (`n`) y categoría (`c`). `essential`, `functional` y `marketing` se traducen directamente. Las `customcategory-<id>` se resuelven por heurística según el nombre del servicio, que puede fallar con servicios poco conocidos.
**TrustArc.** Solo se dispone de `consentDecision`, un array de índices de categorías aceptadas. `[0]` equivale a la categoría necesaria, así que no se genera aviso. La API no expone el catálogo, por eso se usa el resumen genérico.
