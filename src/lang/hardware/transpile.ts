// ============================================================
// sdev → Arduino C/C++ (.ino) transpiler
// ============================================================
// Recognises a `board "<id>" { ... }` block embedded in sdev source.
// Inside the block, supported statements:
//
//   use "Servo"                       -> #include <Servo.h>
//   define <name> = <expr>            -> auto <name> = <expr>;
//   conjure setup() { ... }           -> void setup() { ... }
//   conjure loop()  { ... }           -> void loop()  { ... }
//   conjure <name>(args) { ... }      -> auto <name>(args) { ... }
//   pin <n> be output|input|input_pullup
//   pin <n> write high|low|<expr>
//   pin <n> analog <expr>
//   read <n> -> "expression"          -> digitalRead(<n>)
//   wait <ms>                          -> delay(<ms>)
//   wait_us <us>                       -> delayMicroseconds(<us>)
//   serial begin <baud>                -> Serial.begin(<baud>)
//   serial print <expr>                -> Serial.print(<expr>)
//   serial println <expr>              -> Serial.println(<expr>)
//   if (...) { ... } elif (...) { ... } else { ... }
//   while (...) { ... }
//   for (init; cond; step) { ... }     (passed through verbatim)
//   return <expr>
//
// Anything else inside the braces is passed through unchanged so users can
// drop in raw C/C++ for libraries.
//
// The function returns the C++ source and the list of #include libraries.

import type { BoardDescriptor } from './board-db';

export interface TranspileResult {
  ino: string;
  libraries: string[];      // library names extracted from `use "..."`
  warnings: string[];
}

export interface BoardBlock {
  boardId: string;
  body: string;
  startIndex: number;
  endIndex: number;
}

/** Locate the first `board "..." { ... }` block (brace-balanced) in source. */
export function extractBoardBlock(source: string): BoardBlock | null {
  const m = /\bboard\s+"([^"]+)"\s*\{/.exec(source);
  if (!m) return null;
  const open = m.index + m[0].length - 1;
  let depth = 1;
  let i = open + 1;
  while (i < source.length && depth > 0) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (ch === '/' && source[i + 1] === '/') {
      const nl = source.indexOf('\n', i);
      i = nl === -1 ? source.length : nl;
      continue;
    } else if (ch === '"') {
      i++;
      while (i < source.length && source[i] !== '"') {
        if (source[i] === '\\') i++;
        i++;
      }
    }
    i++;
  }
  if (depth !== 0) return null;
  return { boardId: m[1], body: source.slice(open + 1, i - 1), startIndex: m.index, endIndex: i };
}

export function transpileBoard(block: BoardBlock, board: BoardDescriptor): TranspileResult {
  const warnings: string[] = [];
  const libraries: string[] = [];
  const out: string[] = [];

  out.push(`// auto-generated from sdev for ${board.label} (${board.fqbn})`);
  out.push(`// do not edit by hand`);
  out.push('');

  // Pass 1: collect `use "..."` directives so #include lines come first.
  const useRe = /^[\t ]*use\s+"([^"]+)"\s*;?\s*$/gm;
  let mu: RegExpExecArray | null;
  while ((mu = useRe.exec(block.body)) !== null) {
    libraries.push(mu[1]);
    out.push(`#include <${mu[1]}.h>`);
  }
  if (libraries.length > 0) out.push('');

  // Pass 2: walk top-level statements line by line.
  const stripped = block.body.replace(useRe, '');
  const lines = stripped.split(/\r?\n/);
  let depth = 0;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { out.push(''); continue; }
    out.push(translateLine(line, depth, warnings));
    // Track brace depth so we know whether we're at top level.
    depth += countUnquoted(line, '{') - countUnquoted(line, '}');
    if (depth < 0) depth = 0;
  }

  return { ino: out.join('\n') + '\n', libraries, warnings };
}

function countUnquoted(s: string, ch: string): number {
  let n = 0; let inStr = false;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '"' && s[i - 1] !== '\\') inStr = !inStr;
    else if (!inStr && s[i] === ch) n++;
  }
  return n;
}

