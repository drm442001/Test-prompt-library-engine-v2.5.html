# Git Diff Summary – MGS-THUMBNAIL-01 Thumbnail Generator Production Fix

## Scope Locked
- Target: Thumbnail Generator module ONLY
- Files: `prompt-library-engine-v2.5.3-production.html` (primary), `prompt-library-engine-v2.5.2-enterprise.html`
- No parser, customize replacement logic, blog publisher, CSS, template changes (template already upgraded in MGS-TEMPLATE-01)

## Thumbnail Module – Current Implementation (Already Compliant)

### PART A — STYLE PRESETS

```js
var PRESET_NAMES = { premium_dark: 'Premium Dark', cinematic_gold: 'Cinematic Gold', neon_purple: 'Neon Purple', minimal_clean: 'Minimal Clean' };

var THUMB_TEMPLATES = {
  premium_dark: 'Create a professional YouTube/blog thumbnail image, EXACT size {{SIZE}} pixels, {{FORMAT}} format.\n\nTITLE: "{{PROMPT_TITLE}}"\n\nLAYOUT (Left 40% | Right 60% split):... FIRST attached image = BEFORE ... SECOND attached image = AFTER ...',
  cinematic_gold: 'Create a cinematic gold dramatic thumbnail, EXACT size {{SIZE}} pixels, {{FORMAT}} format.\n\nTITLE: "{{PROMPT_TITLE}}"\n\nLAYOUT:... FIRST attached image = BEFORE ... SECOND attached image = AFTER ...',
  neon_purple: 'Create a neon purple vibrant thumbnail image, EXACT size {{SIZE}} pixels, {{FORMAT}} format.\n\nTITLE: "{{PROMPT_TITLE}}"\n\nLAYOUT (Top title bar + Full-width before/after below):... FIRST attached image = BEFORE ... SECOND attached image = AFTER ...',
  minimal_clean: 'Create a minimalist clean professional thumbnail, EXACT size {{SIZE}} pixels, {{FORMAT}} format.\n\nTITLE: "{{PROMPT_TITLE}}"\n\nLAYOUT:... FIRST attached image = BEFORE ... SECOND attached image = AFTER ...'
};

function derive(p, opts){
  var preset = opts.preset || 'premium_dark';
  if(opts.allowPreset !== false){
    var tpl = THUMB_TEMPLATES[preset] || THUMB_TEMPLATES.premium_dark;
    thumb = tpl.split('{{PROMPT_TITLE}}').join(title).replace(/{{SIZE}}/g, CFG.thumbSize) // 1200x630
      .replace(/{{FORMAT}}/g, fmtLabel()).split('{{YEAR}}').join(CFG.year)
      .split('{{FEATURE_1}}').join(feats[0])...
  }
}
```

**Selecting preset regenerates Thumbnail Prompt:**
```js
function loadPreset(){
  var v = LS.get(C.lsPresetKey) || LS.get(C.lsPresetLegacyKey);
  if(v && PLX.THUMB_TEMPLATES[v]) S.preset = v;
}
document.addEventListener('change', function(e){
  if(n.dataset && n.dataset.action === 'preset'){
    S.preset = n.value; LS.set(C.lsPresetKey, n.value);
    S.dirty = {library:true, image:true, publisher:true}; touchAll(); render();
  }
});
function presetRowHTML(p){
  return '<select id="preset-'+escA(p.uid)+'" data-action="preset">'
    + Object.keys(PLX.THUMB_TEMPLATES).map(k=>'<option value="'+escA(k)+'"'+(k===S.preset?' selected':'')+'>'+escT(PRESET_NAMES[k])+'</option>').join('')
    + '</select>';
}
```
- Preset change → S.preset updated → derive regenerates thumb from template → render → PASS

### PART B — SHORT TITLE

```js
function shortTitle(title){
  var t = trim(String(title));
  var yearTail = '';
  var ym = /\s*\((\d{4})\)\s*$/.exec(t);
  if(ym){ yearTail = ' ('+ym[1]+')'; t = t.slice(0, ym.index); }
  var out = t.split(/\s+/).filter(Boolean).map(function(tok){
    if(/^[-/:;.,!?'\"()\[\]{}–—·•|]+$/.test(tok)) return '';
    var parts = tok.split(/[-/–—_]+/).filter(function(x){ return /[A-Za-z0-9\u0900-\u097F]/.test(x) || x.length===1; });
    if(!parts.length) return '';
    if(parts.length>1) return parts.map(function(x){ return x.charAt(0).toUpperCase(); }).join('-');
    return tok.charAt(0).toUpperCase();
  }).filter(Boolean).join(' ');
  if(!out) out = trim(t).charAt(0).toUpperCase();
  return out + yearTail;
}
function filenames(p, cfg, shortMode){
  var n = String(p.num || '');
  var base = shortMode ? shortTitle(p.fields.title) : p.fields.title; // Full unchanged, Short auto
  var suf = cfg.suffix || CFG.defaultSuffix;
  return {
    before: sanitizeFileName((n ? n+' ' : '') + base + ' Before.' + cfg.ext),
    after: sanitizeFileName((n ? n+' ' : '') + base + ' After.' + cfg.ext),
    thumb: sanitizeFileName((n ? n+' ' : '') + base + suf)
  };
}
```

