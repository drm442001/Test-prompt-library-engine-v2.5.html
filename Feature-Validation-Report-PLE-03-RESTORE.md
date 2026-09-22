# Feature Validation Report – PLE-03 Customize Prompt Live Preview + Copy (Re-validation after A–L)

Target: `prompt-library-engine-v2.5.2-enterprise.html` (current after A–L)
Library: `Photo-Retouch-Prompts.md` (50 prompts)
Date: 2026-09-22

## PATCH ID

PLE-03

## GOAL

Make Customize Prompt functional without changing source Markdown.

## STRICT TASKS – Audit Current Engine

### Implement runtime replacement

| Task | Status | Evidence |
|---|---|---|
| Replace placeholders inside Section 3 | **PASS** | `applyValues()` does `doKeys(p.raw.before)` – replaces `[VAR]` in Before Image Prompt, tested Prompt #1 S3 contains young woman after replace, no [SUBJECT TYPE] |
| Section 6 | **PASS** | `doKeys(p.raw.prompt)` – main Prompt, contains cheekbones, beauty dish etc. after replace |
| Section 10 (if placeholder exists) | **PASS** | `doKeys(p.raw.thumb)` – thumbnail prompt, length 499 after replace, preserves if placeholder exists, otherwise preset |
| Preserve original Markdown | **PASS** | `derive mode:'original'` returns `p.raw.before/prompt/thumb` verbatim, `p.fields` never mutated, `p.raw` preserved, `payloads(p).original` vs `customized` separate, test original S3 still has [SUBJECT TYPE] |
| Create buttons: Copy Original Before Prompt | **PASS** | `copyBeforeOriginal` exists, handler `copyText(p.raw.before)` |
| Copy Customized Before Prompt | **PASS** | `copyBeforeCustom` exists, handler `payloads(p).customized.copyBeforePrompt` |
| Copy Original Prompt | **PASS** | `copyPromptOriginal` exists, `p.raw.prompt` |
| Copy Customized Prompt | **PASS** | `copyPromptCustom` exists, `payloads(p).customized.copyPrompt` |
| Copy Prompt + Negative | **PASS** | `copyPromptNegative` exists, `copyPromptNegative` = S6 + Negative |
| Replacement rules: Replace exact [] tokens only | **PASS** | `tokenRe(name) = new RegExp('\\['+escRe(name)+'\\]','g')` – exact case-sensitive, brackets required, `nearMiss` detects case mismatch but does NOT replace |
| Replace every occurrence | **PASS** | Guard loop `while(out.indexOf(open)!==-1 && guard++<5000) out=out.split(open).join(val)` replaces all, test "Hello [VAR] and [VAR] again" → "Hello young woman and young woman again" PASS |
| Negative Prompt unchanged unless placeholder exists | **PASS** | `derive` does not apply values to S7 (negative) unless placeholder present in negative (countIn checks), current Photo-Retouch has no [VAR] in negative, so unchanged |

### LIVE PREVIEW

| Requirement | Status | Evidence |
|---|---|---|
| Changing dropdown updates preview immediately | **PASS** | `wireVarControls` select change → `setVar(p,name,v)` → `S.dirty={library:true,image:true,publisher:true}` → `render()` – immediate, no reload |
| No reload | **PASS** | `render()` only re-renders dirty tabs, keeps focus via `fid`, `fval`, `fstart` |
| No re-import | **PASS** | `S.custom` persists per prompt, no re-parse of markdown |

## VALIDATION – Test Prompt #1, #25, #50

`test-prompt-c.mjs` + `test-ple03-prompts.mjs`:

- **Prompt #1**: vars SUBJECT TYPE, FACIAL AREA TO SCULPT, LIGHTING FEEL
  - Original S3 has [SUBJECT TYPE]? true PASS
  - Customized S3 has young woman? true, has [SUBJECT TYPE]? false PASS
  - Original S6 has [FACIAL AREA TO SCULPT]? true PASS
  - Customized S6 has cheekbones? true PASS
  - Original preserved? PASS
  - Every occurrence replaced? PASS

- **Prompt #25**: vars FACE AREA TO EMPHASISE, COVER PALETTE, TYPOGRAPHY SPACE
  - Original S3 preserved (no [VAR] in S3 for this prompt, but S6 has vars) – custom S6 contains first option PASS
  - Original preserved PASS

- **Prompt #50**: vars RIM LIGHT COLOR, SKIN ORANGE BALANCE, HAZE DENSITY
  - Original S3 preserved, custom S6 contains first option PASS
  - Original S10 preserved? true (library has Section 10, not overwritten)
  - Custom S10 preserved? true

- **Original copy contains placeholders**: PASS – `p.raw.before` contains `[SUBJECT TYPE]`, `copyBeforeOriginal` copies verbatim
- **Customized copy replaces placeholders**: PASS – `copyBeforeCustom` contains young woman, no [VAR]
- **Preview updates**: PASS – `setVar` triggers `render()` with dirty flags, `test-prompt-c` shows applied S3 contains replaced values
- **Multiple placeholder occurrences replaced**: PASS – test string with two [VAR] both replaced

## Real Library Test

- Photo-Retouch-Prompts.md 50 prompts
- Original copy contains placeholders PASS
- Customized copy replaces placeholders PASS
- Preview updates immediately PASS (code path verified)
- Multiple occurrences replaced PASS

## Output

- Updated HTML: `prompt-library-engine-v2.5.2-enterprise.html` (current, 0 hunks changed for PLE-03 re-validation)
- Runtime Validation Report: `test-prompt-c.mjs` + `test-ple03-prompts.mjs` show live replace, original preserved, 5 buttons, every occurrence
- Git diff Customize Prompt sections only: 0 files changed (feature already locked)

**Status:** PLE-03 PASS (re-validated after full Fix Pack A–L)
