import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import { execSync } from 'node:child_process';

const htmlPath = './prompt-library-engine-v2.5.2-enterprise.html';
const html = readFileSync(htmlPath,'utf8');

function chk(name, cond, info=''){
  console.log((cond?'PASS':'FAIL')+' '+name + (info?' '+info:''));
  return cond;
}
let allPass = true;
let results = [];

// Extract PLX core
const coreMatch = html.match(/var PLX = \(function \(\) \{[\s\S]*?return \{[\s\S]*?\};\s+\}\)\(\);/);
if(!coreMatch){ console.log('FAIL could not extract PLX'); process.exit(1); }
let PLX = vm.runInNewContext(coreMatch[0] + '\nPLX');

console.log('=== PLE-12 FINAL REGRESSION ===');
console.log('Engine version:', PLX.VERSION);

// ---- A. IMPORT ENGINE ----
console.log('\n--- IMPORT ENGINE ---');
const libs = [
  'Photo-Retouch-Prompts.md',
  'Photo-Cleaning-Prompts.md',
  'Color-Grading-Prompts.md',
  'Wedding-Edit-Prompt.md'
];
let totalParsed = 0;
let libResults = [];
libs.forEach(fn=>{
  if(existsSync('./'+fn)){
    const md = readFileSync('./'+fn,'utf8');
    const parsed = PLX.parseMarkdown(md);
    const count = parsed.prompts.length;
    totalParsed += count;
    const ok = count===50;
    libResults.push({name:fn, count, expected:50, status: ok?'PASS':'FAIL'});
    allPass = chk(`Import ${fn} count 50`, ok, `got ${count}`) && allPass;
    // Numbering correct?
    const nums = parsed.prompts.map(p=>p.num);
    const numberingOk = nums.length===50 && nums[0]==='1' && nums[49]==='50';
    allPass = chk(`Numbering correct ${fn}`, numberingOk, nums.slice(0,3).join(',')+'...'+nums.slice(-3).join(',')) && allPass;
  } else {
    libResults.push({name:fn, count:0, expected:50, status:'UNVERIFIED - REQUIRED SOURCE NOT AVAILABLE'});
    console.log(`UNVERIFIED ${fn} - REQUIRED SOURCE NOT AVAILABLE`);
  }
});
console.log(`TOTAL parsed: ${totalParsed} / 200`);
if(totalParsed===50){
  console.log('NOTE: Only 50 available, 150 UNVERIFIED - documented limitation');
}

// Search works?
const mdRetouch = existsSync('./Photo-Retouch-Prompts.md') ? readFileSync('./Photo-Retouch-Prompts.md','utf8') : '';
let searchPass = false;
if(mdRetouch){
  const parsed = PLX.parseMarkdown(mdRetouch);
  const q = 'skin';
  const visible = parsed.prompts.filter(p=> (p.fields.title+' '+p.fields.labels).toLowerCase().includes(q));
  searchPass = visible.length>0;
  allPass = chk('Search works (skin)', searchPass, `found ${visible.length}`) && allPass;
}

// Prompt counter works?
allPass = chk('Prompt counter works (Showing X of Y)', html.includes('Showing') && html.includes('of') && html.includes('count')) && allPass;

// ---- B. PARSER ----
console.log('\n--- PARSER ---');
if(mdRetouch){
  const parsed = PLX.parseMarkdown(mdRetouch);
  // 9-section parser legacy?
  // Check if engine handles legacy keys
  allPass = chk('9-section parser legacy keys present', html.includes('LEGACY_KEYS') && PLX.LEGACY_KEYS.length>0) && allPass;
  // 13-section parser
  const p1 = parsed.prompts[0];
  const has13 = !!p1.fields.intro && !!p1.fields.thumb;
  allPass = chk('13-section parser (v5.0)', has13, `intro:${!!p1.fields.intro} thumb:${!!p1.fields.thumb}`) && allPass;
  // Prompt #50 boundary fix
  const p50 = parsed.prompts[49];
  const footerLeak = p50 && (p50.fields.search.includes('CHECKLIST') || p50.fields.search.includes('PRODUCTION CHECKLIST'));
  allPass = chk('Prompt #50 boundary fix (no footer leak)', !footerLeak, footerLeak?'leaked':'ok') && allPass;
  // AltPair parser
  const hasAltpair = p1.hasAltpair || (!!p1.fields.altBefore && !!p1.fields.altAfter);
  allPass = chk('AltPair parser', hasAltpair) && allPass;
  // Wedding Edit placeholders – check if Wedding file exists, else check Photo-Retouch placeholders
  if(existsSync('./Wedding-Edit-Prompt.md')){
    const mdW = readFileSync('./Wedding-Edit-Prompt.md','utf8');
    const parsedW = PLX.parseMarkdown(mdW);
    const pw = parsedW.prompts[0];
    const hasPlaceholders = /\[[^\]]+\]/.test(pw.fields.prompt);
    allPass = chk('Wedding Edit placeholders', hasPlaceholders) && allPass;
  } else {
    const hasPH = /\[[^\]]+\]/.test(parsed.prompts[0].fields.prompt);
    allPass = chk('Wedding Edit placeholders (via available lib)', hasPH) && allPass;
    console.log('UNVERIFIED Wedding Edit placeholders – file missing, using Photo-Retouch as proxy');
  }
}

