import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('./prompt-library-engine-v2.5.2-enterprise.html','utf8');

function chk(name, cond){ console.log((cond?'PASS':'FAIL')+' '+name); return cond; }
let pass=true;

// Extract renderImageTab source
const m = html.match(/function renderImageTab\(\) \{([\s\S]*?)function wireVarControlsImage/);
if (!m) { console.error('renderImageTab not found'); process.exit(1); }
const src = m[1];

// Check sections in exact order
const order = [
  '1 \\u00b7 Prompt Title',
  'Customize Prompt',
  '2 \\u00b7 Before Image Prompt',
  '3 \\u00b7 Main Prompt',
  '4 \\u00b7 Negative Prompt',
  '5 \\u00b7 Buttons',
  '6 \\u00b7 Thumbnail Image Generator Prompt'
];

// Actually labels in secBlock use escaped unicode, but we check for strings "1 \\u00b7 Prompt Title" etc in source
pass = chk('SECTION 1 Prompt Title exists', src.includes('1 \\u00b7 Prompt Title') || src.includes('1 · Prompt Title')) && pass;
pass = chk('SECTION 2 Before Image Prompt exists', src.includes('2 \\u00b7 Before Image Prompt') || src.includes('2 · Before')) && pass;
pass = chk('SECTION 3 Main Prompt exists', src.includes('3 \\u00b7 Main Prompt') || src.includes('3 · Main')) && pass;
pass = chk('SECTION 4 Negative Prompt exists', src.includes('4 \\u00b7 Negative Prompt') || src.includes('4 · Negative')) && pass;
pass = chk('SECTION 5 Buttons exists', src.includes('5 \\u00b7 Buttons') || src.includes('5 · Buttons')) && pass;
pass = chk('SECTION 6 Thumbnail exists', src.includes('6 \\u00b7 Thumbnail') || src.includes('6 · Thumbnail')) && pass;

// Check order via indexOf
function idx(s){ return src.indexOf(s); }
const idx1 = src.indexOf('1 \\u00b7 Prompt Title') !== -1 ? src.indexOf('1 \\u00b7 Prompt Title') : src.indexOf('1 · Prompt Title');
const idxCustom = src.indexOf('Customize Prompt');
const idx2 = src.indexOf('2 \\u00b7 Before Image Prompt') !== -1 ? src.indexOf('2 \\u00b7 Before Image Prompt') : src.indexOf('2 · Before');
const idx3 = src.indexOf('3 \\u00b7 Main Prompt') !== -1 ? src.indexOf('3 \\u00b7 Main Prompt') : src.indexOf('3 · Main');
const idx4 = src.indexOf('4 \\u00b7 Negative Prompt') !== -1 ? src.indexOf('4 \\u00b7 Negative Prompt') : src.indexOf('4 · Negative');
const idx5 = src.indexOf('5 \\u00b7 Buttons') !== -1 ? src.indexOf('5 \\u00b7 Buttons') : src.indexOf('5 · Buttons');
const idx6 = src.indexOf('6 \\u00b7 Thumbnail') !== -1 ? src.indexOf('6 \\u00b7 Thumbnail') : src.indexOf('6 · Thumbnail');

pass = chk('Customize above Section 2', idxCustom < idx2 && idxCustom > idx1) && pass;
pass = chk('Order 1<2<3<4<5<6', idx1 < idx2 && idx2 < idx3 && idx3 < idx4 && idx4 < idx5 && idx5 < idx6) && pass;

// Buttons per section
pass = chk('Section 1 button Copy Prompt Title', src.includes('Copy Prompt Title')) && pass;
pass = chk('Section 2 buttons Copy Original Before Prompt', src.includes('Copy Original Before Prompt')) && pass;
pass = chk('Section 2 buttons Copy Customized Before Prompt', src.includes('Copy Customized Before Prompt')) && pass;
pass = chk('Section 2 buttons Copy Before Image Title', src.includes('Copy Before Image Title')) && pass;
pass = chk('Section 5 buttons Copy Original Prompt', src.includes('Copy Original Prompt')) && pass;
pass = chk('Section 5 buttons Copy Customized Prompt', src.includes('Copy Customized Prompt')) && pass;
pass = chk('Section 5 buttons Copy Prompt + Negative', src.includes('Copy Prompt + Negative')) && pass;
pass = chk('Section 5 buttons Copy After Image Title', src.includes('Copy After Image Title')) && pass;
pass = chk('Section 6 buttons Copy Thumbnail Prompt', src.includes('Copy Thumbnail Prompt')) && pass;
pass = chk('Section 6 buttons Copy Thumbnail Full Title', src.includes('Copy Thumbnail Full Title')) && pass;
pass = chk('Section 6 buttons Copy Thumbnail Short Title', src.includes('Copy Thumbnail Short Title')) && pass;

// Customize Prompt location
pass = chk('Customize panel id customize-image', src.includes('customize-image-')) && pass;
pass = chk('Customize uses varControlsInner with anchor image', src.includes("varControlsInner(p, 'image')")) && pass;
pass = chk('wireVarControlsImage exists', html.includes('function wireVarControlsImage')) && pass;

// Changing Customize updates Before, Main, Thumbnail - runtime only via setVar
pass = chk('setVar updates dirty library/image/publisher', html.includes('S.dirty = { library: true, image: true, publisher: true }')) && pass;

// Responsive rules: vertical workflow
pass = chk('vflow class used', src.includes('vflow')) && pass;
pass = chk('Never side-by-side cards - no grid3 in image tab', !src.includes('grid3')) && pass;
pass = chk('No horizontal overflow check - CSS overflow-x hidden', html.includes('overflow-x:hidden')) && pass;

// Check real library prompts #1, #25, #50 via PLX derive
const plxMatch = html.match(/var PLX = \(function \(\) \{[\s\S]*?\n  return \{[\s\S]*?\n  \};\n\}\)\(\);/);
let PLX = vm.runInNewContext(plxMatch[0] + '\nPLX');
const md = readFileSync('./Photo-Retouch-Prompts.md','utf8');
const parsed = PLX.parseMarkdown(md);
function getPrompt(num){
  return parsed.prompts.find(p=>String(p.num)===String(num));
}
[1,25,50].forEach(n=>{
  const p = getPrompt(n);
  pass = chk(`Prompt #${n} exists`, !!p) && pass;
  if (p){
    const d = PLX.derive(p, { mode:'customized', values:{ 'SUBJECT TYPE':'young woman', 'FACIAL AREA TO SCULPT':'cheekbones', 'LIGHTING FEEL':'beauty dish' }, preset:'premium_dark', suffix:'_cover.jpg' });
    pass = chk(`Prompt #${n} Before customized`, d.S3 && !d.S3.includes('[SUBJECT TYPE]')) && pass;
    pass = chk(`Prompt #${n} Main customized`, d.S6 && !d.S6.includes('[SUBJECT TYPE]')) && pass;
    pass = chk(`Prompt #${n} Thumbnail preset exists`, !!d.thumb) && pass;
  }
});

// Console Errors = 0
try {
  const { execSync } = await import('node:child_process');
  const fs = await import('node:fs');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  for (let i=0;i<scripts.length;i++){
    const tmp = `/tmp/check08_${i}.js`;
    fs.writeFileSync(tmp, scripts[i]);
    execSync(`node --check ${tmp}`, {stdio:'pipe'});
  }
  console.log('PASS Console Errors = 0 (node --check)');
} catch(e){
  console.log('FAIL Console Errors', e.message);
  pass=false;
}

console.log('\nOVERALL', pass?'PASS':'FAIL');
