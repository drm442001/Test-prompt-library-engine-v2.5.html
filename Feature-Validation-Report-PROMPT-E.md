# Feature Validation Report – Prompt E (PLE-05) Restore Original Template Download

Target: `prompt-library-engine-v2.5.2-enterprise.html`
Library: `Photo-Retouch-Prompts.md` (50 prompts)
Date: 2026-09-22
Branch: arena/01a0c81e-test-prompt-library-engine-v2

## Goal

Restore the old Prompt Library template with all original rules plus new Customize Prompt support.

## Strict Tasks

- Keep old template structure (13 sections in locked order)
- Restore:
  - Category selector
  - Approved Labels
  - Rules
  - Checklist
  - Template instructions
  - Help text
- Add new features without removing old template content

## Implementation

Replaced `TEMPLATE_TEXT` variable (lines 2300-2317) with restored comprehensive template containing:

### Old Structure Preserved (verbatim rules)
- Header `PROMPT LIBRARY TEMPLATE v5.0`
- Intro `Every prompt must follow these 13 sections. The engine also reads legacy 9-section libraries.`
- 13 section placeholders:
  - **1 · POST TITLE** `[SEO title, 50-60 characters, must end with (2026)]`
  - **2 · INTRODUCTION** `[2-3 sentences, 40-60 words TOTAL]`
  - **3 · BEFORE IMAGE PROMPT** `[Show the PROBLEM/RAW state. Aspect Ratio: 3:2. Use [Variable]...]`
  - **4 · ALT TEXT - THUMBNAIL IMAGE** `[SEO alt text for 1200x630 thumbnail, max 125 characters]`
  - **5 · ALT TEXT - BEFORE / AFTER IMAGES** `Before Image Alt: ... After Image Alt: ...`
  - **6 · PROMPT** `[MAIN AI PROMPT - minimum 100 words. Every Step 4 variable must appear here.]`
  - **7 · NEGATIVE PROMPT** `[What to avoid - minimum 30 words]`
  - **8 · COMPATIBLE AI TOOLS** `[Recommended / Suitable / Limited - the engine never invents this list]`
  - **9 · HOW TO USE THIS PROMPT** `Step 1: ... Step 4: Customize these variables: -> [Variable Name] = allowed / values / here`
  - **10 · THUMBNAIL IMAGE GENERATOR PROMPT** `[Optional - if absent the engine shows a labelled generated fallback]`
  - **11 · LABELS (SEO)** `[Primary category first, max 5 labels]`
  - **12 · PERMALINK** `[lowercase-hyphenated-slug]`
  - **13 · SEARCH DESCRIPTION** `[120-150 characters exactly]`

All old rules retained verbatim.

### Restored Sections (previously missing)

1. **CATEGORY SELECTOR**
   - Explains primary category must be first label in Section 11
   - Lists available categories: Photo Retouch, Photo Cleaning, Color Grading, Wedding Edit, HD Enhance, AI Art, Background Removal, Portrait Editing
   - Rule: one primary per prompt, max 5 total

2. **APPROVED LABELS**
   - Primary labels list (9)
   - Secondary SEO labels list (15)
   - Rules: comma separated, no trailing comma, primary first, lowercase slugs for secondary

3. **RULES — OLD TEMPLATE RULES (MUST KEEP)** – 20 rules:
   - Rule 1: 13 sections locked order
   - Rule 2: legacy 9-section backward compatible
   - Rule 3-15: detailed per-section rules (char counts, word counts, format)
   - Rule 16: Before/After filename suffix detection
   - Rule 17: Thumbnail suffix options
   - Rule 18: Full Body = 6+7+9 only
   - Rule 19: No HTML markup
   - Rule 20: Year handling

4. **CHECKLIST — BEFORE SUBMITTING** – 17 checkboxes covering all sections, variables, duplicates, markup

5. **TEMPLATE INSTRUCTIONS** – 8 steps: copy, replace, duplicate blocks, separator, [VARIABLE] usage, Step 4 format, test import, export

6. **HELP TEXT**
   - How to write good prompts per section
   - Common mistakes list (7 items)

### New Feature Added (without removing old)

7. **CUSTOMIZE PROMPT SUPPORT (NEW v2.5)**
   - Explains Step 4 is source of truth
   - Format `-> [VARIABLE NAME] = value / value / value`
   - Supports ->, -, • prefixes, backticks optional
   - First value default, dropdown + Custom Value
   - Textbox only when Custom Value selected
   - Exact token match, every occurrence S3/S6/S10
   - Original vs customized copy buttons (5 required)
   - Variables only from Section 9 Step 4
   - Longest name first replacement
   - Persistence and reset
   - Example Step 4 block with 3 variables
   - WE-002 validation explanation (INFO for split S3/S6)

## Validation

Test harness `test-prompt-e.mjs` checks 28 conditions:

- Old header present
- Every old rule present (13 sections with specific phrases)
- Category selector present
- Approved Labels present
- Rules with Rule 1: etc.
- Checklist present
- Template Instructions present
- Help Text present
- Customize Prompt Support present with dropdown, Custom Value, 5 copy buttons, -> [VARIABLE] format
- Photo Retouch, Photo Cleaning, Color Grading, Wedding Edit categories present

Result: **28/28 PASS, OVERALL PASS**

Additional regression:
- test-prompt-b.mjs PASS (150 vars)
- test-prompt-c.mjs PASS (original preserved)
- test-prompt-d.mjs PASS (19/19)
- Real library Photo-Retouch-Prompts.md still parses 50 prompts, 0 errors

## Output File

`prompt-library-engine-v2.5.2-enterprise.html` – TEMPLATE_TEXT now 10508 chars (was ~800 chars), contains all old rules + new support.

## Files Changed

- `prompt-library-engine-v2.5.2-enterprise.html` only (single file scope locked)

## Result

PLE-05 PASS – Old template structure restored with Category selector, Approved Labels, Rules, Checklist, Template instructions, Help text, plus new Customize Prompt support, without removing old content.
