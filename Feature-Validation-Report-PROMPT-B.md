# PROMPT B — Customize Prompt Variable Dropdown (PLE-02) — Feature Validation Report
**Target:** `prompt-library-engine-v2.5.2-enterprise.html`  
**Date:** 2026-09-22  
**Prompt:** PLE-02 Create working Customize Prompt dropdowns

## Strict Tasks Checklist

| Task | Status | Evidence |
|------|--------|----------|
| Read variables **only from Section 9 → Step 4** | **PASS** | `parseBlock()` calls `extractStep4(p.fields.howto || '', step4Field)` where `howto` is Section 9. `RE_STEP4 = /step\s*4\b.*\bcustomi[sz]e\b/i` searches only within howto. Verified: Prompt #1 howto contains Step 4, extracted vars `[SUBJECT TYPE, FACIAL AREA TO SCULPT, LIGHTING FEEL]` match Step 4 definitions, not from S3/S6. Before section contains `[SUBJECT TYPE]` but var is defined only in S9 Step 4 – correct source. |
| Generate dropdown for every `[VARIABLE]` | **PASS** | `varControlsInner()` generates `<select>` for each var in `c.analysis.vars`. Test with real library: 50 prompts × 3 vars = 150 vars, 150 dropdowns generated, 0 failures. Each `[VARIABLE]` token creates visible dropdown in Customize Prompt panel after Section 13. |
| Default value = Step 4 value | **PASS** | `valuesFor()` sets `out[v.name] = v.options[0]` as default (first real source value from Step 4). `parseOptions()` splits hint by `/,|or|slash` but keeps first as default. Example: Step 4 `→ `[SUBJECT TYPE]` = young woman, male executive...` → options `[young woman, male executive, bridal close-up, teen-safe portrait]`, default `young woman` (real source value). No fabricated options. Lock report confirms: "Single default handling: changed to one real source value plus Custom Value". |
| Add **Custom Value** option | **PASS** | In `varControlsInner()`: `out.push('<option value=\"__custom__\">Custom Value</option>')` appended after real options. Present in every dropdown. Label normalized to "Custom Value" (was "Custom…" in v2.5). |
| Custom textbox appears only when selected | **PASS** | Input initially hidden: `hidden` attribute unless `inCustom`. `inCustom = (selVal && options.indexOf(selVal)===-1) || customMode`. `wireVarControls()` shows/hides: on `__custom__` selected → `box.hidden=false; focus()`, else `hidden=true`. Tested: initial state hidden, selecting Custom Value shows textbox, typing updates all instances of that variable via `setVar()`. |
| Do not modify Markdown source | **PASS** | `applyValues()` returns new object `{before, prompt, thumb}` without mutating `p.raw` or `p.fields`. Source text never altered (core layer comment: "no DOM writes, no markdown mutation. Source text is never altered."). `derive()` uses `srcOf()` that picks raw or fields but does not write back. Verified: after `applyValues`, `p.raw.before` still contains `[SUBJECT TYPE]`. |

## Validation

**PASS only if every Step 4 variable creates a visible dropdown.**

- Real library: 150 Step 4 variables → 150 dropdowns, 0 missing
- Each dropdown visible in Customize Prompt panel (`#customize-<uid>` → `.varrow` → `.var` → `select[data-action="var"]`)
- No Markdown mutation, only derived payloads customized
- Custom Value + textbox logic verified

## Real-Library Test (Photo-Retouch-Prompts.md)

```
Parsed 50 prompts, tier v5.0
Total vars 150, total dropdowns 150, Failures 0
PASS
Prompt #1 howto contains Step4? true
Extracted vars [SUBJECT TYPE, FACIAL AREA TO SCULPT, LIGHTING FEEL]
Before vars [SUBJECT TYPE] — var defined in S9 Step4, used in S3 (correct flow)
```

## Artifacts

- Updated HTML: no code change required – feature already locked and working (verified)
- Test harness: `test-prompt-b.mjs` – 150 vars → 150 dropdowns PASS
- Previous fixes (RE_DEF, VERSION, beacon, WE-002) remain intact, err 0

**Status:** PROMPT B PASS – no modification needed, feature already satisfies strict tasks
