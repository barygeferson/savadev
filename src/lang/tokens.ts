export enum TokenType {
  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  IDENTIFIER = 'IDENTIFIER',
  
  // Unique sdev Keywords
  FORGE = 'FORGE',         // variable declaration
  CONJURE = 'CONJURE',     // function
  PONDER = 'PONDER',       // if
  OTHERWISE = 'OTHERWISE', // else
  CYCLE = 'CYCLE',         // while
  ITERATE = 'ITERATE',     // for-each loop
  THROUGH = 'THROUGH',     // for-each keyword
  WITHIN = 'WITHIN',       // for-in loop
  BE = 'BE',               // assignment operator
  YIELD = 'YIELD',         // return
  YEET = 'YEET',           // break
  SKIP = 'SKIP',           // continue
  YEP = 'YEP',             // true
  NOPE = 'NOPE',           // false
  VOID = 'VOID',           // null
  SUMMON = 'SUMMON',       // import from gist
  ATTEMPT = 'ATTEMPT',     // try
  RESCUE = 'RESCUE',       // catch
  ESSENCE = 'ESSENCE',     // class
  EXTEND = 'EXTEND',       // extends
  NEW = 'NEW',             // new instance
  SELF = 'SELF',           // self reference
  SUPER = 'SUPER',         // super call
  
  // Operators
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  STAR = 'STAR',
  SLASH = 'SLASH',
  PERCENT = 'PERCENT',
  CARET = 'CARET',         // power operator
  TILDE = 'TILDE',         // ternary operator ~
  
  // Comparison (unique symbols)
  EQUALS = 'EQUALS',       // equals
  DIFFERS = 'DIFFERS',     // differs / <>
  LESS = 'LESS',           // <
  MORE = 'MORE',           // >
  ATMOST = 'ATMOST',       // <=
  ATLEAST = 'ATLEAST',     // >=
  
  // Logical (word-based)
  ALSO = 'ALSO',           // and
  EITHER = 'EITHER',       // or
  ISNT = 'ISNT',           // not
  
  // Delimiters (unique block syntax)
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',
  COMMA = 'COMMA',
  ARROW = 'ARROW',         // ->
  PIPE = 'PIPE',           // |>
  DOUBLE_COLON = 'DOUBLE_COLON', // :: block start
  DOUBLE_SEMI = 'DOUBLE_SEMI',   // ;; block end
  COLON = 'COLON',
  DOT = 'DOT',
  
  EOF = 'EOF',
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export const KEYWORDS: Record<string, TokenType> = {
  'forge': TokenType.FORGE,
  'conjure': TokenType.CONJURE,
  'ponder': TokenType.PONDER,
  'otherwise': TokenType.OTHERWISE,
  'cycle': TokenType.CYCLE,
  'iterate': TokenType.ITERATE,
  'through': TokenType.THROUGH,
  'within': TokenType.WITHIN,
  'be': TokenType.BE,
  'yield': TokenType.YIELD,
  'yeet': TokenType.YEET,
  'skip': TokenType.SKIP,
  'yep': TokenType.YEP,
  'nope': TokenType.NOPE,
  'void': TokenType.VOID,
  'also': TokenType.ALSO,
  'either': TokenType.EITHER,
  'isnt': TokenType.ISNT,
  'equals': TokenType.EQUALS,
  'differs': TokenType.DIFFERS,
  'summon': TokenType.SUMMON,
  'attempt': TokenType.ATTEMPT,
  'rescue': TokenType.RESCUE,
  'essence': TokenType.ESSENCE,
  'extend': TokenType.EXTEND,
  'new': TokenType.NEW,
  'self': TokenType.SELF,
  'super': TokenType.SUPER,
};