function translateLine(line: string, _depth: number, warnings: string[]): string {
  const indentMatch = /^[ \t]*/.exec(line);
  const indent = indentMatch ? indentMatch[0] : '';
  const body = line.slice(indent.length);

  // `conjure name(args) { ... }`  ->  function decl
  let m = /^conjure\s+(\w+)\s*\(([^)]*)\)\s*\{?\s*$/.exec(body);
  if (m) {
    const [, name, args] = m;
    const ret = (name === 'setup' || name === 'loop') ? 'void' : 'auto';
    return `${indent}${ret} ${name}(${args}) {`;
  }

  // pin <n> be output|input|input_pullup
  m = /^pin\s+(\S+)\s+be\s+(output|input|input_pullup)\s*;?\s*$/.exec(body);
  if (m) {
    const mode = m[2] === 'input_pullup' ? 'INPUT_PULLUP' : m[2].toUpperCase();
    return `${indent}pinMode(${m[1]}, ${mode});`;
  }

  // pin <n> write high|low|<expr>
  m = /^pin\s+(\S+)\s+write\s+(.+?)\s*;?\s*$/.exec(body);
  if (m) {
    const val = m[2] === 'high' ? 'HIGH' : m[2] === 'low' ? 'LOW' : m[2];
    return `${indent}digitalWrite(${m[1]}, ${val});`;
  }

  // pin <n> analog <expr>  (PWM)
  m = /^pin\s+(\S+)\s+analog\s+(.+?)\s*;?\s*$/.exec(body);
  if (m) return `${indent}analogWrite(${m[1]}, ${m[2]});`;

  // wait <ms> / wait_us <us>
  m = /^wait\s+(.+?)\s*;?\s*$/.exec(body);
  if (m) return `${indent}delay(${m[1]});`;
  m = /^wait_us\s+(.+?)\s*;?\s*$/.exec(body);
  if (m) return `${indent}delayMicroseconds(${m[1]});`;

  // serial begin / print / println / write
  m = /^serial\s+begin\s+(.+?)\s*;?\s*$/.exec(body);
  if (m) return `${indent}Serial.begin(${m[1]});`;
  m = /^serial\s+println\s+(.+?)\s*;?\s*$/.exec(body);
  if (m) return `${indent}Serial.println(${m[1]});`;
  m = /^serial\s+print\s+(.+?)\s*;?\s*$/.exec(body);
  if (m) return `${indent}Serial.print(${m[1]});`;
  m = /^serial\s+write\s+(.+?)\s*;?\s*$/.exec(body);
  if (m) return `${indent}Serial.write(${m[1]});`;

  // tone <pin> <freq> [<duration>]
  m = /^tone\s+(\S+)\s+(\S+)(?:\s+(\S+))?\s*;?\s*$/.exec(body);
  if (m) return m[3]
    ? `${indent}tone(${m[1]}, ${m[2]}, ${m[3]});`
    : `${indent}tone(${m[1]}, ${m[2]});`;
  m = /^notone\s+(\S+)\s*;?\s*$/.exec(body);
  if (m) return `${indent}noTone(${m[1]});`;

  // define <name> = <expr>
  m = /^define\s+(\w+)\s*=\s*(.+?)\s*;?\s*$/.exec(body);
  if (m) {
    // const for numeric / string literals, auto otherwise
    return `${indent}auto ${m[1]} = ${m[2]};`;
  }

  // sdev-flavoured control flow keywords -> C++
  if (/^elif\b/.test(body)) return `${indent}` + body.replace(/^elif\b/, 'else if');
  if (/^otherwise\b/.test(body)) return `${indent}` + body.replace(/^otherwise\b/, 'else');

  // return <expr>
  m = /^return\b\s*(.*?)\s*;?\s*$/.exec(body);
  if (m) return `${indent}return ${m[1]};`;

  // Bare `}` or block headers (`if (...) {`, `while (...) {`, `for (...) {`)
  if (/^(if|else|while|for|switch|do)\b/.test(body) || body === '{' || body === '}') {
    return `${indent}${body}`;
  }

  // Already looks like C++ (ends with `;` or `{` or `}` or is a comment)
  if (/[;{}]$/.test(body) || body.startsWith('//') || body.startsWith('/*') || body.startsWith('#')) {
    return `${indent}${body}`;
  }

  // Bare expression: assume it's a function call needing a semicolon.
  warnings.push(`unrecognised statement, passed through with ';': ${body}`);
  return `${indent}${body};`;
}
