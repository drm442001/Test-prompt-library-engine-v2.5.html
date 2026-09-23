import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const html = readFileSync('./prompt-library-engine-v2.5.3-production.html','utf8');
const m = html.match(/var TEMPLATE_TEXT = \[([\s\S]*?)\]\.join/);
if(!m){ console.log('FAIL no TEMPLATE_TEXT'); process.exit(1); }
const arrStr='['+m[1]+']';
const arr=eval(arrStr);
const tpl=arr.join('\n');
writeFileSync('/tmp/downloaded-template-v5.md', tpl);
console.log(`Template lines ${arr.length}, chars ${tpl.length}`);

function chk(name, cond, extra=''){
  console.log((cond?'PASS':'FAIL')+' '+name + (extra?' '+extra:''));
  return cond;
}
let all=true;

// MUST RESTORE sections
console.log('\n--- Old Sections Exist ---');
all = chk('Mission exists', /Mission:/i.test(tpl)) && all;
all = chk('Reference Links exists', /REFERENCE LINKS/i.test(tpl)) && all;
all = chk('Category Name block exists', /CATEGORY (NAME )?BLOCK/i.test(tpl)) && all;
all = chk('Batch Instructions exists', /BATCH INSTRUCTIONS/i.test(tpl)) && all;
all = chk('Rule 1 exists', /Rule 1:/i.test(tpl)) && all;
all = chk('Rule 2 exists', /Rule 2:/i.test(tpl)) && all;
all = chk('Rule 3 exists', /Rule 3:/i.test(tpl)) && all;
all = chk('Rule 4 exists', /Rule 4:/i.test(tpl)) && all;
all = chk('Rule 5 exists', /Rule 5:/i.test(tpl)) && all;
all = chk('Exact 13 Section template exists', /\*\*1 · POST TITLE\*\*/.test(tpl) && /\*\*13 · SEARCH DESCRIPTION\*\*/.test(tpl)) && all;
all = chk('Approved Labels list exists', /APPROVED LABELS/i.test(tpl)) && all;
all = chk('Checklist exists', /CHECKLIST/i.test(tpl)) && all;
all = chk('Final Delivery Instructions exists', /FINAL DELIVERY/i.test(tpl)) && all;

// ADD ONLY NEW RULES
console.log('\n--- New Rules Appended ---');
all = chk('Customize Prompt exists', /Customize Prompt/i.test(tpl)) && all;
all = chk('Step 4 variables exists', /Step 4 variables/i.test(tpl)) && all;
all = chk('[] placeholder rule exists', /\[\] placeholder/i.test(tpl)) && all;
all = chk('Custom Value rule exists', /Custom Value/i.test(tpl)) && all;
all = chk('AI Tool Naming ChatGPT Images', /ChatGPT Images/.test(tpl)) && all;
all = chk('AI Tool Naming Adobe Firefly', /Adobe Firefly/.test(tpl)) && all;
all = chk('AI Tool Naming Leonardo', /Leonardo/.test(tpl)) && all;
all = chk('AI Tool Naming Flux', /\bFlux\b/.test(tpl)) && all;
all = chk('AI Tool Naming Midjourney', /Midjourney/.test(tpl)) && all;
all = chk('AI Tool Naming Stable Diffusion', /Stable Diffusion/.test(tpl)) && all;
all = chk('AI Compatibility Rule accurate', /Accurate.*compatibility/i.test(tpl) || /AI Compatibility Rule/i.test(tpl)) && all;
all = chk('Search Description Rule 120-150', /Search Description Rule.*120.*150/i.test(tpl) || (/120-150/.test(tpl) && /Search Description/.test(tpl))) && all;
all = chk('Reduce unnecessary 2026 exists', /Reduce unnecessary 2026/i.test(tpl) || /avoid unnecessary 2026/i.test(tpl)) && all;
all = chk('Resolution Rule highest practical resolution supported by selected AI tool', /highest practical resolution supported by selected AI tool/i.test(tpl)) && all;

// No old content removed
console.log('\n--- No Old Content Removed ---');
const oldMust = [
  'Mission:',
  'CATEGORY SELECTOR',
  'REFERENCE LINKS',
  'APPROVED LABELS',
  'Rule 1:',
  'Rule 10:',
  'Rule 15:',
  'Rule 20:',
  'CHECKLIST',
  'TEMPLATE INSTRUCTIONS',
  'FINAL DELIVERY',
  'HELP TEXT',
  '**1 · POST TITLE**',
  '**6 · PROMPT**',
  '**13 · SEARCH DESCRIPTION**'
];
oldMust.forEach(s=>{
  all = chk(`Old content preserved: ${s}`, tpl.includes(s)) && all;
});

// Verify template parses as v5?
console.log('\n--- Template Structure ---');
all = chk('Template version v5.0', /v5\.0/.test(tpl)) && all;
all = chk('13 sections in Prompt #1', (tpl.match(/\*\*\d+ ·/g)||[]).length >= 13) && all;

// Console errors
console.log('\n--- Console Errors ---');
try{
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  for(let i=0;i<scripts.length;i++){
    const tmp=`/tmp/check_tpl_${i}.js`;
    writeFileSync(tmp, scripts[i]);
    execSync(`node --check ${tmp}`, {stdio:'pipe'});
  }
  all = chk('Console Errors = 0', true) && all;
}catch(e){
  all = chk('Console Errors = 0', false, e.message) && all;
}

console.log(`\nOVERALL: ${all?'PASS':'FAIL'}`);
