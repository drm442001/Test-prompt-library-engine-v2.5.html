# Git Diff Summary – Prompt D (PLE-04) Fix All Broken Buttons

Target: `prompt-library-engine-v2.5.2-enterprise.html`
Commit base: 9356f84 (after Prompt C)

## Diff

```diff
@@ -200,7 +200,10 @@
     <div class="toolbar" id="libbar"></div>
     <div class="layout">
       <div class="listwrap">
-        <input type="text" class="search" id="search" placeholder="Search title or label..." aria-label="Search prompts by title or label" />
+        <div style="display:flex;gap:.4rem;align-items:center;margin-bottom:.5rem">
+          <input type="text" class="search" id="search" placeholder="Search title or label..." aria-label="Search prompts by title or label" style="margin-bottom:0;flex:1" />
+          <button type="button" class="cbtn ghost" id="clearSearchBtn" aria-label="Clear search" title="Clear search">✕</button>
+        </div>
         <ul class="plist" id="plist"></ul>
         <div class="count" id="count"></div>
       </div>
@@ -1806,14 +1809,18 @@ var PLX = (function () {
     return '<div class="menu"><button type="button" class="cbtn spec" data-action="menu" aria-haspopup="true" aria-expanded="false">Thumbnail suffix: ' + escT(cur) + '</button>' +
       '<ul class="menu-list" role="menu" aria-label="Thumbnail filename suffix" hidden>' + items + '</ul></div>';
   }
-  var MENU_STATE = { close: null };
+  var MENU_STATE = { closes: [] };
   function wireMenu(p) {
     var wrap = el('imagebody');
+    if (!wrap) return;
+    MENU_STATE.closes = [];
     wrap.querySelectorAll('.menu').forEach(function (menu) {
       var btn = menu.querySelector('button[data-action="menu"]'), list = menu.querySelector('.menu-list');
+      if (!btn || !list) return;
       function close(back) { list.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (back) btn.focus(); }
-      MENU_STATE.close = close;
-      btn.addEventListener('click', function () { if (list.hidden) { list.hidden = false; btn.setAttribute('aria-expanded', 'true'); var f = list.querySelector('button'); if (f) f.focus(); } else close(true); });
+      function open() { list.hidden = false; btn.setAttribute('aria-expanded', 'true'); var f = list.querySelector('button'); if (f) f.focus(); }
+      MENU_STATE.closes.push(close);
+      btn.addEventListener('click', function () { if (list.hidden) open(); else close(true); });
       btn.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
       list.addEventListener('keydown', function (e) {
         var items = [].slice.call(list.querySelectorAll('button')), i = items.indexOf(document.activeElement);
@@ -2275,8 +2282,13 @@ var PLX = (function () {
     el('sampleBtn').addEventListener('click', function () { addLibrary(SAMPLE, 'v5.0 Sample Library'); S.tab = 'library'; render({ force: true }); });
     el('clearBtn').addEventListener('click', clearAll);
     el('search').addEventListener('input', function () { S.search = el('search').value; S.dirty.library = true; render(); });
+    var csb = el('clearSearchBtn');
+    if (csb) csb.addEventListener('click', function () { el('search').value = ''; S.search = ''; S.dirty.library = true; render(); el('search').focus(); });
     document.addEventListener('click', function (e) {
-      if (MENU_STATE.close && e.target && !(e.target.closest && e.target.closest('.menu'))) MENU_STATE.close(false);
+      if (e.target && !(e.target.closest && e.target.closest('.menu'))) {
+        (MENU_STATE.closes || []).forEach(function (fn) { try { fn(false); } catch (err) { } });
+        if (MENU_STATE.close) { try { MENU_STATE.close(false); } catch (err2) { } }
+      }
     }, false);
     mkInput();
     TABS.forEach(function (t) { el('panel-' + t.id).hidden = t.id !== S.tab; });
```

## Change Breakdown

1. **Search clear UI** (lines 200-207): Wrapped search input + added clearSearchBtn, flex layout, no CSS file change outside affected feature (inline style only).

2. **wireMenu fix** (1809-1824):
   - `MENU_STATE` changed from `{close:null}` to `{closes:[]}` to track all menus.
   - Added null guards for wrap/btn/list.
   - Defined `open()` function previously missing, fixing ReferenceError on keydown.
   - Push close to array, click now calls open()/close() cleanly.
   - Prevents duplicate close overwrite.

3. **Boot wiring** (2282-2290):
   - Added clearSearchBtn click handler clearing search, dirty flag, render, focus.
   - Outside click handler now iterates closes array, backward compatible with old close.

## Scope Compliance

- Only modified feature mentioned in Prompt D (broken buttons).
- No Blogger XML, Universal Card, .md libraries, CSS outside feature, unrelated JS modified.
- Single file target.

## Validation

- test-prompt-d.mjs PASS 19/19
- test-prompt-b.mjs PASS
- test-prompt-c.mjs PASS
- Real Photo-Retouch-Prompts.md tested via engine harness, no regression.
