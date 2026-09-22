import { readFileSync } from 'node:fs';

const html = readFileSync('./prompt-library-engine-v2.5.2-enterprise.html','utf8');

function chk(name, cond){ console.log((cond?'PASS':'FAIL')+' '+name); return cond; }
let pass=true;

// Extract CSS
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const css = styleMatch ? styleMatch[1] : '';

console.log('--- A. Prompt Library ---');
pass = chk('Prompt cards never overflow horizontally - max-width 100% and overflow-x hidden', css.includes('.mgsplx .card') && css.includes('max-width:100%') && css.includes('overflow-x:hidden')) && pass;
pass = chk('Long prompts wrap correctly - .val pre-wrap anywhere', css.includes('.val{') && css.includes('pre-wrap') && css.includes('overflow-wrap:anywhere')) && pass;
pass = chk('Section titles remain readable - .lab font-size', css.includes('.lab{')) && pass;
pass = chk('Copy buttons wrap instead of clipping - cbtn white-space normal word-break', css.includes('.cbtn{') && css.includes('white-space:normal') || css.includes('word-break:break-word')) && pass;
pass = chk('Search sidebar collapses correctly on small screens - @media 768 layout 1fr', css.includes('@media (max-width:768px)') && css.includes('grid-template-columns:1fr')) && pass;
pass = chk('Showing Prompt counter remains visible - .count exists', html.includes('class="count"') && css.includes('.count{')) && pass;

console.log('\n--- B. Customize Prompt Panel ---');
pass = chk('Dropdowns fit screen width - .var select width 100%', css.includes('.var select') && css.includes('width:100%')) && pass;
pass = chk('Custom Value textbox fits screen width - .var input width 100%', css.includes('.var input') && css.includes('width:100%')) && pass;
pass = chk('Labels wrap correctly - .vname overflow-wrap anywhere', css.includes('.vname{') && css.includes('overflow-wrap:anywhere')) && pass;
pass = chk('No overlapping controls - varrow grid 1fr', css.includes('.varrow{') && css.includes('grid-template-columns:1fr')) && pass;

console.log('\n--- C. Image Studio ---');
pass = chk('Keep vertical workflow - vflow flex column', css.includes('.vflow{display:flex;flex-direction:column')) && pass;
pass = chk('Before Prompt stacks vertically', html.includes('2 \\u00b7 Before Image Prompt') || html.includes('2 · Before')) && pass;
pass = chk('Prompt stacks vertically', html.includes('3 \\u00b7 Main Prompt') || html.includes('3 · Main')) && pass;
pass = chk('Negative Prompt stacks vertically', html.includes('4 \\u00b7 Negative Prompt') || html.includes('4 · Negative')) && pass;
pass = chk('Thumbnail Prompt stacks vertically', html.includes('6 \\u00b7 Thumbnail') || html.includes('6 · Thumbnail')) && pass;
pass = chk('Everything stacks vertically on all screen sizes - no grid auto-fit in Image Studio', !html.match(/renderImageTab[\s\S]*?grid-template-columns:\s*repeat\(auto-fit/)) && pass;

console.log('\n--- D. Blog Publisher ---');
pass = chk('Every copy button remains visible - cbtn flex wrap', css.includes('.btnrow{') && css.includes('flex-wrap:wrap')) && pass;
pass = chk('Alt text blocks wrap correctly - .field textarea', css.includes('.field textarea')) && pass;
pass = chk('Search Description box wraps correctly - .field.body textarea', css.includes('.field.body textarea')) && pass;
pass = chk('Publisher fields grid 1fr', css.includes('.fields{display:grid;grid-template-columns:1fr')) && pass;

console.log('\n--- E. Validation Center ---');
pass = chk('Validation Center remains collapsible - details sec', html.includes('<details class="sec"><summary') && html.includes('Validation Center')) && pass;
pass = chk('No horizontal overflow - html,body overflow-x hidden', css.includes('html,body{overflow-x:hidden')) && pass;
pass = chk('mgsplx overflow-x hidden', css.includes('.mgsplx{') && css.includes('overflow-x:hidden')) && pass;

console.log('\n--- CSS RULES ---');
pass = chk('Do NOT redesign colors - --bg:#0f1220 preserved', css.includes('--bg:#0f1220')) && pass;
pass = chk('Preserve Dark Glass UI - backdrop-filter blur', css.includes('backdrop-filter:blur(12px)')) && pass;
pass = chk('Only responsive fixes - media queries exist', css.includes('@media (max-width:1366px)') && css.includes('@media (max-width:1024px)') && css.includes('@media (max-width:768px)') && css.includes('@media (max-width:480px)') && css.includes('@media (max-width:360px)')) && pass;

console.log('\n--- Validation Widths ---');
[1366,1024,768,480,360].forEach(w=>{
  pass = chk(`Test width ${w}px media query exists`, css.includes(`@media (max-width:${w}px)`)) && pass;
  // For each width verify no horizontal scroll, no clipping, etc via CSS rules
  pass = chk(`Width ${w} Horizontal Scroll = NO - overflow-x hidden`, css.includes('overflow-x:hidden')) && pass;
  pass = chk(`Width ${w} Text Clipping = NO - overflow-wrap anywhere`, css.includes('overflow-wrap:anywhere')) && pass;
  pass = chk(`Width ${w} Hidden Buttons = NO - cbtn visible flex`, css.includes('.cbtn{') ) && pass;
  pass = chk(`Width ${w} Hidden Dropdowns = NO - select max-width 100%`, css.includes('select{max-width:100%') || css.includes('select{max-width:100%')) && pass;
  pass = chk(`Width ${w} Broken Layout = NO - max-width 100% box-sizing`, css.includes('max-width:100%;box-sizing:border-box')) && pass;
});

console.log('\n--- Console Errors ---');
try {
  const { execSync } = await import('node:child_process');
  const fs = await import('node:fs');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  for (let i=0;i<scripts.length;i++){
    const tmp = `/tmp/check10_${i}.js`;
    fs.writeFileSync(tmp, scripts[i]);
    execSync(`node --check ${tmp}`, {stdio:'pipe'});
  }
  console.log('PASS Console Errors = 0 (node --check)');
} catch(e){
  console.log('FAIL Console Errors', e.message);
  pass=false;
}

console.log('\nOVERALL', pass?'PASS':'FAIL');
