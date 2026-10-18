(() => {
  const CT = globalThis.CT;
  const state = { tc: null, gvl: null, declared: null, cmode: [], dismissed: false };

  fetch(chrome.runtime.getURL("data/gvl.json"))
    .then((r) => r.json()).then((g) => { state.gvl = g; update(); }).catch(() => {});

  // Los mensajes de la página son NO confiables: solo leemos números/cadenas conocidas.
  window.addEventListener("message", (e) => {
    const d = e.data;
    if (e.source !== window || !d || d.source !== "cookie-translator") return;
    if (d.type === "tcdata") { state.tc = d.payload; update(); }
    else if (d.type === "cmode") {
      const ok = ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"];
      const g = d.payload && Array.isArray(d.payload.granted) ? d.payload.granted : [];
      state.cmode = g.filter((k) => ok.includes(k));
      update();
    }
    else if (d.type === "declared") {
      const p = d.payload || {};
      const str = (v, n) => (typeof v === "string" ? v.slice(0, n) : "");
      const kinds = ["purpose", "special", "feature", "service", "other"];
      const items = (Array.isArray(p.items) ? p.items : []).slice(0, 40).map((i) => i && ({
        kind: kinds.includes(i.kind) ? i.kind : "other",
        tcf: Number.isInteger(i.tcf) ? i.tcf : null,
        name: str(i.name, 120), desc: str(i.desc, 400), key: str(i.key, 80), cat: str(i.cat, 40),
      })).filter((i) => i && i.name);
      state.declared = { source: str(p.source, 30), items };
      update();
    }
  });

  // Avisamos al puente de que ya escuchamos, para que reenvíe el último estado.
  window.postMessage({ source: "cookie-translator", type: "ready" }, "*");

  function vendorNames(ids) {
    const v = state.gvl && state.gvl.vendors;
    return v ? ids.map((id) => v[id] && v[id].name).filter((n) => typeof n === "string") : [];
  }

  // Para no repintar el panel si no ha cambiado nada.
  let lastKey = "";
  function show(model, onClose) {
    const key = JSON.stringify(model);
    if (key === lastKey) return;
    lastKey = key;
    CT.renderPanel(model, onClose);
  }

  function update() {
    if (state.dismissed) return;
    const tc = state.tc;

    if (tc && tc.eventStatus === "useractioncomplete") {
      show({
        mode: "after",
        receipt: {
          vendorCount: tc.vendorConsents.length,
          vendorNames: vendorNames(tc.vendorConsents),
          purposes: tc.purposeConsents.filter((n) => n >= 1 && n <= 11),
          features: tc.specialFeatureOptins.filter((n) => n === 1 || n === 2),
        },
      }, () => (state.dismissed = true));
      return;
    }

    const banner = CT.detectBanner();
    const tcfShowing = tc && tc.eventStatus === "cmpuishown";
    if (banner || tcfShowing) {
      show({
        mode: "before",
        cmpName: banner && banner.name,
        partners: banner ? CT.countPartners(banner.el) : null,
        declared: state.declared,
        cmode: state.cmode,
      }, () => (state.dismissed = true));
    } else {
      lastKey = "";
      CT.removePanel();
    }
  }

  let timer = null;
  new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(update, 400);
  }).observe(document.documentElement, { childList: true, subtree: true });
  update();
  setInterval(update, 2000); // por si el banner aparece sin que la página cambie después
})();
