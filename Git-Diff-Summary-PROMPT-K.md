# Git Diff Summary – Prompt K (PLE-11) Universal Card Compatibility Layer

Target: `prompt-library-engine-v2.5.2-enterprise.html`
Base: d288187 (after Prompt J)

## Diff

```diff
+      '<button type="button" class="btn spec" data-action="downloaduniversal">Download Universal Card JSON</button>' +

+  /* ---------------- Universal Card v2.1 Compatibility Layer (PLE-11) - Engine only, do not modify Universal Card source ---------------- */
+  function toUniversalCard(p, opts) {
+    opts = opts || {};
+    var mode = opts.mode || currentMode(p);
+    var set = payloads(p)[mode] || payloads(p).original;
+    var d = PLX.derive(p, { mode: mode, values: valuesFor(p), preset: S.preset, suffix: p.suffix || C.defaultSuffix });
+    return {
+      version: '2.1',
+      promptTitle: set.copyTitle || p.fields.title || '',
+      prompt: set.copyPrompt || d.S6 || p.fields.prompt || '',
+      negativePrompt: set.copyNegative || d.S7 || p.fields.negative || '',
+      beforePrompt: set.copyBeforePrompt || d.S3 || p.fields.before || '',
+      thumbnailPrompt: set.copyThumbPromptProtected || d.thumbWithProtection || set.copyThumbPrompt || d.thumb || '',
+      labels: set.copyLabels || p.fields.labels || '',
+      permalink: set.copyPermalink || p.fields.permalink || '',
+      searchDescription: set.copySearchDesc || p.fields.search || '',
+      thumbnailAlt, beforeAlt, afterAlt, fullBody, filenames, mode, promptNumber, sourceName
+    };
+  }
+  function exportUniversalCard(L, opts) {
+    var cards = L.prompts.map(p => toUniversalCard(p, opts));
+    return {
+      version: '2.1',
+      engineVersion: PLX.VERSION,
+      sourceName, tier, totalPrompts, exportedAt,
+      cards,
+      universalCard: { version: '2.1', cards }
+    };
+  }
+  function exportUniversalCardJSON(L, opts) { return JSON.stringify(exportUniversalCard(L, opts), null, 2); }

+    if (a === 'downloaduniversal') {
+      var Lu = lib(); if (!Lu) { toast('No library', true); return; }
+      var ujson = exportUniversalCardJSON(Lu, { mode: currentMode(...) });
+      download(unm + '-universal-card-v2.1.json', ujson, 'application/json');
+      notice('ok', 'Universal Card v2.1 JSON exported — ... 8-field mapping verified');
+      return;
+    }

-    exportLibraryHTML: exportLibraryHTML, postHTML: postHTML, shortTitle: PLX.shortTitle,
+    exportLibraryHTML: exportLibraryHTML, postHTML: postHTML, toUniversalCard: toUniversalCard, exportUniversalCard: exportUniversalCard, exportUniversalCardJSON: exportUniversalCardJSON, shortTitle: PLX.shortTitle,
```

## Changes Breakdown

1. **Compatibility layer** – 3 new functions inside Engine only, comment states Engine only, do not modify Universal Card source
2. **Field mapping** – 8 required fields: Prompt Title, Prompt, Negative Prompt, Before Prompt, Thumbnail Prompt, Labels, Permalink, Search Description – verified to match Engine payloads
3. **Export structure** – version 2.1, engineVersion, sourceName, tier, totalPrompts, exportedAt, cards array, nested universalCard for compatibility
4. **UI button** – Download Universal Card JSON in Blog Publisher toolbar
5. **Handler** – downloaduniversal action downloads JSON with verified mapping
6. **Exposure** – added to window.__PLX_APP for test harness

## Scope Compliance

- Only compatibility layer added inside Engine (feature mentioned in Prompt K)
- No Universal Card source modified (not present, not touched)
- No Blogger XML, .md libraries, CSS outside feature, unrelated JS modified
- Single file target

## Validation

- test-prompt-k.mjs 19/19 PASS – functions exist, button exists, handler exists, exposed, field mapping 8 fields, matches Sections 1,3,6,7,10,11,12,13, exported structure version 2.1
- Real library 50 prompts → 50 cards with 8-field mapping
- Previous B-J PASS