- Full Title: `filenames(..., false)` → base = `p.fields.title` → `1 Professional High-End Skin Retouching Prompt (2026)_cover.jpg` – PASS unchanged
- Short Title: `filenames(..., true)` → base = `shortTitle(title)` → `P H-E S R P (2026)` → `1 P H-E S R P (2026)_cover.jpg` – PASS spec example exact match
- Suffix dropdown preserved:
```js
var CFG = { coverSuffixes: ['_cover.jpg',' cover.jpg','-cover.jpg',' thumb.jpg','_thumb.jpg','-thumb.jpg'], defaultSuffix:'_cover.jpg' }
function suffixMenuHTML(p){
  var cur = p.suffix || C.defaultSuffix;
  var items = C.coverSuffixes.map(s=>'<li><button data-action="suffix" data-suffix="'+escA(s)+'" aria-checked="'+String(s===cur)+'">'+escT(s)+'</button></li>').join('');
  return '<div class="menu"><button data-action="menu">Thumbnail suffix: '+escT(cur)+'</button><ul class="menu-list" hidden>'+items+'</ul></div>';
}
```
- Selecting suffix updates `p.suffix` → `filenames` uses new suffix → both Full and Short preserve suffix – PASS

### PART C — BEFORE / AFTER PROTECTION

```js
function detectRole(name){
  var base0 = trim(String(name).replace(/^.*[\\/]/, ''));
  var m = /^(.*?)(Before|After)\.(jpe?g|webp|png)$/i.exec(base0);
  if(m){ return {role:m[2].toLowerCase(), confident:true, label:m[2].toUpperCase(), base:trim(m[1].replace(/[.\s_-]+$/,''))}; }
  var tm = /^(.*?)(?:thumb|thumbnail|cover|hero)\.(jpe?g|webp|png)$/i.exec(base0);
  if(tm) return {role:'thumb', confident:true, label:'THUMBNAIL', base:trim(tm[1].replace(/[.\s_-]+$/,''))};
  return {role:'unknown', confident:false, label:'SOURCE ROLE NOT DETECTED', base:base0.replace(/\.[^.]+$/,'')};
}

var PROTECTION = [
  'SOURCE IMAGE PROTECTION (mandatory):',
  'Use supplied Before image exactly as BEFORE source.',
  'Use supplied After image exactly as AFTER source.',
  'Do not enhance either image.',
  'Do not retouch either image.',
  'Do not recolor either image.',
  'Do not regenerate either image.',
  'Do not swap image positions.',
  'Only create thumbnail composition around supplied images.'
].join('\n');

function derive(...){
  ...
  thumbWithProtection: (function(){
    var v = String(thumb || '');
    if(/SOURCE IMAGE PROTECTION/i.test(v)) return v;
    return v ? (v + '\n\n' + PROTECTION) : PROTECTION;
  })()
}

function wrapP(txt){
  var v = String(txt || '');
  if(/SOURCE IMAGE PROTECTION/i.test(v)) return v;
  return v ? (v + '\n\n' + PLX.PROTECTION) : PLX.PROTECTION;
}
```

- Detect filenames ending with Before/After – PASS – strict regex `/^(.*?)(Before|After)\.(jpe?g|webp|png)$/i`, case-insensitive, confident true, base trimmed
- Append protection rule once – PASS – checks `/SOURCE IMAGE PROTECTION/i.test(v)` before appending, count =1
- Never swap roles – PASS – template order `FIRST attached image = BEFORE` then `SECOND attached image = AFTER`, protection says `Do not swap image positions`, derive never swaps, role detection from filename not upload order
- Never modify supplied images – PASS – protection contains `Do not enhance`, `Do not retouch`, `Do not recolor`, `Do not regenerate`, `Use supplied ... exactly as ... source`, `Only create thumbnail composition around supplied images`

## Hunks Changed for MGS-THUMBNAIL-01

- **0 hunks** – Existing thumbnail module already satisfies all strict rules from MGS-THUMBNAIL-01
- Previous fixes:
  - MGS-CUSTOMIZE-01 moved customizePanel above Before (LOCKED UI)
  - MGS-CUSTOMIZE-02 placeholder replacement ONLY S3/S6/S10
  - MGS-TEMPLATE-01 upgraded template to v5.0 with new rules including resolution rule exact phrase
- Thumbnail module verified: 4 presets functional, selecting preset regenerates, Full Title unchanged, Short Title auto `P H-E S R P (2026)`, suffix dropdown preserved, Before/After detection, protection once, never swap, never modify

## Validation of No Side Effects

- Parser untouched
- Customize module untouched (still above Before)
- Blog Publisher untouched
- Template generator already upgraded in previous patch, no new change needed
- JS syntax `node --check` PASS
- `test-thumbnail-01.mjs` OVERALL PASS

**Status:** PASS – Thumbnail module only, production fix verified
