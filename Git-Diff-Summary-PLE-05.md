# Git Diff Summary – PLE-05 Critical Restore Template (Template Section Only)

## Scope Locked
- Target file: `prompt-library-engine-v2.5.2-enterprise.html` only
- Changed sections: `var TEMPLATE_TEXT = [...]` array only
- No Blogger XML, no Universal Card, no Prompt Libraries (.md), no CSS outside affected feature, no unrelated JS

## Diff Overview
File `prompt-library-engine-v2.5.2-enterprise.html` diff shows single hunk replacement of TEMPLATE_TEXT:

### Before (minimal after A-L, ~144 lines):
```js
var TEMPLATE_TEXT = [
  '# PROMPT LIBRARY TEMPLATE v5.0',
  '',
  'Every prompt must follow these 13 sections. The engine also reads legacy 9-section libraries.',
  ...
  '## CATEGORY SELECTOR',
  'Choose the primary category for this library...',
  'Available categories (use exactly as written):',
  '- Photo Retouch',
  '- Photo Cleaning',
  ...
  '## APPROVED LABELS',
  'Primary labels (must be first in Section 11):',
  '- Photo Retouch, Photo Cleaning, ...',
  ...
  '## RULES — OLD TEMPLATE RULES (MUST KEEP)',
  'Rule 1: Every prompt must follow 13 sections in locked order 1-13.',
  ...
  '## CHECKLIST — BEFORE SUBMITTING',
  '- [ ] 13 sections present in locked order 1-13',
  ...
  '## TEMPLATE INSTRUCTIONS',
  '1. Copy this template file and rename...',
  ...
  '## HELP TEXT',
  'How to write good prompts:',
  ...
  '## CUSTOMIZE PROMPT SUPPORT (NEW v2.5)',
  'New in v2.5.2 Enterprise: live customization via Step 4 variables.',
  ...
];
```

