# Git Diff Summary – Prompt G (PLE-07) Thumbnail Before/After Protection

Target: `prompt-library-engine-v2.5.2-enterprise.html`
Base: de8f2c9 (after Prompt F)

## Diff

```diff
-      thumbWithProtection: (thumb ? thumb + '\n\n' + PROTECTION : PROTECTION)
+      thumbWithProtection: (function(){
+        var v = String(thumb || '');
+        if (/Use the supplied Before image exactly as the BEFORE source image\./i.test(v) && /Use the supplied After image exactly as the AFTER source image\./i.test(v)) return v;
+        return v ? (v + '\n\n' + PROTECTION) : PROTECTION;
+      })()
```

## Changes Breakdown

1. **Protection exactly once** – `derive()` previously always appended PROTECTION to thumb prompt, even if Section 10 already contained protection (could duplicate). Fixed to check for both sentences `Use the supplied Before image exactly as the BEFORE source image.` and `Use the supplied After image exactly as the AFTER source image.` – if present, return as-is, else append. Matches existing `wrapP()` guard in `buildPayloads`.

2. **Filename detection** – Already correct: regex `/^(.*?)(Before|After)\.(jpe?g|webp|png)$/i` detects Before.jpg/jpeg/png/webp and After.jpg/jpeg/png/webp, case-insensitive, prefix allowed. No change needed, validated.

3. **Do not swap roles** – `assignFiles()` and `place()` already detect role from filename, not upload order, with `seen` map preventing duplicate, manual swap only via explicit button. No auto-swap. Validated upload order independence.

## Scope Compliance

- Only protection deduplication logic modified (feature mentioned in Prompt G)
- No Blogger XML, Universal Card, .md libraries, CSS outside feature, unrelated JS modified
- Single file target

## Validation

- test-prompt-g.mjs 28/28 PASS – detects all required suffixes, upload order independence, protection 7 lines, exactly once, no auto-swap
- Real library 50 prompts PASS
- Previous prompts B-F PASS
