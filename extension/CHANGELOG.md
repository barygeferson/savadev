# Changelog

## 1.1.0 — Multilingual translator + new commands

- 🌐 **Built-in 25-language translator** synced with the online playground.
  Write sdev in Spanish, French, German, Portuguese, Italian, Dutch, Russian,
  Chinese, Japanese, Korean, Arabic, Hindi, Turkish, Polish, Swedish,
  Norwegian, Danish, Finnish, Greek, Hebrew, Ukrainian, Czech, Romanian,
  Hungarian, or Bulgarian — both the JS and Python interpreters auto-translate
  before tokenizing.
- 🧠 Fuzzy keyword matcher (Levenshtein) handles typos, conjugations, and
  synonyms the strict dictionary misses.
- 🔧 Context fix: `forge name(` is automatically rewritten to `conjure name(`
  so natural-language verbs like Bulgarian `създай` work for both variables
  and method declarations.
- ✏️ New commands:
  - `sdev: Translate File to English sdev` (Ctrl+Alt+T)
  - `sdev: Translate Selection to English sdev`
  - `sdev: Detect Source Language`
  - `sdev: Open Language Documentation`
  - `sdev: Open the sdev Book`
- 📊 Status-bar item shows the active / auto-detected source language.
- ⚙️ New settings: `sdev.sourceLanguage`, `sdev.translate`,
  `sdev.showDetectedLanguage`.
- ✅ Python interpreter now ships with the same translator module the JS
  interpreter uses, so behavior is identical across runners.

## 1.0.0 — Initial release

- Syntax highlighting for `.sdev` / `.sdv`
- 16 snippets covering every language construct
- Run File / Run Selection commands with Ctrl+Enter keybindings
- Bundled JavaScript interpreter (no external install required)
- Optional Python runner
- Auto-closing `:: ;;` blocks, smart indentation, folding
- Bracket matching for `( )`, `[ ]`, and the `:: ;;` block markers
