(() => {
  const CT = (globalThis.CT = globalThis.CT || {});

  // Un "adaptador" mínimo por CMP: nombre + selector del contenedor del banner.
  // Para añadir uno nuevo basta con una línea aquí.
  CT.cmps = [
    { name: "OneTrust", selector: "#onetrust-banner-sdk" },
    { name: "Cookiebot", selector: "#CybotCookiebotDialog" },
    { name: "Didomi", selector: "#didomi-notice, #didomi-popup, .didomi-popup-container, #didomi-host" },
    { name: "Quantcast", selector: ".qc-cmp2-container" },
    { name: "Usercentrics", selector: "#usercentrics-root" },
    { name: "TrustArc", selector: "#truste-consent-track" },
    { name: "El País (PRISA)", selector: "#pmConsentWall" },
  ];

  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return true;
    // Algunos CMP (Usercentrics) ponen un contenedor de tamaño 0 y dibujan el banner en un Shadow DOM abierto.
    // Exigimos un elemento grande para no confundir el banner con el botoncito que queda tras elegir.
    if (el.shadowRoot) {
      for (const n of el.shadowRoot.querySelectorAll("*")) {
        const b = n.getBoundingClientRect();
        if (b.width > 200 && b.height > 100) return true;
      }
    }
    return false;
  };

  // Plan B: cualquier elemento fijo (o ventana de diálogo) que hable de cookies y de aceptar/rechazar.
  // Es lento, así que solo se ejecuta como máximo cada 2 segundos.
  let lastGeneric = 0;
  let lastFound = null;
  const genericBanner = () => {
    if (Date.now() - lastGeneric < 2000) {
      // Dentro de la ventana de espera: devolvemos el último banner si sigue en pantalla.
      return lastFound && lastFound.el.isConnected && visible(lastFound.el) ? lastFound : null;
    }
    lastGeneric = Date.now();
    lastFound = null;
    const host = document.getElementById("cookie-translator-host");
    for (const el of document.querySelectorAll("div, section, aside, dialog")) {
      if (host && host.contains(el)) continue;
      const flotante = getComputedStyle(el).position === "fixed" || el.getAttribute("role") === "dialog";
      if (!flotante || !visible(el)) continue;
      const text = el.innerText || "";
      if (text.length < 40 || text.length > 4000) continue;
      if (/cookies?/i.test(text) && /(aceptar|acepto|permitir|rechazar|accept|agree|allow|reject|decline|consent|accepter|refuser|autoriser|akzeptieren|ablehnen|zulassen|accetta|rifiuta)/i.test(text)) {
        lastFound = { name: null, el };
        return lastFound;
      }
    }
    return null;
  };

  CT.detectBanner = () => {
    for (const c of CT.cmps) {
      const el = document.querySelector(c.selector);
      if (el && visible(el)) return { name: c.name, el };
    }
    return genericBanner();
  };

  // Busca frases tipo "nuestros 143 socios" / "143 partners" en el texto del banner.
  const RE = /(\d{1,4})\s+(partners?|socios|proveedores|vendors|empresas|companies|colaboradores|terceros|partenaires|fournisseurs)/i;
  CT.countPartners = (el) => {
    const m = RE.exec((el && el.innerText) || "");
    return m ? parseInt(m[1], 10) : null;
  };
})();
