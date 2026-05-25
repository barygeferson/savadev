
import { Lexer } from '../src/lang/lexer';
import { Parser } from '../src/lang/parser';
import { Compiler } from '../src/lang/compiler';
import { VM } from '../src/lang/vm';
import { Interpreter } from '../src/lang/interpreter';
import { disassemble, serializeChunk, deserializeChunk, BYTECODE_MAGIC } from '../src/lang/bytecode';
import { SdevError } from '../src/lang/errors';
import { translateSource, detectLanguage, SUPPORTED_LANGUAGES } from '../src/lang/translator';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, extname, basename } from 'path';
import { createInterface } from 'readline';

const VERSION = '3.0.0';
const args = process.argv.slice(2);

function help() {
  console.log(`sdev compiler & runtime v${VERSION}

USAGE:
  sdev <command> [options] <file>

COMMANDS:
  run <file.sdev>             Run source through interpreter (default)
  exec <file.sdev>            Compile + run via stack-based VM
  compile <file.sdev> [-o]    Compile to .sdevc bytecode
  disasm <file.sdev|.sdevc>   Show bytecode disassembly (.sdevir)
  run-bc <file.sdevc>         Execute compiled .sdevc bytecode
  translate <file> --to <lang> Translate source to another language
  repl                        Interactive REPL
  languages                   List supported source languages
  version                     Print version

OPTIONS:
  --lang <Name>               Source language (default: auto-detect)
  --vm                        Force VM execution path
  -o, --out <file>            Output file path
  -h, --help                  Show this help

EXAMPLES:
  sdev run hello.sdev
  sdev compile hello.sdev -o hello.sdevc
  sdev run-bc hello.sdevc
  sdev disasm hello.sdev
  sdev translate hello.sdev --to Bulgarian -o hello.bg.sdev
`);
}

function readFlag(name: string, short?: string): string | undefined {
  const i = args.findIndex(a => a === name || (short && a === short));
  if (i >= 0 && i + 1 < args.length) return args[i + 1];
  return undefined;
}
function hasFlag(name: string, short?: string): boolean {
  return args.some(a => a === name || (short && a === short));
}

if (args.length === 0 || hasFlag('--help', '-h')) { help(); process.exit(0); }
if (args[0] === 'version' || hasFlag('--version', '-v')) {
  console.log(`sdev v${VERSION}`); process.exit(0);
}
if (args[0] === 'languages') {
  console.log('Supported source languages:');
  for (const l of SUPPORTED_LANGUAGES) console.log('  -', l);
  process.exit(0);
}

const cmd = args[0];
const fileArg = args.find((a, i) => i > 0 && !a.startsWith('-') && args[i-1] !== '--lang' && args[i-1] !== '-o' && args[i-1] !== '--out' && args[i-1] !== '--to');
const sourceLang = readFlag('--lang') ?? 'auto';
const outPath = readFlag('-o') ?? readFlag('--out');

function loadSource(file: string): string {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) { console.error(`File not found: ${path}`); process.exit(1); }
  return readFileSync(path, 'utf-8');
}

function loadBytecode(file: string) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) { console.error(`File not found: ${path}`); process.exit(1); }
  const buf = readFileSync(path);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return deserializeChunk(ab);
}

function compileSource(src: string) {
  const lex = new Lexer(src, { sourceLanguage: sourceLang });
  const tokens = lex.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const compiler = new Compiler();
  return { chunk: compiler.compile(ast), detected: lex.detectedLanguage };
}

function reportError(e: unknown) {
  if (e instanceof SdevError) console.error('error:', e.message);
  else if (e instanceof Error) console.error('error:', e.message);
  else console.error('error:', String(e));
  process.exit(1);
}

