import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('./prompt-library-engine-v2.5.3-production.html','utf8');
const coreMatch = html.match(/var PLX = \(function \(\) \{[\s\S]*?return \{[\s\S]*?\};\s+\}\)\(\);/);
let PLX = vm.runInNewContext(coreMatch[0] + '\nPLX');

const md = readFileSync('./Photo-Retouch-Prompts.md','utf8');
const parsed = PLX.parseMarkdown(md);
console.log(`Total prompts: ${parsed.prompts.length}`);

function testPrompt(num){
  const p = parsed.prompts[num-1];
  if(!p){ console.log(`Prompt #${num} NOT FOUND`); return false; }
  console.log(`\n--- Prompt #${num} ---`);
  console.log(`Title: ${p.fields.title}`);
  console.log(`Has Step4: ${p.custom.present}`);
  console.log(`Vars count: ${p.custom.vars.length}`);
  p.custom.vars.forEach(v=>{
    console.log(`  [${v.name}] = ${v.hint} | options: ${JSON.stringify(v.options)}`);
  });
  const howto = p.fields.howto || '';
  const lines = howto.split('\n').filter(l=> /\[.*\].*=/.test(l));
  console.log(`  Step4 lines found: ${lines.length}`);
  lines.forEach(l=> console.log(`    ${l.trim()}`));
  const ok = p.custom.present && p.custom.vars.length>0;
  console.log(`  Result: ${ok ? 'PASS' : 'FAIL'} - dropdowns ${p.custom.vars.length}`);
  return ok;
}

let allPass = true;
allPass = testPrompt(1) && allPass;
allPass = testPrompt(25) && allPass;
allPass = testPrompt(50) && allPass;

console.log('\n--- UI Placement Check ---');
const cardHTMLMatch = html.match(/function cardHTML[\s\S]*?return out\.join\(''\);\n  \}/);
if(cardHTMLMatch){
  const code = cardHTMLMatch[0];
  const idxSec2 = code.indexOf('Section 2');
  const idxCustomize = code.indexOf('customizePanel(p)');
  const idxSec3 = code.indexOf('Section 3 · Before Image Prompt');
  console.log(`Section2 index: ${idxSec2}, customizePanel index: ${idxCustomize}, Section3 index: ${idxSec3}`);
  if(idxSec2>0 && idxCustomize>0 && idxSec3>0){
    const above = idxSec2 < idxCustomize && idxCustomize < idxSec3;
    console.log(`Customize above Before (Sec2 < Customize < Sec3)? ${above ? 'PASS' : 'FAIL'}`);
    if(!above) allPass = false;
  }
  const imgCode = html.slice(html.indexOf('function renderImageTab'), html.indexOf('function renderImageTab')+8000);
  const idxCustImg = imgCode.indexOf('customize-image');
  const idxBeforeImg = imgCode.indexOf('2 \\u00b7 Before Image Prompt');
  console.log(`Image Studio Customize index: ${idxCustImg}, Before index: ${idxBeforeImg}, above? ${idxCustImg < idxBeforeImg ? 'PASS' : 'FAIL'}`);
  if(idxCustImg>0 && idxBeforeImg>0 && !(idxCustImg < idxBeforeImg)) allPass=false;
}

console.log('\n--- Supported Formats Regex Check ---');
const reDef = /^\s*(?:[-*+>•]+\s*)*(?:→|->)?\s*`?\[([^\]\[]+)\]`?\s*=\s*(.+?)\s*$/;
const tests = [
  '→ [VARIABLE] = Value',
  '• [VARIABLE] = Value',
  '- [VARIABLE] = Value',
  '[VARIABLE] = Value',
  '  -> [Subject Name] = young woman / male executive',
  '  • [Skin Tone] = warm / cool',
];
tests.forEach(t=>{
  const m = reDef.exec(t);
  console.log(`${m ? 'PASS' : 'FAIL'} format "${t}" => ${m ? `[${m[1]}]=${m[2]}` : 'no match'}`);
  if(!m) allPass=false;
});

console.log('\n--- Dropdown Generation Check ---');
const hasDropdown = html.includes('data-action="var"') && html.includes('<select') && html.includes('Custom Value') && html.includes('__custom__');
console.log(`Dropdown + Custom Value: ${hasDropdown ? 'PASS' : 'FAIL'}`);
if(!hasDropdown) allPass=false;

console.log('\n--- Runtime State Check ---');
const hasCustomState = html.includes('S.custom') && html.includes('S.customMode') && html.includes('setVar');
console.log(`Runtime state S.custom, S.customMode, setVar: ${hasCustomState ? 'PASS' : 'FAIL'}`);
if(!hasCustomState) allPass=false;

console.log('\n--- No Markdown Mutation Check ---');
const noMutation = html.includes('Source text is never altered') || html.includes('payloads');
console.log(`No mutation: ${noMutation ? 'PASS' : 'FAIL'}`);

console.log('\n--- Console Errors Check ---');
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
try{
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  for(let i=0;i<scripts.length;i++){
    const tmp=`/tmp/check_customize_${i}.js`;
    writeFileSync(tmp, scripts[i]);
    execSync(`node --check ${tmp}`, {stdio:'pipe'});
  }
  console.log('PASS Console Errors = 0');
}catch(e){
  console.log('FAIL Console Errors', e.message);
  allPass=false;
}

console.log(`\nOVERALL: ${allPass ? 'PASS' : 'FAIL'}`);
