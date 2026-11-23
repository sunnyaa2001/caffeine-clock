// xlsx(카페별10메뉴카페인함량) → src/data/catalog/drinks.generated.ts
// 카페인 값은 원본 그대로 옮긴다. 값이 없으면 null(=카페인 정보 미확인).
import * as XLSX from 'xlsx';
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = new URL('../data-source/cafe-menu-caffeine.xlsx', import.meta.url);
const OUT = new URL('../src/data/catalog/drinks.generated.ts', import.meta.url);

const BRAND_IDS = {
  '투썸플레이스': 'twosome', '컴포즈커피': 'compose', '하이오커피': 'highoh', '빽다방': 'paikdabang',
  '텐퍼센트커피': 'tenpercent', '공차': 'gongcha', '스타벅스': 'starbucks', '이디야': 'ediya',
  '파리바게뜨': 'parisbaguette', '메가MGC커피': 'megacoffee', '하삼동커피': 'hasamdong',
};

// 카테고리는 xlsx에 없으므로 메뉴명으로 분류 (카페인 값과 무관). 예외는 OVERRIDES에서 지정.
const OVERRIDES = {
  '커피 밀크쉐이크': 'coffee',
  '리얼초코자바칩프라페': 'noncoffee',
  '아이스티샷추가(아샷추)': 'coffee',
  '아샷추 복숭아': 'coffee',
  '자바 칩 프라푸치노': 'coffee',
  '아보카도바나나프레치노': 'noncoffee',
  '아이스 달고나 라떼': 'latte',
  '하이슈페너': 'latte',
  '아인슈페너': 'latte',
  '리얼초코라떼': 'noncoffee',
  '솔티드밀크카라멜': 'latte',
};
function categorize(name) {
  if (OVERRIDES[name]) return OVERRIDES[name];
  if (name.includes('디카페인')) return 'decaf';
  if (/콜드\s?브루/.test(name)) return 'coldbrew';
  if (/(티|말차|녹차|그린|밀크티|요구르트|타로|우롱|초코)/.test(name) && !/(카페|커피)/.test(name)) return 'noncoffee';
  if (/(라떼|모카|마끼아또|마키아또|딥|클라우드|구름|소금커피)/.test(name)) return 'latte';
  return 'coffee';
}
const TEMP = { '아이스': 'ice', '핫': 'hot' };
const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

const wb = XLSX.read(readFileSync(SRC));
const drinks = [];
const cafes = [];
for (const sheetName of wb.SheetNames) {
  const brandId = BRAND_IDS[sheetName];
  if (!brandId) throw new Error('unknown brand ' + sheetName);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: null });
  const headerIdx = rows.findIndex((r) => r[0] === '메뉴');
  if (headerIdx < 0) throw new Error('header not found in ' + sheetName);
  const checkedMatch = String(rows.slice(0, headerIdx).map((r) => r[0]).join(' ')).match(/(\d{4})\.(\d{2})\.(\d{2})/);
  const checked = checkedMatch ? `${checkedMatch[1]}-${checkedMatch[2]}-${checkedMatch[3]}` : null;
  cafes.push({ brandId, brandName: sheetName, basisNote: rows.slice(0, headerIdx).map((r) => r[0]).filter(Boolean).slice(2).join(' ') || null });
  let rank = 0;
  for (const r of rows.slice(headerIdx + 1)) {
    const [name, caffeine, temp, size, amount, unit, , note, source] = r;
    if (!name) continue;
    rank += 1;
    const caffeineMg = num(caffeine);
    const amt = num(amount);
    let volumeMl = null, servingLabel = null;
    if (amt !== null && unit) {
      servingLabel = `${amt} ${unit}`;
      if (unit === 'mL') volumeMl = amt;
      else if (unit === 'oz') volumeMl = Math.round(amt * 29.5735);
    }
    const isRef = source === '참고 출처';
    drinks.push({
      id: `${brandId}-${String(rank).padStart(2, '0')}`,
      brandId,
      name: String(name).trim(),
      category: categorize(String(name)),
      temperature: TEMP[temp] ?? null,
      size: size ? String(size) : null,
      volumeMl,
      servingLabel,
      caffeineMg,
      sourceType: caffeineMg === null ? 'unverified' : isRef ? 'reference' : 'official',
      sourceName: isRef ? '공개 후기에 인용된 참고 수치' : `${sheetName} 공식 영양정보`,
      sourceUrl: null,
      sourceCheckedDate: checked,
      note: note ?? null,
      rank,
    });
  }
}

const header = `// 자동 생성 파일: scripts/import-xlsx.mjs 로 다시 만드세요. 직접 수정하지 마세요.
// 원본: data-source/cafe-menu-caffeine.xlsx
import type { Drink, Brand } from '../types';
`;
writeFileSync(OUT, header +
  `\nexport const BRANDS: Brand[] = ${JSON.stringify(cafes, null, 2)};\n` +
  `\nexport const DRINKS: Drink[] = ${JSON.stringify(drinks, null, 2)};\n`);
console.log(`brands=${cafes.length} drinks=${drinks.length} unverified=${drinks.filter(d => d.caffeineMg === null).length}`);
const byCat = {}; for (const d of drinks) (byCat[d.category] ??= []).push(d.name);
for (const [k, v] of Object.entries(byCat)) console.log(k, v.length, v.join(', '));
