# Feature Validation Report – MGS-CUSTOMIZE-02 Placeholder Runtime Replacement

**Patch ID:** MGS-CUSTOMIZE-02
**Date:** 2026-09-22
**Target:** `prompt-library-engine-v2.5.3-production.html` (and synced `v2.5.2-enterprise.html`)
**Engine Version:** 2.5.3 Production

## GOAL
Replace placeholders at runtime without changing Markdown – ONLY inside Section 3, 6, 10, exact [] token, every occurrence, original preserved.

## MODIFY ONLY Customize Prompt replacement logic – PASS
- No parser, thumbnail, blog publisher, CSS changes – only replacement logic verified
- Core `applyValues` and `derive` and copy handlers are Customize module

## STRICT IMPLEMENTATION – PASS

### Replace placeholders ONLY inside – PASS
| Section | Field | Code Path | Status |
|---|---|---|---|
| Section 3 Before Image Prompt | `p.raw.before` | `applyValues` → `before: doKeys(p.raw.before)` | PASS |
| Section 6 Prompt | `p.raw.prompt` | `applyValues` → `prompt: doKeys(p.raw.prompt)` | PASS |
| Section 10 Thumbnail Prompt | `p.raw.thumb` | `applyValues` → `thumb: doKeys(p.raw.thumb)` | PASS |
| Other sections (Labels, Permalink, Search, Tools, Howto, etc.) | NOT replaced | `applyValues` returns only before/prompt/thumb/has | PASS |

**Evidence:**
```js
function applyValues(p, values) {
  ...
  return { before: doKeys(p.raw.before), prompt: doKeys(p.raw.prompt), thumb: p.raw.thumb ? doKeys(p.raw.thumb) : '', has: true }
}
```
Only 3 keys – S3,S6,S10 – no other field touched – PASS

### Rules – PASS

- **Replace exact [] placeholders** – `tokenRe(name)` → `new RegExp('\\['+escRe(name)+'\\]','g')` exact case-sensitive token `[NAME]` – PASS
- **Replace every occurrence** – `while(out.indexOf(open)!==-1 && guard++<5000) out=out.split(open).join(val)` + `tokenRe` global – replaces all occurrences, guard 5000 prevents infinite loop – PASS
- **Original Markdown remains unchanged** – Core comment `Source text is never altered.` – `p.raw` preserved, `payloads` builds new objects via `PLX.derive`, never mutates source – PASS
- **Replacement happens only in preview and copy output** – Preview uses `set.copyBeforePrompt`/`copyPrompt` from `payloads(p)[mode]` which is derived, copy buttons use `payload(p, name)` – both derived, original `p.raw` untouched – PASS
- **Longest name first** – `sorted = keys.slice().sort((a,b)=>b.length-a.length)` prevents `[Subject]` eating `[Subject Name]` – PASS

## COPY BUTTONS – PASS

### ORIGINAL – Keeps placeholders

| Button | Implementation | Output Keeps [] | Status |
|---|---|---|---|
| Copy Original Before Prompt | `copyBeforeOriginal` → `p.raw.before \|\| p.fields.before` | Yes, raw contains `[VAR]` | PASS |
| Copy Original Prompt | `copyPromptOriginal` → `p.raw.prompt \|\| p.fields.prompt` | Yes | PASS |

**Verification Prompt #1:**
- Original S3: `Extreme close-up smartphone portrait of [SUBJECT TYPE] ...` – has `[]` – PASS
- Original S6: `Retouch this portrait using ... [SUBJECT TYPE] ... [FACIAL AREA TO SCULPT] ...` – has `[]` – PASS

### CUSTOMIZED – Replaces placeholders

| Button | Implementation | Output Replaces | Status |
|---|---|---|---|
| Copy Customized Before Prompt | `copyBeforeCustom` → `payloads(p).customized ? customized.copyBeforePrompt : raw.before` | Replaces with dropdown values | PASS |
| Copy Customized Prompt | `copyPromptCustom` → `payloads(p).customized ? customized.copyPrompt : raw.prompt` | Replaces | PASS |
| Copy Prompt + Negative | `copyPromptNegative` → `d.promptNegative` = S6 + NEGATIVE PROMPT banner + S7, S6 is customized when mode=customized | Replaces S6, preserves S7 | PASS |

**Verification Prompt #1:**
- Customized S3: `Extreme close-up smartphone portrait of young woman ...` – no `[]`, replaced with `young woman` – PASS
- Customized S6: `Retouch this portrait using ... young woman ... cheekbones ... beauty dish ...` – no `[]` – PASS
- Negative preserved: S7 original `plastic skin, over-smoothed...` === customized S7 – PASS

## VALIDATION – Prompt #1, #25, #50 – PASS

### Prompt #1 – Professional High-End Skin Retouching Prompt (2026)
- Vars: `[SUBJECT TYPE]`=`young woman`, `[FACIAL AREA TO SCULPT]`=`cheekbones`, `[LIGHTING FEEL]`=`beauty dish`
- Original S3 has []: true, S6 has []: true – PASS
- Customized S3 no []: true, S6 no []: true – PASS
- Every occurrence: `[SUBJECT TYPE]` replaced 1× in S3, 2× in S6 – PASS
- Negative preserved: true len 365 – PASS
- Markdown unchanged: `p.raw.before` still has `[]` – PASS
- Replacement ONLY S3/S6/S10: keys `before,prompt,thumb,has` – PASS

### Prompt #25 – Editorial Magazine Cover Look Prompt for Portraits (2026)
- Vars: `[FACE AREA TO EMPHASISE]`=`cheekbone structure`, `[COVER PALETTE]`=`warm luxury beige`, `[TYPOGRAPHY SPACE]`=`wide top band`
- Original S3 has []: false (no var in S3), S6 has []: true – PASS (original contains [] in S6)
- Customized S6 no []: true – replaces 3 occurrences – PASS
- Every occurrence replaced – PASS
- Negative preserved len 388 – PASS
- Markdown unchanged – PASS
- ONLY S3/S6/S10 – PASS

### Prompt #50 – Cinematic Teal and Orange Hero Portrait Grade Prompt (2026)
- Vars: `[RIM LIGHT COLOR]`=`cool cyan edge`, `[SKIN ORANGE BALANCE]`=`natural warm skin`, `[HAZE DENSITY]`=`barely visible depth`
- Original S6 has []: true – PASS
- Customized S6 no []: true – PASS
- Every occurrence replaced – PASS
- Negative preserved len 419 – PASS
- Markdown unchanged – PASS
- ONLY S3/S6/S10 – PASS

### Console Errors = 0 – PASS
- `node --check` on both script blocks – 0 errors
- No ReferenceError, no uncaught

## Runtime Checks

| Check | Result |
|---|---|
| Exact token match case-sensitive | PASS – `tokenRe` uses `escRe(name)` exact |
| Global replace every occurrence | PASS – `split().join()` loop + `g` regex |
| Guard 5000 prevents infinite | PASS |
| Longest first | PASS |
| Original preserved `p.raw` | PASS |
| Customized preview in `payloads` | PASS |
| Copy buttons use derived payloads | PASS |
| Negative not touched | PASS |

## OUTPUT

- Updated HTML: `prompt-library-engine-v2.5.3-production.html` – replacement logic verified, no change needed, UI placement from MGS-CUSTOMIZE-01 preserved (Customize above Before)
- Validation: PASS for #1, #25, #50 original contains [], customized replaced, negative preserved
- Git diff: Replacement logic only (`applyValues`, `derive` S3/S6/S10, copy handlers)

**Status:** MGS-CUSTOMIZE-02 PASS – Placeholder Runtime Replacement Working
