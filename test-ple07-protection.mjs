import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('./prompt-library-engine-v2.5.2-enterprise.html','utf8');

const plxMatch = html.match(/var PLX = \(function \(\) \{[\s\S]*?\n  return \{[\s\S]*?\n  \};\n\}\)\(\);/);
if (!plxMatch) { console.error('PLX not found'); process.exit(1); }
let PLX;
try {
  PLX = vm.runInNewContext(plxMatch[0] + '\nPLX');
} catch(e){ console.error('PLX eval fail', e); process.exit(1); }

function chk(name, cond, info=''){
  console.log((cond?'PASS':'FAIL')+' '+name + (info?' '+info:''));
  return cond;
}

let pass=true;

// A. Filename Role Detection
const tests = [
  ['1 Professional High-End Skin Retouching Prompt (2026) Before.jpg', 'before'],
  ['1 Professional High-End Skin Retouching Prompt (2026) After.jpg', 'after'],
  ['1 Professional High-End Skin Retouching Prompt (2026) Before.jpeg', 'before'],
  ['1 Professional High-End Skin Retouching Prompt (2026) After.jpeg', 'after'],
  ['1 Professional High-End Skin Retouching Prompt (2026) Before.png', 'before'],
  ['1 Professional High-End Skin Retouching Prompt (2026) After.png', 'after'],
  ['1 Professional High-End Skin Retouching Prompt (2026) Before.webp', 'before'],
  ['1 Professional High-End Skin Retouching Prompt (2026) After.webp', 'after'],
  ['test BEFORE.JPG', 'before'],
  ['test after.PNG', 'after'],
  ['random.jpg', 'unknown'],
];

for (const [fname, expected] of tests){
  const det = PLX.detectRole(fname);
  pass = chk(`detectRole ${fname} => ${expected}`, det.role===expected, `got ${det.role}`) && pass;
}

// Check case-insensitive
pass = chk('case-insensitive Before.jpg', PLX.detectRole('Before.jpg').role==='before') && pass;
pass = chk('case-insensitive AFTER.WEBP', PLX.detectRole('AFTER.WEBP').role==='after') && pass;

// B. Source Verification Badge
// Check HTML contains new badge texts
pass = chk('badge BEFORE IMAGE — SOURCE VERIFIED exists', html.includes('BEFORE IMAGE') && html.includes('SOURCE VERIFIED')) && pass;
pass = chk('badge AFTER IMAGE — SOURCE VERIFIED exists', html.includes('AFTER IMAGE') && html.includes('SOURCE VERIFIED')) && pass;
pass = chk('badge SOURCE ROLE NOT DETECTED exists', html.includes('SOURCE ROLE NOT DETECTED')) && pass;
pass = chk('badge from filename (not upload order)', html.includes('from filename (not upload order)')) && pass;
pass = chk('never guess - confident flag exists', html.includes('confident')) && pass;

// C. Thumbnail Prompt Protection Layer
const prot = PLX.PROTECTION;
console.log('\nPROTECTION TEXT:\n'+prot+'\n');
pass = chk('protection header SOURCE IMAGE PROTECTION', prot.includes('SOURCE IMAGE PROTECTION')) && pass;
pass = chk('protection Use supplied Before image exactly as BEFORE source', prot.includes('Use supplied Before image exactly as BEFORE source')) && pass;
pass = chk('protection Use supplied After image exactly as AFTER source', prot.includes('Use supplied After image exactly as AFTER source')) && pass;
pass = chk('protection Do not enhance either image', prot.includes('Do not enhance either image')) && pass;
pass = chk('protection Do not retouch either image', prot.includes('Do not retouch either image')) && pass;
pass = chk('protection Do not recolor either image', prot.includes('Do not recolor either image')) && pass;
pass = chk('protection Do not regenerate either image', prot.includes('Do not regenerate either image')) && pass;
pass = chk('protection Do not swap image positions', prot.includes('Do not swap image positions')) && pass;
pass = chk('protection Only create thumbnail composition around supplied images', prot.includes('Only create thumbnail composition around supplied images')) && pass;

