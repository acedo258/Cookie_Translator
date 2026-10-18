# Cookie Translator
Entiende qué te piden los banners de cookies antes de aceptar o rechazar.

## Qué es
Cookie Translator es una extensión de navegador de código abierto que lee la lista de usos que declara el banner de cookies de una web y la traduce a lenguaje claro: qué datos se recogen, para qué y qué implica para tu privacidad. Funciona 100 % en local: no envía nada a ningún servidor.

## Por qué existe
La ley europea exige que tu consentimiento sea informado, pero cada web cuenta lo mismo de forma distinta. Lidl enumera 16 usos con terminología de la industria, Siemens Energy una lista de herramientas con nombre de empresa y Garmin casi no dice nada. Esta extensión pone todo eso en un formato comparable y comprensible.

## Qué hace
La extensión detecta el banner de cookies de la página y le pregunta directamente al gestor del banner (CMP) qué declara la web, en lugar de adivinar leyendo el texto. Así funciona aunque el banner esté en otro idioma. Después muestra un panel con los usos explicados en lenguaje llano, ordenados de más a menos graves: GPS, huella digital, perfiles para anuncios, vincular dispositivos, etc. Si el banner no ofrece esa información, lo dice y muestra un resumen genérico, sin inventar nada.

## Cómo detecta cada gestor
OneTrust: lee el campo OptanonGroupId de cada grupo, que lleva el número oficial del estándar IAB TCF. Por ejemplo, IAB2V2_3 es el propósito 3 e ISF2V2_1 es la función especial 1. Como es un código y no un texto, funciona en cualquier idioma. Los nombres visibles se usan solo como respaldo y como subtítulo. Se filtran los grupos técnicos y de prueba.

Usercentrics: llama a UC_UI.getServicesBaseInfo(), que devuelve una promesa y por eso se espera con await. Cada servicio trae su nombre y su categoría. Las categorías essential, functional y marketing se traducen directamente. Las categorías propias (customcategory-<id>) se deducen por el nombre del servicio, con una heurística: "Adobe Analytics" se clasifica como estadística y "Brightcove" como contenido de terceros.

Didomi: lee la API Didomi de la página y muestra los usos que declara la web.

TrustArc: solo expone consentDecision, una lista de índices de categorías aceptadas. El valor [0] significa solo la categoría necesaria, así que no se genera ningún aviso y se muestra el resumen genérico.

Otros gestores (Cookiebot, Quantcast, PRISA): se detecta el banner por su selector y se muestra el resumen genérico (por ahora).

Banners desconocidos: plan B que busca elementos flotantes que hablen de cookies y de aceptar o rechazar, también con resumen genérico (por ahora).

## Tipos de cookies que explica
- Necesarias: hacen que la web funcione (sesión, carrito, protección contra bots). No requieren permiso.
- Funcionales: recuerdan idioma, país o contenido incrustado.
- Estadística: miden visitas y uso del sitio.
- Marketing: te siguen entre webs para crear perfiles y mostrar anuncios a medida.

## Instalación (desarrollo)

1. Opcional: ejecuta "npm run update-gvl" para descargar la Global Vendor List del IAB (necesita Node 18 o superior). Se usa para los nombres de empresas.
2.1. En Chrome: abre chrome://extensions, activa el modo desarrollador, pulsa "Cargar descomprimida" y elige esta carpeta.
2.2 En Firefox (128 o superior): abre about:debugging, entra en "Este Firefox", pulsa "Cargar complemento temporal" y elige manifest.json.


## Estructura del proyecto

src/page-bridge.js corre en el contexto de la página y lee las APIs de los gestores (OneTrust, Didomi, UC_UI, __tcfapi).

src/detect.js detecta banners por gestor (añadir uno es una línea) y cuenta los "partners".

src/i18n.js contiene los textos en lenguaje llano (ES/EN). Es la parte más valiosa del proyecto: ¡contribuye!

src/panel.js dibuja el panel, con Shadow DOM, accesible y con modo oscuro.

src/content.js orquesta todo.

data/gvl.json es la lista de proveedores del IAB, generada por scripts/update-gvl.mjs.

## Limitaciones conocidas

Es lo que la web declara, no una auditoría. La extensión no inspecciona el tráfico real ni verifica lo que cada web hace de verdad.

El valor source: "implied" en el objeto de consentimiento indica el estado predeterminado, no una elección tuya.

En OneTrust, Utiq (identificador creado con tu IP y tu operador móvil) y EUID (tu email convertido en código) aparecen como grupos sueltos mezclados con grupos de prueba, y por ahora no se muestran, aunque son de lo más serio del banner.

En Usercentrics, la clasificación de categorías propias es una heurística y puede fallar con servicios poco conocidos.

En TrustArc, la API no expone el catálogo de categorías.

Si un banner cambia su estructura, el resultado puede degradarse al resumen genérico.

## Contribuir
Añadir un gestor nuevo suele requerir una línea en src/detect.js y, si el gestor tiene API, una función en src/page-bridge.js. Mejorar o traducir los textos de src/i18n.js es la contribución más útil.

## Licencia

MIT
