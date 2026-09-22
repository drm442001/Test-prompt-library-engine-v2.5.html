# Git Diff Summary – Prompt F (PLE-06) Thumbnail Style Preset Dropdown

Target: `prompt-library-engine-v2.5.2-enterprise.html`
Base: 3b3740a (after Prompt E)

## Diff

```diff
-  var PRESET_NAMES = { studio: 'Studio Portrait Style (Default)', split: 'Split Arrow Style', minimal: 'Minimalist Clean', cinematic: 'Cinematic Bold' };
+    var PRESET_NAMES = { premium_dark: 'Premium Dark', cinematic_gold: 'Cinematic Gold', neon_purple: 'Neon Purple', minimal_clean: 'Minimal Clean' };
   var THUMB_TEMPLATES = {
-    studio: [ /* Studio Portrait */ ],
-    split: [ /* Split Arrow */ ],
-    minimal: [ /* Minimalist */ ],
-    cinematic: [ /* Cinematic Bold */ ]
+    premium_dark: [ /* Premium Dark – deep black dot-pattern, yellow pill bar, luxury editorial */ ],
+    cinematic_gold: [ /* Cinematic Gold – navy + gold #D4AF37, metallic gold badge, lens flare, gold foil */ ],
+    neon_purple: [ /* Neon Purple – #1a1a2e dark, neon purple #7c3aed glow, purple divider, cyberpunk */ ],
+    minimal_clean: [ /* Minimal Clean – white #fafafa, charcoal title, thin border, Scandinavian */ ]
   };

-      var tpl = THUMB_TEMPLATES[preset] || THUMB_TEMPLATES.studio;
+      var tpl = THUMB_TEMPLATES[preset] || THUMB_TEMPLATES.premium_dark;

-           '\nStyle Preset: ' + (PRESET_NAMES[preset] || PRESET_NAMES.studio), thumb)
+           '\nStyle Preset: ' + (PRESET_NAMES[preset] || PRESET_NAMES.premium_dark), thumb)

   function loadPreset() {
     var v = LS.get(C.lsPresetKey) || LS.get(C.lsPresetLegacyKey);
+    var map = { studio: 'premium_dark', split: 'neon_purple', minimal: 'minimal_clean', cinematic: 'cinematic_gold' };
+    if (v && map[v]) v = map[v];
     if (v && PLX.THUMB_TEMPLATES[v]) { S.preset = v; LS.set(C.lsPresetKey, v); }
+    else if (!v) { S.preset = 'premium_dark'; }
   }
```

## Changes Breakdown

1. **PRESET_NAMES** – Renamed keys to `premium_dark`, `cinematic_gold`, `neon_purple`, `minimal_clean` with exact display names required: Premium Dark, Cinematic Gold, Neon Purple, Minimal Clean.

2. **THUMB_TEMPLATES** – Four distinct templates:
   - premium_dark: deep black premium dark, dot-pattern, yellow pill bar, luxury editorial, subtle gold accent
   - cinematic_gold: navy + gold gradient #D4AF37, metallic gold badge embossed, gold glow, lens flare bokeh, movie-poster luxury
   - neon_purple: dark charcoal #1a1a2e, neon purple #7c3aed glow, purple divider, purple circular badge AI TRANSFORMATION, gradient bar purple→pink, cyberpunk tech
   - minimal_clean: white #fafafa dot grid, charcoal title, 1px black border 12px radius, thin arrow, muted gray tag, Scandinavian Apple-like

   All contain:
   - `{{SIZE}}`, `{{FORMAT}}`, `{{PROMPT_TITLE}}`, `{{YEAR}}`, `{{FEATURE_1-3}}`
   - `FIRST attached image = BEFORE` and `SECOND attached image = AFTER` preserved (Before/After placeholders not changed)
   - Instruction `Attach BEFORE image first, AFTER image second`

3. **Fallbacks** – Changed from `studio` to `premium_dark` for default.

4. **loadPreset migration** – Maps old stored values (studio, split, minimal, cinematic) to new keys, defaults to premium_dark if none.

5. **Regeneration** – Existing handler already sets `S.preset = n.value; LS.set(...); S.dirty = {library:true, image:true, publisher:true}; touchAll(); render();` – verified to regenerate Thumbnail Prompt.

## Scope Compliance

- Only preset-related code modified (feature mentioned in Prompt F)
- No Blogger XML, Universal Card, .md libraries, CSS outside feature, unrelated JS modified
- Before/After placeholders preserved

## Validation

- test-prompt-f.mjs 24/24 PASS
- Four styles produce different outputs (Set size 4)
- Before/After placeholders present in all four
- Selecting style regenerates (dirty+touchAll+render)
- Real library 50 prompts still PASS, previous prompts B-E PASS
