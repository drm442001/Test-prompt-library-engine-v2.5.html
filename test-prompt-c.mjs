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

// Test live replace S3, S6, S10
const vals = {
  'SUBJECT TYPE': 'young woman',
  'FACIAL AREA TO SCULPT': 'cheekbones',
  'LIGHTING FEEL': 'beauty dish'
};

const applied = PLX.applyValues(p, vals);
console.log('\nApplied S3 contains young woman?', applied.before.includes('young woman'), 'still has [SUBJECT TYPE]?', applied.before.includes('[SUBJECT TYPE]'));
console.log('Applied S6 contains cheekbones?', applied.prompt.includes('cheekbones'), 'beauty dish?', applied.prompt.includes('beauty dish'));
console.log('Applied S10 (if any var) length', applied.thumb?.length || 0);

// Test derive original vs customized
const orig = PLX.derive(p, {mode:'original', values:{}, preset:'studio'});
const cust = PLX.derive(p, {mode:'customized', values:vals, preset:'studio'});

console.log('\nOriginal S3 has [SUBJECT TYPE]?', orig.S3.includes('[SUBJECT TYPE]'));
console.log('Customized S3 has young woman?', cust.S3.includes('young woman'), 'has [SUBJECT TYPE]?', cust.S3.includes('[SUBJECT TYPE]'));

console.log('\nOriginal S6 has [FACIAL AREA TO SCULPT]?', orig.S6.includes('[FACIAL AREA TO SCULPT]'));
console.log('Customized S6 has cheekbones?', cust.S6.includes('cheekbones'), 'has [FACIAL AREA TO SCULPT]?', cust.S6.includes('[FACIAL AREA TO SCULPT]'));

console.log('\nOriginal S10 preserved?', orig.thumb.length>0);
console.log('Custom S10 preserved?', cust.thumb.length>0);

// Test every occurrence replaced
const testText = "Hello [SUBJECT TYPE] and [SUBJECT TYPE] again";
const applied2 = PLX.applyValues({raw:{before:testText, prompt:testText, thumb:''}}, {'SUBJECT TYPE':'young woman'});
console.log('\nEvery occurrence replaced? ', applied2.before === "Hello young woman and young woman again" ? 'PASS' : 'FAIL', applied2.before);

// Test original preserved
console.log('\nOriginal preserved check: orig.S3 still has [SUBJECT TYPE]?', orig.S3.includes('[SUBJECT TYPE]') ? 'PASS original contains [VAR]' : 'FAIL');
console.log('Custom contains replaced and no [VAR]?', cust.S3.includes('young woman') && !cust.S3.includes('[SUBJECT TYPE]') ? 'PASS custom replaced' : 'FAIL');

// Test copy buttons existence in code
const htmlContent = fs.readFileSync('prompt-library-engine-v2.5.2-enterprise.html','utf8');
const buttons = ['copyBeforeOriginal','copyBeforeCustom','copyPromptOriginal','copyPromptCustom','copyPromptNegative'];
buttons.forEach(b=>{
  console.log(`Button ${b} exists?`, htmlContent.includes(b) ? 'YES' : 'NO');
});

console.log('\nOverall PASS if customized has replaced values and original still has [VAR] and every occurrence replaced');
const pass = cust.S3.includes('young woman') && orig.S3.includes('[SUBJECT TYPE]') && cust.S6.includes('cheekbones') && orig.S6.includes('[FACIAL AREA TO SCULPT]') && applied2.before === "Hello young woman and young woman again";
console.log(pass ? 'PROMPT C PASS' : 'PROMPT C FAIL');
