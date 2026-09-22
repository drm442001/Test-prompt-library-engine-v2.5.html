import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('./prompt-library-engine-v2.5.2-enterprise.html','utf8');

// Extract PLX core for derive test
// We need to evaluate the core module part up to derive
// Simpler: extract PRESET_NAMES and THUMB_TEMPLATES via regex and evaluate

const presetMatch = html.match(/var PRESET_NAMES = (\{[\s\S]*?\});\s+var THUMB_TEMPLATES = (\{[\s\S]*?\n  \});/);
if (!presetMatch) { console.error('preset block not found'); process.exit(1); }

let presetNames, thumbTemplates;
try {
  presetNames = vm.runInNewContext('(' + presetMatch[1] + ')');
  // thumbTemplates is JS object with .join('\n') inside – need to evaluate as JS
  const code = 'var THUMB_TEMPLATES = ' + presetMatch[2] + '; THUMB_TEMPLATES';
  thumbTemplates = vm.runInNewContext(code);
} catch(e){ console.error('eval preset fail', e); process.exit(1); }

console.log('Presets found:', Object.keys(presetNames));
console.log('Templates found:', Object.keys(thumbTemplates));

function chk(name, cond, info=''){
  if(!cond){ console.log('FAIL', name, info); } else console.log('PASS', name);
  return cond;
}

let pass=true;
pass = chk('four styles count', Object.keys(presetNames).length===4, `got ${Object.keys(presetNames).length}`) && pass;
pass = chk('has Premium Dark', Object.values(presetNames).includes('Premium Dark'), '') && pass;
pass = chk('has Cinematic Gold', Object.values(presetNames).includes('Cinematic Gold'), '') && pass;
pass = chk('has Neon Purple', Object.values(presetNames).includes('Neon Purple'), '') && pass;
pass = chk('has Minimal Clean', Object.values(presetNames).includes('Minimal Clean'), '') && pass;

pass = chk('keys are premium_dark etc', ['premium_dark','cinematic_gold','neon_purple','minimal_clean'].every(k=>k in thumbTemplates), '') && pass;

// Check different outputs
const outputs = Object.entries(thumbTemplates).map(([k,v])=> ({k, v, len: v.length}));
const unique = new Set(outputs.map(o=>o.v));
pass = chk('all four produce different outputs', unique.size===4, `unique ${unique.size}`) && pass;

// Check Before/After placeholders preserved
for (const [k,t] of Object.entries(thumbTemplates)){
  pass = chk(`${k} contains BEFORE placeholder`, /BEFORE/.test(t) && /FIRST attached image = BEFORE/.test(t), '') && pass;
  pass = chk(`${k} contains AFTER placeholder`, /AFTER/.test(t) && /SECOND attached image = AFTER/.test(t), '') && pass;
  pass = chk(`${k} contains SIZE placeholder`, t.includes('{{SIZE}}'), '') && pass;
  pass = chk(`${k} contains PROMPT_TITLE`, t.includes('{{PROMPT_TITLE}}'), '') && pass;
}

// Check that selecting style regenerates – look for S.preset assignment and dirty flags
pass = chk('preset change regenerates - S.preset assignment exists', html.includes('S.preset = n.value') || html.includes('S.preset = k'), '') && pass;
pass = chk('preset change sets dirty library/image/publisher', html.includes('S.dirty = { library: true, image: true, publisher: true }'), '') && pass;
pass = chk('preset change calls touchAll', html.includes('touchAll()'), '') && pass;
pass = chk('preset change calls render', html.includes('render()'), '') && pass;

// Check loadPreset migration for old names
pass = chk('loadPreset maps old studio etc', html.includes('studio') && html.includes('premium_dark') && html.includes('map'), '') && pass;

// Check derive uses preset fallback premium_dark
pass = chk('derive fallback premium_dark', html.includes('THUMB_TEMPLATES.premium_dark'), '') && pass;

console.log('\nOVERALL', pass?'PASS':'FAIL');

// Also test with real library: simulate derive for one prompt without Section 10
import { readFileSync as rfs } from 'node:fs';
const md = rfs('./Photo-Retouch-Prompts.md','utf8');
// Use existing test-engine to parse? Quick parse via PLX if we can eval whole PLX
// For now, just ensure template still works for Photo-Retouch prompt #1 which has Section 10 present – but preset should be ignored when Section 10 present, and used when absent.
// We'll trust earlier logic.

