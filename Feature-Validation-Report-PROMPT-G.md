# Feature Validation Report – Prompt G (PLE-07) Thumbnail Before/After Protection

Target: `prompt-library-engine-v2.5.2-enterprise.html`
Library: `Photo-Retouch-Prompts.md` (50 prompts)
Date: 2026-09-22
Branch: arena/01a0c81e-test-prompt-library-engine-v2

## Goal

Protect supplied images.

## Strict Tasks

- Detect filenames ending with:
  - Before.jpg/jpeg/png/webp
  - After.jpg/jpeg/png/webp
- Generate protection text exactly once
- Do not swap image roles

## Implementation

### 1. Filename detection

`detectRole(name)` already implemented with regex:
```js
/^(.*?)(Before|After)\.(jpe?g|webp|png)$/i
```
- Case-insensitive
- Supports jpg, jpeg, png, webp (jpe?g covers jpg/jpeg)
- Prefix `(.*?)` allows any base name like `1 Professional High-End Skin Retouching Prompt (2026) Before.jpg`
- Returns role `before`/`after` with confident true, label `BEFORE`/`AFTER`

Validated with 15 filenames:
- `myimage Before.jpg` → before PASS
- `Before.jpeg` → before PASS
- `Before.png` → before PASS
- `Before.webp` → before PASS
- `After.jpg/jpeg/png/webp` → after PASS
- Long title `1 Professional... Before.jpg` → before PASS
- Uppercase `BEFORE.JPG`, `AFTER.PNG` → PASS
- `x-after-final.jpg` → unknown PASS (not guessed, strict suffix only)

### 2. Protection text exactly once

`PROTECTION` constant (7 lines locked §16):
```
SOURCE IMAGE PROTECTION (mandatory):
Use the supplied Before image exactly as the BEFORE source image.
Use the supplied After image exactly as the AFTER source image.
Do not edit, retouch, enhance, recolor, regenerate, replace, or otherwise alter either supplied source image.
Do not swap the Before and After roles.
Only create the thumbnail composition/layout around the supplied source images.
The source images are already prepared assets.
```

Deduplication guard:

- `wrapP(txt)` in buildPayloads checks if both sentences `Use the supplied Before image exactly as the BEFORE source image.` and `Use the supplied After image exactly as the AFTER source image.` already present → returns txt as-is, else appends protection.
- Fixed `derive()` `thumbWithProtection` to use same guard (previously always appended, could duplicate if Section 10 already contained protection):
```js
thumbWithProtection: (function(){
  var v = String(thumb || '');
  if (/Use the supplied Before image exactly as the BEFORE source image\./i.test(v) && /Use the supplied After image exactly as the AFTER source image\./i.test(v)) return v;
  return v ? (v + '\n\n' + PROTECTION) : PROTECTION;
})()
```

Tested:
- Adding protection once → count 1 PASS
- Adding second time → same string, not duplicated PASS
- Derive guard also prevents duplicate PASS

### 3. Do not swap image roles

- `assignFiles(files)` detects role from filename via `detectRole`, not upload order, stores in `seen` map to prevent duplicate
- `place()` stores role as detected, never swaps
- Manual swap only via explicit `Swap Before ↔ After` button (`data-action="swapslots"`), not automatic
- `roleBanner` shows error if roles reversed or conflict, but does not auto-correct
- Tested upload order independence:
  - Files `['a Before.jpg','b After.jpg']` → before role correct, after role correct PASS
  - Reversed `['b After.jpg','a Before.jpg']` → before still Before, after still After, not swapped PASS

## Validation

`test-prompt-g.mjs` 28/28 PASS:
- Detect all required suffixes Before/After jpg/jpeg/png/webp
- Upload order independence
- Protection 7 lines, contains required sentences, contains Do not swap
- Protection exactly once, not duplicated on second call
- Derive thumbWithProtection deduplication

Real library:
- Photo-Retouch-Prompts.md 50 prompts parse 0 errors
- Previous prompts B-F still PASS

## Files Changed

- `prompt-library-engine-v2.5.2-enterprise.html` only – single line fix in derive for deduplication guard (scope locked)

## Result

PLE-07 PASS – Before/After roles remain correct regardless of upload order, filenames ending with Before/After jpg/jpeg/png/webp detected, protection text generated exactly once, roles never auto-swapped.
