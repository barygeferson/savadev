// sdev syntax highlighter — tokenizes source into colored spans

const KEYWORDS = new Set([
  'forge','be','conjure','yield','ponder','otherwise','cycle',
  'iterate','through','summon','essence','extend','self','super',
  'new','async','await','spawn','also','either','isnt','equals',
  'differs','void','yep','nope',
]);

const BUILTINS = new Set([
  'speak','morph','measure','gather','pluck','weave','hue','canvas',
  'clear','turtle','pendown','penup','pencolor','penwidth','forward',
  'backward','left','right','goto','home','circle','rect','line',
  'ellipse','triangle','star','heart','fill','stroke','noStroke',
  'text','point','random','floor','ceil','round','abs','root','sin',
  'cos','tan','log','pow','max','min','slice','find','sort','reverse',
  'keys','values','type','number','string','input','wait','print',
  'range','push','pop','shift','unshift','join','split','trim',
  'upper','lower','replace','includes','startsWith','endsWith',
]);

type TokenType = 'keyword'|'builtin'|'string'|'number'|'comment'|'operator'|'identifier'|'plain';

interface Token { type: TokenType; value: string; }

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    // Line comment
    if (code[i] === '/' && code[i+1] === '/') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = code.length;
      tokens.push({ type: 'comment', value: code.slice(i, end) });
      i = end;
      continue;
    }
    // String double-quote
    if (code[i] === '"') {
      let j = i + 1;
      while (j < code.length && code[j] !== '"') {
        if (code[j] === '\\') j++;
        j++;
      }
      tokens.push({ type: 'string', value: code.slice(i, j + 1) });
      i = j + 1;
      continue;
    }
    // String single-quote
    if (code[i] === "'") {
      let j = i + 1;
      while (j < code.length && code[j] !== "'") {
        if (code[j] === '\\') j++;
        j++;
      }
      tokens.push({ type: 'string', value: code.slice(i, j + 1) });
      i = j + 1;
      continue;
    }
    // Number
    if (/[0-9]/.test(code[i]) || (code[i] === '.' && /[0-9]/.test(code[i+1] || ''))) {
      let j = i;
      while (j < code.length && /[0-9._]/.test(code[j])) j++;
      tokens.push({ type: 'number', value: code.slice(i, j) });
      i = j;
      continue;
    }
    // Identifier / keyword
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
      const word = code.slice(i, j);
      const type: TokenType = KEYWORDS.has(word) ? 'keyword'
        : BUILTINS.has(word) ? 'builtin'
        : 'identifier';
      tokens.push({ type, value: word });
      i = j;
      continue;
    }
    // Operator
    if (/[+\-*/%^|<>=!&()[\]{},.:;]/.test(code[i])) {
      tokens.push({ type: 'operator', value: code[i] });
      i++;
      continue;
    }
    // Whitespace / other
    tokens.push({ type: 'plain', value: code[i] });
    i++;
  }
  return tokens;
}

const COLOR_MAP: Record<TokenType, string> = {
  keyword:    'text-primary',
  builtin:    'text-neon-magenta',
  string:     'text-neon-green',
  number:     'text-neon-orange',
  comment:    'text-muted-foreground italic',
  operator:   'text-accent',
  identifier: 'text-foreground',
  plain:      'text-foreground',
};

interface Props { code: string; }

export function SyntaxHighlighter({ code }: Props) {
  const tokens = tokenize(code);
  return (
    <span>
      {tokens.map((t, i) => (
        <span key={i} className={COLOR_MAP[t.type]}>
          {t.value}
        </span>
      ))}
    </span>
  );
}
