# Git Diff Summary – PLE-03 Customize Prompt Live Preview + Copy (Re-validation after A–L)

Target: `prompt-library-engine-v2.5.2-enterprise.html`
Base: After PLE-02

## Diff

```diff
0 files changed – feature already locked and verified, no code change needed for PLE-03 re-validation
```

## Audit – Code Already Present (Customize Prompt sections only)

- `applyValues(p, values)` – longest-name-first sort, guard 5000, exact token `[name]` replacement via split/join, handles S3, S6, S10
- `derive(p, opts)` – mode original returns raw verbatim, mode customized uses `applyValues`, preserves original
- `payloads(p)` – builds original and customized sets with `copyBeforePrompt`, `copyPrompt`, `copyThumbPrompt`, etc., memoised via sig
- `handleCopy()` – 5 required buttons:
  - `copyBeforeOriginal` → `p.raw.before`
  - `copyBeforeCustom` → `payloads(p).customized.copyBeforePrompt`
  - `copyPromptOriginal` → `p.raw.prompt`
  - `copyPromptCustom` → `payloads(p).customized.copyPrompt`
  - `copyPromptNegative` → `promptNegative` (S6+S7)
- `wireVarControls()` – select change → `setVar()` → `S.dirty` → `render()` immediate live preview, no reload/re-import
- `setVar()` – preserves custom value in `S.custom`, sets mode customized, touches prompt
- Replacement rules: exact [] tokens only via `tokenRe`, every occurrence via while split/join, negative unchanged unless placeholder exists

## Validation

- test-prompt-c.mjs: Original S3 has [VAR] true, Custom S3 has replaced true, Original preserved PASS, Custom replaced PASS, every occurrence PASS, 5 buttons exist YES, PROMPT C PASS
- test-ple03-prompts.mjs: Prompt #1, #25, #50 all show original preserved, customized replaced, live preview via setVar

## Scope Compliance

- No modification for re-validation
- Single file target unchanged
- Real library 50 prompts PASS

## Result

PLE-03 PASS – 0 hunks changed, live preview + copy functional without changing source Markdown.
