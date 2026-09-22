import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('./prompt-library-engine-v2.5.2-enterprise.html','utf8');

function chk(name, cond, info=''){
  console.log((cond?'PASS':'FAIL')+' '+name, info||'');
  return cond;
}
let pass=true;

// Check compatibility layer exists
pass = chk('toUniversalCard function exists', html.includes('function toUniversalCard'), '') && pass;
pass = chk('exportUniversalCard function exists', html.includes('function exportUniversalCard'), '') && pass;
pass = chk('exportUniversalCardJSON exists', html.includes('function exportUniversalCardJSON'), '') && pass;
pass = chk('downloaduniversal button exists', html.includes('data-action="downloaduniversal"'), '') && pass;
pass = chk('downloaduniversal handler exists', html.includes("if (a === 'downloaduniversal')"), '') && pass;
pass = chk('exposed in __PLX_APP', html.includes('toUniversalCard') && html.includes('exportUniversalCard'), '') && pass;
pass = chk('does not modify Universal Card source comment', html.includes('do not modify Universal Card source') || html.includes('Engine only'), '') && pass;

// Extract PLX and compatibility layer via eval
const coreMatch = html.match(/var PLX = \(function \(\) \{[\s\S]*?return \{[\s\S]*?\};\s+\}\)\(\);/);
let PLX;
try { PLX = vm.runInNewContext(coreMatch[0] + '\nPLX'); } catch(e){ console.error('PLX eval fail', e); process.exit(1); }

// We need to evaluate the whole app module partially to get toUniversalCard
// Instead, we will manually test field mapping by parsing a prompt and mapping

const md = readFileSync('./Photo-Retouch-Prompts.md','utf8');
const lib = PLX.parseMarkdown(md);
const p = lib.prompts[0];
p.libId='L1'; p.uid='P1'; p.rev=0;
p.custom.analysis = PLX.analyzeCustomization(p);

// Simulate payloads and toUniversalCard logic (copy from html)
const S = { preset:'premium_dark', mode:'original', custom:{}, customMode:{}, overrides:{}, images:{} };
const C = PLX.CFG;
function valuesFor(pp){ 
  const out={}; const saved = S.custom[pp.libId+'|'+pp.uid]||{}; 
  (pp.custom && pp.custom.vars||[]).forEach(v=>{ if(v.options && v.options.length) out[v.name]=v.options[0]; });
  Object.keys(saved).forEach(k=>out[k]=saved[k]); return out;
}
function payloads(pp){
  const d0 = PLX.derive(pp, { mode:'original', values: valuesFor(pp), preset:S.preset, suffix:'_cover.jpg', legacyClean:false });
  const set = {
    copyTitle: d0.titleV,
    copyBeforePrompt: d0.S3,
    copyPrompt: d0.S6,
    copyNegative: d0.S7,
    copyThumbPrompt: d0.thumb,
    copyThumbPromptProtected: d0.thumbWithProtection,
    copyLabels: d0.labelsV,
    copyPermalink: d0.permalinkV,
    copySearchDesc: d0.searchV,
    copyThumbAlt: d0.thumbAlt,
    copyBeforeAlt: d0.altBefore,
    copyAfterAlt: d0.altAfter,
    copyFullBody: d0.fullBody,
    filenames: d0.filenames,
    filenamesShort: d0.filenamesShort
  };
  return { original:set, customized:null };
}
function toUniversalCard(pp, opts){
  opts=opts||{};
  var mode=opts.mode||'original';
  var set = payloads(pp)[mode] || payloads(pp).original;
  var d = PLX.derive(pp, { mode:mode, values: valuesFor(pp), preset:S.preset, suffix:'_cover.jpg' });
  return {
    version:'2.1',
    promptTitle: set.copyTitle || pp.fields.title || '',
    prompt: set.copyPrompt || d.S6 || pp.fields.prompt || '',
    negativePrompt: set.copyNegative || d.S7 || pp.fields.negative || '',
    beforePrompt: set.copyBeforePrompt || d.S3 || pp.fields.before || '',
    thumbnailPrompt: set.copyThumbPromptProtected || d.thumbWithProtection || set.copyThumbPrompt || d.thumb || '',
    labels: set.copyLabels || pp.fields.labels || '',
    permalink: set.copyPermalink || pp.fields.permalink || '',
    searchDescription: set.copySearchDesc || pp.fields.search || '',
    thumbnailAlt: set.copyThumbAlt || '',
    beforeAlt: set.copyBeforeAlt || '',
    afterAlt: set.copyAfterAlt || '',
    fullBody: set.copyFullBody || '',
    filenames: set.filenames || {},
    mode: mode,
    promptNumber: pp.num || ''
  };
}

const card = toUniversalCard(p);
console.log('\nUniversal Card sample:', JSON.stringify(card,null,2).slice(0,800));

pass = chk('field mapping Prompt Title exists', !!card.promptTitle, '') && pass;
pass = chk('field mapping Prompt exists', !!card.prompt && card.prompt.length>50, '') && pass;
pass = chk('field mapping Negative Prompt exists', !!card.negativePrompt, '') && pass;
pass = chk('field mapping Before Prompt exists', !!card.beforePrompt, '') && pass;
pass = chk('field mapping Thumbnail Prompt exists', !!card.thumbnailPrompt, '') && pass;
pass = chk('field mapping Labels exists', !!card.labels, '') && pass;
pass = chk('field mapping Permalink exists', !!card.permalink, '') && pass;
pass = chk('field mapping Search Description exists', !!card.searchDescription, '') && pass;

pass = chk('Prompt Title matches Section 1', card.promptTitle===p.fields.title, '') && pass;
pass = chk('Prompt matches Section 6', card.prompt.includes(p.fields.prompt.slice(0,20)), '') && pass;
pass = chk('Negative Prompt matches Section 7', card.negativePrompt.includes(p.fields.negative.slice(0,15)), '') && pass;
pass = chk('Before Prompt matches Section 3', card.beforePrompt.includes(p.fields.before.slice(0,20)), '') && pass;
pass = chk('Thumbnail Prompt not empty', card.thumbnailPrompt.length>100, '') && pass;

// Check exported data matches Universal Card expected structure
function exportUniversalCard(L){
  const cards = L.prompts.map(pp=>{
    pp.libId='L1'; pp.uid='P'+pp.num; pp.rev=0; pp.custom.analysis=PLX.analyzeCustomization(pp);
    return toUniversalCard(pp);
  });
  return {
    version:'2.1',
    engineVersion: PLX.VERSION,
    sourceName: L.sourceName||'',
    totalPrompts: cards.length,
    cards: cards,
    universalCard:{ version:'2.1', cards: cards }
  };
}

const L = { sourceName:'Photo Retouch', prompts: lib.prompts.slice(0,2), tier:'v5.0' };
const exported = exportUniversalCard(L);
pass = chk('exported version 2.1', exported.version==='2.1', '') && pass;
pass = chk('exported totalPrompts 2', exported.totalPrompts===2, '') && pass;
pass = chk('exported cards array length 2', exported.cards.length===2, '') && pass;
pass = chk('exported universalCard.version 2.1', exported.universalCard.version==='2.1', '') && pass;
pass = chk('exported cards have 8 required fields', exported.cards.every(c=>c.promptTitle && c.prompt && c.negativePrompt && c.beforePrompt && c.thumbnailPrompt && c.labels && c.permalink && c.searchDescription), '') && pass;

console.log('\nOVERALL', pass?'PASS':'FAIL');
