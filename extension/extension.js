/*
 * sdev VS Code extension — main entry point
 * --------------------------------------------------------------
 * Plain CommonJS, zero dependencies, zero build step.
 *
 * Commands:
 *   sdev.run                  — run the active .sdev file
 *   sdev.runSelection         — run the selected text
 *   sdev.openPlayground       — open the online playground
 *   sdev.translateFile        — translate the file in-place to English sdev
 *   sdev.translateSelection   — translate the selection to English sdev
 *   sdev.detectLanguage       — show the detected source human language
 *   sdev.openDocs             — open the language documentation in a new tab
 *   sdev.openBook             — open the official sdev book
 *
 * The "bundled" runner spawns Node.js against the interpreter shipped at
 * ./interpreter/sdev-interpreter.js (which now embeds the full 25-language
 * translator with fuzzy matching, phrase normalization, and the
 * `forge name(` → `conjure name(` context fix — same code path as the
 * online playground).
 */
const vscode = require('vscode');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

let outputChannel;
let translatorMod = null;
let statusItem = null;

function getOutput() {
  if (!outputChannel) outputChannel = vscode.window.createOutputChannel('sdev');
  return outputChannel;
}

function getConfig() {
  return vscode.workspace.getConfiguration('sdev');
}

/**
 * Lazily load the bundled JS interpreter as a module so we can call its
 * embedded translator directly (without spawning a subprocess) for the
 * translate / detect commands.
 */
function getTranslator(context) {
  if (translatorMod) return translatorMod;
  const file = path.join(context.extensionPath, 'interpreter', 'sdev-interpreter.js');
  try {
    // The interpreter file is a self-contained script — read its translator
    // IIFE by evaluating the file in a sandboxed Function.
    const src = fs.readFileSync(file, 'utf8');
    // Extract the __sdevTranslator IIFE block.
    const m = src.match(/const __sdevTranslator = \(function \(\)[\s\S]*?\}\)\(\);/);
    if (!m) throw new Error('translator block not found in bundled interpreter');
    const fn = new Function(`${m[0]}; return __sdevTranslator;`);
    translatorMod = fn();
    return translatorMod;
  } catch (e) {
    vscode.window.showWarningMessage(`sdev: could not load bundled translator — ${e.message}`);
    return null;
  }
}

/**
 * Build the [command, args] tuple for the current runner setting.
 */
function buildRunner(context, sourceFile) {
  const cfg = getConfig();
  const runner = cfg.get('runner', 'bundled');
  const ext = context.extensionPath;

  if (runner === 'python') {
    const py = cfg.get('pythonPath', 'python3');
    const interpreter = path.join(ext, 'interpreter', 'sdev-interpreter.py');
    if (!fs.existsSync(interpreter)) {
      vscode.window.showErrorMessage(`Bundled Python interpreter missing: ${interpreter}`);
      return null;
    }
    return { cmd: py, args: [interpreter, sourceFile] };
  }

  const node = cfg.get('nodePath', 'node');
  const interpreter = path.join(ext, 'interpreter', 'sdev-interpreter.js');
  if (!fs.existsSync(interpreter)) {
    vscode.window.showErrorMessage('Bundled sdev interpreter is missing from the extension package.');
    return null;
  }
  return { cmd: node, args: [interpreter, sourceFile] };
}

async function runSource(context, source, label) {
  const out = getOutput();
  out.show(true);
  out.appendLine(`──── sdev: ${label} ────`);

  const cfg = getConfig();
  const translate = cfg.get('translate', true);
  const sourceLang = cfg.get('sourceLanguage', 'auto');
  const showDetected = cfg.get('showDetectedLanguage', true);

  // If translation is on and the runner is bundled JS, pre-translate so we
  // can surface the detected language in the output channel.
  let detected = null;
  if (translate) {
    const t = getTranslator(context);
    if (t) {
      try {
        const r = t.translateSource(source, sourceLang);
        if (r && r.detectedLanguage) {
          detected = r.detectedLanguage;
          if (showDetected) out.appendLine(`🌐 Detected language: ${detected}`);
        }
        // Pass the translated source to the interpreter so the runner does
        // not need to re-translate (defensive — interpreters also translate).
        source = r.translated;
      } catch (_) { /* fall through to raw */ }
    }
  }

  const tmpFile = path.join(os.tmpdir(), `sdev-${Date.now()}-${process.pid}.sdev`);
  fs.writeFileSync(tmpFile, source, 'utf8');

  const runner = buildRunner(context, tmpFile);
  if (!runner) return;

  const start = Date.now();
  const child = spawn(runner.cmd, runner.args, { shell: false });

  child.stdout.on('data', (chunk) => out.append(chunk.toString()));
  child.stderr.on('data', (chunk) => out.append(chunk.toString()));
  child.on('error', (err) => {
    out.appendLine(`\n✗ Failed to start runner '${runner.cmd}': ${err.message}`);
    out.appendLine(`  Configure 'sdev.nodePath' or 'sdev.pythonPath' in Settings.`);
    cleanup();
  });
  child.on('close', (code) => {
    const ms = Date.now() - start;
    out.appendLine(`\n${code === 0 ? '✓' : '✗'} Exit ${code} · ${ms}ms`);
    cleanup();
  });

  function cleanup() {
    try { fs.unlinkSync(tmpFile); } catch (_) { /* ignore */ }
  }
}

