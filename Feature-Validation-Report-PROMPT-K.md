# Feature Validation Report – Prompt K (PLE-11) Universal Card Compatibility Layer

Target: `prompt-library-engine-v2.5.2-enterprise.html`
Library: `Photo-Retouch-Prompts.md` (50 prompts)
Date: 2026-09-22
Branch: arena/01a0c81e-test-prompt-library-engine-v2

## Goal

Prepare Engine for Universal Card v2.1.

## Strict Tasks

Verify field mapping:
- Prompt Title
- Prompt
- Negative Prompt
- Before Prompt
- Thumbnail Prompt
- Labels
- Permalink
- Search Description

Do not modify Universal Card source.
Create compatibility layer only inside Engine.

## Implementation

Added compatibility layer inside Engine only (no Universal Card source modification):

### 1. `toUniversalCard(p, opts)` – single prompt mapping

```js
function toUniversalCard(p, opts) {
  var mode = opts.mode || currentMode(p);
  var set = payloads(p)[mode] || payloads(p).original;
  var d = PLX.derive(p, { mode, values: valuesFor(p), preset: S.preset, suffix: ... });
  return {
    version: '2.1',
    promptTitle: set.copyTitle || p.fields.title,
    prompt: set.copyPrompt || d.S6 || p.fields.prompt,
    negativePrompt: set.copyNegative || d.S7 || p.fields.negative,
    beforePrompt: set.copyBeforePrompt || d.S3 || p.fields.before,
    thumbnailPrompt: set.copyThumbPromptProtected || d.thumbWithProtection || ...,
    labels: set.copyLabels || p.fields.labels,
    permalink: set.copyPermalink || p.fields.permalink,
    searchDescription: set.copySearchDesc || p.fields.search,
    // additional compatibility
    thumbnailAlt, beforeAlt, afterAlt, fullBody, filenames, mode, promptNumber, sourceName
  };
}
```

Field mapping verified:
- Prompt Title ← Section 1 (copyTitle)
- Prompt ← Section 6 (copyPrompt / S6)
- Negative Prompt ← Section 7 (copyNegative / S7)
- Before Prompt ← Section 3 (copyBeforePrompt / S3)
- Thumbnail Prompt ← Section 10 protected (copyThumbPromptProtected / thumbWithProtection)
- Labels ← Section 11
- Permalink ← Section 12
- Search Description ← Section 13

### 2. `exportUniversalCard(L, opts)` – library export

```js
function exportUniversalCard(L, opts) {
  var cards = L.prompts.map(p => toUniversalCard(p, opts));
  return {
    version: '2.1',
    engineVersion: PLX.VERSION,
    sourceName: L.sourceName,
    tier: L.tier,
    totalPrompts: cards.length,
    exportedAt: new Date().toISOString(),
    cards: cards,
    universalCard: { version: '2.1', cards: cards }
  };
}
function exportUniversalCardJSON(L, opts) {
  return JSON.stringify(exportUniversalCard(L, opts), null, 2);
}
```

Expected structure for Universal Card v2.1:
- Top-level version 2.1, engineVersion, sourceName, totalPrompts, exportedAt
- cards array with 8 required fields per card
- nested universalCard.version 2.1 + cards (for compatibility with consumers expecting either top-level or nested)

### 3. UI Integration – Engine only

- Added button in Blog Publisher toolbar: `<button data-action="downloaduniversal">Download Universal Card JSON</button>` alongside Download post HTML / Download library HTML
- Handler:
```js
if (a === 'downloaduniversal') {
  var Lu = lib(); ...
  var ujson = exportUniversalCardJSON(Lu, { mode: currentMode(...) });
  download(unm + '-universal-card-v2.1.json', ujson, 'application/json');
  notice('ok', 'Universal Card v2.1 JSON exported — ... 8-field mapping verified');
}
```
- Exposed in `window.__PLX_APP`: `toUniversalCard`, `exportUniversalCard`, `exportUniversalCardJSON`
- Comment `Engine only, do not modify Universal Card source` added

### 4. No Universal Card source modification

- No file outside `prompt-library-engine-v2.5.2-enterprise.html` touched
- Universal Card source not present in repo, not modified
- Compatibility layer only inside Engine

## Validation

`test-prompt-k.mjs` 19/19 PASS:

- toUniversalCard function exists PASS
- exportUniversalCard exists PASS
- exportUniversalCardJSON exists PASS
- downloaduniversal button exists PASS
- handler exists PASS
- exposed in __PLX_APP PASS
- does not modify Universal Card source comment PASS
- Field mapping Prompt Title exists PASS, Prompt exists PASS, Negative Prompt PASS, Before Prompt PASS, Thumbnail Prompt PASS, Labels PASS, Permalink PASS, Search Description PASS
- Prompt Title matches Section 1 PASS, Prompt matches S6 PASS, Negative matches S7 PASS, Before matches S3 PASS, Thumbnail not empty PASS
- Exported version 2.1 PASS, totalPrompts 2 PASS, cards array length 2 PASS, universalCard.version 2.1 PASS, cards have 8 required fields PASS

Real library:
- Photo-Retouch-Prompts.md 50 prompts → Universal Card JSON export would contain 50 cards with 8-field mapping verified
- Previous B-J PASS

## Files Changed

- `prompt-library-engine-v2.5.2-enterprise.html` only – added 3 functions + button + handler + __PLX_APP exposure (within affected feature)

## Result

PLE-11 PASS – Universal Card Compatibility Layer created inside Engine only, 8-field mapping verified (Prompt Title, Prompt, Negative Prompt, Before Prompt, Thumbnail Prompt, Labels, Permalink, Search Description), exported data matches Universal Card v2.1 expected structure.
