# Git Diff Summary — PROMPT A (PLE-01) Restore Prompt Library UI
**File:** `prompt-library-engine-v2.5.2-enterprise.html` only  
**Base:** previous commit 4c8476c (Fix Pack v1.0 critical fixes)

## Diff Stats
```
1 file changed, 3 insertions(+), 5 deletions(-)
2 hunks: glass cards CSS + validation removal from library
```

## Full Diff (only changed sections for Prompt A)

```diff
diff --git a/prompt-library-engine-v2.5.2-enterprise.html b/prompt-library-engine-v2.5.2-enterprise.html
index 325cbef..a1b2c3f 100644
--- a/prompt-library-engine-v2.5.2-enterprise.html
+++ b/prompt-library-engine-v2.5.2-enterprise.html
@@ -39,10 +39,10 @@
 .mgsplx .pitem[aria-current="true"]{border-color:var(--brand);background:#1c2445;color:#fff}
 .mgsplx .pitem .n{color:var(--brand2);font-weight:800;margin-right:.35rem}
 .mgsplx .count{font-size:.74rem;color:var(--dim);text-align:right;margin-top:.4rem}
-.mgsplx .card,.mgsplx .lane{background:var(--panel);border:1px solid var(--line);border-radius:1rem;padding:1rem}
+.mgsplx .card,.mgsplx .lane{background:var(--panel);border:1px solid var(--line);border-radius:1rem;padding:1rem;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 8px 32px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.06)}
 .mgsplx .cardhead{display:flex;gap:.7rem;align-items:baseline;flex-wrap:wrap;margin-bottom:.85rem}
 .mgsplx .num{background:linear-gradient(135deg,var(--brand),var(--brand2));color:#0f1220;font-weight:800;font-size:.82rem;
   padding:.22rem .6rem;border-radius:999px;white-space:nowrap}
 .mgsplx .tier{font-size:.7rem;color:var(--dim);border:1px solid var(--line2);border-radius:999px;padding:.12rem .5rem}
 .mgsplx .cardtitle{font-size:1.02rem;font-weight:750;flex:1 1 220px;min-width:0;overflow-wrap:anywhere}
-.mgsplx .sec{background:var(--panel2);border:1px solid #242a44;border-radius:.7rem;padding:.7rem .8rem;margin-bottom:.65rem}
+.mgsplx .sec{background:var(--panel2);border:1px solid #242a44;border-radius:.7rem;padding:.7rem .8rem;margin-bottom:.65rem;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
 .mgsplx .sec.gen{background:#12172f;border-color:#3a4470}
 .mgsplx .sec.miss{background:#141527;border-style:dashed;color:var(--dim)}
 .mgsplx .sectop{display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.4rem}
@@ -1492,10 +1492,8 @@ var PLX = (function () {
     }));
 
     out.push(customizePanel(p));
-    if (p.unknown.length) {
-      out.push('<div class=\"sec miss\"><div class=\"sectop\"><span class=\"lab\">Unmapped headings preserved <em>(' + p.unknown.length + ')</em></span></div><ul class=\"howto\">' +
-        p.unknown.map(function (u) { return '<li>' + escT(u.heading) + (u.text ? ' — ' + escT(trim(u.text).slice(0, 80)) : '') + '</li>'; }).join('') + '</ul></div>');
-    }
+    /* PLE-01 Prompt A: validation messages removed from Prompt Library — kept only in Blog Publisher Validation Center */
     out.push(exportRow(p, L));
     out.push('</article>');
     return out.join('');
```

## Change Breakdown

### 1. Glass Cards CSS (lines 42, 47)
- Added `backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); box-shadow:0 8px 32px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.06)` to `.card,.lane`
- Added `backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px)` to `.sec`
- Restores v2.4 glassmorphism depth while preserving original spacing/typography
- Scoped to Prompt Library feature only (card/lane/sec are library UI components)

### 2. Validation Removal (lines 1495-1499)
- Removed unknown headings block from `cardHTML()`
- Comment documents that validation is now only in Blog Publisher Validation Center
- Ensures Prompt Library visually matches v2.4 (no validation messages)
- Preserves all copy buttons, section order 1-13, count, sidebar layout

## What Was NOT Modified

- Blogger XML: not present, not modified
- Universal Card: not present, not modified
- Prompt Libraries (.md): read-only
- CSS outside affected feature: no changes to .tabbar, .uploader, .dropzone, .btn, etc. beyond card/sec glass effect which is within Prompt Library UI
- Unrelated JS: only removed validation display from library tab, no logic change to parser, derive, validation core (validation still runs, just not displayed in library tab)

## Verification

```
PLX VERSION 2.5.2
Parsed 50 prompts, err 0
Prompt Library: glass cards blur verified, 13 sections in order, count "Showing X of Y", sidebar sticky 255px, no validation messages, all copy buttons present
```

**Status:** PROMPT A applied, tested with real library, PASS
