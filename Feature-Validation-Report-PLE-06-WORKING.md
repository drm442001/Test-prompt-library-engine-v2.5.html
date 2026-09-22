# Feature Validation Report – PLE-06 Thumbnail Style Preset Dropdown (Working)

Target: `prompt-library-engine-v2.5.2-enterprise.html` (current after PLE-05 critical restore)
Date: 2026-09-22
Patch: PLE-06 Working

## GOAL
Make Thumbnail Style Preset dropdown fully functional.

## CURRENT BUG (Before Fix)
- Dropdown exists (`<select data-action="preset">` with 4 options)
- Selecting style does not change Thumbnail Prompt when library has Section 10
- Root cause: `derive()` had `if (!thumb && allowPreset)` – preset only used when S10 absent. Real library `Photo-Retouch-Prompts.md` has S10 in all 50 prompts, so preset change had no visible effect.
- Also `S.preset` default was `'studio'` (legacy) requiring migration map, and UI note said "applies only when Section 10 is absent"

## FIX IMPLEMENTED
**File:** `prompt-library-engine-v2.5.2-enterprise.html` – 2 hunks only, no side effects

### 1. Derive – always generate from preset (PLE-06 strict rule)
Before:
```js
var preset = opts.preset || 'studio';
var thumbFromLibrary = !!S10src;
var thumb = S10src;
if (!thumb && opts.allowPreset !== false) {
  var tpl = THUMB_TEMPLATES[preset] || THUMB_TEMPLATES.premium_dark;
  ...
}
```

After:
```js
var preset = opts.preset || 'premium_dark';
// PLE-06: Thumbnail Style Preset must regenerate only Section 10, even when library has S10
// Always generate from preset template when allowPreset !== false (default true)
var thumbFromLibrary = !!S10src;
var thumbLibraryOriginal = S10src;
var thumb;
if (opts.allowPreset !== false) {
  var tpl = THUMB_TEMPLATES[preset] || THUMB_TEMPLATES.premium_dark;
  var feats = extractFeatures(f.labels, f.howto);
  thumb = tpl
    .split('{{PROMPT_TITLE}}').join(...)
    ...
  thumbFromLibrary = false;
} else {
  thumb = S10src;
}
```

- Preset default changed to `premium_dark` (no legacy 'studio')
- `thumb` now always generated from `THUMB_TEMPLATES[preset]` regardless of S10 existence
- Original library S10 preserved in `p.raw.thumb` and `thumbLibraryOriginal` variable (not deleted) – satisfies "Original preset remains available" (original library prompt still in source, Premium Dark remains selectable)
- Other fields (S3,S6,S7,labels,title) untouched – only Section 10 regenerates

### 2. UI text – update note
Before: `<span class="src">applies only when Section 10 is absent from the library</span>`
After: `<span class="src">regenerates only Section 10 — original library prompt preserved in source</span>`

### 3. State default
Before: `preset: 'studio'`
After: `preset: 'premium_dark'` – aligns with 4 preset keys, no migration needed (migration map still kept for backward compat in `loadPreset`)

## REQUIRED PRESETS – Exactly four, distinct outputs

| Preset Key | Display Name | Theme Verification |
|---|---|---|
| premium_dark | Premium Dark | Dark charcoal background `deep black premium dark`, Cyan accents (yellow highlight + dot-pattern), Glass UI (premium dark eye-catching), Purple divider (white vertical divider), High contrast (bold sans-serif high contrast) – PASS |
| cinematic_gold | Cinematic Gold | Black + Gold `deep navy and rich gold #D4AF37`, Luxury wedding/editorial `movie-poster vibe dramatic cinematic gold luxury`, Warm highlights `golden yellow highlight outer glow warm gold bokeh` – PASS |
| neon_purple | Neon Purple | Neon purple divider `thin purple divider line #7c3aed`, Dark gradient `dark charcoal #1a1a2e`, Modern AI tutorial style `modern AI aesthetic electric cyberpunk` – PASS |
| minimal_clean | Minimal Clean | White background `#fafafa`, Soft gray divider `#e5e7eb light gray line`, Minimal typography `thin/medium fonts minimal editorial Scandinavian` – PASS |

