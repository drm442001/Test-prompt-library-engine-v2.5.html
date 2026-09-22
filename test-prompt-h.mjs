import { readFileSync } from 'node:fs';
const html = readFileSync('./prompt-library-engine-v2.5.2-enterprise.html','utf8');

function chk(name, cond, info=''){
  console.log((cond?'PASS':'FAIL')+' '+name, info||'');
  return cond;
}
let pass=true;

// Check renderImageTab order
const renderMatch = html.match(/function renderImageTab\(\) \{([\s\S]*?)wrap\.innerHTML = out\.join/);
if (!renderMatch){ console.error('renderImageTab not found'); process.exit(1); }
const body = renderMatch[1];

// Find order of labels
const order = [];
const re = /label:\s*['"](\d)\s*·\s*([^'"]+)['"]/g;
let m;
while((m=re.exec(body))!==null){
  order.push({num: parseInt(m[1]), label: m[2].trim()});
}
console.log('Detected order:', order.map(o=>`${o.num}·${o.label}`).join(' -> '));

pass = chk('has 5 sections in order', order.length===5, `got ${order.length}`) && pass;
if (order.length===5){
  pass = chk('1 Prompt Title', /Prompt Title/.test(order[0].label), `got ${order[0].label}`) && pass;
  pass = chk('2 Before Prompt', /Before Prompt/.test(order[1].label), `got ${order[1].label}`) && pass;
  pass = chk('3 Main Prompt', /Main Prompt/.test(order[2].label), `got ${order[2].label}`) && pass;
  pass = chk('4 Negative Prompt', /Negative Prompt/.test(order[3].label), `got ${order[3].label}`) && pass;
  pass = chk('5 Thumbnail Prompt', /Thumbnail Prompt/.test(order[4].label), `got ${order[4].label}`) && pass;
}

// Check no side-by-side cards: should not have grid-template-columns with auto-fit in thumbPreviewHTML for Image Studio
// And should have vflow (vertical)
pass = chk('uses vflow vertical container', body.includes('vflow'), '') && pass;

// Check thumbPreviewHTML vertical
const thumbPreviewMatch = html.match(/function thumbPreviewHTML[\s\S]*?return out\.join/);
if (thumbPreviewMatch){
  const tp = thumbPreviewMatch[0];
  pass = chk('thumbPreviewHTML uses flex column not grid auto-fit', tp.includes('flex-direction:column') && !tp.includes('repeat(auto-fit'), '') && pass;
} else {
  console.log('FAIL thumbPreviewHTML not found');
  pass=false;
}

// Check no laneHTML side-by-side usage in renderImageTab (should not use laneHTML)
pass = chk('renderImageTab does not use laneHTML side-by-side', !body.includes('laneHTML'), '') && pass;

// Check Desktop, Tablet, Mobile same workflow order – vflow is single column always, no media query changing order
// The CSS has @media (max-width:900px) that changes layout grid but vflow remains column
pass = chk('vflow CSS is column', html.includes('.vflow{display:flex;flex-direction:column'), '') && pass;

// Check that old Before Title / After Title removed from main workflow (they were side file name sections)
pass = chk('Before Title not in main vertical order (removed)', !body.includes('Before Title'), '') && pass;
pass = chk('After Title not in main vertical order (removed)', !body.includes('After Title'), '') && pass;

console.log('\nOVERALL', pass?'PASS':'FAIL');
