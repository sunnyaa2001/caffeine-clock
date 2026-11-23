// 입장코드 발급: node scripts/make-codes.mjs 30  → supabase/codes.sql, supabase/codes.csv
// 헷갈리는 글자(0/O, 1/I/L)는 뺐다.
import { randomInt } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const n = Number(process.argv[2] ?? 30);
const ABC = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const codes = new Set();
while (codes.size < n) codes.add('CC-' + Array.from({ length: 4 }, () => ABC[randomInt(ABC.length)]).join(''));
const list = [...codes];
writeFileSync(new URL('../supabase/codes.sql', import.meta.url),
  'insert into public.participants (code, label) values\n' +
  list.map((c, i) => `  ('${c}', 'P${String(i + 1).padStart(2, '0')}')`).join(',\n') + '\non conflict do nothing;\n');
writeFileSync(new URL('../supabase/codes.csv', import.meta.url), 'label,code\n' + list.map((c, i) => `P${String(i + 1).padStart(2, '0')},${c}`).join('\n') + '\n');
console.log(list.join(' '));
