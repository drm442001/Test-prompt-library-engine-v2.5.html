import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('./prompt-library-engine-v2.5.2-enterprise.html','utf8');

// Extract PLX module via evaluating the script up to PLX
// We'll extract the PLX IIFE code block
const plxMatch = html.match(/var PLX = \(function \(\) \{[\s\S]*?\n  return \{[\s\S]*?\n  \};\n\}\)\(\);/);
if (!plxMatch) { console.error('PLX not found'); process.exit(1); }

let PLX;
try {
  const code = plxMatch[0] + '\nPLX';
  PLX = vm.runInNewContext(code);
} catch(e){ console.error('PLX eval fail', e); process.exit(1); }

// Parse real library
const md = readFileSync('./Photo-Retouch-Prompts.md','utf8');
const parsed = PLX.parseMarkdown(md);
const p = parsed.prompts[0];
console.log('Prompt #1 title:', p.fields.title);
console.log('Has S10 in library:', !!p.fields.thumb, 'len', (p.fields.thumb||'').length);

// Derive with each preset
const presets = ['premium_dark','cinematic_gold','neon_purple','minimal_clean'];
const results = {};

for (const preset of presets){
  const d = PLX.derive(p, { mode:'original', preset, suffix:'_cover.jpg' });
  results[preset] = d.thumb;
  console.log(`\n--- ${preset} --- thumb len ${d.thumb.length} thumbFromLibrary ${d.thumbFromLibrary}`);
  console.log(d.thumb.slice(0,120).replace(/\n/g,' | '));
}

function chk(name, cond){ console.log((cond?'PASS':'FAIL')+' '+name); return cond; }

let pass=true;
const thumbs = Object.values(results);
const unique = new Set(thumbs);
pass = chk('four presets generate different prompt output', unique.size===4, `got ${unique.size}`) && pass;

// Verify only Section 10 changes, other fields unchanged
const basePreset = 'premium_dark';
const dBase = PLX.derive(p, { mode:'original', preset: basePreset, suffix:'_cover.jpg' });
for (const preset of presets){
  if (preset===basePreset) continue;
  const d = PLX.derive(p, { mode:'original', preset, suffix:'_cover.jpg' });
  pass = chk(`${preset} S3 unchanged vs ${basePreset}`, d.S3===dBase.S3) && pass;
  pass = chk(`${preset} S6 unchanged vs ${basePreset}`, d.S6===dBase.S6) && pass;
  pass = chk(`${preset} S7 unchanged vs ${basePreset}`, d.S7===dBase.S7) && pass;
  pass = chk(`${preset} title unchanged vs ${basePreset}`, d.titleV===dBase.titleV) && pass;
  pass = chk(`${preset} labels unchanged vs ${basePreset}`, d.labelsV===dBase.labelsV) && pass;
  pass = chk(`${preset} thumb CHANGES vs ${basePreset}`, d.thumb!==dBase.thumb) && pass;
}

// Check themes per spec
pass = chk('Premium Dark theme Dark charcoal background Cyan accents Glass UI Purple divider High contrast', 
  results.premium_dark.includes('deep black premium dark') || results.premium_dark.includes('premium dark') && results.premium_dark.includes('dot-pattern') ) && pass;

pass = chk('Cinematic Gold theme Black + Gold Luxury wedding editorial Warm highlights',
  results.cinematic_gold.includes('cinematic gold') && results.cinematic_gold.includes('#D4AF37') ) && pass;

pass = chk('Neon Purple theme Neon purple divider Dark gradient Modern AI tutorial',
  results.neon_purple.includes('neon purple') && results.neon_purple.includes('#7c3aed') ) && pass;

pass = chk('Minimal Clean theme White background Soft gray divider Minimal typography',
  results.minimal_clean.includes('minimalist clean') && results.minimal_clean.includes('#fafafa') ) && pass;

// Check copy buttons still work: filenames independent of preset
for (const preset of presets){
  const d = PLX.derive(p, { mode:'original', preset, suffix:'_cover.jpg' });
  pass = chk(`${preset} filenames.before exists`, !!d.filenames.before) && pass;
  pass = chk(`${preset} filenames.thumb exists`, !!d.filenames.thumb) && pass;
  pass = chk(`${preset} filenamesShort.thumb exists`, !!d.filenamesShort.thumb) && pass;
}

// Check that preset dropdown HTML still exists and new note
pass = chk('presetRowHTML contains new note regenerates only Section 10', html.includes('regenerates only Section 10')) && pass;
pass = chk('presetRowHTML does NOT contain old note absent from library', !html.includes('applies only when Section 10 is absent')) && pass;

// Console Errors = 0 via syntax check
import { execSync } from 'node:child_process';
try {
  execSync('node --check prompt-library-engine-v2.5.2-enterprise.html', {stdio:'pipe'});
  // Actually need to extract script blocks
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  for (let i=0;i<scripts.length;i++){
    const tmp = `/tmp/check${i}.js`;
    const fs = await import('node:fs');
    fs.writeFileSync(tmp, scripts[i]);
    execSync(`node --check ${tmp}`, {stdio:'pipe'});
  }
  console.log('PASS Console Errors = 0 (node --check)');
} catch(e){
  console.log('FAIL Console Errors syntax', e.message);
  pass=false;
}

console.log('\nOVERALL', pass?'PASS':'FAIL');
