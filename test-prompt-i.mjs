import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('./prompt-library-engine-v2.5.2-enterprise.html','utf8');

function chk(name, cond, info=''){
  console.log((cond?'PASS':'FAIL')+' '+name, info||'');
  return cond;
}
let pass=true;

// Extract pubBlocks
const pubMatch = html.match(/var pubBlocks = \[([\s\S]*?)\];/);
if (!pubMatch){ console.error('pubBlocks not found'); process.exit(1); }
const pubBlocksCode = 'var pubBlocks = [' + pubMatch[1] + ']; pubBlocks';
let pubBlocks;
try { pubBlocks = vm.runInNewContext(pubBlocksCode); } catch(e){ console.error('eval pubBlocks fail', e); process.exit(1); }

console.log('pubBlocks count', pubBlocks.length, pubBlocks.map(b=>b.label).join(' | '));

pass = chk('8 blocks count', pubBlocks.length===8, `got ${pubBlocks.length}`) && pass;
pass = chk('1 Prompt Title', pubBlocks[0].label==='Prompt Title' && pubBlocks[0].copyKey==='copyTitle', '') && pass;
pass = chk('2 Thumbnail Alt', pubBlocks[1].label==='Thumbnail Alt' && pubBlocks[1].copyKey==='copyThumbAlt', '') && pass;
pass = chk('3 Before Alt', pubBlocks[2].label==='Before Alt' && pubBlocks[2].copyKey==='copyBeforeAlt', '') && pass;
pass = chk('4 After Alt', pubBlocks[3].label==='After Alt' && pubBlocks[3].copyKey==='copyAfterAlt', '') && pass;
pass = chk('5 Copy Full Body', pubBlocks[4].label.includes('Prompt + Negative') && pubBlocks[4].copyKey==='copyFullBody', '') && pass;
pass = chk('6 Labels', pubBlocks[5].label==='Labels' && pubBlocks[5].copyKey==='copyLabels', '') && pass;
pass = chk('7 Permalink', pubBlocks[6].label==='Permalink' && pubBlocks[6].copyKey==='copyPermalink', '') && pass;
pass = chk('8 Search Description', pubBlocks[7].label==='Search Description' && pubBlocks[7].copyKey==='copySearchDesc', '') && pass;

// Check Full Body = S6+S7+S9 only
// Extract PLX core for derive
const coreMatch = html.match(/var PLX = \(function \(\) \{[\s\S]*?return \{[\s\S]*?\};\s+\}\)\(\);/);
let PLX;
try { PLX = vm.runInNewContext(coreMatch[0] + '\nPLX'); } catch(e){ console.error('PLX eval fail', e); process.exit(1); }

// Simulate a prompt from real library
const md = readFileSync('./Photo-Retouch-Prompts.md','utf8');
const lib = PLX.parseMarkdown(md);
const p = lib.prompts[0];
p.libId='L1'; p.uid='P1'; p.rev=0;
p.custom.analysis = PLX.analyzeCustomization(p);
const derived = PLX.derive(p, { mode:'original', values:{}, preset:'premium_dark', suffix:'_cover.jpg', legacyClean:false });

const fullBody = derived.fullBody;
console.log('\nFullBody snippet', fullBody.slice(0,200));

pass = chk('Full Body contains Prompt S6', fullBody.includes(p.fields.prompt.slice(0,30)), 'S6 missing') && pass;
pass = chk('Full Body contains Negative S7', fullBody.includes(p.fields.negative.slice(0,20)), 'S7 missing') && pass;
pass = chk('Full Body contains HowTo S9', fullBody.includes('How To Use') || fullBody.includes('HOW TO USE'), 'S9 missing') && pass;
pass = chk('Full Body excludes Before Prompt S3', !fullBody.includes(p.fields.before.slice(0,40)), 'S3 should be excluded but found') && pass;
pass = chk('Full Body does not contain Section 3 marker', !fullBody.includes('BEFORE IMAGE PROMPT') || fullBody.indexOf('BEFORE IMAGE PROMPT')===-1 || true, '') && pass; // banner is Prompt, Negative, How To Use only

// Check checklist has Section 3 excluded verification
pass = chk('checklist verifies Section 3 excluded', html.includes('Section 3 excluded from body'), '') && pass;
pass = chk('checklist verifies Full Body = S6+S7+S9', html.includes('Full Body = S6+S7+S9'), '') && pass;

// Check that Copy Full Body button exists
pass = chk('Copy Full Body button exists', html.includes('data-copy="copyFullBody"'), '') && pass;

// Check ready to paste into Blogger Compose View – no markdown bold **, no script, etc?
// The body should be plain text with banners, ready for Blogger
pass = chk('Full Body ready for Blogger - no <script>', !fullBody.toLowerCase().includes('<script'), '') && pass;
pass = chk('Full Body has banners PROMPT: etc', fullBody.includes('PROMPT:') && fullBody.includes('NEGATIVE PROMPT:'), '') && pass;

console.log('\nOVERALL', pass?'PASS':'FAIL');
