# Git Diff Summary – MGS-CUSTOMIZE-01 Customize Prompt Dropdown Generator

## Scope Locked
- Target: Customize Prompt module ONLY
- Files: `prompt-library-engine-v2.5.3-production.html` (primary), `prompt-library-engine-v2.5.2-enterprise.html` (synced)
- No parser changes, no thumbnail changes, no blog publisher changes, no CSS, no template

## Diff Overview

### Before (Customize panel at bottom of card, after Section 13)
```js
function cardHTML(p, L) {
  ...
  /* 2 INTRODUCTION */
  out.push(secBlock({ label: 'Section 2 · Introduction', ... }));

  /* 3 BEFORE IMAGE PROMPT */
  out.push(secBlock({ cls: 'before', label: 'Section 3 · Before Image Prompt', ... }));

  /* 4 THUMBNAIL ALT */ ...
  /* 5 BEFORE / AFTER ALT */ ...
  /* 6 PROMPT */ ...
  /* 7 NEGATIVE */ ...
  /* 8 TOOLS */ ...
  /* 9 HOW TO USE */ ...
  /* 10 THUMBNAIL */ ...
  /* 11/12/13 */ ...

  out.push(customizePanel(p)); // <-- at bottom
  out.push(exportRow(p, L));
}
```

### After (Customize panel above Before Image Prompt – LOCKED UI)
```js
function cardHTML(p, L) {
  ...
  /* 2 INTRODUCTION */
  out.push(secBlock({ label: 'Section 2 · Introduction', ... }));

  /* MGS-CUSTOMIZE-01: Customize Prompt panel appears above Before Image Prompt (LOCKED UI) */
  out.push(customizePanel(p));

  /* 3 BEFORE IMAGE PROMPT */
  out.push(secBlock({ cls: 'before', label: 'Section 3 · Before Image Prompt', ... }));

  /* 4 THUMBNAIL ALT */ ...
  /* ... 5-13 ... */

  out.push(exportRow(p, L)); // customizePanel removed from bottom
}
```

### Image Studio – Already Compliant (No Change)
```js
function renderImageTab() {
  /* 1 Prompt Title */
  /* CUSTOMIZE PROMPT LOCATION: appears ABOVE Section 2 */
  out.push('<div class="sec" id="customize-image-..."> ... varControlsInner ... </div>');
  /* 2 Before Image Prompt */
  /* 3 Main Prompt */
  /* ... */
}
```
- Image Studio already had customize above Before (PLE-08 locked) – no diff needed – PASS

## Customize Module Details (Unchanged Logic, Only Placement)

### Extraction – ONLY Section 9 Step 4 – PASS
```js
var RE_STEP4 = /step\s*4\b[^\n]*\bcustomi[sz]e\b/i;
var RE_DEF = /^\s*(?:[-*+>•]+\s*)*(?:→|->)?\s*`?\[([^\]\[]+)\]`?\s*=\s*(.+?)\s*$/;

function extractStep4(howto) {
  // Finds Step 4 inside howto (Section 9)
  // Parses only block after Step 4 until Step 5/Expected/Tips/##
  // Supports →, •, -, [VAR]=Value, ->, backticked
}
```

### Dropdown Generation – PASS
```js
function varControlsInner(p, anchor) {
  // For each var:
  // <div class="vname">[NAME]</div>
  // <select data-action="var" data-var="NAME">
  //   <option>value1</option>...
  //   <option value="__custom__">Custom Value</option>
  // </select>
  // <input type="text" data-action="var" hidden />
}
```

### Runtime State – PASS
```js
var S = {
  custom: {},      // libId|num -> { varName: value }
  customMode: {},  // libId|num -> { varName: true } Custom selected
};

function setVar(p, name, value) {
  S.custom[pkey(p)][name]=value;
  S.mode='customized';
  S.dirty={library:true,image:true,publisher:true};
  render();
}
```

### Show Textbox on Custom Value – PASS
```js
function wireVarControls(p) {
  select.addEventListener('change', function() {
    if(v==='__custom__'){
      S.customMode[k][name]=true;
      box.hidden=false; box.focus();
      return;
    }
    delete S.customMode[k][name];
    box.hidden=true;
    setVar(p,name,v);
  });
  input.addEventListener('input', function(){
    setVar(p,name,v);
  });
}
```

### No Markdown Mutation – PASS
- Core comment preserved: `Pure module: no DOM writes, no markdown mutation. Source text is never altered.`
- `payloads` builds new via `PLX.derive`, never mutates `p.raw` or `p.fields`

## Hunks Changed
- 1 hunk in `cardHTML`: moved `customizePanel(p)` from after Section 13 to after Section 2 (above Section 3)
- 0 hunks in parser, thumbnail, blog publisher, CSS, template
- Image Studio already compliant – 0 hunks

## Validation of No Side Effects
- Parser untouched (RE_STEP4, RE_DEF preserved)
- Thumbnail preset logic untouched
- Blog Publisher untouched
- Validation Center untouched
- Responsive untouched
- JS syntax `node --check` PASS

**Status:** PASS – Customize module only, UI locked above Before Image Prompt
