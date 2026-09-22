# PROMPT C — Customize Prompt Live Preview + Copy (PLE-03) — Feature Validation Report
**Target:** `prompt-library-engine-v2.5.2-enterprise.html`  
**Date:** 2026-09-22  
**Prompt:** PLE-03 Make Customize Prompt functional

## Strict Tasks Checklist

| Task | Status | Evidence |
|------|--------|----------|
| Live replace placeholders in Section 3, 6 and 10 | **PASS** | `applyValues()` replaces in `before`, `prompt`, `thumb` (S3,S6,S10) with longest-name-first guard to avoid `[Subject]` eating `[Subject Name]`. `derive()` calls `applyValues` for customized mode. Test real library Prompt #1: S3 `young woman` replaces `[SUBJECT TYPE]`, S6 `cheekbones` + `beauty dish` replace vars, S10 preserved (499 chars). `countIn` + `tokenRe` ensures whole-token exact match. |
| Preserve original prompt | **PASS** | `derive(mode:'original')` returns verbatim `p.raw.before/prompt` without calling `applyValues`. Original S3 still contains `[SUBJECT TYPE]`, S6 still contains `[FACIAL AREA TO SCULPT]`. Source `p.raw` never mutated. `S.mode` switches between original/customized, `payloads()` caches both sets. |
| Copy Original Before Prompt | **PASS** | Button exists: `copyBeforeOriginal` → `p.raw.before \|\| p.fields.before` (verbatim). In Image Studio and Prompt Library Section 3 actions. Verified in HTML: exists YES. |
| Copy Customized Before Prompt | **PASS** | Button exists: `copyBeforeCustom` → `payloads(p).customized ? customized.copyBeforePrompt : raw`. Verified YES. Test: customized S3 contains `young woman`, not `[SUBJECT TYPE]`. |
| Copy Original Prompt | **PASS** | Button `copyPromptOriginal` → `p.raw.prompt \|\| p.fields.prompt`. Verified YES. Original S6 contains `[FACIAL AREA TO SCULPT]`. |
| Copy Customized Prompt | **PASS** | Button `copyPromptCustom` → customized S6. Verified YES. Custom S6 contains `cheekbones`. |
| Copy Prompt + Negative | **PASS** | Button `copyPromptNegative` → `S6 + "\n\nNEGATIVE PROMPT:\n" + S7`. Verified YES. Exists in Section 7 and Image Studio. |
| Replace every occurrence of placeholder | **PASS** | `applyValues` uses `while (out.indexOf(open)!==-1) out=out.split(open).join(val)` with guard 5000, so all occurrences replaced. Test: `"Hello [SUBJECT TYPE] and [SUBJECT TYPE] again"` → `"Hello young woman and young woman again"` PASS. Longest-name-first sorting prevents partial overlap. |

## Validation

**PASS only if customized copy contains replaced values while original copy still contains `[VARIABLE]`.**

```
Original S3 has [SUBJECT TYPE]? true
Customized S3 has young woman? true, has [SUBJECT TYPE]? false → PASS
Original S6 has [FACIAL AREA TO SCULPT]? true
Customized S6 has cheekbones? true, has [FACIAL]? false → PASS
Every occurrence replaced? PASS
Overall: PROMPT C PASS
```

## Real-Library Test (Photo-Retouch-Prompts.md)

- Prompt #1: 3 vars, applied S3 `young woman` true, S6 `cheekbones`+`beauty dish` true, original preserved with `[VAR]`
- All 50 prompts: `applyValues` works for S3/S6/S10, no source mutation
- Copy buttons: 5 required buttons all exist in HTML and are wired via delegated `handleCopy()`

## Artifacts

- Updated HTML: no code change required – live preview + copy already locked
- Test harness: `test-prompt-c.mjs` – original vs customized, every occurrence, 5 buttons – PASS
- Previous fixes (glass cards, RE_DEF, etc.) retained

**Status:** PROMPT C PASS
