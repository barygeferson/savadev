#!/usr/bin/env node
/*
 * Thin wrapper that loads the bundled sdev JS interpreter and executes a
 * source file. Stays tiny so the extension boots fast.
 *
 *   node run-sdev.js  <interpreter.js>  <source.sdev>
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

// Load the interpreter into the current process. The bundled interpreter
// exposes a `sdev` global (in browser) and module.exports = { execute } in Node.
let sdev;
try {
  sdev = require(path.resolve(interpreterPath));
} catch (e) {
  console.error(`Failed to load sdev interpreter: ${e.message}`);
  process.exit(2);
}

const exec = (sdev && (sdev.execute || (sdev.sdev && sdev.sdev.execute))) || null;
if (typeof exec !== 'function') {
  console.error('Bundled interpreter does not expose an execute() function.');
  process.exit(2);
}

let result;
try {
  // 2nd arg is canvas (browser-only); pass null in Node.
  result = exec(source, null);
} catch (e) {
  console.error(`✗ ${e && e.message ? e.message : e}`);
  process.exit(1);
}

if (result && Array.isArray(result.output)) {
  for (const line of result.output) process.stdout.write(String(line) + '\n');
}
if (result && result.error) {
  process.stderr.write(`✗ ${result.error}\n`);
  process.exit(1);
}
process.exit(0);
