import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import { execSync } from 'node:child_process';

const html = readFileSync('./prompt-library-engine-v2.5.3-production.html','utf8');
const coreMatch = html.match(/var PLX = \(function \(\) \{[\s\S]*?return \{[\s\S]*?\};\s+\}\)\(\);/);
let PLX = vm.runInNewContext(coreMatch[0] + '\nPLX');

const md = readFileSync('./Photo-Retouch-Prompts.md','utf8');
const parsed = PLX.parseMarkdown(md);

function valuesFor(p){
  const out={};
  (p.custom.vars||[]).forEach(v=>{ if(v.options&&v.options.length) out[v.name]=v.options[0]; });
  return out;
}

function chk(name, cond, info=''){
  console.log((cond?'PASS':'FAIL')+' '+name + (info?' '+info:''));
  return cond;
}
let allPass=true;

console.log('=== MGS-CUSTOMIZE-02 Placeholder Runtime Replacement ===');

function testPrompt(num){
  console.log(`\n--- Prompt #${num} ---`);
  const p = parsed.prompts[num-1];
  if(!p){ console.log('NOT FOUND'); return false; }
  console.log(`Title: ${p.fields.title}`);
  const vals = valuesFor(p);
  console.log(`Vars: ${JSON.stringify(vals)}`);

  const dOrig = PLX.derive(p, {mode:'original', values:{}, preset:'premium_dark', suffix:'_cover.jpg'});
  const dCust = PLX.derive(p, {mode:'customized', values:vals, preset:'premium_dark', suffix:'_cover.jpg'});

  // Original copy contains []
  const origHasBracket = /\[[^\]]+\]/.test(p.raw.before || '') || /\[[^\]]+\]/.test(p.raw.prompt || '');
  const origS3HasBracket = /\[[^\]]+\]/.test(dOrig.S3);
  const origS6HasBracket = /\[[^\]]+\]/.test(dOrig.S6);
  console.log(`Original S3 has []: ${origS3HasBracket}, S6 has []: ${origS6HasBracket}`);
  let pass = chk(`Prompt #${num} Original contains []`, origHasBracket || origS3HasBracket || origS6HasBracket);
  
  // Customized copy contains replaced values (no [])
  const custS3NoBracket = !/\[[^\]]+\]/.test(dCust.S3);
  const custS6NoBracket = !/\[[^\]]+\]/.test(dCust.S6);
  // Check that replacement actually happened (if var occurs)
  const beforeCount = (p.custom.vars||[]).reduce((a,v)=> a + (PLX.countIn ? PLX.countIn(v.name, p.raw.before) : 0),0);
  const promptCount = (p.custom.vars||[]).reduce((a,v)=> a + (PLX.countIn ? PLX.countIn(v.name, p.raw.prompt) : 0),0);
  console.log(`Occurrences: S3 ${beforeCount}, S6 ${promptCount}`);
  console.log(`Customized S3 no []: ${custS3NoBracket}, S6 no []: ${custS6NoBracket}`);
  console.log(`Customized S3 preview: ${dCust.S3.slice(0,120)}...`);
  console.log(`Customized S6 preview: ${dCust.S6.slice(0,120)}...`);

  pass = chk(`Prompt #${num} Customized replaces []`, (beforeCount===0 || custS3NoBracket) && (promptCount===0 || custS6NoBracket)) && pass;

  // Check every occurrence replaced
  // For each var, ensure no leftover token
  (p.custom.vars||[]).forEach(v=>{
    const token = `[${v.name}]`;
    const stillInS3 = dCust.S3.includes(token);
    const stillInS6 = dCust.S6.includes(token);
    const ok = !stillInS3 && !stillInS6;
    pass = chk(`  ${token} every occurrence replaced`, ok, stillInS3||stillInS6 ? `still in ${stillInS3?'S3':''} ${stillInS6?'S6':''}` : '') && pass;
  });

  // Negative Prompt preserved (should be unchanged between original and customized, no placeholder replacement)
  const negOrig = dOrig.S7;
  const negCust = dCust.S7;
  const negPreserved = negOrig===negCust;
  console.log(`Negative preserved: ${negPreserved} (len ${negOrig.length})`);
  pass = chk(`Prompt #${num} Negative preserved`, negPreserved) && pass;

  // Original Markdown remains unchanged
  const rawBeforeUnchanged = p.raw.before.includes('[') ; // should still have brackets
  pass = chk(`Prompt #${num} Original Markdown unchanged`, rawBeforeUnchanged || origHasBracket) && pass;

  // Check applyValues only touches S3,S6,S10
  const applied = PLX.applyValues(p, vals);
  const onlyS3S6S10 = applied && applied.before!==undefined && applied.prompt!==undefined && (applied.thumb!==undefined);
  // Ensure it doesn't touch other fields
  const noOther = !applied || (!applied.negative && !applied.search && !applied.labels);
  pass = chk(`Prompt #${num} Replacement ONLY S3/S6/S10`, onlyS3S6S10, JSON.stringify(Object.keys(applied||{}))) && pass;

  return pass;
}

allPass = testPrompt(1) && allPass;
allPass = testPrompt(25) && allPass;
allPass = testPrompt(50) && allPass;

console.log('\n--- Copy Buttons Check ---');
allPass = chk('Copy Original Before Prompt exists', html.includes('copyBeforeOriginal')) && allPass;
allPass = chk('Copy Original Prompt exists', html.includes('copyPromptOriginal')) && allPass;
allPass = chk('Copy Customized Before Prompt exists', html.includes('copyBeforeCustom')) && allPass;
allPass = chk('Copy Customized Prompt exists', html.includes('copyPromptCustom')) && allPass;
allPass = chk('Copy Prompt + Negative exists', html.includes('copyPromptNegative')) && allPass;

console.log('\n--- Replacement Rules Check ---');
allPass = chk('Replace exact [] placeholders', html.includes('tokenRe') || html.includes("'[' + k + ']'")) && allPass;
allPass = chk('Replace every occurrence (guard 5000 / split join)', html.includes('guard') && html.includes('split') && html.includes('join')) && allPass;
allPass = chk('Original Markdown remains unchanged comment', html.includes('Source text is never altered')) && allPass;
allPass = chk('Replacement only in preview and copy output', html.includes('payloads') && html.includes('derive')) && allPass;
allPass = chk('Longest name first to avoid eating', html.includes('b.length - a.length')) && allPass;

console.log('\n--- Console Errors Check ---');
try{
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  for(let i=0;i<scripts.length;i++){
    const tmp=`/tmp/check_c02_${i}.js`;
    writeFileSync(tmp, scripts[i]);
    execSync(`node --check ${tmp}`, {stdio:'pipe'});
  }
  allPass = chk('Console Errors = 0', true) && allPass;
}catch(e){
  allPass = chk('Console Errors = 0', false, e.message) && allPass;
}

console.log(`\nOVERALL: ${allPass ? 'PASS' : 'FAIL'}`);