function updateStatusFor(editor, context) {
  if (!statusItem) return;
  if (!editor || editor.document.languageId !== 'sdev') {
    statusItem.hide();
    return;
  }
  const t = getTranslator(context);
  if (!t) { statusItem.hide(); return; }
  const cfg = getConfig();
  const lang = cfg.get('sourceLanguage', 'auto');
  let label = lang;
  if (lang === 'auto') {
    try {
      const detected = t.detectLanguage(editor.document.getText());
      label = detected ? `auto → ${detected}` : 'auto → English';
    } catch (_) { label = 'auto'; }
  }
  statusItem.text = `$(globe) sdev: ${label}`;
  statusItem.tooltip = 'Click to change the sdev source language';
  statusItem.command = 'workbench.action.openSettings';
  statusItem.show();
}

function activate(context) {
  statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  context.subscriptions.push(statusItem);

  context.subscriptions.push(
    vscode.commands.registerCommand('sdev.run', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== 'sdev') {
        vscode.window.showWarningMessage('Open an .sdev file to run it.');
        return;
      }
      if (editor.document.isDirty) await editor.document.save();
      await runSource(context, editor.document.getText(), `Run ${path.basename(editor.document.fileName)}`);
    }),

    vscode.commands.registerCommand('sdev.runSelection', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const sel = editor.document.getText(editor.selection);
      if (!sel.trim()) {
        vscode.window.showInformationMessage('Nothing selected.');
        return;
      }
      await runSource(context, sel, 'Run Selection');
    }),

    vscode.commands.registerCommand('sdev.openPlayground', () => {
      vscode.env.openExternal(vscode.Uri.parse('https://s-dev.lovable.app'));
    }),

    vscode.commands.registerCommand('sdev.openDocs', () => {
      vscode.env.openExternal(vscode.Uri.parse('https://s-dev.lovable.app/docs'));
    }),

    vscode.commands.registerCommand('sdev.openBook', () => {
      vscode.env.openExternal(vscode.Uri.parse('https://s-dev.lovable.app/sdev-book-en.md'));
    }),

    vscode.commands.registerCommand('sdev.translateFile', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const t = getTranslator(context);
      if (!t) return;
      const lang = getConfig().get('sourceLanguage', 'auto');
      const r = t.translateSource(editor.document.getText(), lang);
      if (!r.detectedLanguage && r.translated === editor.document.getText()) {
        vscode.window.showInformationMessage('sdev: nothing to translate — already English sdev.');
        return;
      }
      const fullRange = new vscode.Range(
        editor.document.positionAt(0),
        editor.document.positionAt(editor.document.getText().length)
      );
      await editor.edit(eb => eb.replace(fullRange, r.translated));
      vscode.window.showInformationMessage(
        `sdev: translated from ${r.detectedLanguage || 'auto'} to English sdev.`
      );
    }),

    vscode.commands.registerCommand('sdev.translateSelection', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.selection.isEmpty) return;
      const t = getTranslator(context);
      if (!t) return;
      const lang = getConfig().get('sourceLanguage', 'auto');
      const r = t.translateSource(editor.document.getText(editor.selection), lang);
      await editor.edit(eb => eb.replace(editor.selection, r.translated));
      vscode.window.showInformationMessage(
        `sdev: selection translated${r.detectedLanguage ? ` from ${r.detectedLanguage}` : ''}.`
      );
    }),

    vscode.commands.registerCommand('sdev.detectLanguage', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const t = getTranslator(context);
      if (!t) return;
      const detected = t.detectLanguage(editor.document.getText());
      vscode.window.showInformationMessage(
        detected ? `sdev: detected source language is ${detected}.` : 'sdev: source looks like English sdev (or could not be detected).'
      );
    }),

    vscode.window.onDidChangeActiveTextEditor((ed) => updateStatusFor(ed, context)),
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (vscode.window.activeTextEditor && e.document === vscode.window.activeTextEditor.document) {
        updateStatusFor(vscode.window.activeTextEditor, context);
      }
    }),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('sdev')) updateStatusFor(vscode.window.activeTextEditor, context);
    }),
  );

  updateStatusFor(vscode.window.activeTextEditor, context);

  // Friendly first-run message.
  const seenKey = 'sdev.welcomeShown.v2';
  if (!context.globalState.get(seenKey)) {
    context.globalState.update(seenKey, true);
    vscode.window.showInformationMessage(
      'sdev language support installed — now with a built-in 25-language translator. Press Ctrl+Enter (Cmd+Enter on macOS) in any .sdev file to run it.',
      'Open Playground',
      'Open Docs'
    ).then((choice) => {
      if (choice === 'Open Playground') vscode.commands.executeCommand('sdev.openPlayground');
      else if (choice === 'Open Docs') vscode.commands.executeCommand('sdev.openDocs');
    });
  }
}

function deactivate() {
  if (outputChannel) outputChannel.dispose();
  if (statusItem) statusItem.dispose();
}

module.exports = { activate, deactivate };
