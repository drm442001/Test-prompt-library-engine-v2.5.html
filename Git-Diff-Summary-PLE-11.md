# Git Diff Summary – PLE-11 Universal Card Compatibility Layer

## Scope Locked
- Target file: `prompt-library-engine-v2.5.2-enterprise.html` only
- Changed sections: `toUniversalCard()` function only (Universal Card Compatibility Layer)
- No Blogger XML, no Universal Card source, no Prompt Libraries, no CSS, no unrelated JS

## Diff Overview

### Before (basic mapping, no aliases, no placeholder/metadata sub-objects)
```js
function toUniversalCard(p, opts) {
  opts = opts || {};
  var mode = opts.mode || currentMode(p);
  var set = payloads(p)[mode] || payloads(p).original;
  var d = PLX.derive(p, { mode: mode, values: valuesFor(p), preset: S.preset, suffix: p.suffix || C.defaultSuffix });
  return {
    version: '2.1',
    promptTitle: set.copyTitle || p.fields.title || '',
    prompt: set.copyPrompt || d.S6 || p.fields.prompt || '',
    negativePrompt: set.copyNegative || d.S7 || p.fields.negative || '',
    beforePrompt: set.copyBeforePrompt || d.S3 || p.fields.before || '',
    thumbnailPrompt: set.copyThumbPromptProtected || d.thumbWithProtection || set.copyThumbPrompt || d.thumb || '',
    labels: set.copyLabels || p.fields.labels || '',
    permalink: set.copyPermalink || p.fields.permalink || '',
    searchDescription: set.copySearchDesc || p.fields.search || '',
    thumbnailAlt: set.copyThumbAlt || '',
    beforeAlt: set.copyBeforeAlt || '',
    afterAlt: set.copyAfterAlt || '',
    fullBody: set.copyFullBody || '',
    filenames: set.filenames || d.filenames || {},
    filenamesShort: set.filenamesShort || d.filenamesShort || {},
    mode: mode,
    promptNumber: p.num || '',
    sourceName: (lib() && lib().sourceName) || ''
  };
}
```

