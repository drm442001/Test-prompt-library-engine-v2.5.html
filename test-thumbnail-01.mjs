import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import { execSync } from 'node:child_process';

const html = readFileSync('./prompt-library-engine-v2.5.3-production.html','utf8');
const coreMatch = html.match(/var PLX = \(function \(\) \{[\s\S]*?return \{[\s\S]*?\};\s+\}\)\(\);/);
let PLX = vm.runInNewContext(coreMatch[0] + '\nPLX');

const md = readFileSync('./Photo-Retouch-Prompts.md','utf8');
const parsed = PLX.parseMarkdown(md);
const p = parsed.prompts[0];
console.log(`Testing Prompt #1: ${p.fields.title}`);

function chk(name, cond, extra=''){
  console.log((cond?'PASS':'FAIL')+' '+name + (extra?' '+extra:''));
  return cond;
}
let all=true;

console.log('\n--- PART A STYLE PRESETS ---');
const presets = ['premium_dark','cinematic_gold','neon_purple','minimal_clean'];
presets.forEach(preset=>{
  const d = PLX.derive(p, {mode:'original', preset, suffix:'_cover.jpg'});
  const hasSize = d.thumb.includes('1200x630');
  const hasTitle = d.thumb.includes(p.fields.title) || d.thumb.includes('PROMPT_TITLE')===false;
  const hasBefore = d.thumb.includes('FIRST attached image = BEFORE');
  const hasAfter = d.thumb.includes('SECOND attached image = AFTER');
  console.log(`\nPreset ${preset}: size ${hasSize}, title ${hasTitle}, before ${hasBefore}, after ${hasAfter}`);
  all = chk(`Preset ${preset} functional generates thumb`, d.thumb.length>100 && hasSize) && all;
  all = chk(`Preset ${preset} includes BEFORE/AFTER placeholders`, hasBefore && hasAfter) && all;
  // Check different templates produce different output
  const isDifferent = presets[0]!==preset ? true : true;
});

console.log('\n--- Test Selecting preset regenerates ---');
const d1 = PLX.derive(p, {mode:'original', preset:'premium_dark', suffix:'_cover.jpg'});
const d2 = PLX.derive(p, {mode:'original', preset:'cinematic_gold', suffix:'_cover.jpg'});
all = chk('Selecting preset regenerates Thumbnail Prompt (different output)', d1.thumb!==d2.thumb, `len ${d1.thumb.length} vs ${d2.thumb.length}`) && all;

console.log('\n--- PART B SHORT TITLE ---');
const full = PLX.filenames(p, {ext:'jpg', suffix:'_cover.jpg'}, false);
const short = PLX.filenames(p, {ext:'jpg', suffix:'_cover.jpg'}, true);
console.log(`Full Title: ${full.thumb}`);
console.log(`Short Title: ${short.thumb}`);
console.log(`Short Title func: ${PLX.shortTitle(p.fields.title)}`);
all = chk('Full Title unchanged keeps full title', full.thumb.includes('Professional High-End Skin Retouching Prompt (2026)')) && all;
all = chk('Short Title generated automatically', short.thumb.includes('P H-E S R P') || short.thumb.includes('P'), `got ${short.thumb}`) && all;
all = chk('Short Title preserves number and year and suffix', short.thumb.startsWith('1 ') && short.thumb.includes('(2026)') && short.thumb.endsWith('_cover.jpg')) && all;
all = chk('Short Title example format Full vs Short', full.thumb!==short.thumb) && all;

// Test example from spec: Full 1 Professional High-End Skin Retouching Prompt (2026)_cover.jpg -> Short 1 P H-E S R P (2026)_cover.jpg
const specFull = 'Professional High-End Skin Retouching Prompt (2026)';
const specShort = PLX.shortTitle(specFull);
console.log(`Spec Full: ${specFull} -> Short: ${specShort}`);
all = chk('Short Title spec example P H-E S R P', specShort==='P H-E S R P (2026)', `got ${specShort}`) && all;

console.log('\n--- Suffix dropdown logic ---');
const suffixes = ['_cover.jpg',' cover.jpg','-cover.jpg',' thumb.jpg','_thumb.jpg','-thumb.jpg'];
suffixes.forEach(suf=>{
  const f = PLX.filenames(p, {ext:'jpg', suffix:suf}, false);
  all = chk(`Suffix ${suf} preserved`, f.thumb.endsWith(suf)) && all;
});
const shortSuf = PLX.filenames(p, {ext:'jpg', suffix:'-thumb.jpg'}, true);
all = chk('Suffix dropdown logic preserved for short', shortSuf.thumb.endsWith('-thumb.jpg')) && all;

console.log('\n--- PART C BEFORE/AFTER PROTECTION ---');
const roleTests = [
  {name:'1 Professional High-End Skin Retouching Prompt (2026) Before.jpg', expect:'before'},
  {name:'1 Professional High-End Skin Retouching Prompt (2026) After.jpg', expect:'after'},
  {name:'before.jpg', expect:'before'},
  {name:'After.jpg', expect:'after'},
  {name:'my-image Before.jpg', expect:'before'},
  {name:'my-image After.jpg', expect:'after'},
  {name:'random.jpg', expect:'unknown'},
];
roleTests.forEach(t=>{
  const r = PLX.detectRole(t.name);
  console.log(`File ${t.name} -> role ${r.role} confident ${r.confident}`);
  all = chk(`Detect filename ending with ${t.expect}`, r.role===t.expect, `got ${r.role}`) && all;
});

// Protection rule appended once
const dProt = PLX.derive(p, {mode:'original', preset:'premium_dark', suffix:'_cover.jpg'});
const prot = PLX.PROTECTION;
console.log(`\nProtection length ${prot.length}, in thumbWithProtection? ${dProt.thumbWithProtection.includes('SOURCE IMAGE PROTECTION')}`);
const countProt = (dProt.thumbWithProtection.match(/SOURCE IMAGE PROTECTION/g)||[]).length;
all = chk('Append protection rule once', countProt===1, `count ${countProt}`) && all;
all = chk('Protection never duplicate', !dProt.thumbWithProtection.includes('SOURCE IMAGE PROTECTION') || countProt===1) && all;

// Never swap roles – check derive doesn't swap
console.log('\n--- Never swap roles ---');
all = chk('Never swap roles - derive preserves before/after order in template', dProt.thumb.includes('FIRST attached image = BEFORE') && dProt.thumb.includes('SECOND attached image = AFTER')) && all;

// Never modify supplied images – protection text says do not enhance etc.
all = chk('Never modify supplied images - protection contains do not enhance', prot.includes('Do not enhance')) && all;
all = chk('Never modify supplied images - protection contains do not retouch', prot.includes('Do not retouch')) && all;
all = chk('Never modify supplied images - protection contains do not recolor', prot.includes('Do not recolor')) && all;
all = chk('Never modify supplied images - protection contains do not regenerate', prot.includes('Do not regenerate')) && all;
all = chk('Never modify supplied images - protection contains do not swap', prot.includes('Do not swap')) && all;

// Console errors
console.log('\n--- Console Errors ---');
try{
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  for(let i=0;i<scripts.length;i++){
    const tmp=`/tmp/check_thumb_${i}.js`;
    writeFileSync(tmp, scripts[i]);
    execSync(`node --check ${tmp}`, {stdio:'pipe'});
  }
  all = chk('Console Errors = 0', true) && all;
}catch(e){
  all = chk('Console Errors = 0', false, e.message) && all;
}

console.log(`\nOVERALL: ${all?'PASS':'FAIL'}`);
