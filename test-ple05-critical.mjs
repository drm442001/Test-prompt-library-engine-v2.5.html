import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const html = readFileSync('./prompt-library-engine-v2.5.2-enterprise.html','utf8');
const m = html.match(/var TEMPLATE_TEXT = \[([\s\S]*?)\]\.join/);
let template = vm.runInNewContext('var TEMPLATE_TEXT = ['+m[1]+'].join("\\n"); TEMPLATE_TEXT');

function chk(name, cond){
  console.log((cond?'PASS':'FAIL')+' '+name);
  return cond;
}
let pass=true;
pass = chk('HEADER Motion Graphics Studio branding', template.includes('Motion Graphics Studio branding')) && pass;
pass = chk('HEADER Mission', template.includes('Mission:')) && pass;
pass = chk('HEADER Template version', template.includes('Template version: v5.0')) && pass;
pass = chk('HEADER Category information', template.includes('Category information:')) && pass;

pass = chk('CATEGORY BLOCK', template.includes('CATEGORY BLOCK')) && pass;
pass = chk('CATEGORY SELECTOR', template.includes('CATEGORY SELECTOR')) && pass;
pass = chk('approved categories Photo Retouch', template.includes('Photo Retouch')) && pass;

pass = chk('REFERENCE LINKS', template.includes('REFERENCE LINKS')) && pass;
pass = chk('Blog link', template.includes('Blog link:')) && pass;
pass = chk('Engine reference', template.includes('Engine reference:')) && pass;
pass = chk('GitHub raw placeholder', template.includes('GitHub raw placeholder')) && pass;
pass = chk('Output filename instructions', template.includes('Output filename instructions')) && pass;
pass = chk('Before filename example', template.includes('Before.jpg')) && pass;

pass = chk('RULES', template.includes('## RULES')) && pass;
pass = chk('Rule 1', template.includes('Rule 1:')) && pass;
pass = chk('Rule 2', template.includes('Rule 2:')) && pass;
pass = chk('Rule 3', template.includes('Rule 3:')) && pass;
pass = chk('Rule 4', template.includes('Rule 4:')) && pass;
pass = chk('Rule 5', template.includes('Rule 5:')) && pass;
pass = chk('formatting instructions', template.includes('Formatting instructions:')) && pass;

pass = chk('APPROVED LABELS', template.includes('APPROVED LABELS')) && pass;
pass = chk('complete list', template.includes('No category removed') && template.includes('No labels removed')) && pass;

pass = chk('CHECKLIST', template.includes('## CHECKLIST')) && pass;
pass = chk('full checklist', template.includes('- [ ] 13 sections present')) && pass;

pass = chk('FINAL DELIVERY', template.includes('FINAL DELIVERY')) && pass;
pass = chk('output instructions', template.includes('Save file as')) && pass;

pass = chk('ADD NEW v2.5 FEATURES ONLY', template.includes('ADD NEW v2.5 FEATURES ONLY')) && pass;
pass = chk('Customize Prompt Rules', template.includes('Customize Prompt Rules')) && pass;
pass = chk('Step 4 variables', template.includes('Step 4 variables:')) && pass;
pass = chk('[] placeholders', template.includes('[] placeholders:')) && pass;
pass = chk('Custom Value support', template.includes('Custom Value support:')) && pass;

pass = chk('AI Tool Naming Rules', template.includes('AI Tool Naming Rules')) && pass;
pass = chk('ChatGPT Images', template.includes('ChatGPT Images')) && pass;
pass = chk('Adobe Firefly', template.includes('Adobe Firefly')) && pass;
pass = chk('Stable Diffusion', template.includes('Stable Diffusion')) && pass;
pass = chk('Midjourney', template.includes('Midjourney')) && pass;
pass = chk('Flux', template.includes('Flux')) && pass;
pass = chk('Leonardo', template.includes('Leonardo')) && pass;

pass = chk('Compatibility Rules', template.includes('Compatibility Rules')) && pass;
pass = chk('Accurate AI Tool Compatibility', template.includes('Accurate AI Tool Compatibility')) && pass;
pass = chk('No fake compatibility', template.includes('No fake compatibility')) && pass;

pass = chk('Search Description Rules', template.includes('Search Description Rules')) && pass;
pass = chk('120–150 chars', template.includes('120–150 chars') || template.includes('120-150 chars')) && pass;
pass = chk('Avoid unnecessary "2026"', template.includes('Avoid unnecessary "2026"')) && pass;

pass = chk('8K Rules', template.includes('8K Rules')) && pass;
pass = chk('Highest practical resolution', template.includes('highest practical resolution')) && pass;

pass = chk('13-section structure unchanged', template.includes('## Prompt #1') && template.includes('**1 · POST TITLE**') && template.includes('**13 · SEARCH DESCRIPTION**')) && pass;

console.log('\nOVERALL', pass?'PASS':'FAIL');
