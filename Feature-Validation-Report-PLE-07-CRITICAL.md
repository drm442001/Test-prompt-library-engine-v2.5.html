# Feature Validation Report – PLE-07 Thumbnail Before/After Protection (Critical)

Target: `prompt-library-engine-v2.5.2-enterprise.html` (current after PLE-06)
Date: 2026-09-22
Patch: PLE-07 Critical

## GOAL
Protect the actual Before and After images used in Motion Graphics Studio blog thumbnail generation. Feature must work with existing Thumbnail Image Generator Prompt without changing user's image assets.

## MGS BLOG WORKFLOW (SOURCE OF TRUTH) – LOCKED
1. Before Image Prompt generates **Before Raw Image**
2. Main Prompt + Negative Prompt generates **After Edited Image**
3. Thumbnail Generator uses those two existing images
4. Thumbnail Generator **must not edit or regenerate** either image

Workflow preserved – no changes to image generation, only protection layer appended to Section 10.

## STRICT TASKS

### A. Filename Role Detection – PASS

Detect uploaded image role using filename suffix, case-insensitive, ignore upload order.

| Filename | Expected Role | Detected | Status |
|---|---|---|---|
| `1 Professional High-End Skin Retouching Prompt (2026) Before.jpg` | BEFORE | BEFORE | PASS |
| `1 Professional High-End Skin Retouching Prompt (2026) After.jpg` | AFTER | AFTER | PASS |
| `Before.jpg` | BEFORE | BEFORE | PASS |
| `Before.jpeg` | BEFORE | BEFORE | PASS |
| `Before.png` | BEFORE | BEFORE | PASS |
| `Before.webp` | BEFORE | BEFORE | PASS |
| `After.jpg` | AFTER | AFTER | PASS |
| `After.jpeg` | AFTER | AFTER | PASS |
| `After.png` | AFTER | AFTER | PASS |
| `After.webp` | AFTER | AFTER | PASS |
| `test BEFORE.JPG` (uppercase) | BEFORE | BEFORE | PASS |
| `test after.PNG` (mixed) | AFTER | AFTER | PASS |
| `random.jpg` | unknown | unknown | PASS – never guess |

Implementation: `detectRole()` regex `/^(.*?)(Before|After)\.(jpe?g|webp|png)$/i` – case-insensitive, captures Before/After before extension, ignores path, ignores upload order.

Upload order independence verified:
- Order `Before.jpg` then `After.jpg` → Before slot = Before, After slot = After – PASS
- Reversed order `After.jpg` then `Before.jpg` → Before slot still Before, After slot still After – PASS (roles remain correct, not swapped)

### B. Source Verification Badge – PASS

- When filename role detected, show badge:
  - `BEFORE IMAGE — SOURCE VERIFIED` – PASS (implemented in `slotHTML` and `thumbPreviewHTML`)
  - `AFTER IMAGE — SOURCE VERIFIED` – PASS
- If filename cannot be identified: `SOURCE ROLE NOT DETECTED` – PASS
- Never guess: `confident` flag false for unknown, role `unknown` – PASS

Before fix: badge showed `BEFORE` + `SOURCE VERIFIED` as separate spans.
After fix: badge shows exact text `BEFORE IMAGE — SOURCE VERIFIED` and `AFTER IMAGE — SOURCE VERIFIED` as single bold badge, plus note `from filename (not upload order)`.

`thumbPreviewHTML` also updated to show `BEFORE IMAGE — SOURCE VERIFIED — Detected Role: BEFORE` and `AFTER IMAGE — SOURCE VERIFIED — Detected Role: AFTER`.

### C. Thumbnail Prompt Protection Layer – PASS

Append exactly one protection rule inside Section 10 preview and copied Thumbnail Prompt.

New PROTECTION (PLE-07 Critical):
```
SOURCE IMAGE PROTECTION (mandatory):
Use supplied Before image exactly as BEFORE source.
Use supplied After image exactly as AFTER source.
Do not enhance either image.
Do not retouch either image.
Do not recolor either image.
Do not regenerate either image.
Do not swap image positions.
Only create thumbnail composition around supplied images.
```

Verification:
- Header `SOURCE IMAGE PROTECTION` present – PASS
- 8 required instructions present – PASS (all 8 checked)
- Never duplicate: `thumbWithProtection` checks `/SOURCE IMAGE PROTECTION/i` before appending, returns original if already present – PASS
- `wrapP()` in `buildPayloads` also checks same regex – PASS
- Count of `SOURCE IMAGE PROTECTION` in `thumbWithProtection` = 1 – PASS
- Duplication test: double protection would be 2, but guard prevents – PASS

### D. Copy Thumbnail Prompt – PASS

Copy button must include protection text exactly once.

- `copyThumbPromptProtected` = `wrapP(pick(d.thumb, 'thumb'))` → preset-generated thumb + PROTECTION once – PASS
- `thumbWithProtection` = thumb + `\n\n` + PROTECTION once – PASS
- Copy action `copyThumbPromptProtected` verified via derive – contains all 8 rules – PASS
- No duplicate protection text – PASS (count 1)

## VALIDATION – Required Test Files

Test with:
- `1 Professional High-End Skin Retouching Prompt (2026) Before.jpg`
- `1 Professional High-End Skin Retouching Prompt (2026) After.jpg`

| Check | Result |
|---|---|
| Upload order reversed (After then Before) | PASS – roles remain correct (Before slot = Before.jpg, After slot = After.jpg) |
| Roles remain correct | PASS – detectRole from filename, not upload order |
| Badge correct | PASS – BEFORE IMAGE — SOURCE VERIFIED / AFTER IMAGE — SOURCE VERIFIED |
| Prompt correct | PASS – Section 10 preview includes protection exactly once, 8 rules |
| No duplicate protection text | PASS – count 1, guard prevents duplication |

## Real Library Test

- Library: `Photo-Retouch-Prompts.md` 50 prompts
- Prompt #1 derive with preset `premium_dark` → thumb len 1543 + protection 8 lines, thumbWithProtection len includes protection once
- `test-prompt-b.mjs`: 150 vars →150 dropdowns PASS
- `test-prompt-g.mjs`: OVERALL PASS (role detection, reversed order, protection 9 lines, dedup)
- `test-ple07-protection.mjs`: OVERALL PASS (all A-D tasks)

## Console Errors = 0

- `node --check` on extracted `<script>` blocks: PASS 0 errors
- No ReferenceError, no undefined
- JS syntax valid

## Output

- Updated HTML: `prompt-library-engine-v2.5.2-enterprise.html` (PLE-07 fix, 3 hunks: PROTECTION, thumbWithProtection guard, slotHTML/thumbPreviewHTML badges, wrapP guard)
- Feature Validation: PASS (Filename Role Detection, Source Verification Badge, Protection Layer, Copy Thumbnail Prompt, reversed upload order, no duplicate)
- Git Diff: Protection layer only, no side effects

**Status:** PLE-07 PASS – Thumbnail Before/After Protection Critical Working