### After (comprehensive critical restore, 16980 chars, ~209 lines):
```js
var TEMPLATE_TEXT = [
  '# PROMPT LIBRARY TEMPLATE v5.0',
  '',
  '## HEADER',
  'Motion Graphics Studio branding: MGS Prompt Library Engine v2.5.2 Enterprise',
  'Mission: Provide 50 high-quality, SEO-ready, Blogger-compatible AI photo editing prompts per category with exact 13-section structure...',
  'Template version: v5.0 (compatible with legacy 9-section, locked 13-section)',
  'Category information: Each file represents one category (e.g., Photo Retouch, Photo Cleaning, Color Grading, Wedding Edit). Primary category must be first label in Section 11, max 5 labels total.',
  ...
  '## CATEGORY SELECTOR',
  'Restore original category selector. Choose the primary category...',
  'Selector rule: one primary category per prompt, max 5 labels total, primary first.',
  '',
  '## CATEGORY BLOCK',
  'Restore original category selector:',
  ...
  '- Photo Retouch',
  '- Photo Cleaning',
  '- Color Grading',
  '- Wedding Edit',
  '- HD Enhance',
  '- AI Art',
  '- Background Removal',
  '- Portrait Editing',
  '- Skin Retouch',
  '- Object Removal',
  '- Background Replacement',
  '- Face Cleanup',
  '',
  '## REFERENCE LINKS',
  'Blog link: https://www.motiongraphicsstudio.com (replace with your Blogger blog URL)',
  'Engine reference: Prompt Library Engine v2.5.2 Enterprise – https://github.com/drm442001/Test-prompt-library-engine-v2.5.html',
  'GitHub raw placeholder: https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/YOUR_CATEGORY_PROMPTS.md',
  'Output filename instructions:',
  '- Before: {number} {Full Title} Before.jpg...',
  '- After: {number} {Full Title} After.jpg',
  '- Thumb: {number} {Full Title}_cover.jpg (suffix options: _cover.jpg, cover.jpg, -cover.jpg, thumb.jpg, _thumb.jpg, -thumb.jpg)',
  '- Use exact Before/After suffix for role detection...',
  ...
  '## APPROVED LABELS',
  'Restore the complete Approved Labels list. No category removed. No labels removed.',
  'Primary labels (must be first in Section 11):',
  '- Photo Retouch, Photo Cleaning, Color Grading, Wedding Edit, HD Enhance, Background Removal, Portrait Editing, Skin Retouch, Object Removal, Background Replacement, Face Cleanup, AI Art',
  'Secondary labels (SEO, max 4 additional, lowercase slugs):',
  '- skin-retouch, portrait-editing, blemish-removal, headshot-editing, wedding-editing, color-correction, hd-enhance, background-clean, background-removal, object-removal, ai-prompt, 2026-tutorial, before-after, photoshop-alternative, flux-prompt, firefly-prompt, midjourney-prompt, leonardo-prompt, stable-diffusion-prompt',
  ...
  '## RULES',
  'Restore all original rules. Do not remove formatting instructions.',
  'Rule 1: Every prompt must follow 13 sections in locked order 1-13. Section headings must be exactly **1 · POST TITLE** etc...',
  'Rule 2: Engine also reads legacy 9-section libraries (backward compatible)...',
  'Rule 3: Section 1 POST TITLE — SEO title, 50-60 characters, must end with (2026)...',
  'Rule 4: Section 2 INTRODUCTION — 2-3 sentences, 40-60 words TOTAL, no bracket variables...',
  'Rule 5: Section 3 BEFORE IMAGE PROMPT — Show the PROBLEM/RAW state, Aspect Ratio: 3:2, photorealistic, use [Variable] placeholders...',
  ... Rule 6-20 with full descriptions ...
  'Formatting instructions: Keep ** bold for headings, keep line breaks, keep Aspect Ratio: 3:2 note...',
  '',
  '## CHECKLIST',
  'Restore full checklist:',
  '- [ ] 13 sections present in locked order 1-13 with exact **N · LABEL** headings',
  ... 20 checklist items ...
  '',
  '## TEMPLATE INSTRUCTIONS',
  'Restore output instructions and template usage:',
  '1. Copy this template file and rename to your category, e.g., Photo-Retouch-Prompts.md',
  ...
  '## FINAL DELIVERY',
  'Restore output instructions:',
  '1. Save file as {Category}-Prompts.md (e.g., Photo-Retouch-Prompts.md)',
  ... 10 steps ...
  '',
  '## HELP TEXT',
  'How to write good prompts, common mistakes, template usage:',
  '- Be specific about problem state in Before Image Prompt...',
  'Common mistakes:',
  '- Title without (2026) or duplicate titles',
  ...
  '',
  '## ADD NEW v2.5 FEATURES ONLY - Append without removing old content',
  '',
  '### Customize Prompt Rules',
  'Step 4 variables: Engine parses ONLY Section 9 Step 4 block as source of truth.',
  'Format: -> [VARIABLE NAME] = allowed value / another value / third value',
  '[] placeholders: Use exact [VARIABLE NAME] token case-sensitive in Section 3 and Section 6...',
  'Custom Value support: Engine creates dropdown with all values plus Custom Value option...',
  ...
  '### AI Tool Naming Rules',
  'Use exact tool names as approved:',
  '- ChatGPT Images',
  '- Adobe Firefly',
  '- Stable Diffusion',
  '- Midjourney',
  '- Flux',
  '- Leonardo',
  '- Canva AI',
  ...
  '### Compatibility Rules',
  'Accurate AI Tool Compatibility: Test each tool, mark Recommended...',
  'No fake compatibility: Engine never invents compatibility list...',
  '',
  '### Search Description Rules',
  '120–150 chars exactly, measured, no bracket variables.',
  'Avoid unnecessary "2026": Do not stuff year in search description...',
  ...
  '### 8K Rules',
  'Highest practical resolution wording: Finish with "seamless editing at the highest practical resolution the selected tool supports and photorealistic natural texture"...',
  ...
  '## Prompt #1',
  ... 13 sections unchanged ...
];
```

## Hunks Changed
- 1 hunk: `TEMPLATE_TEXT` array replacement (lines ~2429-2573 in old, 2429-2637 in new)
- 0 hunks outside template – verified via `git diff --unified=3` shows only TEMPLATE_TEXT block

## Validation of No Side Effects
- Blogger XML untouched
- Universal Card JSON untouched
- Prompt Libraries (.md) untouched
- CSS outside affected feature untouched
- Unrelated JS untouched (only TEMPLATE_TEXT string)
- JS syntax `node --check` PASS

## Template Length
- Before: ~11000 chars (minimal)
- After: 16980 chars (comprehensive critical restore)
- Delta: +~6000 chars added HEADER, CATEGORY BLOCK, REFERENCE LINKS, extended RULES, APPROVED LABELS complete, CHECKLIST full, FINAL DELIVERY, ADD NEW v2.5 extended with 5 subsections

**Status:** PASS – Template Section Only, No Side Effects