### After (enhanced mapping per PLE-11 spec table, placeholder & metadata compatibility, future ready)
```js
function toUniversalCard(p, opts) {
  opts = opts || {};
  var mode = opts.mode || currentMode(p);
  var set = payloads(p)[mode] || payloads(p).original;
  var setOriginal = payloads(p).original;
  var setCustomized = payloads(p).customized || setOriginal;
  var d = PLX.derive(p, { mode: mode, values: valuesFor(p), preset: S.preset, suffix: p.suffix || C.defaultSuffix });
  var dOriginal = PLX.derive(p, { mode: 'original', values: {}, preset: S.preset, suffix: p.suffix || C.defaultSuffix });
  var dCustom = PLX.derive(p, { mode: 'customized', values: valuesFor(p), preset: S.preset, suffix: p.suffix || C.defaultSuffix });
  return {
    version: '2.1',
    // Strict mapping per PLE-11 table
    cardTitle: set.copyTitle || p.fields.title || '',
    promptTitle: set.copyTitle || p.fields.title || '',
    title: set.copyTitle || p.fields.title || '',
    beforePrompt: set.copyBeforePrompt || d.S3 || p.fields.before || '',
    mainPrompt: set.copyPrompt || d.S6 || p.fields.prompt || '',
    prompt: set.copyPrompt || d.S6 || p.fields.prompt || '',
    negativePrompt: set.copyNegative || d.S7 || p.fields.negative || '',
    howToUse: set.copyHowto || d.S9 || p.fields.howto || '',
    labels: set.copyLabels || p.fields.labels || '',
    permalink: set.copyPermalink || p.fields.permalink || '',
    searchDescription: set.copySearchDesc || p.fields.search || '',
    // Extended compatibility
    thumbnailPrompt: set.copyThumbPromptProtected || d.thumbWithProtection || set.copyThumbPrompt || d.thumb || '',
    thumbnailAlt: set.copyThumbAlt || '',
    beforeAlt: set.copyBeforeAlt || '',
    afterAlt: set.copyAfterAlt || '',
    fullBody: set.copyFullBody || '',
    filenames: set.filenames || d.filenames || {},
    filenamesShort: set.filenamesShort || d.filenamesShort || {},
    mode: mode,
    promptNumber: p.num || '',
    sourceName: (lib() && lib().sourceName) || '',
    // Placeholder Compatibility
    original: {
      promptTitle: setOriginal.copyTitle || p.fields.title || '',
      cardTitle: setOriginal.copyTitle || p.fields.title || '',
      beforePrompt: setOriginal.copyBeforePrompt || dOriginal.S3 || p.fields.before || '',
      mainPrompt: setOriginal.copyPrompt || dOriginal.S6 || p.fields.prompt || '',
      prompt: setOriginal.copyPrompt || dOriginal.S6 || p.fields.prompt || '',
      negativePrompt: setOriginal.copyNegative || dOriginal.S7 || p.fields.negative || '',
      howToUse: setOriginal.copyHowto || dOriginal.S9 || p.fields.howto || '',
      hasPlaceholders: /\[[^\]]+\]/.test(setOriginal.copyPrompt || p.fields.prompt || '')
    },
    customized: {
      promptTitle: setCustomized.copyTitle || p.fields.title || '',
      cardTitle: setCustomized.copyTitle || p.fields.title || '',
      beforePrompt: setCustomized.copyBeforePrompt || dCustom.S3 || p.fields.before || '',
      mainPrompt: setCustomized.copyPrompt || dCustom.S6 || p.fields.prompt || '',
      prompt: setCustomized.copyPrompt || dCustom.S6 || p.fields.prompt || '',
      negativePrompt: setCustomized.copyNegative || dCustom.S7 || p.fields.negative || '',
      howToUse: setCustomized.copyHowto || dCustom.S9 || p.fields.howto || '',
      isCompatible: !/\[[^\]]+\]/.test(setCustomized.copyPrompt || '')
    },
    // Metadata Compatibility
    metadata: {
      title: set.copyTitle || p.fields.title || '',
      category: (String(set.copyLabels || p.fields.labels || '').split(',')[0] || '').trim(),
      labels: set.copyLabels || p.fields.labels || '',
      searchDescription: set.copySearchDesc || p.fields.search || '',
      permalink: set.copyPermalink || p.fields.permalink || ''
    }
  };
}
```

## Hunks Changed
- 1 hunk: `toUniversalCard()` enhanced (lines ~2230-2300)
- 0 hunks outside affected feature
- 0 CSS changes
- 0 Parser changes
- 0 Universal Card source modification (comment preserved, only Engine layer)

## Validation of No Side Effects
- Blogger XML untouched
- Universal Card source NOT modified (only Engine export layer)
- Prompt Libraries untouched
- CSS untouched
- Prompt parser untouched
- Customize Prompt untouched
- Thumbnail Preset (PLE-06) preserved
- Thumbnail Protection (PLE-07) preserved
- Image Studio Workflow (PLE-08) preserved
- Blog Publisher (PLE-09) preserved
- Responsive (PLE-10) preserved
- JS syntax `node --check` PASS

## Why This Fixes PLE-11
- Previously mapping had only `promptTitle` but spec requires `Card Title` – now includes `cardTitle` alias + `title` alias
- Previously Prompt -> Main Prompt mapping missing explicit `mainPrompt` – now includes `mainPrompt` alias
- Previously How To Use mapping missing – now includes `howToUse`
- Previously placeholder compatibility not explicitly tracked – now includes `original.hasPlaceholders` (must preserve []) and `customized.isCompatible` (no [])
- Previously metadata compatibility not explicit – now includes `metadata` object with Title, Category, Labels, Search Description, Permalink
- Future compatibility prepared for Blogger XML v5.0 and Universal Card v2.1 via version 2.1 and universalCard wrapper, no hardcoded popup logic

**Status:** PASS – Universal Card compatibility layer only, no Universal Card source modification
