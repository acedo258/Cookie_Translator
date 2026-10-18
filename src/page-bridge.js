// Se ejecuta en el contexto de la PÁGINA (world: MAIN) para poder ver window.__tcfapi.
// Solo observa: nunca modifica ni responde por el usuario.
(() => {
  if (window.__ctBridge) return;
  window.__ctBridge = true;

  let last = null; // último estado recibido, por si el content script llega tarde

  const post = (type, payload) =>
    window.postMessage({ source: "cookie-translator", type, payload }, "*");

  // Cuando el content script avisa de que ya está escuchando, le reenviamos el último estado.
  window.addEventListener("message", (e) => {
    const d = e.data;
    if (e.source !== window || !d || d.source !== "cookie-translator" || d.type !== "ready") return;
    if (last) post("tcdata", last);
  });

  const trueKeys = (obj) =>
    obj ? Object.keys(obj).filter((k) => obj[k]).map(Number) : [];

  const slim = (tc) => ({
    cmpId: tc.cmpId,
    gdprApplies: tc.gdprApplies,
    eventStatus: tc.eventStatus,
    purposeConsents: trueKeys(tc.purpose && tc.purpose.consents),
    vendorConsents: trueKeys(tc.vendor && tc.vendor.consents),
    specialFeatureOptins: trueKeys(tc.specialFeatureOptins),
  });

  let attempts = 0;
  function hook() {
    if (typeof window.__tcfapi !== "function") {
      if (++attempts < 40) setTimeout(hook, 500); // hasta ~20 s
      return;
    }
    try {
      window.__tcfapi("addEventListener", 2, (tc, ok) => {
        if (ok && tc) { last = slim(tc); post("tcdata", last); }
      });
    } catch (e) { /* CMP no estándar: lo ignoramos */ }
  }
  hook();

  // ---- Finalidades DECLARADAS por el banner (antes de que el usuario elija) ----
  // Leemos de la API del propio gestor (OneTrust, Didomi) el NOMBRE y la DESCRIPCIÓN que la web declara.
  // Cada item: { kind: "purpose"|"special"|"feature"|"other", tcf: id TCF o null, name, desc }.
  const num = (v) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : null; };
  const clip = (v, n) => typeof v === "string" ? v.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, n) : "";
  const loc = (v) => {
    if (typeof v === "string") return v;
    if (v && typeof v === "object") {
      const l = (document.documentElement.lang || navigator.language || "en").slice(0, 2).toLowerCase();
      return v[l] || v.es || v.en || Object.values(v).find((x) => typeof x === "string") || "";
    }
    return "";
  };
  // Solo para ordenar por gravedad (no para el texto): nombre TCF en inglés -> id.
  const byName = (list, name) => { const m = list.find(([, re]) => re.test(name)); return m ? m[0] : null; };
  const PURPOSE_NAMES = [
    [1, /store and\/or access|speichern von oder zugriff/i], [2, /limited data to select advertising|reduzierter daten zur auswahl von werbe/i],
    [3, /create profiles for personali[sz]ed advertising|erstellung von profilen f(ü|ue)r personalisierte werbung/i], [4, /use profiles to select personali[sz]ed advertising|verwendung von profilen zur auswahl personalisierter werbung/i],
    [5, /create profiles to personali[sz]e content|erstellung von profilen zur personalisierung von inhalten/i], [6, /use profiles to select personali[sz]ed content|verwendung von profilen zur auswahl personalisierter inhalte/i],
    [7, /measure advertising performance|messung der werbeleistung/i], [8, /measure content performance|messung der (performance|leistung) von inhalten/i],
    [9, /understand audiences|analyse von zielgruppen/i], [10, /develop and improve|entwicklung und verbesserung/i], [11, /limited data to select content|reduzierter daten zur auswahl von inhalten/i],
  ];
  const SPL_NAMES = [[1, /precise geolocation|genaue[rn]? standortdaten/i], [2, /scan device characteristics|endger(ä|ae)teeigenschaften|aktiv abfragen/i]];
  const FEAT_NAMES = [[1, /match and combine|abgleich(ung)? und kombination/i], [2, /link different devices|verkn(ü|ue)pfung verschiedener endger/i], [3, /identify devices|identifikation von endger(ä|ae)ten/i]];

  function fromOneTrust() {
    const o = window.OneTrust;
    if (!o || typeof o.GetDomainData !== "function") return null;
    const groups = ((o.GetDomainData() || {}).Groups) || [];
    const items = [];
    const walk = (g) => {
      const type = String(g.Type || g.GroupType || "").toUpperCase();
      const name = clip(loc(g.GroupName), 120);
      const desc = clip(loc(g.GroupDescription), 400);
      // OptanonGroupId lleva el id TCF en cualquier idioma: IAB2V2_3 (finalidad 3), ISF2V2_1 (función especial 1),
      // IFE2V2_2 (función 2), ISP2V2_n (finalidad especial: técnica, no se muestra).
      const m = /^(IAB|ISF|IFE|ISP)2(?:V\d+)?_(\d+)$/.exec(String(g.OptanonGroupId || g.CustomGroupId || ""));
      let kind = null, tcf = null;
      if (name && m) {
        if (m[1] !== "ISP") { kind = { IAB: "purpose", ISF: "special", IFE: "feature" }[m[1]]; tcf = parseInt(m[2], 10); }
      } else if (name && /^IAB/.test(type)) {
        // Sin OptanonGroupId: se deduce del tipo y del nombre oficial (nunca del PurposeId interno).
        if (/_STACK$/.test(type) || /_SPL_PURPOSE$/.test(type)) kind = null;
        else if (/_SPL_FEATURE$/.test(type)) { kind = "special"; tcf = byName(SPL_NAMES, name); }
        else if (/_FEATURE$/.test(type)) { kind = "feature"; tcf = byName(FEAT_NAMES, name); }
        else if (/_PURPOSE$/.test(type)) { kind = "purpose"; tcf = byName(PURPOSE_NAMES, name); }
      }
      if (kind) items.push({ kind, tcf, name, desc });
      (g.SubGroups || g.ChildGroups || []).forEach(walk);
    };
    groups.forEach(walk);
    return items.length ? { source: "OneTrust", items } : null;
  }

  function fromDidomi() {
    const D = window.Didomi;
    if (!D) return null;
    let ps = [];
    try { ps = (D.getRequiredPurposes && D.getRequiredPurposes()) || []; } catch (e) {}
    if (!ps.length && typeof D.getRequiredPurposeIds === "function") ps = (D.getRequiredPurposeIds() || []).map((id) => ({ id }));
    const items = ps.map((p) => {
      const id = String(p.id || "");
      const name = clip(loc(p.name), 120) || clip(id.replace(/_/g, " "), 120);
      const desc = clip(loc(p.description) || loc(p.descriptionLegal), 400);
      const iab = num(p.iabId);
      // "id" va aparte para que la gravedad se pueda deducir de palabras clave si no hay id TCF.
      return name ? { kind: iab != null ? "purpose" : "other", tcf: iab, name, desc, key: clip(id, 80) } : null;
    }).filter(Boolean);
    return items.length ? { source: "Didomi", items } : null;
  }

  // Usercentrics: lista de servicios que declara la web, cada uno con su categoría (essential, functional, marketing…).
  function fromUsercentrics() {
    const U = window.UC_UI;
    if (!U) return null;
    let r = null;
    for (const fn of ["getServicesBaseInfo", "getServicesFullInfo"]) {
      if (typeof U[fn] !== "function") continue;
      const v = U[fn]();
      if (Array.isArray(v)) { r = v; break; }
      // Versiones nuevas devuelven una promesa: guardamos el resultado para el siguiente intento.
      if (v && typeof v.then === "function") { v.then((a) => { if (Array.isArray(a)) ucCache = a; }).catch(() => {}); }
    }
    if (!r) r = ucCache;
    if (!Array.isArray(r)) return null;
    const items = r.map((x) => ({
      kind: "service", tcf: null,
      name: clip(String(x.name || x.dataProcessor || ""), 120),
      desc: "",
      cat: clip(String(x.categorySlug || x.categorySlug || ""), 40),
    })).filter((i) => i.name && !/^(essential|necessary|strictly)/i.test(i.cat));
    return items.length ? { source: "Usercentrics", items } : null;
  }
  let ucCache = null;

  // Google Consent Mode: estado efectivo = valores "default" (sin región) y después los "update", en orden.
  // Si alguno de estos permisos está "granted" mientras el banner sigue sin respuesta, es un aviso.
  const CM_KEYS = ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"];
  let cmKey = "";
  function readConsentMode() {
    const dl = window.dataLayer;
    if (!Array.isArray(dl)) return;
    const state = {};
    for (const x of dl) {
      if (!x || x[0] !== "consent" || !x[2] || typeof x[2] !== "object") continue;
      if (x[1] === "default" && x[2].region) continue; // regla solo para otras regiones
      if (x[1] !== "default" && x[1] !== "update") continue;
      for (const k of CM_KEYS) if (typeof x[2][k] === "string") state[k] = x[2][k];
    }
    const granted = CM_KEYS.filter((k) => state[k] === "granted");
    const key = granted.join();
    if (key !== cmKey) { cmKey = key; post("cmode", { granted }); }
  }
  setInterval(readConsentMode, 1500);
  readConsentMode();

  let declaredKey = "", tries = 0;
  const lastDeclared = { v: null };
  function readDeclared() {
    let r = null;
    for (const fn of [fromOneTrust, fromDidomi, fromUsercentrics]) {
      try { r = fn(); } catch (e) { r = null; }
      if (r) break;
    }
    if (r) {
      const key = JSON.stringify(r);
      if (key !== declaredKey) { declaredKey = key; lastDeclared.v = r; post("declared", r); }
    }
    if (!r || tries < 10) { if (++tries < 60) setTimeout(readDeclared, 1000); }
  }
  readDeclared();
  window.addEventListener("message", (e) => {
    const d = e.data;
    if (e.source === window && d && d.source === "cookie-translator" && d.type === "ready" && lastDeclared.v) post("declared", lastDeclared.v);
  });
})();
