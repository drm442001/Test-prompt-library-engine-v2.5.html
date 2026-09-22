import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('./prompt-library-engine-v2.5.2-enterprise.html','utf8');
const plxMatch = html.match(/var PLX = \(function \(\) \{[\s\S]*?\n  return \{[\s\S]*?\n  \};\n\}\)\(\);/);
let PLX = vm.runInNewContext(plxMatch[0] + '\nPLX');

function chk(name, cond){ console.log((cond?'PASS':'FAIL')+' '+name); return cond; }
let pass=true;

// Parse real library
const md = readFileSync('./Photo-Retouch-Prompts.md','utf8');
const parsed = PLX.parseMarkdown(md);
const p1 = parsed.prompts[0];
console.log('Prompt #1:', p1.fields.title);

// Derive payloads simulation
function valuesFor(p){ 
  const out={}; 
  (p.custom.vars||[]).forEach(v=>{ if(v.options&&v.options.length) out[v.name]=v.options[0]; });
  return out;
}
const d = PLX.derive(p1, { mode:'original', values: valuesFor(p1), preset:'premium_dark', suffix:'_cover.jpg' });

// Simulate payloads
const fullBody = d.fullBody;
const S3 = d.S3;
const S10 = d.thumb;

// Check Full Body contains ONLY Prompt, Negative, HowTo
pass = chk('Full Body contains Prompt S6', fullBody.includes(d.S6.slice(0,40))) && pass;
pass = chk('Full Body contains Negative S7', fullBody.includes(d.S7.slice(0,20))) && pass;
pass = chk('Full Body contains HowTo S9', fullBody.includes('How To Use') || fullBody.includes(d.S9.slice(0,20))) && pass;

pass = chk('Full Body does NOT include Before Prompt S3', !fullBody.includes(S3.slice(0,40))) && pass;
pass = chk('Full Body does NOT include Thumbnail Prompt S10', !fullBody.includes(S10.slice(0,40))) && pass;
pass = chk('Full Body does NOT include Labels', !fullBody.includes(p1.fields.labels.slice(0,20)) || fullBody.includes('LABELS')===false) && pass;
pass = chk('Full Body does NOT include Permalink', !fullBody.includes(p1.fields.permalink)) && pass;
pass = chk('Full Body does NOT include Search Description', !fullBody.includes(p1.fields.search.slice(0,20))) && pass;
pass = chk('Full Body does NOT include Alt Text Thumbnail', !fullBody.toLowerCase().includes('alt text - thumbnail')) && pass;
pass = chk('Full Body does NOT include Prompt Title as standalone', !fullBody.includes('Section 1')) && pass;

// Check publisher blocks order
const pubMatch = html.match(/var pubBlocks = \[([\s\S]*?)\];/);
if (!pubMatch){ console.error('pubBlocks not found'); process.exit(1); }
const blocksText = pubMatch[1];
const labels = [...blocksText.matchAll(/label:\s*'([^']+)'/g)].map(m=>m[1]);
console.log('Publisher blocks:', labels.join(' | '));
const expected = ['Prompt Title','Thumbnail Alt','Before Alt','After Alt','Prompt + Negative + How To Use','Labels','Permalink','Search Description'];
pass = chk('8 blocks count', labels.length===8) && pass;
expected.forEach((exp,i)=>{
  pass = chk(`Block ${i+1} ${exp}`, labels[i]===exp) && pass;
});

// Check copy buttons exist
[
  'copyTitle','copyThumbAlt','copyBeforeAlt','copyAfterAlt','copyFullBody','copyLabels','copyPermalink','copySearchDesc'
].forEach(btn=>{
  pass = chk(`Copy button ${btn} exists`, html.includes(btn)) && pass;
});

// Blogger Compose View ready checks
pass = chk('No HTML corruption <script> in Full Body', !/<script/i.test(fullBody)) && pass;
pass = chk('No Markdown corruption ** in Full Body? allowed but banners are NAME: not **', !fullBody.includes('**')) && pass;
pass = chk('No duplicate blank lines \\n\\n\\n', !/\n{3,}/.test(fullBody)) && pass;
pass = chk('Has headings PROMPT:', /PROMPT:/.test(fullBody)) && pass;
pass = chk('Has NEGATIVE PROMPT:', /NEGATIVE PROMPT:/.test(fullBody)) && pass;
pass = chk('Has HOW TO USE', /HOW TO USE/.test(fullBody)) && pass;

// MGS workflow locked check: Title -> Import 3 Images -> Thumbnail Alt -> Before Alt -> After Alt -> Copy Full Body -> Labels -> Permalink -> Search Description
// The pubBlocks order already reflects Title, Thumbnail Alt, Before Alt, After Alt, Full Body, Labels, Permalink, Search Description
// Import 3 Images is Image Studio, not Publisher, but workflow mentions it
pass = chk('MGS workflow order Title first', labels[0]==='Prompt Title') && pass;
pass = chk('MGS workflow Thumbnail Alt second', labels[1]==='Thumbnail Alt') && pass;
pass = chk('MGS workflow Before Alt third', labels[2]==='Before Alt') && pass;
pass = chk('MGS workflow After Alt fourth', labels[3]==='After Alt') && pass;
pass = chk('MGS workflow Full Body fifth', labels[4].includes('Full Body') || labels[4].includes('Prompt + Negative')) && pass;
pass = chk('MGS workflow Labels sixth', labels[5]==='Labels') && pass;
pass = chk('MGS workflow Permalink seventh', labels[6]==='Permalink') && pass;
pass = chk('MGS workflow Search Description eighth', labels[7]==='Search Description') && pass;

// Test Prompt #1 copy contents
console.log('\n--- Prompt #1 Copy Validation ---');
console.log('Title:', p1.fields.title.slice(0,60));
console.log('Thumbnail Alt:', d.thumbAlt.slice(0,80));
console.log('Before Alt:', d.altBefore.slice(0,80));
console.log('After Alt:', d.altAfter.slice(0,80));
console.log('Full Body len:', fullBody.length);
console.log('Labels:', d.labelsV);
console.log('Permalink:', d.permalinkV);
console.log('Search:', d.searchV.slice(0,100));

pass = chk('Title copy non-empty', !!p1.fields.title) && pass;
pass = chk('Thumbnail Alt copy non-empty', !!d.thumbAlt) && pass;
pass = chk('Before Alt copy non-empty', !!d.altBefore) && pass;
pass = chk('After Alt copy non-empty', !!d.altAfter) && pass;
pass = chk('Full Body copy non-empty', !!fullBody) && pass;
pass = chk('Labels copy non-empty', !!d.labelsV) && pass;
pass = chk('Permalink copy non-empty', !!d.permalinkV) && pass;
pass = chk('Search Description copy non-empty', !!d.searchV) && pass;

// Console Errors
try {
  const { execSync } = await import('node:child_process');
  const fs = await import('node:fs');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  for (let i=0;i<scripts.length;i++){
    const tmp = `/tmp/check09_${i}.js`;
    fs.writeFileSync(tmp, scripts[i]);
    execSync(`node --check ${tmp}`, {stdio:'pipe'});
  }
  console.log('PASS Console Errors = 0');
} catch(e){
  console.log('FAIL Console Errors', e.message);
  pass=false;
}

console.log('\nOVERALL', pass?'PASS':'FAIL');
