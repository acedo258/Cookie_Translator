(() => {
  const CT = (globalThis.CT = globalThis.CT || {});

  CT.strings = {
    es: {
      title: "Cookie Translator",
      close: "Cerrar",
      allTitle: "Si aceptas todo",
      allIntro: (n) => n
        ? `Vas a compartir estos datos con ${n} empresas, de más a menos graves:`
        : "Vas a compartir estos datos con las empresas del banner, de más a menos graves:",
      levels: { high: "Muy sensible", medium: "Sensible", low: "Poco sensible", unk: "Sin clasificar" },
      risks: [
        { level: "high", features: [1], text: "Ubicación precisa (GPS): saben dónde estás con exactitud, por ejemplo tu casa o tu trabajo." },
        { level: "high", features: [2], text: "Huella digital: analizan las características de tu dispositivo para reconocerte aunque borres las cookies." },
        { level: "high", purposes: [3, 4], text: "Un perfil sobre ti y tus intereses para mostrarte anuncios a medida." },
        { level: "high", gfeatures: [1], text: "Combinar tus datos con los de otras fuentes para completar tu perfil." },
        { level: "high", gfeatures: [2], text: "Vincular tus distintos dispositivos (móvil, ordenador, tele…) para reconocerte en todos." },
        { level: "medium", purposes: [5, 6], text: "Un perfil sobre ti para personalizar el contenido que ves." },
        { level: "medium", gfeatures: [3], text: "Reconocerte por lo que tu dispositivo envía solo (tu IP, navegador, idioma…), incluso sin cookies. La IP es un dato personal: delata tu zona y tu operador." },
        { level: "medium", purposes: [9], text: "Estadísticas de audiencia combinando tus datos con los de otras fuentes." },
        { level: "medium", purposes: [7, 8], text: "Medir qué anuncios y contenidos ves, durante cuánto tiempo y qué haces después." },
        { level: "low", purposes: [10], text: "Desarrollar y mejorar productos y servicios con tus datos." },
        { level: "low", purposes: [2, 11], text: "Elegir anuncios y contenido con datos limitados, como la página que ves y tu zona aproximada." },
        { level: "low", purposes: [1], text: "Guardar o leer información en tu dispositivo (cookies, identificadores)." },
      ],
      declaredIntro: (n) => n
        ? `Este banner declara que ${n} empresas piden esto, de más a menos grave:`
        : "Este banner declara que pide esto, de más a menos grave:",
      declaredDisclaimer: "Lista leída del propio banner de este sitio: solo lo que declara. La explicación en lenguaje llano y el orden son de la extensión; en gris, el nombre original que usa la web. Pulsa un texto en gris para verlo entero.",
      alertTitle: "!!! Aviso",
      alertBody: "Esta web ya parte con estos permisos concedidos por defecto, antes de que elijas nada:",
      alertItems: {
        ad_storage: "guardar cookies de publicidad",
        ad_user_data: "enviar tus datos a Google para publicidad",
        ad_personalization: "personalizar anuncios con tu perfil",
        analytics_storage: "guardar cookies de estadísticas",
      },
      alertNote: "Es lo que la propia página configura en Google Consent Mode; no puedo comprobar qué se envía realmente.",
      declaredAs: "El banner lo declara como:",
      serviceCats: {
        marketing: { level: "high", text: "Publicidad, seguimiento o medición de campañas: servicios que registran lo que haces para mostrarte anuncios o medir su efecto (algunos, según su nombre, te pueden seguir también en otras webs)." },
        analytics: { level: "medium", text: "Estadísticas: miden cómo usas la web, qué páginas ves y cuánto tiempo." },
        functional: { level: "low", text: "Contenido de terceros (vídeos, mapas, audio): al cargarlo, esa empresa recibe tu IP y sabe que has visitado la web." },
        unknown: { level: "unk", text: "Servicios sin clasificar por el banner." },
      },
      servicesAs: "Servicios que declara:",
      necessaryTitle: "Si aceptas solo lo necesario",
      necessaryBody: "Solo cookies técnicas: mantener tu sesión, recordar el idioma, seguridad. Sin perfiles ni publicidad personalizada.",
      disclaimer: "Resumen genérico basado en el estándar IAB TCF. Revisa las opciones del banner para ver el detalle de este sitio.",
      receiptTitle: "Lo que acabas de aceptar",
      receiptNone: "No has autorizado ninguna empresa ni finalidad opcional.",
      receiptVendors: (n) => `Has compartido estos datos con ${n} empresas, de más a menos graves:`,
      receiptData: "Has compartido estos datos, de más a menos graves:",
      receiptCompanies: "Algunas de esas empresas:",
      receiptMore: (n) => `…y ${n} más`,
    },
    en: {
      title: "Cookie Translator",
      close: "Close",
      allTitle: "If you accept everything",
      allIntro: (n) => n
        ? `You will share this data with ${n} companies, from most to least serious:`
        : "You will share this data with the companies in the banner, from most to least serious:",
      levels: { high: "Very sensitive", medium: "Sensitive", low: "Less sensitive", unk: "Unclassified" },
      risks: [
        { level: "high", features: [1], text: "Precise location (GPS): they know exactly where you are, such as your home or workplace." },
        { level: "high", features: [2], text: "Fingerprinting: they scan your device's characteristics to recognise you even if you clear cookies." },
        { level: "high", purposes: [3, 4], text: "A profile about you and your interests to show you tailored ads." },
        { level: "high", gfeatures: [1], text: "Combining your data with data from other sources to complete your profile." },
        { level: "high", gfeatures: [2], text: "Linking your different devices (phone, computer, TV…) to recognise you on all of them." },
        { level: "medium", purposes: [5, 6], text: "A profile about you to personalise the content you see." },
        { level: "medium", gfeatures: [3], text: "Recognising you from what your device sends on its own (your IP, browser, language…), even without cookies. Your IP is personal data: it reveals your area and your provider." },
        { level: "medium", purposes: [9], text: "Audience statistics, combining your data with data from other sources." },
        { level: "medium", purposes: [7, 8], text: "Measuring which ads and content you see, for how long and what you do next." },
        { level: "low", purposes: [10], text: "Developing and improving products and services using your data." },
        { level: "low", purposes: [2, 11], text: "Picking ads and content with limited data, such as the page you're on and your rough area." },
        { level: "low", purposes: [1], text: "Storing or reading information on your device (cookies, identifiers)." },
      ],
      declaredIntro: (n) => n
        ? `This banner declares that ${n} companies ask for this, from most to least serious:`
        : "This banner declares that it asks for this, from most to least serious:",
      declaredDisclaimer: "List read from this site's own banner: only what it declares. The plain-language explanation and the order are the extension's; in grey, the name the site itself uses. Click a grey text to expand it.",
      alertTitle: "!!! Warning",
      alertBody: "This site already starts with these permissions granted by default, before you choose anything:",
      alertItems: {
        ad_storage: "storing advertising cookies",
        ad_user_data: "sending your data to Google for advertising",
        ad_personalization: "personalising ads with your profile",
        analytics_storage: "storing analytics cookies",
      },
      alertNote: "This is what the page itself sets in Google Consent Mode; I can't verify what is actually sent.",
      declaredAs: "The banner declares it as:",
      serviceCats: {
        marketing: { level: "high", text: "Advertising, tracking or campaign measurement: services that record what you do to show you ads or measure their effect (some, depending on the service, can also follow you on other sites)." },
        analytics: { level: "medium", text: "Statistics: they measure how you use the site, which pages you see and for how long." },
        functional: { level: "low", text: "Third-party content (videos, maps, audio): when it loads, that company receives your IP and knows you visited the site." },
        unknown: { level: "unk", text: "Services the banner does not classify." },
      },
      servicesAs: "Services declared:",
      necessaryTitle: "If you accept only what's necessary",
      necessaryBody: "Technical cookies only: keeping you logged in, remembering your language, security. No profiling or personalised ads.",
      disclaimer: "Generic summary based on the IAB TCF standard. Check the banner's options for this site's details.",
      receiptTitle: "What you just accepted",
      receiptNone: "You haven't authorised any company or optional purpose.",
      receiptVendors: (n) => `You shared this data with ${n} companies, from most to least serious:`,
      receiptData: "You shared this data, from most to least serious:",
      receiptCompanies: "Some of those companies:",
      receiptMore: (n) => `…and ${n} more`,
    },
  };

  // Idioma de la interfaz del navegador; si no se puede obtener, el de las páginas web.
  const ui = (globalThis.chrome && chrome.i18n && chrome.i18n.getUILanguage && chrome.i18n.getUILanguage()) || navigator.language || "en";
  CT.lang = ui.toLowerCase().startsWith("es") ? "es" : "en";
  CT.t = () => CT.strings[CT.lang];
})();
