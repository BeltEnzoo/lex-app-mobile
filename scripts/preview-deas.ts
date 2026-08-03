import { readFileSync } from 'node:fs';
import * as XLSX from 'xlsx';

const wb = XLSX.read(readFileSync('data/deas_instalados.xlsx'));
const m = XLSX.utils.sheet_to_json<(string | number)[]>(wb.Sheets[wb.SheetNames[0]], {
  header: 1,
  defval: '',
  raw: true,
});

for (const cells of m.slice(2)) {
  if (!cells || cells.every((c) => String(c ?? '').trim() === '')) continue;
  const name = String(cells[2] ?? '');
  const addr = String(cells[11] ?? '');
  const loc = String(cells[10] ?? '');
  const prov = String(cells[9] ?? '');
  const serial = String(cells[8] ?? '');
  console.log([serial, name, loc, prov, addr.slice(0, 70) || '(SIN DIR)'].join(' | '));
}
