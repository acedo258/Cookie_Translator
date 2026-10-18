# Cookie Translator

Extensión de navegador (open source) que **traduce el banner de cookies a lenguaje humano** antes de que aceptes.
Browser extension that explains cookie banners in plain language *before* you click.

- Si aceptas todo → qué estás permitiendo (perfiles, anuncios a medida, medición…).
- Si aceptas solo lo necesario → qué cambia.
- Después de elegir (CMPs con IAB TCF) → un "recibo" con las empresas y finalidades que has autorizado.

100 % local: no envía nada a ningún servidor.

## Probar en local

1. (Opcional) `npm run update-gvl` para descargar la lista de proveedores del IAB (nombres en el "recibo").
2. **Chrome:** `chrome://extensions` → Modo desarrollador → *Cargar descomprimida* → esta carpeta.
   **Firefox (128+):** `about:debugging` → *Este Firefox* → *Cargar complemento temporal* → `manifest.json`.
3. Sirve la página de prueba: `python3 -m http.server 8000` y abre `http://localhost:8000/test/demo.html`.

## Estructura

| Archivo | Qué hace |
|---|---|
| `src/page-bridge.js` | Corre en la página, escucha `window.__tcfapi` y reenvía datos |
| `src/detect.js` | Detecta banners por CMP (añadir uno = una línea) y cuenta "partners" |
| `src/i18n.js` | Textos en lenguaje llano (ES/EN) — **la parte más valiosa, ¡contribuye!** |
| `src/panel.js` | Panel con Shadow DOM, accesible y con modo oscuro |
| `src/content.js` | Orquesta todo |

## Limitaciones conocidas (v0.1)

- El estándar TCF **no expone** la lista de proveedores antes de que el usuario elija, así que el resumen previo es genérico por finalidades (+ el nº de socios si el banner lo menciona). El detalle exacto solo se conoce tras la elección.
- Banners sin TCF: solo se detectan por selector; no se lee su contenido a fondo.

## Roadmap

Adaptadores por CMP (OneTrust, Cookiebot, Didomi…) que lean los proveedores reales · popup con historial · tests con fixtures · más idiomas.

## Licencia
MIT
