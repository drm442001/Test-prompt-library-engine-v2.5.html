import fs from 'fs';
import path from 'path';
const htmlPath = path.resolve('prompt-library-engine-v2.5.2-enterprise.html');
const html = fs.readFileSync(htmlPath, 'utf8');
// Extract first <script> block content (core + app)
const match = html.match(/<script>\s*\/\* ===== core ===== \*\/([\s\S]*?)<\/script>/);
if (!match) { console.error('No script found'); process.exit(1); }
let script = match[1];
// The file has two layers: core PLX and app. We need only PLX for parsing tests.
// PLX is defined as var PLX = (function(){...})();
// So evaluate it in a VM.
import vm from 'vm';
const sandbox = { console, window: {}, document: {} };
vm.createContext(sandbox);
const coreCode = `
${script.split('/* ===== app ===== */')[0]}
`;
try {
  vm.runInContext(coreCode, sandbox, { timeout: 5000 });
} catch (e) {
  console.error('Core eval error', e);
  process.exit(1);
}
const PLX = sandbox.PLX;
if (!PLX) { console.error('PLX not defined'); process.exit(1); }
console.log('PLX VERSION', PLX.VERSION);

const md = fs.readFileSync('Photo-Retouch-Prompts.md', 'utf8');
const lib = PLX.parseMarkdown(md);
console.log('Parsed library tier', lib.tier, 'blockCount', lib.blockCount, 'prompts', lib.prompts.length);
if (lib.error) console.log('Error', lib.error);
if (lib.footer) console.log('Footer present length', lib.footer.length);
let errCount=0, warnCount=0, totalIssues=0;
lib.prompts.forEach((p, idx)=>{
  // analyze
  const analysis = PLX.analyzeCustomization(p);
  p.custom.analysis = analysis;
  const issues = PLX.validate(p, {});
  totalIssues+=issues.length;
  errCount+=issues.filter(i=>i.level==='error').length;
  warnCount+=issues.filter(i=>i.level==='warn').length;
  if (idx<3 || issues.some(i=>i.level==='error')) {
    console.log(`\nPrompt #${p.num} title=${p.fields.title.slice(0,60)} tier=${p.tier}`);
    console.log('  custom vars', p.custom.vars.length, 'present', p.custom.present);
    if (p.custom.vars.length) console.log('   vars', p.custom.vars.map(v=>v.name).join(', '));
    console.log('  issues', issues.map(i=>`${i.level}:${i.code}:${i.msg}`).join(' | '));
    console.log('  unknown', p.unknown.length);
  }
});
console.log('\nSUMMARY err', errCount, 'warn', warnCount, 'totalIssues', totalIssues);
console.log('Prompt #50 check');
const last = lib.prompts[lib.prompts.length-1];
if (last) {
  console.log(' last num', last.num, 'title', last.fields.title);
  console.log(' search len', last.fields.search.length);
  console.log(' has footer contamination?', (last.fields.search||'').includes('PRODUCTION CHECKLIST') ? 'YES BAD' : 'NO GOOD');
}
console.log('\nTest derive Full Body exclusion');
const sample = lib.prompts[0];
const d = PLX.derive(sample, { mode:'original', preset:'studio', suffix:'_cover.jpg' });
console.log('FullBody contains Prompt?', d.fullBody.includes('PROMPT:') || d.fullBody.includes('Prompt') ? 'yes' : 'no');
console.log('FullBody contains Section3 text?', d.fullBody.includes(sample.fields.before.slice(0,20)) ? 'BAD includes S3' : 'GOOD excludes S3');
console.log('Before prompt length', d.S3.length);
console.log('Prompt length', d.S6.length);

console.log('\nTest thumbnail short title');
const title = 'Professional High-End Skin Retouching Prompt (2026)';
console.log('shortTitle', PLX.shortTitle(title), 'expected P H-E S R P (2026)');

console.log('\nTest role detection');
['01 Professional High-End Skin Retouching Prompt Before.jpg','01 Professional High-End Skin Retouching Prompt After.jpg','01 Professional High-End Skin Retouching Prompt _cover.jpg','my Before.jpg','my After.jpeg','x-after-final.jpg'].forEach(fn=>{
  console.log(fn, '=>', PLX.detectRole(fn));
});

console.log('\nTest Step4 extraction forms');
const howtoSample = lib.prompts[0].fields.howto;
console.log('howto sample Step4 block present?', PLX.extractStep4(howtoSample).present);
console.log('vars', PLX.extractStep4(howtoSample).vars.map(v=>v.name));

console.log('\nTest filenames');
console.log(PLX.filenames(sample, {ext:'jpg', suffix:'_cover.jpg'}, false));
console.log(PLX.filenames(sample, {ext:'jpg', suffix:'_cover.jpg'}, true));
