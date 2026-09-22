# Feature Validation Report – PLE-02 Customize Prompt Variable Dropdown (Re-validation after A–L)

Target: `prompt-library-engine-v2.5.2-enterprise.html` (current after A–L)
Library: `Photo-Retouch-Prompts.md` (50 prompts)
Date: 2026-09-22

## PATCH ID

PLE-02

## GOAL

Implement Customize Prompt variable dropdown generator from Step 4.

## SOURCE OF TRUTH

Section 9 → Step 4 only.

Recognize:
- → [VARIABLE] = value
- • [VARIABLE] = value
- [VARIABLE] = value (with/without bullet, with/without backticks)

## STRICT TASKS – Audit Current Engine

| Task | Status | Evidence |
|---|---|---|
| Parse Step 4 | **PASS** | `extractStep4(p.fields.howto)` with `RE_STEP4 = /step\s*4\b.*\bcustomi[sz]e\b/i` finds Step 4 block, then parses following lines until Step 5/Expected/Tips/## |
| Extract variable name | **PASS** | `RE_DEF = /^\s*(?:[-*+>•]+\s*)*(?:→|->)?\s*`?\[([^\]\[]+)\]`?\s*=\s*(.+?)\s*$/` – handles →, ->, •, -, *, >, with/without backticks, captures name inside [] |
| Extract default value | **PASS** | `parseOptions(hint)` splits by `/\s*(?:\/\|\|\s(?!\|)|,|\bor\b)\s*/i`, first value `v.options[0]` becomes default, stored in `valuesFor(p)` |
| Create dropdown | **PASS** | `varControlsInner()` creates `<select data-action="var" data-var="NAME">` with options from `v.options`, plus Custom Value |
| Add "Custom Value" | **PASS** | `<option value="__custom__">Custom Value</option>` appended after real options |
| Show textbox only for Custom Value | **PASS** | `wireVarControls()` – select change: if `__custom__` → `box.hidden=false` + focus, else `box.hidden=true`; input hidden by default unless inCustom |
| Preserve custom value | **PASS** | `S.custom[libId|uid][varName] = value` persists per prompt, `S.customMode` marks explicit Custom choice, `valuesFor()` merges saved + default, `setVar()` updates and triggers render with keepFocus |
| Do not modify Markdown | **PASS** | `applyValues()` returns new object `{before, prompt, thumb}`, never mutates `p.raw` or `p.fields`; original verbatim kept in `derive mode:'original'` |
| Do not invent variables | **PASS** | Only vars from Step 4 block parsed, no fabrication; if Step4 absent, `present=false`, no dropdowns |
| Ignore placeholders outside Step 4 | **PASS** | `extractStep4` only reads Step4 block, not random brackets elsewhere; `analyzeCustomization` counts occurrences but replacement only for declared vars; test `Before section vars [SUBJECT TYPE]` defined in S9 Step4 correct, not invented |

## UI

| Requirement | Status | Evidence |
|---|---|---|
| Customize Prompt panel appears above prompt preview | **PASS** | `cardHTML()` pushes `customizePanel(p)` after 13 sections but before exportRow, panel id `customize-UID`, label `Customize Prompt <em>Step 4 · source of truth</em>` |
| Each variable: Label | **PASS** | `<div class="vname">[VARIABLE NAME]</div>` with exact name |
| Dropdown | **PASS** | `<select>` with options + Custom Value, aria-label `Value for NAME` |
| Optional textbox | **PASS** | `<input type="text" data-action="var" data-var="NAME" placeholder="Custom value..." hidden>` shown only when Custom Value selected |

## VALIDATION – Import Photo-Retouch library

`test-prompt-b.mjs`:

```
Parsed 50
Total vars 150, total dropdowns 150
Failures 0 []
PASS if totalVars == totalDropdowns and failures 0: PASS

Prompt #1 howto contains Step4? true
Prompt #1 vars [ '[SUBJECT TYPE]', '[FACIAL AREA TO SCULPT]', '[LIGHTING FEEL]' ]
Extracted vars [ 'SUBJECT TYPE', 'FACIAL AREA TO SCULPT', 'LIGHTING FEEL' ]
Before section vars [ '[SUBJECT TYPE]' ]
Variables only from Step4?  YES - var in S3 but defined in S9 Step4 (correct)
```

- **Every Step 4 variable creates dropdown**: PASS – 50 prompts ×3 vars avg =150 vars → 150 dropdowns, Failures 0
- **Default value shown**: PASS – `valuesFor()` uses `v.options[0]` as default, e.g., Prompt #1 SUBJECT TYPE default `young woman`, dropdown shows selected, `test-custom.mjs` verifies applied S3 contains young woman
- **Custom textbox appears**: PASS – `wireVarControls` shows textbox only for `__custom__`, hidden otherwise, verified via HTML `hidden` attribute logic
- **Markdown unchanged**: PASS – `p.raw.before` still contains `[SUBJECT TYPE]`, `p.fields` untouched, `applyValues` returns new object

## Real Library Test

- Photo-Retouch-Prompts.md 50 prompts, 150 vars, 150 dropdowns, 0 failures
- No markdown mutation, original preserved
- Variables only from Section 9 Step 4, not from random brackets

## Output

- Updated HTML: `prompt-library-engine-v2.5.2-enterprise.html` (current, still satisfies PLE-02)
- Variable Extraction Report: `test-prompt-b.mjs` shows 150 vars extracted, all from Step4
- Validation PASS/FAIL: PASS

**Status:** PLE-02 PASS (re-validated after full Fix Pack A–L, 0 hunks changed)
