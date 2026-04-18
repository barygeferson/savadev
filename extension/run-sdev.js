#!/usr/bin/env node
/*
 * Thin wrapper that loads the bundled sdev JS interpreter and runs a source
 * file. Stays tiny so the extension boots fast.
 *
 *   node run-sdev.js  <interpreter.js>  <source.sdev>
 *
 * The bundled interpreter exposes either:
 *   - module.exports = { Interpreter, Lexer, Parser, ... }
 *     (modern build — instantiated and `.run(code)` is called)
 *   - module.exports = { execute }
 *     (legacy build — called directly)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const [, , interpreterPath, sourcePath] = process.argv;
if (!interpreterPath || !sourcePath) {
  console.error('usage: run-sdev.js <interpreter.js> <source.sdev>');
  process.exit(2);
}

let source;
try {
  source = fs.readFileSync(sourcePath, 'utf8');
} catch (e) {
  console.error(`Could not read source file: ${e.message}`);
  process.exit(2);
}

let mod;
try {
  mod = require(path.resolve(interpreterPath));
} catch (e) {
  console.error(`Failed to load sdev interpreter: ${e.message}`);
  process.exit(2);
}

// Capture all output written via console.log (the interpreter's `speak`
// builtin uses console.log under the hood) AND collect from a returned
// `output` array if the interpreter provides one.
const lines = [];
const origLog = console.log;
console.log = (...args) => {
  lines.push(args.map(stringify).join(' '));
};
function stringify(v) {
  if (v === null || v === undefined) return String(v);
  if (typeof v === 'string') return v;
  try { return JSON.stringify(v); } catch { return String(v); }
}

let result;
let runtimeError = null;
try {
  if (typeof mod.execute === 'function') {
    result = mod.execute(source, null);
  } else if (typeof mod.Interpreter === 'function') {
    const interp = new mod.Interpreter();
    if (typeof interp.run === 'function') {
      result = interp.run(source);
    } else if (typeof interp.execute === 'function') {
      result = interp.execute(source);
    } else {
      throw new Error('Interpreter instance has no run()/execute() method');
    }
  } else {
    throw new Error('Bundled interpreter does not expose execute() or Interpreter');
  }
} catch (e) {
  runtimeError = e && e.message ? e.message : String(e);
}

console.log = origLog;

// Some interpreter shapes also include `output` on the result object.
if (result && Array.isArray(result.output)) {
  for (const line of result.output) lines.push(String(line));
}

for (const line of lines) process.stdout.write(line + '\n');

if (runtimeError) {
  process.stderr.write(`✗ ${runtimeError}\n`);
  process.exit(1);
}
if (result && result.error) {
  process.stderr.write(`✗ ${result.error}\n`);
  process.exit(1);
}
process.exit(0);
