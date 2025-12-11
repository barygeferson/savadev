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
  YIELD = 'YIELD',         // return
  YEET = 'YEET',           // break
  SKIP = 'SKIP',           // continue
  YEP = 'YEP',             // true
  NOPE = 'NOPE',           // false
  VOID = 'VOID',           // null
  WITHIN = 'WITHIN',       // for-in
  BE = 'BE',               // assignment operator
  
  // Operators
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  STAR = 'STAR',
  SLASH = 'SLASH',
  PERCENT = 'PERCENT',
  CARET = 'CARET',         // power operator
  
  // Comparison (unique symbols)
  EQUALS = 'EQUALS',       // ==
  DIFFERS = 'DIFFERS',     // !=
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
  TILDE = 'TILDE',         // ~ for special ops
  
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
  'yield': TokenType.YIELD,
  'yeet': TokenType.YEET,
  'skip': TokenType.SKIP,
  'yep': TokenType.YEP,
  'nope': TokenType.NOPE,
  'void': TokenType.VOID,
  'within': TokenType.WITHIN,
  'be': TokenType.BE,
  'also': TokenType.ALSO,
  'either': TokenType.EITHER,
  'isnt': TokenType.ISNT,
  'equals': TokenType.EQUALS,
  'differs': TokenType.DIFFERS,
};