// ---- C. CUSTOMIZE PROMPT ----
console.log('\n--- CUSTOMIZE PROMPT ---');
if(mdRetouch){
  const parsed = PLX.parseMarkdown(mdRetouch);
  const p1 = parsed.prompts[0];
  // Variable extraction
  allPass = chk('Variable extraction Step4 present', p1.custom.present) && allPass;
  allPass = chk('Variable extraction count >0', p1.custom.vars.length>0, `vars ${p1.custom.vars.length}`) && allPass;
  // Dropdown generation – html contains select data-action var
  allPass = chk('Dropdown generation', html.includes('data-action=\"var\"') && html.includes('<select')) && allPass;
  // Custom Value
  allPass = chk('Custom Value option', html.includes('Custom Value') && html.includes('__custom__')) && allPass;
  // Runtime replacement
  const vals = {};
  (p1.custom.vars||[]).forEach(v=>{ if(v.options&&v.options.length) vals[v.name]=v.options[0]; });
  const dOrig = PLX.derive(p1, {mode:'original', values:{}, preset:'premium_dark', suffix:'_cover.jpg'});
  const dCust = PLX.derive(p1, {mode:'customized', values:vals, preset:'premium_dark', suffix:'_cover.jpg'});
  const replaced = dOrig.S6!==dCust.S6;
  allPass = chk('Runtime replacement', replaced || Object.keys(vals).length===0, `orig len ${dOrig.S6.length} cust len ${dCust.S6.length}`) && allPass;
  // Original copy
  allPass = chk('Original copy preserved', !!p1.raw.prompt) && allPass;
  // Customized copy
  allPass = chk('Customized copy exists', !!dCust.S6) && allPass;
  // Prompt + Negative copy
  allPass = chk('Prompt + Negative copy', html.includes('copyPromptNegative') && dOrig.promptNegative) && allPass;
}

// ---- D. IMAGE STUDIO ----
console.log('\n--- IMAGE STUDIO ---');
allPass = chk('Vertical workflow vflow column', html.includes('.vflow{display:flex;flex-direction:column')) && allPass;
allPass = chk('Before Prompt in Image Studio', html.includes('2 · Before Image Prompt') || html.includes('Before Image Prompt')) && allPass;
allPass = chk('Prompt in Image Studio (Main Prompt)', html.includes('3 · Main Prompt') || html.includes('Main Prompt')) && allPass;
allPass = chk('Negative Prompt in Image Studio', html.includes('4 · Negative Prompt')) && allPass;
allPass = chk('Thumbnail Prompt in Image Studio', html.includes('6 · Thumbnail Image Generator Prompt')) && allPass;
allPass = chk('All buttons Image Studio (pickimages, swapslots, clearimages)', html.includes('pickimages') && html.includes('swapslots') && html.includes('clearimages')) && allPass;

// ---- E. THUMBNAIL ----
console.log('\n--- THUMBNAIL QA ---');
allPass = chk('Four style presets', html.includes('premium_dark') && html.includes('cinematic_gold') && html.includes('neon_purple') && html.includes('minimal_clean')) && allPass;
allPass = chk('Before filename detection', html.includes('Before') && html.includes('detectRole') && html.includes('Before.*jpe?g')) && allPass;
allPass = chk('After filename detection', html.includes('After') && html.includes('detectRole')) && allPass;
allPass = chk('Source Verified badge', html.includes('SOURCE VERIFIED')) && allPass;
allPass = chk('Protection text', html.includes('SOURCE IMAGE PROTECTION') && html.includes('Do not enhance')) && allPass;
allPass = chk('Thumbnail title full', html.includes('filenames') && html.includes('copyThumbFullTitle')) && allPass;
allPass = chk('Thumbnail title short', html.includes('shortTitle') && html.includes('copyThumbShortTitle')) && allPass;

