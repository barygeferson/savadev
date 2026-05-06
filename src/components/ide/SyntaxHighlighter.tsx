// sdev syntax highlighter — tokenizes source into colored spans
import { SDEV_KEYWORDS, SDEV_BUILTINS, SDEV_CONSTANTS } from './languageData';

const KEYWORDS = new Set(SDEV_KEYWORDS);
const BUILTINS = new Set(SDEV_BUILTINS.map(b => b.name));
const CONSTANTS = new Set(SDEV_CONSTANTS);

type TokenType = 'keyword'|'builtin'|'constant'|'string'|'number'|'comment'|'operator'|'identifier'|'plain';
interface Token { type: TokenType; value: string; }

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    if (code[i] === '/' && code[i+1] === '/') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = code.length;
      tokens.push({ type: 'comment', value: code.slice(i, end) });
      i = end; continue;
    }
    if (code[i] === '"' || code[i] === "'") {
      const q = code[i];
      let j = i + 1;
      while (j < code.length && code[j] !== q) {
        if (code[j] === '\\') j++;
        j++;
      }
      tokens.push({ type: 'string', value: code.slice(i, j + 1) });
      i = j + 1; continue;
    }
    if (/[0-9]/.test(code[i]) || (code[i] === '.' && /[0-9]/.test(code[i+1] || ''))) {
      let j = i;
      while (j < code.length && /[0-9._]/.test(code[j])) j++;
      tokens.push({ type: 'number', value: code.slice(i, j) });
      i = j; continue;
    }
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
      const word = code.slice(i, j);
      const type: TokenType =
        KEYWORDS.has(word) ? 'keyword' :
        CONSTANTS.has(word) ? 'constant' :
        BUILTINS.has(word) ? 'builtin' : 'identifier';
      tokens.push({ type, value: word });
      i = j; continue;
    }
    if (/[+\-*/%^|<>=!&()[\]{},.:;]/.test(code[i])) {
      tokens.push({ type: 'operator', value: code[i] });
      i++; continue;
    }
    tokens.push({ type: 'plain', value: code[i] });
    i++;
  }
  return tokens;
}

const COLOR_MAP: Record<TokenType, string> = {
  keyword:    'text-primary font-semibold',
  builtin:    'text-neon-magenta',
  constant:   'text-neon-orange',
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
        <span key={i} className={COLOR_MAP[t.type]}>{t.value}</span>
      ))}
    </span>
  );
}
