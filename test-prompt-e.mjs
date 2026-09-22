import { readFileSync } from 'node:fs';
const html = readFileSync('./prompt-library-engine-v2.5.2-enterprise.html','utf8');
const m = html.match(/var TEMPLATE_TEXT = \[([\s\S]*?)\]\.join/);
if (!m) { console.error('TEMPLATE_TEXT not found'); process.exit(1); }
// Evaluate the array safely: we know it's an array of strings joined by \n
// Extract by evaluating in VM
import vm from 'node:vm';
let template = '';
try {
  const code = 'var TEMPLATE_TEXT = [' + m[1] + '].join("\\n"); TEMPLATE_TEXT';
  template = vm.runInNewContext(code);
} catch(e){
  console.error('eval failed', e);
  process.exit(1);
}

let pass=true;
function chk(name, cond, info=''){
  if(!cond){ pass=false; console.log('FAIL', name, info); } else console.log('PASS', name);
}

chk('contains old header', template.includes('PROMPT LIBRARY TEMPLATE v5.0'), '');
chk('contains Every prompt must follow these 13 sections', template.includes('Every prompt must follow these 13 sections'), '');
chk('contains legacy 9-section', template.includes('legacy 9-section'), '');
chk('contains Section 1 POST TITLE 50-60 chars (2026)', template.includes('POST TITLE') && template.includes('50-60 characters') && template.includes('(2026)'), '');
chk('contains Section 2 INTRODUCTION 2-3 sentences 40-60 words', template.includes('INTRODUCTION') && template.includes('40-60 words'), '');
chk('contains Section 3 BEFORE IMAGE PROMPT PROBLEM/RAW 3:2 [Variable]', template.includes('BEFORE IMAGE PROMPT') && template.includes('PROBLEM/RAW') && template.includes('3:2') && template.includes('[Variable]'), '');
chk('contains Section 4 ALT TEXT THUMBNAIL 1200x630 max 125', template.includes('ALT TEXT - THUMBNAIL') && template.includes('1200x630') && template.includes('125 characters'), '');
chk('contains Section 5 ALT TEXT BEFORE/AFTER', template.includes('ALT TEXT - BEFORE / AFTER'), '');
chk('contains Section 6 PROMPT minimum 100 words Every Step 4 variable', template.includes('MAIN AI PROMPT') && template.includes('100 words') && template.includes('Every Step 4 variable'), '');
chk('contains Section 7 NEGATIVE PROMPT minimum 30 words', template.includes('NEGATIVE PROMPT') && template.includes('30 words'), '');
chk('contains Section 8 COMPATIBLE AI TOOLS Recommended Suitable Limited engine never invents', template.includes('COMPATIBLE AI TOOLS') && template.includes('Recommended') && template.includes('engine never invents'), '');
chk('contains Section 9 HOW TO USE Step 4 Customize', template.includes('HOW TO USE') && template.includes('Step 4') && template.includes('Customize'), '');
chk('contains Section 10 THUMBNAIL IMAGE GENERATOR Optional fallback', template.includes('THUMBNAIL IMAGE GENERATOR') && template.includes('fallback'), '');
chk('contains Section 11 LABELS Primary category first max 5', template.includes('LABELS') && template.includes('Primary category first') && template.includes('max 5'), '');
chk('contains Section 12 PERMALINK lowercase-hyphenated-slug', template.includes('PERMALINK') && template.includes('lowercase-hyphenated-slug'), '');
chk('contains Section 13 SEARCH DESCRIPTION 120-150', template.includes('SEARCH DESCRIPTION') && template.includes('120-150'), '');

// New required sections
chk('contains CATEGORY SELECTOR', template.includes('CATEGORY SELECTOR'), '');
chk('contains APPROVED LABELS', template.includes('APPROVED LABELS'), '');
chk('contains RULES old template rules', template.includes('RULES') && template.includes('Rule 1:'), '');
chk('contains CHECKLIST', template.includes('CHECKLIST'), '');
chk('contains TEMPLATE INSTRUCTIONS', template.includes('TEMPLATE INSTRUCTIONS'), '');
chk('contains HELP TEXT', template.includes('HELP TEXT'), '');
chk('contains CUSTOMIZE PROMPT SUPPORT new', template.includes('CUSTOMIZE PROMPT SUPPORT') || template.includes('Customize Prompt'), '');
chk('contains new Customize Prompt details dropdown Custom Value', template.includes('Custom Value') && template.includes('dropdown'), '');
chk('contains 5 required copy buttons mention', template.includes('Copy Original Prompt') && template.includes('Copy Customized Prompt'), '');
chk('contains Step 4 format -> [VARIABLE]', template.includes('-> [SUBJECT TYPE]') || template.includes('-> [Variable Name]'), '');
chk('contains Photo Retouch category', template.includes('Photo Retouch'), '');
chk('contains Photo Cleaning', template.includes('Photo Cleaning'), '');
chk('contains Color Grading', template.includes('Color Grading'), '');
chk('contains Wedding Edit', template.includes('Wedding Edit'), '');

console.log('\nTemplate length', template.length);
console.log('OVERALL', pass?'PASS':'FAIL');
