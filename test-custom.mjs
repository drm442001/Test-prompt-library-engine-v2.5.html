import fs from 'fs';
import vm from 'vm';
const html = fs.readFileSync('prompt-library-engine-v2.5.2-enterprise.html','utf8');
const m = html.match(/<script>\s*\/\* ===== core ===== \*\/([\s\S]*?)<\/script>/);
let script = m[1];
const coreCode = script.split('/* ===== app ===== */')[0];
const sandbox={console, window:{}, document:{}};
vm.createContext(sandbox);
vm.runInContext(coreCode, sandbox, {timeout:5000});
const PLX = sandbox.PLX;

const md = fs.readFileSync('Photo-Retouch-Prompts.md','utf8');
const lib = PLX.parseMarkdown(md);
const p = lib.prompts[0];
p.custom.analysis = PLX.analyzeCustomization(p);
console.log('Prompt #1 vars', p.custom.vars.map(v=>v.name));
console.log('occ', p.custom.analysis.vars.map(v=>v.occ));
console.log('malformed', p.custom.malformed);
console.log('orphan', p.custom.analysis.orphan);

// Test applyValues
const vals = { 'SUBJECT TYPE': 'young woman', 'FACIAL AREA TO SCULPT': 'cheekbones', 'LIGHTING FEEL': 'beauty dish' };
const applied = PLX.applyValues(p, vals);
console.log('\nApplied before contains young woman?', applied.before.includes('young woman'));
console.log('Applied prompt contains cheekbones?', applied.prompt.includes('cheekbones'));
console.log('Applied prompt contains beauty dish?', applied.prompt.includes('beauty dish'));

// Test derive
const dOrig = PLX.derive(p, {mode:'original', preset:'studio'});
const dCust = PLX.derive(p, {mode:'customized', values:vals, preset:'studio'});
console.log('\nOriginal S3', dOrig.S3.slice(0,100));
console.log('Custom S3', dCust.S3.slice(0,100));
console.log('Original S6', dOrig.S6.slice(0,200));
console.log('Custom S6', dCust.S6.slice(0,200));

console.log('\nValidation issues', PLX.validate(p, {}).map(i=>i.code));
