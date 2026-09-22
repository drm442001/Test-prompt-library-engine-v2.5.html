# Git Diff Summary – PLE-07 Thumbnail Before/After Protection (Critical)

## Scope Locked
- Target file: `prompt-library-engine-v2.5.2-enterprise.html` only
- Changed sections: PROTECTION constant, thumbWithProtection guard, slotHTML badge, thumbPreviewHTML badge, wrapP guard
- No Blogger XML, no Universal Card, no Prompt Libraries, no CSS outside affected feature, no unrelated JS

## Diff Overview

### Hunk 1 – PROTECTION constant (lines ~848-860)
```diff
-  /* Locked §16: source images are references, never edit targets. Engine-appended, never inside copied prompt text. */
-  var PROTECTION = [
-    'SOURCE IMAGE PROTECTION (mandatory):',
-    'Use the supplied Before image exactly as the BEFORE source image.',
-    'Use the supplied After image exactly as the AFTER source image.',
-    'Do not edit, retouch, enhance, recolor, regenerate, replace, or otherwise alter either supplied source image.',
-    'Do not swap the Before and After roles.',
-    'Only create the thumbnail composition/layout around the supplied source images.',
-    'The source images are already prepared assets.'
-  ].join('\n');
+  /* Locked §16: source images are references, never edit targets. Engine-appended, never inside copied prompt text. PLE-07 Critical Protection */
+  var PROTECTION = [
+    'SOURCE IMAGE PROTECTION (mandatory):',
+    'Use supplied Before image exactly as BEFORE source.',
+    'Use supplied After image exactly as AFTER source.',
+    'Do not enhance either image.',
+    'Do not retouch either image.',
+    'Do not recolor either image.',
+    'Do not regenerate either image.',
+    'Do not swap image positions.',
+    'Only create thumbnail composition around supplied images.'
+  ].join('\n');
```

### Hunk 2 – thumbWithProtection guard (lines ~1009-1013)
```diff
-      thumbWithProtection: (function(){
-        var v = String(thumb || '');
-        if (/Use the supplied Before image exactly as the BEFORE source image\./i.test(v) && /Use the supplied After image exactly as the AFTER source image\./i.test(v)) return v;
-        return v ? (v + '\n\n' + PROTECTION) : PROTECTION;
-      })()
+      thumbWithProtection: (function(){
+        var v = String(thumb || '');
+        if (/SOURCE IMAGE PROTECTION/i.test(v)) return v;
+        return v ? (v + '\n\n' + PROTECTION) : PROTECTION;
+      })()
```

### Hunk 3 – slotHTML badge (lines ~1819-1836)
```diff
-      parts.push('<div class="kv"><span><b>' + escT(slot.roleLabel || 'SOURCE ROLE NOT DETECTED') + '</b></span>' + (slot.role === 'before' || slot.role === 'after' ? '<span>SOURCE VERIFIED</span>' : '<span>SOURCE ROLE NOT DETECTED</span>') + '<span>from filename (not upload order)</span></div>');
+      var badgeText = 'SOURCE ROLE NOT DETECTED';
+      if (slot.role === 'before') badgeText = 'BEFORE IMAGE \u2014 SOURCE VERIFIED';
+      else if (slot.role === 'after') badgeText = 'AFTER IMAGE \u2014 SOURCE VERIFIED';
+      else if (slot.role === 'thumb') badgeText = 'THUMBNAIL \u2014 SOURCE VERIFIED';
+      parts.push('<div class="kv"><span><b>' + escT(badgeText) + '</b></span><span>from filename (not upload order)</span></div>');
```

### Hunk 4 – thumbPreviewHTML badges (lines ~1854-1880)
```diff
-    out.push('<div class="who"><span class="badge" style="background:#852222;color:#fff;margin-right:.3rem">BEFORE</span> Detected Role: ' + (st.before ? escT(st.before.roleLabel) : 'none') + '</div>');
+    var beforeBadge = st.before && st.before.role === 'before' ? 'BEFORE IMAGE \u2014 SOURCE VERIFIED' : 'SOURCE ROLE NOT DETECTED';
+    out.push('<div class="who"><span class="badge" style="background:#852222;color:#fff;margin-right:.3rem">BEFORE</span> ' + escT(beforeBadge) + ' \u2014 Detected Role: ' + (st.before ? escT(st.before.roleLabel) : 'none') + '</div>');
...
-    out.push('<div class="who"><span class="badge" style="background:#1e7d54;color:#fff;margin-right:.3rem">AFTER</span> Detected Role: ' + (st.after ? escT(st.after.roleLabel) : 'none') + '</div>');
+    var afterBadge = st.after && st.after.role === 'after' ? 'AFTER IMAGE \u2014 SOURCE VERIFIED' : 'SOURCE ROLE NOT DETECTED';
+    out.push('<div class="who"><span class="badge" style="background:#1e7d54;color:#fff;margin-right:.3rem">AFTER</span> ' + escT(afterBadge) + ' \u2014 Detected Role: ' + (st.after ? escT(st.after.roleLabel) : 'none') + '</div>');
```

### Hunk 5 – wrapP guard in buildPayloads (lines ~1205-1210)
```diff
-    function wrapP(txt) {
-      var v = String(txt || '');
-      if (/Use the supplied Before image exactly as the BEFORE source image\./i.test(v) && /Use the supplied After image exactly as the AFTER source image\./i.test(v)) return v;
-      return v ? (v + '\n\n' + PLX.PROTECTION) : PLX.PROTECTION;
-    }
+    function wrapP(txt) {
+      var v = String(txt || '');
+      if (/SOURCE IMAGE PROTECTION/i.test(v)) return v;
+      return v ? (v + '\n\n' + PLX.PROTECTION) : PLX.PROTECTION;
+    }
```

## Hunks Changed
- 5 hunks, all within Thumbnail Protection layer
- 0 hunks outside affected feature
- 0 CSS changes outside feature
- 0 Parser changes
- 0 Customize Prompt changes
- 0 Image Studio layout changes (vertical order preserved)

## Validation of No Side Effects
- Blogger XML untouched
- Universal Card JSON untouched
- Prompt Libraries (.md) untouched
- CSS outside affected feature untouched
- Prompt parser untouched
- Customize Prompt untouched
- Thumbnail Style Preset (PLE-06) preserved – 4 presets distinct, regen on select still works
- JS syntax `node --check` PASS

## Why This Fixes PLE-07
- Role detection already supported Before/After jpg/jpeg/png/webp case-insensitive, but badge text updated to exact required `BEFORE IMAGE — SOURCE VERIFIED` / `AFTER IMAGE — SOURCE VERIFIED` / `SOURCE ROLE NOT DETECTED`
- Protection text updated to exact 8 required instructions, header `SOURCE IMAGE PROTECTION (mandatory):`
- Duplication guard changed from checking old phrases to checking header `/SOURCE IMAGE PROTECTION/i` – ensures exactly one protection rule in Section 10 preview and copied prompt
- Upload order independence already implemented via `detectRole` from filename, not order – verified with reversed order test
- Copy Thumbnail Prompt includes protection exactly once via `thumbWithProtection` and `wrapP`

**Status:** PASS – Protection layer only, no side effects
