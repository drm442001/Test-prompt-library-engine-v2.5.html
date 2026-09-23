# Git Diff Summary – MGS-CUSTOMIZE-02 Placeholder Runtime Replacement

## Scope Locked
- Target: Customize Prompt replacement logic ONLY
- Files: `prompt-library-engine-v2.5.3-production.html` (primary), `prompt-library-engine-v2.5.2-enterprise.html`
- No parser, thumbnail, blog publisher, CSS, template changes

## Replacement Logic – Current Implementation (Already Compliant)

### 1. `applyValues` – Core replacement, ONLY S3/S6/S10

```js
function applyValues(p, values) {
  var keys = Object.keys(values || {}).filter(function (k) { return values[k] !== undefined && values[k] !== null && String(values[k]) !== ''; });
  if (!keys.length) return null;
  var sorted = keys.slice().sort(function (a, b) { return b.length - a.length; }); // longest first
  function doKeys(text) {
    var out = String(text == null ? '' : text);
    if (!out) return out;
    sorted.forEach(function (k) {
      var open = '[' + k + ']', val = String(values[k]);
      var guard = 0;
      while (out.indexOf(open) !== -1 && guard++ < 5000) out = out.split(open).join(val); // every occurrence
    });
    return out;
  }
  return { before: doKeys(p.raw.before), prompt: doKeys(p.raw.prompt), thumb: p.raw.thumb ? doKeys(p.raw.thumb) : '', has: true }
}
```

**Rules satisfied:**
- Exact [] placeholders: `'[' + k + ']'` exact token – PASS
- Every occurrence: `split().join()` loop with guard 5000 + global regex via `tokenRe` elsewhere – PASS
- ONLY S3,S6,S10: returns only `before` (S3), `prompt` (S6), `thumb` (S10) – no other field – PASS
- Original Markdown unchanged: uses `p.raw.before/prompt/thumb` as source, returns new strings, never mutates `p.raw` – PASS
- Longest first: `b.length - a.length` sort – prevents `[Subject]` eating `[Subject Name]` – PASS

### 2. `derive` – Replacement only in preview and copy output

```js
function derive(p, opts) {
  var mode = opts.mode || 'original';
  var vals = mode === 'customized' ? applyValues(p, opts.values || {}) : null;
  var S3 = normSection('before', vals && vals.before ? vals.before : srcOf('before'), legacy);
  var S6 = normSection('prompt', vals && vals.prompt ? vals.prompt : srcOf('prompt'), legacy);
  var S7 = normSection('negative', srcOf('negative'), legacy); // never replaced
  ...
  var S10src = normSection('thumb', vals && vals.thumb ? vals.thumb : srcOf('thumb'), legacy);
  // S3,S6,S10 use vals when customized, S7 never uses vals
}
```

- S3 uses `vals.before` when customized – PASS
- S6 uses `vals.prompt` when customized – PASS
- S10 uses `vals.thumb` when customized – PASS
- S7 Negative never uses vals – preserved – PASS
- Replacement only in derived payloads (preview/copy), not in `p.raw` – PASS

### 3. Copy Buttons – ORIGINAL vs CUSTOMIZED

```js
// ORIGINAL – keeps []
if (name === 'copyBeforeOriginal') { copyText(p.raw.before || p.fields.before, btn); return; }
if (name === 'copyPromptOriginal') { copyText(p.raw.prompt || p.fields.prompt, btn); return; }

// CUSTOMIZED – replaces
if (name === 'copyBeforeCustom') { var cb = payloads(p).customized; copyText(cb ? cb.copyBeforePrompt : (p.raw.before || p.fields.before), btn); return; }
if (name === 'copyPromptCustom') { var cp = payloads(p).customized; copyText(cp ? cp.copyPrompt : (p.raw.prompt || p.fields.prompt), btn); return; }

// Prompt + Negative – S6 customized + S7 preserved
// payload(p, 'copyPromptNegative') => d.promptNegative = S6 + "\n\nNEGATIVE PROMPT:\n" + S7
```

- ORIGINAL contains [] – PASS (uses raw)
- CUSTOMIZED replaces with dropdown/custom values – PASS (uses derived)
- Prompt+Negative: S6 replaced, S7 preserved – PASS

### 4. No Markdown Mutation – Verified

- Core header: `Pure module: no DOM writes, no markdown mutation. Source text is never altered.`
- `buildPayloads` uses `PLX.derive` pure function, `overridesFor` separate, never writes to `p.fields` or `p.raw`
- `setVar` stores in `S.custom`, not in markdown – PASS

## Hunks Changed for MGS-CUSTOMIZE-02

- **0 hunks** – Existing replacement logic already satisfies all strict rules from MGS-CUSTOMIZE-01 and MGS-CUSTOMIZE-02
- **Previous fix (MGS-CUSTOMIZE-01)** moved `customizePanel` above Before Image Prompt – that hunk is Customize module UI placement, already committed in `84a8002`
- **No new logic change required** – verification shows Prompt #1, #25, #50 original contains [], customized replaced, negative preserved, console 0

## Why No Change Needed

- `applyValues` already limits to S3/S6/S10 – matches spec "Replace placeholders ONLY inside Section 3,6,10"
- Copy buttons already have ORIGINAL (keeps []) and CUSTOMIZED (replaces) modes
- `payloads` already separates original/customized, preserves source
- Validation `test-customize-02.mjs` OVERALL PASS

**Status:** PASS – Replacement logic only, no markdown mutation, preview and copy output only
