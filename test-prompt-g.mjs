import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('./prompt-library-engine-v2.5.2-enterprise.html','utf8');

// Extract PLX core for detectRole and PROTECTION
const coreMatch = html.match(/var PLX = \(function \(\) \{[\s\S]*?return \{[\s\S]*?\};\s+\}\)\(\);/);
if (!coreMatch) { console.error('PLX core not found'); process.exit(1); }

let PLX;
try {
  const code = coreMatch[0] + '\nPLX';
  PLX = vm.runInNewContext(code);
} catch(e){ console.error('eval PLX fail', e); process.exit(1); }

function chk(name, cond, info=''){
  console.log((cond?'PASS':'FAIL')+' '+name, info||'');
  return cond;
}

let pass=true;

// Test detectRole for required filenames
const tests = [
  ['myimage Before.jpg', 'before'],
  ['myimage Before.jpeg', 'before'],
  ['myimage Before.png', 'before'],
  ['myimage Before.webp', 'before'],
  ['myimage After.jpg', 'after'],
  ['myimage After.jpeg', 'after'],
  ['myimage After.png', 'after'],
  ['myimage After.webp', 'after'],
  ['1 Professional High-End Skin Retouching Prompt (2026) Before.jpg', 'before'],
  ['1 Professional High-End Skin Retouching Prompt (2026) After.jpg', 'after'],
  ['photo BEFORE.JPG', 'before'],
  ['photo AFTER.PNG', 'after'],
  ['photo Before.JPEG', 'before'],
  ['photo After.WEBP', 'after'],
  ['x-after-final.jpg', 'unknown'],
];

for (const [fname, expected] of tests){
  const det = PLX.detectRole(fname);
  pass = chk(`detectRole ${fname} -> ${expected}`, det.role===expected, `got ${det.role}`) && pass;
}

function simulateAssign(files){
  const st = { before:null, after:null, thumb:null, dupBefore:false, dupAfter:false };
  const seen={};
  for (const f of files){
    const det = PLX.detectRole(f);
    const target = det.role==='before'?'before':det.role==='after'?'after':det.role==='thumb'?'thumb':null;
    if (!target) continue;
    if (seen[target]) continue;
    seen[target]=true;
    st[target]={ name:f, role:det.role, roleLabel:det.label };
  }
  return st;
}

let st1 = simulateAssign(['a Before.jpg','b After.jpg']);
pass = chk('order before then after - before role correct', st1.before && st1.before.role==='before', '') && pass;
pass = chk('order before then after - after role correct', st1.after && st1.after.role==='after', '') && pass;

let st2 = simulateAssign(['b After.jpg','a Before.jpg']);
pass = chk('reversed order after then before - before role correct', st2.before && st2.before.role==='before', '') && pass;
pass = chk('reversed order after then before - after role correct', st2.after && st2.after.role==='after', '') && pass;
pass = chk('reversed order - roles not swapped', st2.before.name.includes('Before') && st2.after.name.includes('After'), '') && pass;

// Test protection text exactly once - PLE-07 new spec
const prot = PLX.PROTECTION;
pass = chk('PROTECTION contains 9 lines rule', prot.split('\n').length===9, `lines ${prot.split('\n').length}`) && pass;
pass = chk('PROTECTION contains Before image exactly', prot.includes('Use supplied Before image exactly as BEFORE source.'), '') && pass;
pass = chk('PROTECTION contains After image exactly', prot.includes('Use supplied After image exactly as AFTER source.'), '') && pass;
pass = chk('PROTECTION contains Do not enhance', prot.includes('Do not enhance either image.'), '') && pass;
pass = chk('PROTECTION contains Do not retouch', prot.includes('Do not retouch either image.'), '') && pass;
pass = chk('PROTECTION contains Do not recolor', prot.includes('Do not recolor either image.'), '') && pass;
pass = chk('PROTECTION contains Do not regenerate', prot.includes('Do not regenerate either image.'), '') && pass;
pass = chk('PROTECTION contains Do not swap', prot.includes('Do not swap image positions.'), '') && pass;
pass = chk('PROTECTION contains Only create thumbnail', prot.includes('Only create thumbnail composition around supplied images.'), '') && pass;

function wrapP(txt){
  var v = String(txt||'');
  if (/SOURCE IMAGE PROTECTION/i.test(v)) return v;
  return v ? (v + '\n\n' + prot) : prot;
}

const thumbWithoutProt = 'Create a thumbnail...';
const once = wrapP(thumbWithoutProt);
pass = chk('protection added once', (once.match(new RegExp(prot.split('\n')[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'g'))||[]).length===1, '') && pass;

const twice = wrapP(once);
pass = chk('protection not duplicated second time', twice===once, `twice length ${twice.length} once ${once.length}`) && pass;

function thumbWithProtection(thumb){
  var v = String(thumb||'');
  if (/SOURCE IMAGE PROTECTION/i.test(v)) return v;
  return v ? (v + '\n\n' + prot) : prot;
}
const t1 = thumbWithProtection(thumbWithoutProt);
pass = chk('derive thumbWithProtection adds once', t1.includes(prot) && t1.split(prot).length===2, '') && pass;
const t2 = thumbWithProtection(t1);
pass = chk('derive thumbWithProtection not duplicate', t2===t1, '') && pass;

console.log('\nOVERALL', pass?'PASS':'FAIL');
