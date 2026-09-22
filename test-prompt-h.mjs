import { readFileSync } from 'node:fs';
const html = readFileSync('./prompt-library-engine-v2.5.2-enterprise.html','utf8');

function chk(name, cond, info=''){
  console.log((cond?'PASS':'FAIL')+' '+name, info||'');
  return cond;
}
let pass=true;

// Check renderImageTab order - PLE-08 locked layout 6 sections
const renderMatch = html.match(/function renderImageTab\(\) \{([\s\S]*?)wrap\.innerHTML = out\.join/);
if (!renderMatch){ console.error('renderImageTab not found'); process.exit(1); }
const body = renderMatch[1];

// Find order of labels - tolerant for \u00b7 escaped or · char
const order = [];
const re = /label:\s*['"](\d)\s*(?:·|\\u00b7|\\u00b7)\s*([^'"]+)['"]/g;
let m;
while((m=re.exec(body))!==null){
  order.push({num: parseInt(m[1]), label: m[2].trim()});
}
console.log('Detected order:', order.map(o=>`${o.num}·${o.label}`).join(' -> '));

pass = chk('has 6 sections in order per PLE-08', order.length===6, `got ${order.length}`) && pass;
if (order.length===6){
  pass = chk('1 Prompt Title', /Prompt Title/.test(order[0].label), `got ${order[0].label}`) && pass;
  pass = chk('2 Before Image Prompt', /Before/.test(order[1].label), `got ${order[1].label}`) && pass;
  pass = chk('3 Main Prompt', /Main Prompt/.test(order[2].label), `got ${order[2].label}`) && pass;
  pass = chk('4 Negative Prompt', /Negative Prompt/.test(order[3].label), `got ${order[3].label}`) && pass;
  pass = chk('5 Buttons', /Buttons/.test(order[4].label), `got ${order[4].label}`) && pass;
  pass = chk('6 Thumbnail', /Thumbnail/.test(order[5].label), `got ${order[5].label}`) && pass;
}

// Check no side-by-side cards: should not have grid-template-columns with auto-fit in thumbPreviewHTML for Image Studio
pass = chk('uses vflow vertical container', body.includes('vflow'), '') && pass;

const thumbPreviewMatch = html.match(/function thumbPreviewHTML[\s\S]*?return out\.join/);
if (thumbPreviewMatch){
  const tp = thumbPreviewMatch[0];
  pass = chk('thumbPreviewHTML uses flex column not grid auto-fit', tp.includes('flex-direction:column') && !tp.includes('repeat(auto-fit'), '') && pass;
} else {
  console.log('FAIL thumbPreviewHTML not found');
  pass=false;
}

pass = chk('renderImageTab does not use laneHTML side-by-side', !body.includes('laneHTML'), '') && pass;
pass = chk('vflow CSS is column', html.includes('.vflow{display:flex;flex-direction:column'), '') && pass;

// Check Customize above Section 2
const idxCustom = body.indexOf('Customize Prompt');
const idx2 = body.indexOf('2 \\u00b7 Before Image Prompt') !== -1 ? body.indexOf('2 \\u00b7 Before Image Prompt') : body.indexOf('2 · Before');
pass = chk('Customize above Section 2', idxCustom !== -1 && idxCustom < idx2, '') && pass;

// Check buttons per PLE-08
pass = chk('Section 2 has Copy Before Image Title', body.includes('Copy Before Image Title')) && pass;
pass = chk('Section 5 has Copy After Image Title', body.includes('Copy After Image Title')) && pass;
pass = chk('Section 6 has Copy Thumbnail Full Title', body.includes('Copy Thumbnail Full Title')) && pass;
pass = chk('Section 6 has Copy Thumbnail Short Title', body.includes('Copy Thumbnail Short Title')) && pass;

console.log('\nOVERALL', pass?'PASS':'FAIL');
