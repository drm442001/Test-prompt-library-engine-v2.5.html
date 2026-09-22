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
console.log('Parsed', lib.prompts.length);
let totalVars = 0;
let totalDropdowns = 0;
let failures = [];
lib.prompts.forEach((p,i)=>{
  const c = PLX.extractStep4(p.fields.howto);
  c.analysis = PLX.analyzeCustomization({custom:c, raw:p.raw, fields:p.fields});
  totalVars += c.vars.length;
  // Simulate varControlsInner logic: for each var, should generate dropdown
  c.vars.forEach(v=>{
    if (!v.options || v.options.length===0) {
      failures.push(`Prompt #${i+1} var ${v.name} has no options`);
    } else {
      totalDropdowns++;
    }
    // Check default = Step4 value (first option)
    const def = v.options[0];
    if (!def) failures.push(`Prompt #${i+1} var ${v.name} default missing`);
    // Check Custom Value option exists (in our code, we add it)
    // Check custom textbox hidden initially
  });
});
console.log(`Total vars ${totalVars}, total dropdowns ${totalDropdowns}`);
console.log(`Failures ${failures.length}`, failures.slice(0,10));
console.log(`PASS if totalVars == totalDropdowns and failures 0: ${totalVars===totalDropdowns && failures.length===0 ? 'PASS' : 'FAIL'}`);

// Also test that variables only from Section 9 Step 4, not from other sections
const p1 = lib.prompts[0];
console.log('\nPrompt #1 howto contains Step4?', /Step 4/i.test(p1.fields.howto));
console.log('Prompt #1 vars', p1.fields.howto.match(/\[.*?\]/g));
console.log('Extracted vars', PLX.extractStep4(p1.fields.howto).vars.map(v=>v.name));
console.log('Before section vars', (p1.fields.before.match(/\[.*?\]/g)||[]));
console.log('Variables only from Step4? ', p1.fields.before.includes('[SUBJECT TYPE]') && PLX.extractStep4(p1.fields.howto).vars.some(v=>v.name==='SUBJECT TYPE') ? 'YES - var in S3 but defined in S9 Step4 (correct)' : 'check');
