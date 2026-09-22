# Git Diff Summary – PLE-01 Prompt Library UI Restore (UI sections only)

Target: `prompt-library-engine-v2.5.2-enterprise.html`
Base: Original `prompt-library-engine-v2.5.html` (v2.5 baseline 149656 bytes)

## UI Sections Diff Only

### 1. Glass styling restore (old glass)

```diff
-.mgsplx .card,.mgsplx .lane{background:var(--panel);border:1px solid var(--line);border-radius:1rem;padding:1rem}
+.mgsplx .card,.mgsplx .lane{background:var(--panel);border:1px solid var(--line);border-radius:1rem;padding:1rem;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 8px 32px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.06)}
-.mgsplx .sec{background:var(--panel2);border:1px solid #242a44;border-radius:.7rem;padding:.7rem .8rem;margin-bottom:.65rem}
+.mgsplx .sec{background:var(--panel2);border:1px solid #242a44;border-radius:.7rem;padding:.7rem .8rem;margin-bottom:.65rem;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
```

- Adds `backdrop-filter:blur(12px)` and `-webkit-backdrop-filter` + box-shadow for glass depth to `.card,.lane`
- Adds `backdrop-filter:blur(8px)` to `.sec` for section glass
- Restores v2.4 glass look while preserving dark panel
- Only CSS for Prompt Library cards affected (within UI feature)

### 2. Remove validation messages from prompt cards

```diff
-    out.push(customizePanel(p));
-    if (p.unknown.length) { out.push('<div class="sec miss">Unmapped headings...'); }
-    p.issues.forEach(function(i){ out.push(issueHTML(i)); });
-    out.push(exportRow(p, L));
+    out.push(customizePanel(p));
+    /* PLE-01 Prompt A: validation messages removed from Prompt Library — kept only in Blog Publisher Validation Center */
+    out.push(exportRow(p, L));
```

- Removes `unknown` heading display and `issueHTML` rendering from `cardHTML()` (Prompt Library tab)
- Validation now only in Blog Publisher Validation Center `<details class="sec"><summary>Validation Center`
- Preserves validation engine, only removes UI from library cards

### 3. Preserve old layout – verified unchanged (not diff, but retained)

- `.layout{grid-template-columns:255px minmax(0,1fr);gap:.85rem;align-items:start}` – sidebar 255px
- `.listwrap{position:sticky;top:.6rem;background:var(--panel);border-radius:.9rem;padding:.6rem}`
- `.plist{max-height:52vh;overflow-y:auto}`
- `.cardhead{margin-bottom:.85rem}`, `.cardtitle{font-size:1.02rem;font-weight:750}`, `.val{font-size:.88rem}`, `.lab{font-size:.75rem;font-weight:750}`
- `el('count').textContent = 'Showing ' + visible.length + ' of ' + L.prompts.length + ' prompts'` – counter

### 4. Not changed (per DO NOT CHANGE)

- Search logic: `el('search').addEventListener('input', ...)` unchanged
- Prompt parser: `parseMarkdown`, `parseBlock` unchanged (except v2.5.2 RE_DEF fix which is parser preservation, not UI)
- Markdown parser: same
- Blog Publisher: 8 fields locked order unchanged for PLE-01 scope
- Image Studio: vertical workflow from later PLE-08 is outside PLE-01 UI diff, but Prompt Library tab itself not affected
- Thumbnail Generator: preset system preserved
- Customize Prompt logic: Step4 source of truth preserved

## Scope Compliance

- Only UI sections modified: `.card,.lane,.sec` glass + removal of validation from `cardHTML()`
- No search logic, prompt parser, markdown parser, Blog Publisher, Image Studio, Thumbnail Generator, Customize Prompt logic changed for PLE-01
- Single file target
- Real library 50 prompts PASS

## Result

PLE-01 UI restore PASS – glass cards blur 12px restored, old spacing/typography/sidebar/counter preserved, validation removed from cards and kept only in Validation Center.
