// Descarga la Global Vendor List del IAB y guarda solo lo necesario en data/gvl.json
// Uso: node scripts/update-gvl.mjs   (Node 18+)
import { writeFile } from "node:fs/promises";

const res = await fetch("https://vendor-list.consensu.org/v3/vendor-list.json");
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const gvl = await res.json();

const vendors = {};
for (const [id, v] of Object.entries(gvl.vendors)) {
  vendors[id] = { name: v.name, purposes: v.purposes, legIntPurposes: v.legIntPurposes, policyUrl: v.urls?.[0]?.privacy };
}
await writeFile("data/gvl.json", JSON.stringify({ version: gvl.vendorListVersion, vendors }));
console.log(`OK: ${Object.keys(vendors).length} vendors (v${gvl.vendorListVersion})`);