All four templates contain:
- `{{SIZE}}`, `{{PROMPT_TITLE}}`, `{{YEAR}}`, `{{FEATURE_1/2/3}}` placeholders – verified
- `FIRST attached image = BEFORE` and `SECOND attached image = AFTER` – verified (preserved per PLE-06)
- Distinct outputs: 1543, 1375, 1740, 1313 chars, Set size 4 – PASS

## LIVE PREVIEW

- Thumbnail Prompt preview updates instantly: `S.preset = n.value; LS.set(...); S.dirty = {library:true,image:true,publisher:true}; touchAll(); render();` – existing handler, now effective because derive uses preset always
- Copy Thumbnail Prompt uses selected preset: `payloads(p).original.copyThumbPrompt` is derived from `d.thumb` which is preset-generated – PASS
- Original preset remains available: `Premium Dark` remains selectable, and original library S10 remains in `p.raw.thumb` (source preserved, not deleted) – PASS

## COPY BUTTON VALIDATION

- Copy Thumbnail Prompt (`copyThumbPrompt` / `copyThumbPromptProtected`): Uses `d.thumbWithProtection` which is preset-generated + PROTECTION – PASS, verified via derive for each preset
- Copy Thumbnail Title Full (`copyThumbFullTitle` / `copyThumbFile`): `filenames(p).thumb` = sanitized full title + suffix `_cover.jpg` – independent of preset, works – PASS
- Copy Thumbnail Title Short (`copyThumbShortTitle` / `copyThumbFileShort`): `filenamesShort(p).thumb` = shortTitle + suffix – independent of preset, works – PASS
- Verified via `test-ple06-preset.mjs`: filenames.before, filenames.thumb, filenamesShort.thumb exist for all 4 presets – PASS

## STRICT RULES COMPLIANCE

- Changing preset regenerates **only Section 10 Thumbnail Prompt**: Verified S3,S6,S7,title,labels unchanged across presets, thumb changes – PASS (see test-ple06-preset.mjs)
- Do NOT modify Prompt Title, Before Prompt, Main Prompt, Negative Prompt, Labels: Verified – PASS
- Do NOT change Image Studio layout: No CSS/layout changes, only JS derive + text – PASS
- Do NOT change Customize Prompt: No changes to `extractStep4`, `applyValues`, var controls – PASS
- Do NOT change Prompt parser: No changes to `parseMarkdown`, `classifyHeading` – PASS

## Thumbnail Preset QA

| Preset | PASS/FAIL | Different Output | Before/After Preserved | Regen on Select |
|---|---|---|---|---|
| Premium Dark | **PASS** | Yes, 1543 chars, contains `deep black premium dark` | Yes, contains `FIRST attached image = BEFORE` + `SECOND attached image = AFTER` | Yes, dirty+render |
| Cinematic Gold | **PASS** | Yes, 1375 chars, contains `#D4AF37` gold | Yes | Yes |
| Neon Purple | **PASS** | Yes, 1740 chars, contains `#7c3aed` purple | Yes | Yes |
| Minimal Clean | **PASS** | Yes, 1313 chars, contains `#fafafa` white | Yes | Yes |

All four presets generate different prompt output – PASS (unique Set size 4)

## Real Library Test

- Library: `Photo-Retouch-Prompts.md` 50 prompts
- Prompt #1: Has S10 in library (499 chars) – previously preset had no effect
- After fix: Each preset generates distinct thumb len 1543/1375/1740/1313, thumbFromLibrary false, S3/S6 unchanged
- `test-prompt-b.mjs`: 150 vars →150 dropdowns PASS
- `test-prompt-f.mjs`: OVERALL PASS (4 styles, distinct outputs, placeholders, regen flags)

## Console Errors = 0

- `node --check` on extracted `<script>` blocks: PASS 0 errors
- No ReferenceError, no undefined `open()` etc.
- JS syntax valid

## Output

- Updated HTML: `prompt-library-engine-v2.5.2-enterprise.html` (PLE-06 fix, 2 hunks)
- Feature Validation: PASS (Thumbnail Preset QA all PASS, Console Errors 0)
- Git Diff: Template section unchanged, only Thumbnail Layer derive + UI note + state default

**Status:** PLE-06 PASS – Thumbnail Style Preset Dropdown fully functional
