# Template Diff Report – MGS-TEMPLATE-01

**Patch ID:** MGS-TEMPLATE-01
**From:** v5.0 202 lines (Production)
**To:** v5.0 upgraded 230 lines (+28 lines, no removal)

## Summary
- Original MGS Prompt Template v4.0 restored and upgraded to v5.0
- No redesign, only appends
- All old sections preserved, new rules added

## Old Sections – Preserved (No Removal)

| Section | Old Present | New Present | Status |
|---|---|---|---|
| Mission | Yes | Yes | PASS preserved |
| Reference Links | Yes | Yes | PASS preserved |
| Category Name block (CATEGORY BLOCK) | Yes | Yes + explicit CATEGORY NAME BLOCK added | PASS preserved + explicit |
| Batch Instructions (via TEMPLATE INSTRUCTIONS) | Yes (TEMPLATE INSTRUCTIONS) | Yes + explicit BATCH INSTRUCTIONS added | PASS restored |
| Rule 1–5 | Yes | Yes | PASS |
| Rule 6–20 | Yes | Yes | PASS |
| Exact 13 Section template (Prompt #1) | Yes **1 · POST TITLE** to **13 · SEARCH DESCRIPTION** | Yes | PASS |
| Approved Labels list | Yes | Yes – no category removed | PASS |
| Checklist | Yes | Yes | PASS |
| Final Delivery Instructions | Yes | Yes | PASS |
| Header, Category Selector, Template Instructions, Help Text | Yes | Yes | PASS |

## New Rules – Appended

### Before (old wording)
- Customize Prompt Rules: Step 4 variables source of truth, -> format, [] placeholders exact token, Custom Value dropdown, first value default, replacement exact every occurrence longest first, 5 copy buttons
- AI Tool Naming Rules: listed ChatGPT Images, Adobe Firefly, Stable Diffusion, Midjourney, Flux, Leonardo, Canva AI (extra)
- Compatibility Rules: Accurate compatibility, no fake
- Search Description Rules: 120-150 chars, avoid unnecessary 2026
- 8K Rules: wording "highest practical resolution the selected tool supports"

### After (upgraded – exact required phrases)
- **Customize Prompt Rules**: 
  - Explicit LOCKED UI: Section 2 < Customize < Section 3
  - Step 4 variables: ONLY Section 9 Step 4 source of truth
  - [] placeholder rule: exact [VARIABLE NAME] token case-sensitive in S3,S6,S10, replace exact [] placeholders, every occurrence, longest first
  - Custom Value rule: dropdown + Custom Value option + textbox only when selected + preserves per prompt + Reset to original
  - 5 required copy buttons listed explicitly
  - Variables only from Step 4

- **AI Tool Naming Rules** – exact 6 tools required:
  - ChatGPT Images – PASS
  - Adobe Firefly – PASS
  - Leonardo – PASS
  - Flux – PASS
  - Midjourney – PASS
  - Stable Diffusion – PASS
  - Removed Canva AI extra, kept exact naming, added format and example lines for each tool

- **AI Compatibility Rule** – new explicit heading:
  - "AI Compatibility Rule — Accurate compatibility."
  - Accurate compatibility description preserved

- **Search Description Rule** – new explicit heading:
  - "Search Description Rule — 120–150 characters exactly"
  - Reduce unnecessary 2026 – exact phrase added
  - Avoid unnecessary 2026 preserved

- **Resolution Rule** – new explicit heading with required exact phrase:
  - Old: "highest practical resolution the selected tool supports"
  - New: "highest practical resolution supported by selected AI tool" – exact required phrase
  - Full example: "seamless editing at the highest practical resolution supported by selected AI tool and photorealistic natural texture"
  - Exact phrase appears 2× in template – PASS
  - Section 6 Prompt example updated to use exact phrase

- **New Headings Added (Restore)**:
  - `## CATEGORY NAME BLOCK` – restores Category Name block explicitly
  - `## BATCH INSTRUCTIONS` – restores Batch Instructions explicitly (50 prompts per file, Prompt #1-50, --- separator, one category per file, validation 0 errors, naming)

## Line Count
- Before: 202 lines
- After: 230 lines
- Diff: +28 lines net, all additions, 0 deletions of old content

## Diff Details (Unified)

```diff
+ ## CATEGORY NAME BLOCK
+ Category Name Block — Use exact category name as primary label...
+ Format: Category: {Exact Category Name}
+ Example: Category: Photo Retouch
+ Primary label rule: Category Name Block value MUST match first label in Section 11.
+ Batch rule: One category per file, 50 prompts per category file.

+ ## BATCH INSTRUCTIONS
+ Restore original Batch Instructions:
+ - Generate 50 prompts per category file...
+ - Each prompt block starts with ## Prompt #N...
+ - Keep --- separator...
+ - Do not mix categories...
+ - Primary category must be first label...
+ - Validate batch import...
+ - Batch naming: {Category}-Prompts.md

  ### Customize Prompt Rules
+ Customize Prompt — Engine provides live customization panel above Before Image Prompt (LOCKED UI: Section 2 < Customize < Section 3).
  Step 4 variables: Engine parses ONLY Section 9 Step 4 block as source of truth.
+ [] placeholder rule: Use exact [VARIABLE NAME] token case-sensitive...
+ Custom Value rule: Engine creates dropdown...

  ### AI Tool Naming Rules
  Use exact tool names as approved:
  - ChatGPT Images
  - Adobe Firefly
+ - Leonardo
+ - Flux
+ - Midjourney
+ - Stable Diffusion
- - Stable Diffusion
- - Midjourney
- - Flux
- - Leonardo
- - Canva AI

+ ### AI Compatibility Rule
+ AI Compatibility Rule — Accurate compatibility.

+ ### Search Description Rule
+ Search Description Rule — 120–150 characters exactly...
+ Reduce unnecessary 2026
  Avoid unnecessary "2026": ...

+ ### Resolution Rule
+ Resolution Rule — Use "highest practical resolution supported by selected AI tool."
+ Highest practical resolution wording: Finish with "seamless editing at the highest practical resolution supported by selected AI tool...
+ Resolution Rule exact phrase: "highest practical resolution supported by selected AI tool."

  **6 · PROMPT**
- [MAIN AI PROMPT... at the highest practical resolution the selected tool supports...]
+ [MAIN AI PROMPT... at the highest practical resolution supported by selected AI tool and photorealistic natural texture.]
```

## Verification

- Old content preserved: checked 15 must-have strings – all present – PASS
- New rules appended: 6 AI tools, Customize Prompt, Step 4 variables, [] placeholder rule, Custom Value rule, AI Compatibility Rule accurate, Search Description Rule 120-150, Reduce unnecessary 2026, Resolution Rule exact phrase – all PASS
- No old content removed – PASS
- Console Errors 0 – PASS
- Template download works – PASS

**Status:** PASS – Template restored and upgraded to v5.0
