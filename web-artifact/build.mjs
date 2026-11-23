// Claude 아티팩트(단일 HTML 페이지)용 빌드. Next.js 앱과 같은 화면 코드를 그대로 쓴다.
import { build } from 'esbuild';
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const out = root + 'web-artifact/dist/';
mkdirSync(out, { recursive: true });

await build({
  entryPoints: [root + 'web-artifact/main.tsx'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  jsx: 'automatic',
  outfile: out + 'app.js',
  define: { 'process.env.NODE_ENV': '"production"' },
  alias: {
    '@': root + 'src',
    'next/link': root + 'web-artifact/next-link.tsx',
    'next/navigation': root + 'web-artifact/next-navigation.ts',
  },
  logLevel: 'warning',
});

execSync(`npx @tailwindcss/cli -i web-artifact/app.css -o web-artifact/dist/app.css --minify`, { cwd: root, stdio: 'inherit' });
const css = readFileSync(out + 'app.css', 'utf8');
const font = readFileSync(root + 'node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2').toString('base64');
const fontFace = `@font-face{font-family:"Pretendard Variable";font-weight:45 920;font-style:normal;font-display:swap;src:url(data:font/woff2;base64,${font}) format("woff2")}`;

const html = `<title>Caffeine Clock</title>
<meta name="description" content="마신 음료와 시각, 취침 예정시간으로 잠들 때 남아 있을 카페인을 추정하는 교육·연구용 도구">
<style>${fontFace}
:root{color-scheme:light}
html,body{background:#f5f4f0;color:#17171c;font-size:16px}
${css}</style>
<div id="root"></div>
<script src="app.js"></script>
`;
writeFileSync(out + 'index.html', html);
console.log('html', (html.length / 1024).toFixed(0) + 'KB', 'js', (readFileSync(out + 'app.js').length / 1024).toFixed(0) + 'KB');
