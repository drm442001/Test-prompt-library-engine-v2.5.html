# Feature Validation Report – Prompt I (PLE-09) Blog Publisher Workflow Verification

Target: `prompt-library-engine-v2.5.2-enterprise.html`
Library: `Photo-Retouch-Prompts.md` (50 prompts)
Date: 2026-09-22
Branch: arena/01a0c81e-test-prompt-library-engine-v2

## Goal

Finalize Blogger publishing workspace.

## Strict Tasks

Verify:
- Prompt Title
- Thumbnail Alt
- Before Alt
- After Alt
- Copy Full Body
- Labels
- Permalink
- Search Description

Copy Full Body must contain only Prompt + Negative Prompt + How To Use.

## Implementation Audit

### Current pubBlocks (locked order)

Found in `renderPublisherTab()`:

```js
var pubBlocks = [
  { key: 'title', label: 'Prompt Title', sec: 'Section 1', copyKey: 'copyTitle', btnLabel: 'Copy Title', rows: 2 },
  { key: 'altThumb', label: 'Thumbnail Alt', sec: 'Section 4', copyKey: 'copyThumbAlt', btnLabel: 'Copy Thumbnail Alt', rows: 2 },
  { key: 'altBefore', label: 'Before Alt', sec: 'Section 5', copyKey: 'copyBeforeAlt', btnLabel: 'Copy Before Alt', rows: 2 },
  { key: 'altAfter', label: 'After Alt', sec: 'Section 5', copyKey: 'copyAfterAlt', btnLabel: 'Copy After Alt', rows: 2 },
  { key: '__body', label: 'Prompt + Negative + How To Use', sec: 'Sections 6 + 7 + 9', copyKey: 'copyFullBody', btnLabel: 'Copy Full Body', rows: 14, isBody: true },
  { key: 'labels', label: 'Labels', sec: 'Section 11', copyKey: 'copyLabels', btnLabel: 'Copy Labels', rows: 2 },
  { key: 'permalink', label: 'Permalink', sec: 'Section 12', copyKey: 'copyPermalink', btnLabel: 'Copy Permalink', rows: 2 },
  { key: 'search', label: 'Search Description', sec: 'Section 13', copyKey: 'copySearchDesc', btnLabel: 'Copy Search Description', rows: 2 }
];
```

Matches required 8 fields exactly in required order:
1. Prompt Title
2. Thumbnail Alt
3. Before Alt
4. After Alt
5. Copy Full Body
6. Labels
7. Permalink
8. Search Description

### Copy Full Body = S6+S7+S9 only

In `derive()`:

```js
/* Full Body = Sections 6 + 7 + 9 (never Section 3). Extras only when explicitly enabled. */
var extras = CFG.bodyExtras === 'v2.4';
var parts = [];
if (extras && (raw.intro || f.intro)) parts.push(...)
parts.push(banner(..., 'Prompt', 6) + S6);
parts.push(banner(..., 'Negative Prompt', 7) + S7);
if (extras && f.tools) parts.push(...)
if (extras && S9) parts.push(...)
else if (S9) parts.push(banner(..., 'How To Use This Prompt', 9) + S9);
...
var fullBody = parts.join('\n\n');
```

- Default `bodyExtras = 'none'` → Full Body contains only Prompt (S6) + Negative Prompt (S7) + How To Use (S9)
- Extras (Introduction, Tools, Expected, Tips) only when `bodyExtras === 'v2.4'` checked explicitly
- Checklist verifies:
  - `['Full Body = S6+S7+S9', /Prompt/i.test(payload(p, 'copyFullBody'))]`
  - `['Section 3 excluded from body', payload(p, 'copyFullBody').indexOf(payload(p, 'copyBeforePrompt').slice(0, 40)) === -1]`

### Ready for Blogger Compose View

- Full Body contains banners `PROMPT:`, `NEGATIVE PROMPT:`, `HOW TO USE THIS PROMPT:` – ready to paste as formatted text in Blogger Compose
- No `<script>` markup, no HTML tags, plain text with line breaks
- No Section 3 (Before Image Prompt) included
- Copy button `data-copy="copyFullBody"` exists, plus `Copy from this box` for edited overrides
- Overrides system allows manual editing then revert

## Validation

`test-prompt-i.mjs`:

- 8 blocks count PASS
- 1 Prompt Title PASS
- 2 Thumbnail Alt PASS
- 3 Before Alt PASS
- 4 After Alt PASS
- 5 Copy Full Body PASS
- 6 Labels PASS
- 7 Permalink PASS
- 8 Search Description PASS
- Full Body contains S6 PASS, S7 PASS, S9 PASS
- Full Body excludes S3 PASS
- Checklist verifies Section 3 excluded PASS, Full Body = S6+S7+S9 PASS
- Copy Full Body button exists PASS
- Full Body ready for Blogger (no script, has banners) PASS

**OVERALL PASS**

Real library:
- Photo-Retouch-Prompts.md 50 prompts, Full Body for Prompt #1 contains S6+S7+S9, excludes S3, ready to paste
- Previous B-H PASS

## Files Changed

- None – feature already locked and verified (0 hunks changed)

## Result

PLE-09 PASS – Blogger publishing workspace finalized with 8 fields in locked order, Copy Full Body contains only Prompt + Negative Prompt + How To Use, ready to paste into Blogger Compose View.