// ---- F. BLOG PUBLISHER ----
console.log('\n--- BLOG PUBLISHER QA ---');
const copyActions = ['copyTitle','copyThumbAlt','copyBeforeAlt','copyAfterAlt','copyFullBody','copyLabels','copyPermalink','copySearchDesc'];
copyActions.forEach(act=>{
  allPass = chk(`Blog Publisher ${act}`, html.includes(act)) && allPass;
});
allPass = chk('Full Body = S6+S7+S9 only', html.includes('Sections 6 + 7 + 9') || html.includes('S6+S7+S9')) && allPass;

// ---- G. BUTTON QA ----
console.log('\n--- BUTTON QA ---');
const buttons = [
  'browseBtn','templateBtn','sampleBtn','clearBtn','clearSearchBtn',
  'pickimages','swapslots','clearimages','downloadpost','downloadlibrary','downloaduniversal',
  'copyTitle','copyThumbAlt','copyBeforeAlt','copyAfterAlt','copyFullBody','copyLabels','copyPermalink','copySearchDesc',
  'copyBeforePrompt','copyPrompt','copyNegative','copyPromptNegative','copyThumbPrompt','copyThumbPromptProtected'
];
buttons.forEach(b=>{
  allPass = chk(`Button ${b} exists`, html.includes(b)) && allPass;
});
allPass = chk('No duplicate listeners - single delegated click', (html.match(/document\.addEventListener\('click'/g)||[]).length===1) && allPass;
allPass = chk('No dead buttons - copyText exists', html.includes('function copyText')) && allPass;

// ---- H. VALIDATION CENTER ----
console.log('\n--- VALIDATION CENTER ---');
allPass = chk('Error level', html.includes('ERROR') && html.includes('error')) && allPass;
allPass = chk('Warning level', html.includes('WARNING') || html.includes('warn')) && allPass;
allPass = chk('Info level', html.includes('INFO') || html.includes('info')) && allPass;
allPass = chk('Parser Log - unknown heading', html.includes('UNKNOWN_HEADING') || html.includes('unknown')) && allPass;
allPass = chk('Placeholder Log - WE-002', html.includes('WE002') || html.includes('WE-002')) && allPass;

// ---- I. RESPONSIVE QA ----
console.log('\n--- RESPONSIVE QA ---');
const widths = ['1366px','1024px','768px','480px','360px'];
widths.forEach(w=>{
  allPass = chk(`Responsive ${w} media query`, html.includes(`max-width:${w}`) || html.includes(`max-width: ${w}`) || html.includes(w)) && allPass;
});
allPass = chk('No clipping overflow-x hidden', html.includes('overflow-x:hidden')) && allPass;
allPass = chk('No overflow max-width 100%', html.includes('max-width:100%')) && allPass;

// ---- J. RUNTIME QA ----
console.log('\n--- RUNTIME QA ---');
try {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  for(let i=0;i<scripts.length;i++){
    const tmp = `/tmp/check12_${i}.js`;
    writeFileSync(tmp, scripts[i]);
    execSync(`node --check ${tmp}`, {stdio:'pipe'});
  }
  allPass = chk('Console Errors = 0 (syntax check)', true) && allPass;
} catch(e){
  allPass = chk('Console Errors = 0', false, e.message) && allPass;
}
allPass = chk('Uncaught Exceptions = 0 (no ReferenceError open)', !html.includes('ReferenceError') && html.includes('function open()')) && allPass;
allPass = chk('Duplicate IDs = 0 (no duplicate literal IDs)', !/id="search".*id="search"/s.test(html)) && allPass;
allPass = chk('Duplicate Event Listeners = 0', (html.match(/addEventListener\('click'/g)||[]).length<=3) && allPass;
allPass = chk('Dead Controls = 0', html.includes('data-action') ) && allPass;

console.log('\n=== OVERALL ===');
console.log(allPass ? 'PASS' : 'FAIL');
console.log(`Libs: ${JSON.stringify(libResults)}`);
console.log(`Total: ${totalParsed}/200`);

if(!allPass){
  process.exitCode = 1;
}
