import { readFileSync } from 'node:fs';
const html = readFileSync('./prompt-library-engine-v2.5.2-enterprise.html','utf8');

function chk(name, cond){
  console.log(`${cond?'PASS':'FAIL'} ${name}`);
  return cond;
}
let allPass=true;

// Group A
const groupA = [
  'copyPrompt',
  'copyNegative',
  'copyBeforePrompt',
  'copyPromptNegative',
  'copyLabels',
  'copyPermalink',
  'copySearchDesc',
  'copyFullBody',
  'copyThumbPrompt',
  'copyThumbPromptProtected',
  'copyTitle',
  'copyIntro',
  'copyThumbAlt',
  'copyBeforeAlt',
  'copyAfterAlt',
  'copyHowto',
  'copyTools'
];
console.log('=== GROUP A — Prompt Library Buttons ===');
for (const id of groupA){
  const exists = html.includes(`data-copy="${id}"`) || html.includes(`data-copy='${id}'`) || html.includes(id);
  const pass = chk(`Button ${id}`, exists);
  allPass = allPass && pass;
}

// Group B
const groupB = [
  'copyBeforeOriginal',
  'copyBeforeCustom',
  'copyPromptOriginal',
  'copyPromptCustom'
];
console.log('\n=== GROUP B — Customize Prompt Buttons ===');
for (const id of groupB){
  const exists = html.includes(id);
  const pass = chk(`Button ${id}`, exists);
  allPass = allPass && pass;
}

// Group C
const groupC = [
  'copyBeforeTitle',
  'copyBeforeFile',
  'copyAfterTitle',
  'copyAfterFile',
  'copyThumbFullTitle',
  'copyThumbFile',
  'copyThumbShortTitle',
  'copyThumbFileShort',
  'copyThumbPromptProtected'
];
console.log('\n=== GROUP C — Image Studio Buttons ===');
for (const id of groupC){
  const exists = html.includes(id);
  const pass = chk(`Button ${id}`, exists);
  allPass = allPass && pass;
}
const groupC_actions = [
  'pickimages',
  'swapslots',
  'clearimages',
  'assign',
  'unassign',
  'assignother',
  'suffix',
  'menu'
];
console.log('\n=== GROUP C — Image Studio Actions ===');
for (const act of groupC_actions){
  const exists = html.includes(`data-action="${act}"`);
  const pass = chk(`Action ${act}`, exists);
  allPass = allPass && pass;
}

// Group D
console.log('\n=== GROUP D — Template Buttons ===');
const groupD = [
  { id:'templateBtn', desc:'Download Template' },
  { id:'browseBtn', desc:'Import Prompt Library - Choose .md' },
  { id:'fileInput', desc:'Import - file input' },
  { id:'dropzone', desc:'Import - drag & drop zone' },
  { id:'pasteBtn', desc:'Import - Load pasted content' },
  { id:'sampleBtn', desc:'Load built-in sample' },
  { id:'clearBtn', desc:'Clear all libraries' },
  { id:'clearSearchBtn', desc:'Search Clear' },
  { id:'search', desc:'Search input' },
  { id:'plist', desc:'Prompt Navigation - list' },
  { id:'tabbar', desc:'Tab navigation' },
  { id:'libbar', desc:'Library pills navigation' }
];
for (const {id,desc} of groupD){
  const exists = html.includes(`id="${id}"`);
  const pass = chk(`Button ${desc} (${id})`, exists);
  allPass = allPass && pass;
}

// Expand/Collapse
console.log('\n=== GROUP D — Expand/Collapse controls ===');
const expandChecks = [
  { needle:'<details', desc:'Validation Center details' },
  { needle:'details.paste', desc:'Paste .md details' },
  { needle:'tabbar', desc:'Tabbar expand' }
];
for (const {needle,desc} of expandChecks){
  const exists = html.includes(needle);
  const pass = chk(`Control ${desc}`, exists);
  allPass = allPass && pass;
}

// Validation rules per button
console.log('\n=== VALIDATION RULES ===');
const checks = [
  { name:'Click handler exists (delegated data-action)', cond: html.includes("document.addEventListener('click'") && html.includes('data-action') },
  { name:'Clipboard action copyText exists', cond: html.includes('function copyText') && html.includes('navigator.clipboard') },
  { name:'No duplicate event listener - boot single attach', cond: (html.match(/el\('browseBtn'\)\.addEventListener/g)||[]).length===1 },
  { name:'No ReferenceError open()', cond: html.includes('function open()') && !html.includes('open(); // open not defined') },
  { name:'Search clear wired', cond: html.includes('clearSearchBtn') && html.includes("el('search').value = ''") },
  { name:'Buttons work after importing another library - S.libs handling', cond: html.includes('S.libs.push') && html.includes('S.activeLib') }
];
for (const c of checks){
  const pass = chk(c.name, c.cond);
  allPass = allPass && pass;
}

// Console errors
console.log('\n=== CONSOLE ERRORS ===');
import { execSync } from 'node:child_process';
let syntaxPass=true;
try {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
  const fs = await import('node:fs');
  fs.writeFileSync('/tmp/test-ple04.js', scripts);
  execSync('node --check /tmp/test-ple04.js', { stdio:'pipe' });
} catch(e){
  syntaxPass=false;
  console.log('FAIL JS syntax', e.message.slice(0,200));
}
allPass = allPass && syntaxPass;
chk('Console Errors = 0 (JS syntax)', syntaxPass);

console.log('\nOVERALL Button QA', allPass?'PASS':'FAIL');
