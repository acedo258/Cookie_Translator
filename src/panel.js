(() => {
  const CT = (globalThis.CT = globalThis.CT || {});
  let host = null, root = null;

  const CSS = `
    :host { all: initial; }
    .card { position: fixed; right: 16px; bottom: 16px; z-index: 2147483647; width: 340px; max-height: 70vh; overflow: auto;
      font: 14px/1.45 system-ui, sans-serif; color: #1a1a1a; background: #fff; border: 1px solid #d0d5dd;
      border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,.2); padding: 14px 16px; box-sizing: border-box; }
    @media (prefers-color-scheme: dark) { .card { color: #eee; background: #1e1f22; border-color: #3a3d42; } }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    h1 { font-size: 13px; margin: 0; opacity: .7; letter-spacing: .03em; text-transform: uppercase; }
    button { all: unset; cursor: pointer; padding: 2px 8px; border-radius: 6px; font-size: 12px; border: 1px solid currentColor; opacity: .7; }
    button:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
    .alert { border: 2px solid #b42318; border-radius: 8px; padding: 8px 10px; margin: 4px 0 8px; background: rgba(180,35,24,.08); }
    .alert h2 { margin: 0 0 4px; color: #b42318; }
    @media (prefers-color-scheme: dark) { .alert { border-color: #f97066; } .alert h2 { color: #f97066; } }
    h2 { font-size: 15px; margin: 12px 0 4px; }
    .warn h2 { color: #b42318; } .ok h2 { color: #067647; }
    @media (prefers-color-scheme: dark) { .warn h2 { color: #f97066; } .ok h2 { color: #47cd89; } }
    ul { margin: 4px 0 0; padding-left: 18px; } li { margin: 3px 0; }
    ol { list-style: none; padding: 0; margin: 6px 0 0; }
    ol li { margin: 6px 0; padding-left: 10px; border-left: 3px solid #667085; }
    ol li.high { border-color: #b42318; } ol li.medium { border-color: #b54708; }
    @media (prefers-color-scheme: dark) { ol li.high { border-color: #f97066; } ol li.medium { border-color: #fdb022; } }
    ol li.unk { border-color: #667085; }
    .nm { display: block; font-weight: 600; }
    .ds { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; font-size: 12.5px; opacity: .8; margin-top: 2px; }
    .ds.open { -webkit-line-clamp: unset; }
    .lvl { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; opacity: .75; }
    p { margin: 4px 0; } .small { font-size: 12px; opacity: .65; margin-top: 12px; }
  `;

  const h = (tag, props, ...kids) => {
    const el = document.createElement(tag);
    Object.assign(el, props || {});
    kids.flat().forEach((k) => k != null && el.append(k));
    return el;
  };

  // Cada punto declarado por la web se asocia a una de nuestras explicaciones (t.risks) usando,
  // por este orden: 1) el id TCF que da el gestor, 2) palabras clave en el nombre/id, 3) nada.
  // Lo que no se reconoce se muestra con el nombre y la descripción que declara la propia web.
  const KEYMAP = [
    [/geoloc|location|ubicaci|gps|localizaci|standort/i, "special", 1],
    [/fingerprint|device.?char|characteristics|scan|huella/i, "special", 2],
    [/content.*profile|profile.*content|perfil.*contenido/i, "purpose", 5],
    [/(ads?|advertis|anunci|publicidad).*(profile|perfil)|(profile|perfil).*(ads?|advertis|anunci|publicidad)/i, "purpose", 3],
    [/personali[sz]ed.?content|contenido.?personaliz/i, "purpose", 6],
    [/personali[sz]ed.?(ads|advertis)|anuncios.?personaliz/i, "purpose", 4],
    [/data.?sharing|combin|match.*data|compart/i, "feature", 1],
    [/link.*device|vincul|cross.?device/i, "feature", 2],
    [/identify.*device|identificar.*dispositivo/i, "feature", 3],
    [/measure.*(ad\b|ads|advert)|ad.?performance|medi.*anunci/i, "purpose", 7],
    [/measure.*content|content.?performance|medi.*contenido/i, "purpose", 8],
    [/market.?research|audience|audiencia|estad[ií]stic/i, "purpose", 9],
    [/improve|develop|mejor|desarroll/i, "purpose", 10],
    [/limited.?data.*content/i, "purpose", 11],
    [/limited.?data|basic.?ads|anuncios.?b[aá]sic/i, "purpose", 2],
    [/\bcookies?\b|store|stor[ae]|access|almacen/i, "purpose", 1],
  ];
  const riskFieldFor = { purpose: "purposes", special: "features", feature: "gfeatures" };
  const resolve = (it) => {
    let kind = it.kind, id = it.tcf;
    if (!riskFieldFor[kind] || id == null) {
      const text = `${it.key || ""} ${it.name}`;
      const k = KEYMAP.find(([re]) => re.test(text));
      if (!k) return -1;
      kind = k[1]; id = k[2];
    }
    const t = CT.t();
    return t.risks.findIndex((r) => (r[riskFieldFor[kind]] || []).includes(id));
  };

  // c = categoría + nombre del servicio: las categorías propias ("customcategory-…") no dicen nada, el nombre sí.
  const catKey = (c) => (/market|advert|target|publicid|retarget|remarketing|audience manager|pixel/i.test(c) ? "marketing"
    : /analy|statist|measure|perform|estad|anal[ií]t/i.test(c) ? "analytics"
    : /function|prefer|personal|social|funcion/i.test(c) ? "functional" : "unknown");
  const RANK = { high: 0, medium: 1, low: 2, unk: 3 };

  const declaredList = (items) => {
    const t = CT.t();
    const known = new Map();   // índice de t.risks -> nombres que declara la web
    const services = new Map(); // categoría -> nombres de servicios
    const unknown = [];
    for (const it of items) {
      if (it.kind === "service") {
        const k = catKey(`${it.cat} ${it.name}`);
        if (!services.has(k)) services.set(k, []);
        if (!services.get(k).includes(it.name)) services.get(k).push(it.name);
        continue;
      }
      const i = resolve(it);
      if (i < 0) { unknown.push(it); continue; }
      if (!known.has(i)) known.set(i, []);
      if (!known.get(i).includes(it.name)) known.get(i).push(it.name);
    }
    const mk = (cls, label, title, desc) => {
      const d = desc ? h("span", { className: "ds", textContent: desc }) : null;
      if (d) d.addEventListener("click", () => d.classList.toggle("open"));
      return h("li", { className: cls },
        h("span", { className: "lvl", textContent: label }), title, d);
    };
    const rows = [];
    for (const [i, names] of known) {
      const r = t.risks[i];
      rows.push({ rank: RANK[r.level] * 1000 + i, el: mk(r.level, t.levels[r.level], r.text, `${t.declaredAs} ${names.join(" · ")}`) });
    }
    for (const [k, names] of services) {
      const c = t.serviceCats[k];
      rows.push({ rank: RANK[c.level] * 1000 + 500, el: mk(c.level, t.levels[c.level], c.text, `${t.servicesAs} ${names.join(" · ")}`) });
    }
    for (const it of unknown) {
      rows.push({ rank: RANK.unk * 1000, el: mk("unk", t.levels.unk, h("span", { className: "nm", textContent: it.name }), it.desc) });
    }
    rows.sort((a, b) => a.rank - b.rank);
    return h("ol", null, rows.map((r) => r.el));
  };

  CT.removePanel = () => { if (host) host.remove(); host = root = null; };

  CT.renderPanel = (model, onClose) => {
    const t = CT.t();
    if (!host) {
      host = document.createElement("div");
      host.id = "cookie-translator-host";
      root = host.attachShadow({ mode: "closed" });
      root.append(h("style", { textContent: CSS }));
      document.documentElement.append(host);
    }
    root.querySelectorAll(".card").forEach((n) => n.remove());

    const close = h("button", { textContent: t.close, ariaLabel: t.close });
    close.addEventListener("click", () => { CT.removePanel(); onClose && onClose(); });
    const card = h("div", { className: "card", role: "region", ariaLabel: t.title },
      h("header", null, h("h1", { textContent: t.title }), close));

    // Todo el texto externo (nombres de proveedores, etc.) entra con textContent, nunca como HTML.
    // Lista ordenada de más a menos grave. Si se pasan "purposes" y "features",
    // solo se muestran los riesgos que coincidan (para el recibo); si no, todos.
    const riskList = (filter) => {
      const items = t.risks
        .filter((r) => !filter || (r.purposes || []).some((id) => filter.purposes.includes(id))
          || (r.features || []).some((id) => filter.features.includes(id))
          || (r.gfeatures || []).some((id) => (filter.generalFeatures || []).includes(id)))
        .map((r) => h("li", { className: r.level }, h("span", { className: "lvl", textContent: t.levels[r.level] }), r.text));
      return h("ol", null, items);
    };

    // Todo el texto externo (nombres de proveedores, etc.) entra con textContent, nunca como HTML.
    if (model.mode === "before") {
      if (model.cmode && model.cmode.length) {
        card.append(h("section", { className: "alert", role: "alert" },
          h("h2", { textContent: t.alertTitle }),
          h("p", { textContent: t.alertBody }),
          h("ul", null, model.cmode.map((k) => h("li", { textContent: t.alertItems[k] }))),
          h("p", { className: "small", textContent: t.alertNote })));
      }
      const dec = model.declared;
      const useDeclared = !!(dec && dec.items && dec.items.length);
      card.append(
        h("section", { className: "warn" },
          h("h2", { textContent: t.allTitle }),
          h("p", { textContent: useDeclared ? t.declaredIntro(model.partners) : t.allIntro(model.partners) }),
          useDeclared ? declaredList(dec.items) : riskList(null)),
        h("section", { className: "ok" },
          h("h2", { textContent: t.necessaryTitle }),
          h("p", { textContent: t.necessaryBody })),
        h("p", { className: "small", textContent: useDeclared ? t.declaredDisclaimer : t.disclaimer }));
    } else {
      const r = model.receipt;
      card.append(h("h2", { textContent: t.receiptTitle }));
      const list = riskList({ purposes: r.purposes, features: r.features });
      if (!r.vendorCount && !list.children.length) {
        card.append(h("p", { textContent: t.receiptNone }));
      } else {
        card.append(h("p", { textContent: r.vendorCount ? t.receiptVendors(r.vendorCount) : t.receiptData }), list);
        if (r.vendorNames.length) {
          const shown = r.vendorNames.slice(0, 8).map((n) => h("li", { textContent: n }));
          if (r.vendorCount > shown.length) shown.push(h("li", { textContent: t.receiptMore(r.vendorCount - shown.length) }));
          card.append(h("p", { textContent: t.receiptCompanies }), h("ul", null, shown));
        }
      }
    }
    root.append(card);
  };
})();
