// Pulls raw tables from the Knesset's open OData API into data/raw/.
import { writeFile } from 'node:fs/promises';

const BASE = 'https://knesset.gov.il/Odata/ParliamentInfo.svc';
const TABLES = ['KNS_Person', 'KNS_PersonToPosition', 'KNS_Position', 'KNS_KnessetDates'];

async function all(table) {
  const rows = [];
  for (let skip = 0; ; ) {
    const res = await fetch(`${BASE}/${table}()?$format=json&$skip=${skip}`);
    if (!res.ok) throw new Error(`${table} ${res.status}`);
    const page = (await res.json()).value;
    if (!page.length) return rows;
    rows.push(...page);
    skip += page.length;
  }
}

for (const t of TABLES) {
  const rows = await all(t);
  await writeFile(new URL(`../data/raw/${t}.json`, import.meta.url), JSON.stringify(rows));
  console.log(t, rows.length);
}
