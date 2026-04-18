# sdev for Visual Studio Code

Official VS Code support for the **sdev** programming language.

## Features

- 🎨 **Syntax highlighting** for `.sdev` and `.sdv` files (keywords, strings, numbers, hex, scientific notation, operators, classes, functions, blocks)
- 🧩 **Snippets** for every core language construct (`forge`, `conjure`, `ponder`, `cycle`, `iterate`, `essence`, `attempt`, `lambda`, `pipe`, ternary, …)
- ⚡ **Run command** — press `Ctrl+Enter` / `Cmd+Enter` in any `.sdev` file to execute it
- ✂️ **Run selection** — `Ctrl+Shift+Enter` / `Cmd+Shift+Enter` runs only the highlighted code
- 🧠 **Bundled interpreter** — the extension ships with the full sdev JavaScript interpreter, so no separate install is required (works on any machine that has Node.js, which VS Code itself uses)
- 🌐 **Online playground** — `sdev: Open Online Playground` command jumps to the web IDE
- 🔁 **Auto-closing blocks** — `::` automatically pairs with `;;`, with proper indentation and folding
- 💬 **Comments** — both `//` and `#` line comments + `/* */` blocks

## Commands

| Command                     | Default keybinding              |
| --------------------------- | ------------------------------- |
| `sdev: Run File`            | `Ctrl+Enter` / `Cmd+Enter`      |
| `sdev: Run Selection`       | `Ctrl+Shift+Enter` / `Cmd+Shift+Enter` |
| `sdev: Open Online Playground` | (Command Palette only)       |

## Settings

| Setting           | Default     | Description                                                  |
| ----------------- | ----------- | ------------------------------------------------------------ |
| `sdev.runner`     | `bundled`   | `bundled` (Node + bundled interpreter), `node`, or `python`  |
| `sdev.nodePath`   | `node`      | Path to the `node` executable                                |
| `sdev.pythonPath` | `python3`   | Path to the Python executable (only for the `python` runner) |

## Quickstart

1. Install the extension (`.vsix`)
2. Open or create a `.sdev` file
3. Type `hello` and press `Tab` — you'll get a complete Hello World snippet
4. Press `Ctrl+Enter` to run it; output appears in the **sdev** Output panel

```sdev
forge message be "Hello, World!"
speak(message)

conjure greet(name) ::
  yield "Hello, " + name + "!"
;;

speak(greet("sdev"))
```

## Installation (manual / `.vsix`)

```
code --install-extension sdev-language-1.0.0.vsix
```

…or in VS Code: **Extensions panel → ⋯ menu → Install from VSIX…**

## License

MIT
