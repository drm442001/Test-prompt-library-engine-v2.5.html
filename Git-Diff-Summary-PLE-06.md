# Git Diff Summary – PLE-06 Thumbnail Style Preset Dropdown (Working)

## Scope Locked
- Target file: `prompt-library-engine-v2.5.2-enterprise.html` only
- Changed sections: Thumbnail Layer derive + presetRowHTML + state default
- No Blogger XML, no Universal Card, no Prompt Libraries, no CSS outside affected feature, no unrelated JS

## Diff Overview

### Hunk 1 – State default (line 1117)
```diff
-    preset: 'studio',
+    preset: 'premium_dark',
```

### Hunk 2 – Derive logic (lines 944-960)
```diff
-    var preset = opts.preset || 'studio';
-    var thumbFromLibrary = !!S10src;
-    var thumb = S10src;
-    if (!thumb && opts.allowPreset !== false) {
-      var tpl = THUMB_TEMPLATES[preset] || THUMB_TEMPLATES.premium_dark;
-      var feats = extractFeatures(f.labels, f.howto);
-      thumb = tpl
-        .split('{{PROMPT_TITLE}}').join(legacy ? cleanTitle(f.title) : f.title)
-        .replace(/\{\{SIZE\}\}/g, CFG.thumbSize)
-        .replace(/\{\{FORMAT\}\}/g, fmtLabel())
-        .split('{{YEAR}}').join(CFG.year)
-        .split('{{FEATURE_1}}').join(feats[0]).split('{{FEATURE_2}}').join(feats[1]).split('{{FEATURE_3}}').join(feats[2]);
-    }
+    var preset = opts.preset || 'premium_dark';
+    // PLE-06: Thumbnail Style Preset must regenerate only Section 10, even when library has S10
+    // Always generate from preset template when allowPreset !== false (default true)
+    var thumbFromLibrary = !!S10src;
+    var thumbLibraryOriginal = S10src;
+    var thumb;
+    if (opts.allowPreset !== false) {
+      var tpl = THUMB_TEMPLATES[preset] || THUMB_TEMPLATES.premium_dark;
+      var feats = extractFeatures(f.labels, f.howto);
+      thumb = tpl
+        .split('{{PROMPT_TITLE}}').join(legacy ? cleanTitle(f.title) : f.title)
+        .replace(/\{\{SIZE\}\}/g, CFG.thumbSize)
+        .replace(/\{\{FORMAT\}\}/g, fmtLabel())
+        .split('{{YEAR}}').join(CFG.year)
+        .split('{{FEATURE_1}}').join(feats[0]).split('{{FEATURE_2}}').join(feats[1]).split('{{FEATURE_3}}').join(feats[2]);
+      // When library has custom S10, keep flag false to indicate GENERATED from preset, but original remains in raw
+      thumbFromLibrary = false;
+    } else {
+      thumb = S10src;
+    }
```

### Hunk 3 – UI note (presetRowHTML, line 1594-1601)
```diff
-      '<span class="src">applies only when Section 10 is absent from the library</span></div>';
+      '<span class="src">regenerates only Section 10 — original library prompt preserved in source</span></div>';
```

## Hunks Changed
- 3 hunks, all within Thumbnail Layer / state
- 0 hunks outside affected feature
- 0 CSS changes
- 0 Parser changes
- 0 Customize Prompt changes
- 0 Image Studio layout changes

## Validation of No Side Effects
- Blogger XML untouched
- Universal Card JSON untouched
- Prompt Libraries (.md) untouched
- CSS outside affected feature untouched (no layout change)
- Prompt parser untouched (parseMarkdown, classifyHeading unchanged)
- Customize Prompt untouched (extractStep4, applyValues unchanged)
- Image Studio layout untouched (vertical order 1 Title 2 Before 3 Main 4 Negative 5 Thumbnail preserved)
- Other presets still distinct, Before/After placeholders preserved
- JS syntax `node --check` PASS

## Why This Fixes PLE-06
- Previously preset only applied when `!thumb` (S10 absent) → real library with S10 had no visible change
- Now preset always generates thumb when `allowPreset !== false` (default true) → selecting style instantly changes Section 10
- `S.preset` default `premium_dark` aligns with 4 keys, no legacy 'studio' fallback needed (migration map kept for backward compat)
- UI note updated to reflect new behavior (regenerates only Section 10)

**Status:** PASS – Template section unchanged, only Thumbnail Preset logic fixed
