import { Button } from '@/components/ui/button';
import { Download, FileCode, Terminal } from 'lucide-react';
import { toast } from 'sonner';

interface DownloadPanelProps {
  code: string;
}

export function DownloadPanel({ code }: DownloadPanelProps) {
  const generateHTML = () => {
    // Minified sdev interpreter embedded in HTML
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>sdev App</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'SF Mono', 'Monaco', 'Consolas', monospace; background: #0d0d15; color: #e0e0e0; min-height: 100vh; display: flex; flex-direction: column; }
    .header { padding: 1rem 2rem; border-bottom: 1px solid #2a2a4a; background: #1a1a2e; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 1.25rem; color: #a78bfa; }
    .run-btn { background: linear-gradient(135deg, #8b5cf6, #d946ef); color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; }
    .run-btn:hover { opacity: 0.9; }
    .main { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem 2rem; flex: 1; }
    .panel { background: #1a1a2e; border: 1px solid #2a2a4a; border-radius: 0.5rem; overflow: hidden; }
    .panel-header { padding: 0.75rem 1rem; background: #252540; border-bottom: 1px solid #2a2a4a; font-size: 0.875rem; color: #888; }
    .editor { height: 300px; padding: 1rem; font-family: inherit; font-size: 0.875rem; background: transparent; color: #e0e0e0; border: none; resize: none; width: 100%; outline: none; }
    .output { padding: 1rem; font-size: 0.875rem; max-height: 300px; overflow-y: auto; }
    .output-line { margin-bottom: 0.25rem; color: #a78bfa; }
    .error { color: #f87171; }
    canvas { max-width: 100%; height: auto; display: block; margin: 1rem auto; }
    @media (max-width: 768px) { .main { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>sdev</h1>
    <button class="run-btn" onclick="runCode()">▶ Run</button>
  </div>
  <div class="main">
    <div class="panel">
      <div class="panel-header">Code</div>
      <textarea id="editor" class="editor" spellcheck="false">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>
    <div class="panel">
      <div class="panel-header">Output</div>
      <div id="output" class="output"></div>
      <canvas id="canvas" width="400" height="400" style="display:none;"></canvas>
    </div>
  </div>
  <script>
    // sdev interpreter embedded - see https://github.com/sdev-lang for full source
    ${generateInterpreterBundle()}
    
    function runCode() {
      const code = document.getElementById('editor').value;
      const outputEl = document.getElementById('output');
      const canvas = document.getElementById('canvas');
      outputEl.innerHTML = '';
      canvas.style.display = 'none';
      
      try {
        const result = sdev.execute(code, canvas);
        result.output.forEach(line => {
          const div = document.createElement('div');
          div.className = 'output-line';
          div.textContent = line;
          outputEl.appendChild(div);
        });
        if (result.hasGraphics) {
          canvas.style.display = 'block';
        }
        if (result.error) {
          const div = document.createElement('div');
          div.className = 'error';
          div.textContent = '❌ ' + result.error;
          outputEl.appendChild(div);
        }
      } catch (e) {
        const div = document.createElement('div');
        div.className = 'error';
        div.textContent = '❌ ' + e.message;
        outputEl.appendChild(div);
      }
    }
    
    // Auto-run on load
    runCode();
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sdev-app.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded sdev-app.html');
  };

  const generateNPMPackage = () => {
    const packageJson = JSON.stringify({
      name: 'my-sdev-app',
      version: '1.0.0',
      type: 'module',
      bin: { 'sdev-app': './cli.js' },
      scripts: { start: 'node cli.js' },
    }, null, 2);

    const cliJs = `#!/usr/bin/env node
import { readFileSync } from 'fs';

// Minimal sdev interpreter
${generateInterpreterBundle()}

const code = \`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;

const result = sdev.execute(code);
result.output.forEach(line => console.log(line));
if (result.error) {
  console.error('❌', result.error);
  process.exit(1);
}
`;

    const readme = `# My sdev App

A sdev programming language application.

## Run

\`\`\`bash
npm start
\`\`\`

Or run any .sdev file:

\`\`\`bash
npx sdev run myfile.sdev
\`\`\`

## Learn More

Visit [sdev documentation](https://sdev-lang.dev) to learn more about the language.
`;

    // Create a zip-like structure as multiple downloads
    const files = [
      { name: 'package.json', content: packageJson },
      { name: 'cli.js', content: cliJs },
      { name: 'README.md', content: readme },
      { name: 'main.sdev', content: code },
    ];

    // Download as individual files (would need a zip library for proper packaging)
    files.forEach((file, i) => {
      setTimeout(() => {
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }, i * 200);
    });

    toast.success('Downloaded npm package files');
  };

  const downloadSdevFile = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'main.sdev';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded main.sdev');
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={downloadSdevFile} className="gap-2">
        <FileCode className="w-4 h-4" />
        .sdev file
      </Button>
      <Button variant="outline" size="sm" onClick={generateHTML} className="gap-2">
        <Download className="w-4 h-4" />
        HTML App
      </Button>
      <Button variant="outline" size="sm" onClick={generateNPMPackage} className="gap-2">
        <Terminal className="w-4 h-4" />
        NPM Package
      </Button>
    </div>
  );
}

function generateInterpreterBundle(): string {
  // This is a minimal interpreter bundle for standalone use
  return `
const sdev = (function() {
  const TokenType = {
    NUMBER: 'NUMBER', STRING: 'STRING', IDENTIFIER: 'IDENTIFIER',
    FORGE: 'FORGE', CONJURE: 'CONJURE', PONDER: 'PONDER', OTHERWISE: 'OTHERWISE',
    CYCLE: 'CYCLE', YIELD: 'YIELD', YEP: 'YEP', NOPE: 'NOPE', VOID: 'VOID',
    BE: 'BE', PLUS: 'PLUS', MINUS: 'MINUS', STAR: 'STAR', SLASH: 'SLASH',
    PERCENT: 'PERCENT', CARET: 'CARET', EQUALS: 'EQUALS', DIFFERS: 'DIFFERS',
    LESS: 'LESS', MORE: 'MORE', ATMOST: 'ATMOST', ATLEAST: 'ATLEAST',
    ALSO: 'ALSO', EITHER: 'EITHER', ISNT: 'ISNT', LPAREN: 'LPAREN',
    RPAREN: 'RPAREN', LBRACKET: 'LBRACKET', RBRACKET: 'RBRACKET',
    COMMA: 'COMMA', ARROW: 'ARROW', PIPE: 'PIPE', DOUBLE_COLON: 'DOUBLE_COLON',
    DOUBLE_SEMI: 'DOUBLE_SEMI', COLON: 'COLON', DOT: 'DOT', EOF: 'EOF'
  };
  
  const KEYWORDS = {
    'forge': TokenType.FORGE, 'conjure': TokenType.CONJURE, 'ponder': TokenType.PONDER,
    'otherwise': TokenType.OTHERWISE, 'cycle': TokenType.CYCLE, 'yield': TokenType.YIELD,
    'yep': TokenType.YEP, 'nope': TokenType.NOPE, 'void': TokenType.VOID, 'be': TokenType.BE,
    'also': TokenType.ALSO, 'either': TokenType.EITHER, 'isnt': TokenType.ISNT,
    'equals': TokenType.EQUALS, 'differs': TokenType.DIFFERS
  };

  class SdevError extends Error {
    constructor(msg, line) { super(\`[Line \${line}] \${msg}\`); }
  }
  class ReturnException { constructor(v) { this.value = v; } }

  class Lexer {
    constructor(src) { this.src = src; this.pos = 0; this.line = 1; this.col = 1; this.tokens = []; }
    tokenize() {
      while (this.pos < this.src.length) this.scan();
      this.tokens.push({ type: TokenType.EOF, value: '', line: this.line, column: this.col });
      return this.tokens;
    }
    scan() {
      this.skipWS();
      if (this.pos >= this.src.length) return;
      const c = this.src[this.pos++];
      this.col++;
      const single = { '(': TokenType.LPAREN, ')': TokenType.RPAREN, '[': TokenType.LBRACKET, 
        ']': TokenType.RBRACKET, ',': TokenType.COMMA, '.': TokenType.DOT, '+': TokenType.PLUS,
        '*': TokenType.STAR, '%': TokenType.PERCENT, '^': TokenType.CARET };
      if (single[c]) { this.tokens.push({ type: single[c], value: c, line: this.line, column: this.col }); return; }
      if (c === '-') { if (this.src[this.pos] === '>') { this.pos++; this.col++; this.tokens.push({ type: TokenType.ARROW, value: '->', line: this.line, column: this.col }); } else this.tokens.push({ type: TokenType.MINUS, value: c, line: this.line, column: this.col }); return; }
      if (c === '|' && this.src[this.pos] === '>') { this.pos++; this.col++; this.tokens.push({ type: TokenType.PIPE, value: '|>', line: this.line, column: this.col }); return; }
      if (c === ':') { if (this.src[this.pos] === ':') { this.pos++; this.col++; this.tokens.push({ type: TokenType.DOUBLE_COLON, value: '::', line: this.line, column: this.col }); } else this.tokens.push({ type: TokenType.COLON, value: ':', line: this.line, column: this.col }); return; }
      if (c === ';' && this.src[this.pos] === ';') { this.pos++; this.col++; this.tokens.push({ type: TokenType.DOUBLE_SEMI, value: ';;', line: this.line, column: this.col }); return; }
      if (c === '/') { if (this.src[this.pos] === '/') { while (this.pos < this.src.length && this.src[this.pos] !== '\\n') this.pos++; return; } this.tokens.push({ type: TokenType.SLASH, value: c, line: this.line, column: this.col }); return; }
      if (c === '<') { if (this.src[this.pos] === '>') { this.pos++; this.col++; this.tokens.push({ type: TokenType.DIFFERS, value: '<>', line: this.line, column: this.col }); } else if (this.src[this.pos] === '=') { this.pos++; this.col++; this.tokens.push({ type: TokenType.ATMOST, value: '<=', line: this.line, column: this.col }); } else this.tokens.push({ type: TokenType.LESS, value: '<', line: this.line, column: this.col }); return; }
      if (c === '>') { if (this.src[this.pos] === '=') { this.pos++; this.col++; this.tokens.push({ type: TokenType.ATLEAST, value: '>=', line: this.line, column: this.col }); } else this.tokens.push({ type: TokenType.MORE, value: '>', line: this.line, column: this.col }); return; }
      if (c === '"' || c === "'" || c === '\`') { let v = ''; while (this.pos < this.src.length && this.src[this.pos] !== c) { if (this.src[this.pos] === '\\\\') { this.pos++; const e = { n: '\\n', t: '\\t', r: '\\r' }; v += e[this.src[this.pos]] || this.src[this.pos]; } else v += this.src[this.pos]; this.pos++; this.col++; } this.pos++; this.col++; this.tokens.push({ type: TokenType.STRING, value: v, line: this.line, column: this.col }); return; }
      if (c >= '0' && c <= '9') { let v = c; while (this.pos < this.src.length && ((this.src[this.pos] >= '0' && this.src[this.pos] <= '9') || this.src[this.pos] === '.')) { v += this.src[this.pos++]; this.col++; } this.tokens.push({ type: TokenType.NUMBER, value: v, line: this.line, column: this.col }); return; }
      if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_') { let v = c; while (this.pos < this.src.length && ((this.src[this.pos] >= 'a' && this.src[this.pos] <= 'z') || (this.src[this.pos] >= 'A' && this.src[this.pos] <= 'Z') || (this.src[this.pos] >= '0' && this.src[this.pos] <= '9') || this.src[this.pos] === '_')) { v += this.src[this.pos++]; this.col++; } this.tokens.push({ type: KEYWORDS[v] || TokenType.IDENTIFIER, value: v, line: this.line, column: this.col }); return; }
    }
    skipWS() { while (this.pos < this.src.length && ' \\t\\r\\n'.includes(this.src[this.pos])) { if (this.src[this.pos] === '\\n') { this.line++; this.col = 0; } this.pos++; this.col++; } }
  }

  class Parser {
    constructor(t) { this.t = t; this.p = 0; }
    parse() { const s = []; while (!this.end()) s.push(this.stmt()); return { type: 'Program', statements: s }; }
    stmt() { if (this.ck(TokenType.FORGE)) return this.forge(); if (this.ck(TokenType.CONJURE)) return this.conjure(); if (this.ck(TokenType.PONDER)) return this.ponder(); if (this.ck(TokenType.CYCLE)) return this.cycl(); if (this.ck(TokenType.YIELD)) return this.yld(); if (this.ck(TokenType.DOUBLE_COLON)) return this.block(); return this.exprStmt(); }
    forge() { this.adv(); const n = this.consume(TokenType.IDENTIFIER).value; this.consume(TokenType.BE); return { type: 'LetStatement', name: n, value: this.expr(), line: this.prev().line }; }
    conjure() { this.adv(); const n = this.consume(TokenType.IDENTIFIER).value; this.consume(TokenType.LPAREN); const p = []; if (!this.ck(TokenType.RPAREN)) do { p.push(this.consume(TokenType.IDENTIFIER).value); } while (this.match(TokenType.COMMA)); this.consume(TokenType.RPAREN); return { type: 'FuncDeclaration', name: n, params: p, body: this.block(), line: this.prev().line }; }
    ponder() { this.adv(); const c = this.expr(); const t = this.block(); let e; if (this.match(TokenType.OTHERWISE)) e = this.ck(TokenType.PONDER) ? this.ponder() : this.block(); return { type: 'IfStatement', condition: c, thenBranch: t, elseBranch: e, line: this.prev().line }; }
    cycl() { this.adv(); const c = this.expr(); return { type: 'WhileStatement', condition: c, body: this.block(), line: this.prev().line }; }
    yld() { this.adv(); let v; if (!this.ck(TokenType.DOUBLE_SEMI) && !this.end()) v = this.expr(); return { type: 'ReturnStatement', value: v, line: this.prev().line }; }
    block() { this.consume(TokenType.DOUBLE_COLON); const s = []; while (!this.ck(TokenType.DOUBLE_SEMI) && !this.end()) s.push(this.stmt()); this.consume(TokenType.DOUBLE_SEMI); return { type: 'BlockStatement', statements: s, line: this.prev().line }; }
    exprStmt() { const e = this.expr(); if (this.match(TokenType.BE)) { const v = this.expr(); if (e.type === 'Identifier') return { type: 'AssignStatement', name: e.name, value: v, line: e.line }; if (e.type === 'IndexExpr') return { type: 'IndexAssignStatement', object: e.object, index: e.index, value: v, line: e.line }; } return { type: 'ExpressionStatement', expression: e, line: e.line }; }
    expr() { return this.pipe(); }
    pipe() { let l = this.or(); while (this.match(TokenType.PIPE)) { const r = this.or(); if (r.type === 'CallExpr') { r.args.unshift(l); l = r; } else l = { type: 'CallExpr', callee: r, args: [l], line: l.line }; } return l; }
    or() { let l = this.and(); while (this.match(TokenType.EITHER)) l = { type: 'BinaryExpr', operator: 'either', left: l, right: this.and(), line: l.line }; return l; }
    and() { let l = this.eq(); while (this.match(TokenType.ALSO)) l = { type: 'BinaryExpr', operator: 'also', left: l, right: this.eq(), line: l.line }; return l; }
    eq() { let l = this.cmp(); while (this.match(TokenType.EQUALS, TokenType.DIFFERS)) l = { type: 'BinaryExpr', operator: this.prev().type === TokenType.EQUALS ? 'equals' : 'differs', left: l, right: this.cmp(), line: l.line }; return l; }
    cmp() { let l = this.term(); while (this.match(TokenType.LESS, TokenType.MORE, TokenType.ATMOST, TokenType.ATLEAST)) l = { type: 'BinaryExpr', operator: this.prev().value, left: l, right: this.term(), line: l.line }; return l; }
    term() { let l = this.factor(); while (this.match(TokenType.PLUS, TokenType.MINUS)) l = { type: 'BinaryExpr', operator: this.prev().value, left: l, right: this.factor(), line: l.line }; return l; }
    factor() { let l = this.power(); while (this.match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT)) l = { type: 'BinaryExpr', operator: this.prev().value, left: l, right: this.power(), line: l.line }; return l; }
    power() { let l = this.unary(); while (this.match(TokenType.CARET)) l = { type: 'BinaryExpr', operator: '^', left: l, right: this.unary(), line: l.line }; return l; }
    unary() { if (this.match(TokenType.MINUS, TokenType.ISNT)) return { type: 'UnaryExpr', operator: this.prev().value, operand: this.unary(), line: this.prev().line }; return this.call(); }
    call() { let e = this.primary(); while (true) { if (this.match(TokenType.LPAREN)) { const a = []; if (!this.ck(TokenType.RPAREN)) do { a.push(this.expr()); } while (this.match(TokenType.COMMA)); this.consume(TokenType.RPAREN); e = { type: 'CallExpr', callee: e, args: a, line: e.line }; } else if (this.match(TokenType.LBRACKET)) { const i = this.expr(); this.consume(TokenType.RBRACKET); e = { type: 'IndexExpr', object: e, index: i, line: e.line }; } else if (this.match(TokenType.DOT)) { e = { type: 'MemberExpr', object: e, property: this.consume(TokenType.IDENTIFIER).value, line: e.line }; } else if (this.match(TokenType.ARROW)) { if (e.type === 'Identifier') e = { type: 'LambdaExpr', params: [e.name], body: this.expr(), line: e.line }; } else break; } return e; }
    primary() { const t = this.peek(); if (this.match(TokenType.NUMBER)) return { type: 'NumberLiteral', value: parseFloat(t.value), line: t.line }; if (this.match(TokenType.STRING)) return { type: 'StringLiteral', value: t.value, line: t.line }; if (this.match(TokenType.YEP)) return { type: 'BooleanLiteral', value: true, line: t.line }; if (this.match(TokenType.NOPE)) return { type: 'BooleanLiteral', value: false, line: t.line }; if (this.match(TokenType.VOID)) return { type: 'NullLiteral', line: t.line }; if (this.match(TokenType.IDENTIFIER)) return { type: 'Identifier', name: t.value, line: t.line }; if (this.match(TokenType.LPAREN)) { const es = []; const ns = []; let isL = true; if (!this.ck(TokenType.RPAREN)) do { const e = this.expr(); es.push(e); if (e.type !== 'Identifier') isL = false; else ns.push(e.name); } while (this.match(TokenType.COMMA)); this.consume(TokenType.RPAREN); if (this.match(TokenType.ARROW)) return { type: 'LambdaExpr', params: ns, body: this.expr(), line: t.line }; return es[0]; } if (this.match(TokenType.LBRACKET)) { const el = []; if (!this.ck(TokenType.RBRACKET)) do { el.push(this.expr()); } while (this.match(TokenType.COMMA)); this.consume(TokenType.RBRACKET); return { type: 'ArrayLiteral', elements: el, line: t.line }; } if (this.match(TokenType.DOUBLE_COLON)) { const en = []; if (!this.ck(TokenType.DOUBLE_SEMI)) do { const k = this.expr(); this.consume(TokenType.COLON); en.push({ key: k, value: this.expr() }); } while (this.match(TokenType.COMMA)); this.consume(TokenType.DOUBLE_SEMI); return { type: 'DictLiteral', entries: en, line: t.line }; } throw new SdevError('Unexpected token: ' + t.value, t.line); }
    peek() { return this.t[this.p]; }
    prev() { return this.t[this.p - 1]; }
    end() { return this.peek().type === TokenType.EOF; }
    ck(ty) { return !this.end() && this.peek().type === ty; }
    match(...ts) { for (const ty of ts) if (this.ck(ty)) { this.adv(); return true; } return false; }
    adv() { if (!this.end()) this.p++; return this.prev(); }
    consume(ty, m) { if (this.ck(ty)) return this.adv(); throw new SdevError(m || 'Expected ' + ty, this.peek().line); }
  }

  class Env {
    constructor(p) { this.p = p; this.v = {}; }
    define(n, val) { this.v[n] = val; }
    get(n, l) { if (n in this.v) return this.v[n]; if (this.p) return this.p.get(n, l); throw new SdevError('Undefined: ' + n, l); }
    set(n, val, l) { if (n in this.v) { this.v[n] = val; return; } if (this.p) { this.p.set(n, val, l); return; } throw new SdevError('Undefined: ' + n, l); }
  }

  function stringify(v) { if (v === null) return 'void'; if (typeof v === 'boolean') return v ? 'yep' : 'nope'; if (Array.isArray(v)) return '[' + v.map(stringify).join(', ') + ']'; if (typeof v === 'object' && v.type) return '<conjuration>'; if (typeof v === 'object') return ':: ' + Object.entries(v).map(([k,val]) => k + ': ' + stringify(val)).join(', ') + ' ;;'; return String(v); }
  function isTruthy(v) { if (v === null || v === false || v === 0 || v === '') return false; if (Array.isArray(v)) return v.length > 0; return true; }

  class Interpreter {
    constructor(out, canvas) { this.out = out; this.canvas = canvas; this.ctx = canvas?.getContext('2d'); this.hasGfx = false; this.env = new Env(); this.builtins(); }
    builtins() {
      const b = (n, f) => this.env.define(n, { type: 'builtin', call: f });
      b('speak', a => { this.out(a.map(stringify).join(' ')); return null; });
      b('measure', (a,l) => { const v = a[0]; if (typeof v === 'string' || Array.isArray(v)) return v.length; throw new SdevError('Cannot measure', l); });
      b('morph', (a,l) => { const [v,t] = a; if (t === 'number') return parseFloat(v); if (t === 'text') return stringify(v); if (t === 'truth') return isTruthy(v); throw new SdevError('Unknown type', l); });
      b('sequence', (a,l) => { let s=0,e=0,st=1; if (a.length===1) e=a[0]; else if (a.length===2) {s=a[0];e=a[1];} else {s=a[0];e=a[1];st=a[2];} const r=[]; if (st>0) for(let i=s;i<e;i+=st) r.push(i); else for(let i=s;i>e;i+=st) r.push(i); return r; });
      b('each', (a,l) => { if (!Array.isArray(a[0])) throw new SdevError('First arg must be list', l); return a[0].map((x,i) => a[1].call([x,i], l)); });
      b('sift', (a,l) => { if (!Array.isArray(a[0])) throw new SdevError('First arg must be list', l); return a[0].filter(x => isTruthy(a[1].call([x], l))); });
      b('fold', (a,l) => { let acc = a[1]; for (const x of a[0]) acc = a[2].call([acc, x], l); return acc; });
      b('gather', a => { a[0].push(a[1]); return a[0]; });
      b('pluck', a => a[0].pop());
      b('portion', a => a[0].slice(a[1], a[2]));
      b('weave', a => a[0].map(stringify).join(a[1]));
      b('shatter', a => a[0].split(a[1]));
      b('essence', a => { const v=a[0]; if (v===null) return 'void'; if (typeof v==='number') return 'number'; if (typeof v==='string') return 'text'; if (typeof v==='boolean') return 'truth'; if (Array.isArray(v)) return 'list'; return 'tome'; });
      b('magnitude', a => Math.abs(a[0]));
      b('least', a => Array.isArray(a[0]) ? Math.min(...a[0]) : Math.min(...a));
      b('greatest', a => Array.isArray(a[0]) ? Math.max(...a[0]) : Math.max(...a));
      b('root', a => Math.sqrt(a[0]));
      b('ground', a => Math.floor(a[0]));
      b('elevate', a => Math.ceil(a[0]));
      b('nearby', a => Math.round(a[0]));
      b('chaos', () => Math.random());
      b('inscriptions', a => Object.keys(a[0]));
      b('contents', a => Object.values(a[0]));
      b('upper', a => a[0].toUpperCase());
      b('lower', a => a[0].toLowerCase());
      b('trim', a => a[0].trim());
      b('reverse', a => typeof a[0]==='string' ? a[0].split('').reverse().join('') : [...a[0]].reverse());
      b('contains', a => typeof a[0]==='string' ? a[0].includes(a[1]) : a[0].some(x=>x===a[1]));
      // Graphics
      if (this.ctx) {
        let fill = '#00ff88', stroke = '#00ff88', width = 2;
        b('canvas', a => { this.canvas.width = a[0]; this.canvas.height = a[1]; this.hasGfx = true; return null; });
        b('clear', a => { this.ctx.fillStyle = a[0] || '#1a1a2e'; this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height); return null; });
        b('fill', a => { fill = a[0]; return null; });
        b('stroke', a => { stroke = a[0]; if (a[1]) width = a[1]; return null; });
        b('rect', a => { this.hasGfx = true; this.ctx.fillStyle = fill; this.ctx.fillRect(a[0],a[1],a[2],a[3]); this.ctx.strokeStyle = stroke; this.ctx.lineWidth = width; this.ctx.strokeRect(a[0],a[1],a[2],a[3]); return null; });
        b('circle', a => { this.hasGfx = true; this.ctx.beginPath(); this.ctx.arc(a[0],a[1],a[2],0,Math.PI*2); this.ctx.fillStyle = fill; this.ctx.fill(); this.ctx.strokeStyle = stroke; this.ctx.stroke(); return null; });
        b('line', a => { this.hasGfx = true; this.ctx.beginPath(); this.ctx.moveTo(a[0],a[1]); this.ctx.lineTo(a[2],a[3]); this.ctx.strokeStyle = stroke; this.ctx.lineWidth = width; this.ctx.stroke(); return null; });
        b('text', a => { this.hasGfx = true; this.ctx.font = (a[3]||16) + 'px monospace'; this.ctx.fillStyle = fill; this.ctx.fillText(a[0],a[1],a[2]); return null; });
        b('hue', a => 'hsl(' + a[0] + ',' + (a[1]||100) + '%,' + (a[2]||50) + '%)');
        b('rgb', a => 'rgb(' + a[0] + ',' + a[1] + ',' + a[2] + ')');
        // Turtle
        let tx=200,ty=200,ta=-90,tp=true,tc='#00ff88',tw=2;
        b('turtle', () => { tx=this.canvas.width/2; ty=this.canvas.height/2; ta=-90; tp=true; tc='#00ff88'; tw=2; return null; });
        b('forward', a => { const r=ta*Math.PI/180; const nx=tx+Math.cos(r)*a[0]; const ny=ty+Math.sin(r)*a[0]; if(tp){this.ctx.beginPath();this.ctx.moveTo(tx,ty);this.ctx.lineTo(nx,ny);this.ctx.strokeStyle=tc;this.ctx.lineWidth=tw;this.ctx.stroke();} tx=nx;ty=ny; this.hasGfx=true; return null; });
        b('backward', a => { const r=ta*Math.PI/180; const nx=tx-Math.cos(r)*a[0]; const ny=ty-Math.sin(r)*a[0]; if(tp){this.ctx.beginPath();this.ctx.moveTo(tx,ty);this.ctx.lineTo(nx,ny);this.ctx.strokeStyle=tc;this.ctx.lineWidth=tw;this.ctx.stroke();} tx=nx;ty=ny; this.hasGfx=true; return null; });
        b('left', a => { ta-=a[0]; return null; });
        b('right', a => { ta+=a[0]; return null; });
        b('penup', () => { tp=false; return null; });
        b('pendown', () => { tp=true; return null; });
        b('pencolor', a => { tc=a[0]; return null; });
        b('penwidth', a => { tw=a[0]; return null; });
        b('goto', a => { if(tp){this.ctx.beginPath();this.ctx.moveTo(tx,ty);this.ctx.lineTo(a[0],a[1]);this.ctx.strokeStyle=tc;this.ctx.lineWidth=tw;this.ctx.stroke();} tx=a[0];ty=a[1]; return null; });
      }
    }
    run(ast) { let r = null; for (const s of ast.statements) r = this.exec(s, this.env); return r; }
    exec(n, env) {
      switch (n.type) {
        case 'NumberLiteral': return n.value;
        case 'StringLiteral': return n.value;
        case 'BooleanLiteral': return n.value;
        case 'NullLiteral': return null;
        case 'Identifier': return env.get(n.name, n.line);
        case 'ArrayLiteral': return n.elements.map(e => this.exec(e, env));
        case 'DictLiteral': { const o = {}; for (const e of n.entries) o[stringify(this.exec(e.key, env))] = this.exec(e.value, env); return o; }
        case 'LambdaExpr': return { type: 'lambda', call: (a,l) => { const le = new Env(env); n.params.forEach((p,i) => le.define(p, a[i])); return this.exec(n.body, le); } };
        case 'BinaryExpr': return this.binary(n, env);
        case 'UnaryExpr': { const o = this.exec(n.operand, env); return n.operator === '-' ? -o : !isTruthy(o); }
        case 'CallExpr': { const fn = this.exec(n.callee, env); const args = n.args.map(a => this.exec(a, env)); return fn.call(args, n.line); }
        case 'IndexExpr': { const o = this.exec(n.object, env); const i = this.exec(n.index, env); return Array.isArray(o) || typeof o === 'string' ? o[i<0?o.length+i:i] : o[stringify(i)]; }
        case 'MemberExpr': return this.exec(n.object, env)[n.property];
        case 'LetStatement': env.define(n.name, this.exec(n.value, env)); return null;
        case 'AssignStatement': { const v = this.exec(n.value, env); env.set(n.name, v, n.line); return v; }
        case 'IndexAssignStatement': { const o = this.exec(n.object, env); const i = this.exec(n.index, env); const v = this.exec(n.value, env); if (Array.isArray(o)) o[i<0?o.length+i:i] = v; else o[stringify(i)] = v; return v; }
        case 'IfStatement': return isTruthy(this.exec(n.condition, env)) ? this.exec(n.thenBranch, env) : n.elseBranch ? this.exec(n.elseBranch, env) : null;
        case 'WhileStatement': { let r = null, i = 0; while (isTruthy(this.exec(n.condition, env)) && i++ < 100000) r = this.exec(n.body, env); return r; }
        case 'FuncDeclaration': { const fn = { type: 'user', call: (a,l) => { const fe = new Env(env); n.params.forEach((p,i) => fe.define(p, a[i])); try { this.exec(n.body, fe); return null; } catch(e) { if (e instanceof ReturnException) return e.value; throw e; } } }; env.define(n.name, fn); return null; }
        case 'ReturnStatement': throw new ReturnException(n.value ? this.exec(n.value, env) : null);
        case 'BlockStatement': { const be = new Env(env); let r = null; for (const s of n.statements) r = this.exec(s, be); return r; }
        case 'ExpressionStatement': return this.exec(n.expression, env);
        case 'Program': { let r = null; for (const s of n.statements) r = this.exec(s, env); return r; }
      }
    }
    binary(n, env) {
      if (n.operator === 'also') { const l = this.exec(n.left, env); return isTruthy(l) ? this.exec(n.right, env) : l; }
      if (n.operator === 'either') { const l = this.exec(n.left, env); return isTruthy(l) ? l : this.exec(n.right, env); }
      const l = this.exec(n.left, env), r = this.exec(n.right, env);
      switch (n.operator) {
        case '+': return typeof l === 'string' || typeof r === 'string' ? stringify(l) + stringify(r) : Array.isArray(l) ? [...l, ...r] : l + r;
        case '-': return l - r;
        case '*': return typeof l === 'string' ? l.repeat(r) : typeof r === 'string' ? r.repeat(l) : l * r;
        case '/': return l / r;
        case '%': return l % r;
        case '^': return Math.pow(l, r);
        case '<': return l < r;
        case '>': return l > r;
        case '<=': return l <= r;
        case '>=': return l >= r;
        case 'equals': return l === r || (Array.isArray(l) && Array.isArray(r) && l.length === r.length && l.every((v,i) => v === r[i]));
        case 'differs': case '<>': return l !== r;
      }
    }
  }

  return {
    execute: function(code, canvas) {
      const output = [];
      try {
        const lexer = new Lexer(code);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        const interp = new Interpreter(m => output.push(m), canvas);
        interp.run(ast);
        return { success: true, output, hasGraphics: interp.hasGfx };
      } catch (e) {
        return { success: false, output, error: e.message };
      }
    }
  };
})();
`;
}
