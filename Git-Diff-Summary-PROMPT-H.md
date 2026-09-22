# Git Diff Summary – Prompt H (PLE-08) Image Studio Workflow Polish

Target: `prompt-library-engine-v2.5.2-enterprise.html`
Base: ab6cb81 (after Prompt G)

## Diff

```diff
-    /* Everything vertical: PATCH-06 required order */
+    /* Vertical workflow - PLE-08 locked order: 1 Title, 2 Before Prompt, 3 Main Prompt, 4 Negative Prompt, 5 Thumbnail Prompt */
     out.push('<div class="vflow">');

-    /* 1. Before Prompt */
+    /* 1. Prompt Title */
     out.push(secBlock({
-      cls: 'before', label: 'Before Image Prompt', note: 'Section 3 · raw / problem state' + ...
+      label: '1 · Prompt Title',
+      note: 'Section 1 · Post Title' + ...,
+      flag: p.fields.title ? ...,
+      value: p.fields.title || '— missing —',
+      actions: [{ name: 'copyTitle', label: 'Copy Prompt Title' }]
     }));

+    /* 2. Before Prompt */
     out.push(secBlock({
-      label: 'Before Title', note: 'file name convention',
-      value: payload(p, 'filenames').before,
-      actions: [{ name: 'copyBeforeTitle', ... }]
-    }));
-
-    /* 3. Prompt */
-    out.push(secBlock({
-      cls: 'after', label: 'Prompt', note: 'Section 6 · main prompt' + ...,
+      cls: 'before', label: '2 · Before Prompt', note: 'Section 3 · raw / problem state' + ...,
       ...

-    /* 4. Negative Prompt */
+    /* 3. Main Prompt */
     out.push(secBlock({
-      cls: 'after', label: 'Negative Prompt', note: 'Section 7',
+      cls: 'after', label: '3 · Main Prompt', note: 'Section 6 · main prompt' + ...,

-    /* 5. After Title */
-    out.push(secBlock({
-      label: 'After Title', note: 'file name convention',
-      value: payload(p, 'filenames').after,
-      actions: [{ name: 'copyAfterTitle', ... }]
-    }));
-
-    /* 6. Thumbnail Generator Prompt */
+    /* 4. Negative Prompt */
+    out.push(secBlock({
+      cls: 'after', label: '4 · Negative Prompt', note: 'Section 7',

-    /* 6. Thumbnail Generator Prompt */
+    /* 5. Thumbnail Prompt */
     out.push(secBlock({
-      cls: 'thumb', label: 'Thumbnail Generator Prompt',
+      cls: 'thumb', label: '5 · Thumbnail Prompt',

-    /* 7. Thumbnail Controls */
+    /* Thumbnail Controls - vertical, no side-by-side */

-    out.push('<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.6rem;margin-top:.4rem">');
+    out.push('<div style="display:flex;flex-direction:column;gap:.6rem;margin-top:.4rem">');
```

## Changes Breakdown

1. **Workflow order** – Reordered to required 5-section vertical stack:
   - 1 · Prompt Title (new first)
   - 2 · Before Prompt (was 1)
   - 3 · Main Prompt (was 3 Prompt)
   - 4 · Negative Prompt (was 4)
   - 5 · Thumbnail Prompt (was 6 Thumbnail Generator Prompt)
   - Removed Before Title and After Title file name blocks from main flow (not in required 5)

2. **Remove side-by-side cards** – Changed `thumbPreviewHTML` from `display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))` (side-by-side on desktop) to `display:flex;flex-direction:column` – vertical on all breakpoints, same order Desktop/Tablet/Mobile

3. **vflow preserved** – `display:flex;flex-direction:column` already vertical, no media query changes order

## Scope Compliance

- Only Image Studio workflow modified (feature mentioned in Prompt H)
- No Blogger XML, Universal Card, .md libraries, CSS outside feature (except inline style change from grid to flex column, which is within affected feature), unrelated JS not modified
- Single file target

## Validation

- test-prompt-h.mjs 11/11 PASS – order 1→5 correct, vflow vertical, no grid auto-fit, no laneHTML side-by-side, Before/After Title removed
- Real library 50 prompts PASS, previous B-G PASS