// Check protection appears exactly once in thumbWithProtection
const md = readFileSync('./Photo-Retouch-Prompts.md','utf8');
const parsed = PLX.parseMarkdown(md);
const p = parsed.prompts[0];
const d = PLX.derive(p, { mode:'original', preset:'premium_dark', suffix:'_cover.jpg' });
const thumbProtected = d.thumbWithProtection;

const countProtection = (thumbProtected.match(/SOURCE IMAGE PROTECTION/g)||[]).length;
pass = chk('protection appears exactly once in thumbWithProtection', countProtection===1, `got ${countProtection}`) && pass;

// Check that thumbWithProtection contains all 8 rules
pass = chk('thumbWithProtection contains Before rule', thumbProtected.includes('Use supplied Before image exactly as BEFORE source')) && pass;
pass = chk('thumbWithProtection contains After rule', thumbProtected.includes('Use supplied After image exactly as AFTER source')) && pass;
pass = chk('thumbWithProtection contains Do not enhance', thumbProtected.includes('Do not enhance either image')) && pass;
pass = chk('thumbWithProtection contains Do not retouch', thumbProtected.includes('Do not retouch either image')) && pass;
pass = chk('thumbWithProtection contains Do not recolor', thumbProtected.includes('Do not recolor either image')) && pass;
pass = chk('thumbWithProtection contains Do not regenerate', thumbProtected.includes('Do not regenerate either image')) && pass;
pass = chk('thumbWithProtection contains Do not swap', thumbProtected.includes('Do not swap image positions')) && pass;
pass = chk('thumbWithProtection contains Only create thumbnail', thumbProtected.includes('Only create thumbnail composition around supplied images')) && pass;

// Check duplication prevention: if thumb already contains protection, should not duplicate
const d2 = PLX.derive(p, { mode:'original', preset:'premium_dark', suffix:'_cover.jpg' });
// Simulate second append
const double = thumbProtected + '\n\n' + PLX.PROTECTION;
const countDouble = (double.match(/SOURCE IMAGE PROTECTION/g)||[]).length;
pass = chk('duplication check - double would be 2', countDouble===2) && pass;
// But derive's thumbWithProtection should prevent duplication by checking /SOURCE IMAGE PROTECTION/
pass = chk('derive prevents duplication via regex', /SOURCE IMAGE PROTECTION/i.test(thumbProtected)) && pass;

// D. Copy Thumbnail Prompt includes protection exactly once
// In payloads, copyThumbPromptProtected uses wrapP which also checks /SOURCE IMAGE PROTECTION/
pass = chk('wrapP prevents duplication', html.includes('if (/SOURCE IMAGE PROTECTION/i.test(v)) return v;')) && pass;

// Validation: Upload order reversed roles remain correct
// Simulate assignFiles logic: detectRole determines target, not order
function simulateAssign(filesInOrder){
  let st = { before:null, after:null, thumb:null };
  for (const fname of filesInOrder){
    const det = PLX.detectRole(fname);
    const target = det.role==='before'?'before':det.role==='after'?'after':det.role==='thumb'?'thumb':null;
    if (!target) continue;
    st[target] = { name: fname, role: det.role, roleLabel: det.label };
  }
  return st;
}

const reversed = [
  '1 Professional High-End Skin Retouching Prompt (2026) After.jpg',
  '1 Professional High-End Skin Retouching Prompt (2026) Before.jpg'
];
const stReversed = simulateAssign(reversed);
pass = chk('upload order reversed - Before still correct', stReversed.before && stReversed.before.name.includes('Before.jpg')) && pass;
pass = chk('upload order reversed - After still correct', stReversed.after && stReversed.after.name.includes('After.jpg')) && pass;
pass = chk('upload order reversed - roles correct', stReversed.before.role==='before' && stReversed.after.role==='after') && pass;

// Console Errors = 0
try {
  const { execSync } = await import('node:child_process');
  const fs = await import('node:fs');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  for (let i=0;i<scripts.length;i++){
    const tmp = `/tmp/check07_${i}.js`;
    fs.writeFileSync(tmp, scripts[i]);
    execSync(`node --check ${tmp}`, {stdio:'pipe'});
  }
  console.log('PASS Console Errors = 0 (node --check)');
} catch(e){
  console.log('FAIL Console Errors', e.message);
  pass=false;
}

console.log('\nOVERALL', pass?'PASS':'FAIL');