try {
  switch (cmd) {
    case 'run': {
      if (!fileArg) { console.error('Missing file'); process.exit(1); }
      const src = loadSource(fileArg);
      const lex = new Lexer(src, { sourceLanguage: sourceLang });
      const tokens = lex.tokenize();
      const ast = new Parser(tokens).parse();
      if (hasFlag('--vm')) {
        const chunk = new Compiler().compile(ast);
        new VM((m) => console.log(m)).run(chunk);
      } else {
        new Interpreter((m) => console.log(m)).interpret(ast);
      }
      break;
    }
    case 'exec': {
      if (!fileArg) { console.error('Missing file'); process.exit(1); }
      const { chunk } = compileSource(loadSource(fileArg));
      new VM((m) => console.log(m)).run(chunk);
      break;
    }
    case 'compile': {
      if (!fileArg) { console.error('Missing file'); process.exit(1); }
      const { chunk } = compileSource(loadSource(fileArg));
      const out = outPath ?? fileArg.replace(/\.sdev$/, '') + '.sdevc';
      const ab = serializeChunk(chunk);
      writeFileSync(out, Buffer.from(ab));
      console.log(`compiled -> ${out} (${(ab.byteLength/1024).toFixed(2)} KB, magic=0x${BYTECODE_MAGIC.toString(16)})`);
      break;
    }
    case 'disasm': {
      if (!fileArg) { console.error('Missing file'); process.exit(1); }
      let chunk;
      if (extname(fileArg) === '.sdevc') chunk = loadBytecode(fileArg);
      else chunk = compileSource(loadSource(fileArg)).chunk;
      const out = disassemble(chunk.entry);
      if (outPath) { writeFileSync(outPath, out); console.log('wrote', outPath); }
      else console.log(out);
      break;
    }
    case 'run-bc': {
      if (!fileArg) { console.error('Missing file'); process.exit(1); }
      const chunk = loadBytecode(fileArg);
      new VM((m) => console.log(m)).run(chunk);
      break;
    }
    case 'translate': {
      if (!fileArg) { console.error('Missing file'); process.exit(1); }
      const to = readFlag('--to');
      if (!to) { console.error('Missing --to <language>'); process.exit(1); }
      const src = loadSource(fileArg);
      const { translated } = translateSource(src, sourceLang === 'auto' ? (detectLanguage(src) ?? 'English') : sourceLang, to);
      if (outPath) { writeFileSync(outPath, translated); console.log('wrote', outPath); }
      else process.stdout.write(translated);
      break;
    }
    case 'repl': {
      console.log(`sdev REPL v${VERSION} — type :q to quit, :vm to toggle VM mode`);
      const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: 'sdev> ' });
      let useVm = false;
      let buffer = '';
      rl.prompt();
      rl.on('line', (line) => {
        const t = line.trim();
        if (t === ':q' || t === ':quit') { rl.close(); return; }
        if (t === ':vm') { useVm = !useVm; console.log('vm mode:', useVm); rl.prompt(); return; }
        if (t === ':clear') { buffer = ''; console.log('cleared'); rl.prompt(); return; }
        buffer += line + '\n';
        try {
          const lex = new Lexer(buffer, { sourceLanguage: sourceLang });
          const ast = new Parser(lex.tokenize()).parse();
          if (useVm) new VM((m) => console.log(m)).run(new Compiler().compile(ast));
          else new Interpreter((m) => console.log(m)).interpret(ast);
          buffer = '';
        } catch (e) {
          if (e instanceof SdevError) { console.error('error:', e.message); buffer = ''; }
          else { /* incomplete input — keep buffer */ }
        }
        rl.prompt();
      });
      rl.on('close', () => { console.log('bye'); process.exit(0); });
      break;
    }
    default: {
      // Treat unknown command as a file to run
      if (existsSync(resolve(process.cwd(), cmd))) {
        const src = loadSource(cmd);
        const ast = new Parser(new Lexer(src, { sourceLanguage: sourceLang }).tokenize()).parse();
        new Interpreter((m) => console.log(m)).interpret(ast);
      } else {
        console.error(`Unknown command: ${cmd}`);
        help();
        process.exit(1);
      }
    }
  }
} catch (e) { reportError(e); }
