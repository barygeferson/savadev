import { Token, TokenType, KEYWORDS } from './tokens';
import { SdevError } from './errors';

export class Lexer {
  private source: string;
  private pos: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];

  constructor(source: string) {
    this.source = source;
  }

  tokenize(): Token[] {
    while (!this.isAtEnd()) {
      this.scanToken();
    }
    this.tokens.push({ type: TokenType.EOF, value: '', line: this.line, column: this.column });
    return this.tokens;
  }

  private scanToken(): void {
    this.skipWhitespace();
    if (this.isAtEnd()) return;

    const startColumn = this.column;
    const char = this.advance();

    // Single character tokens
    const singleTokens: Record<string, TokenType> = {
      '(': TokenType.LPAREN,
      ')': TokenType.RPAREN,
      '[': TokenType.LBRACKET,
      ']': TokenType.RBRACKET,
      ',': TokenType.COMMA,
      '.': TokenType.DOT,
      '+': TokenType.PLUS,
      '*': TokenType.STAR,
      '%': TokenType.PERCENT,
      '^': TokenType.CARET,
      '~': TokenType.TILDE,
    };

    if (singleTokens[char]) {
      this.addToken(singleTokens[char], char, startColumn);
      return;
    }

    // Two character tokens
    if (char === '-') {
      if (this.peek() === '>') {
        this.advance();
        this.addToken(TokenType.ARROW, '->', startColumn);
      } else {
        this.addToken(TokenType.MINUS, char, startColumn);
      }
      return;
    }

    if (char === '|') {
      if (this.peek() === '>') {
        this.advance();
        this.addToken(TokenType.PIPE, '|>', startColumn);
      } else {
        throw new SdevError(`Unexpected character: '${char}'`, this.line, startColumn);
      }
      return;
    }

    if (char === ':') {
      if (this.peek() === ':') {
        this.advance();
        this.addToken(TokenType.DOUBLE_COLON, '::', startColumn);
      } else {
        this.addToken(TokenType.COLON, ':', startColumn);
      }
      return;
    }

    if (char === ';') {
      if (this.peek() === ';') {
        this.advance();
        this.addToken(TokenType.DOUBLE_SEMI, ';;', startColumn);
      }
      // Single semicolon is just ignored (optional statement terminator)
      return;
    }

    if (char === '/') {
      if (this.peek() === '/') {
        // Comment - skip to end of line
        while (!this.isAtEnd() && this.peek() !== '\n') {
          this.advance();
        }
        return;
      }
      this.addToken(TokenType.SLASH, char, startColumn);
      return;
    }

    if (char === '#') {
      // Python-style comment - skip to end of line
      while (!this.isAtEnd() && this.peek() !== '\n') {
        this.advance();
      }
      return;
    }

    if (char === '<') {
      if (this.peek() === '>') {
        this.advance();
        this.addToken(TokenType.DIFFERS, '<>', startColumn);
      } else if (this.peek() === '=') {
        this.advance();
        this.addToken(TokenType.ATMOST, '<=', startColumn);
      } else {
        this.addToken(TokenType.LESS, '<', startColumn);
      }
      return;
    }

    if (char === '>') {
      if (this.peek() === '=') {
        this.advance();
        this.addToken(TokenType.ATLEAST, '>=', startColumn);
      } else {
        this.addToken(TokenType.MORE, '>', startColumn);
      }
      return;
    }

    // String literals with backticks or quotes
    if (char === '"' || char === "'" || char === '`') {
      this.scanString(char, startColumn);
      return;
    }

    // Numbers (including hex 0x...)
    if (this.isDigit(char)) {
      this.scanNumber(char, startColumn);
      return;
    }

    // Identifiers and keywords
    if (this.isAlpha(char)) {
      this.scanIdentifier(char, startColumn);
      return;
    }

    throw new SdevError(`Unexpected character: '${char}'`, this.line, startColumn);
  }

  private scanString(quote: string, startColumn: number): void {
    let value = '';
    while (!this.isAtEnd() && this.peek() !== quote) {
      if (this.peek() === '\n') {
        if (quote === '`') {
          value += this.advance();
          this.line++;
          this.column = 1;
          continue;
        }
        throw new SdevError('Unterminated string', this.line, startColumn);
      }
      if (this.peek() === '\\') {
        this.advance();
        const escaped = this.advance();
        const escapes: Record<string, string> = {
          'n': '\n',
          't': '\t',
          'r': '\r',
          '\\': '\\',
          '"': '"',
          "'": "'",
          '`': '`',
        };
        value += escapes[escaped] ?? escaped;
      } else {
        value += this.advance();
      }
    }
    if (this.isAtEnd()) {
      throw new SdevError('Unterminated string', this.line, startColumn);
    }
    this.advance(); // closing quote
    this.addToken(TokenType.STRING, value, startColumn);
  }

  private scanNumber(first: string, startColumn: number): void {
    let value = first;

    // Hex literals: 0x... or 0X...
    if (first === '0' && (this.peek() === 'x' || this.peek() === 'X')) {
      value += this.advance(); // x
      while (this.isHexDigit(this.peek())) {
        value += this.advance();
      }
      this.addToken(TokenType.NUMBER, String(parseInt(value, 16)), startColumn);
      return;
    }

    while (this.isDigit(this.peek())) {
      value += this.advance();
    }
    // Handle decimal point
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      value += this.advance(); // the dot
      while (this.isDigit(this.peek())) {
        value += this.advance();
      }
    }
    // Handle scientific notation (e.g. 1.5e10)
    if ((this.peek() === 'e' || this.peek() === 'E') && 
        (this.isDigit(this.peekNext()) || this.peekNext() === '+' || this.peekNext() === '-')) {
      value += this.advance(); // e
      if (this.peek() === '+' || this.peek() === '-') {
        value += this.advance();
      }
      while (this.isDigit(this.peek())) {
        value += this.advance();
      }
    }
    this.addToken(TokenType.NUMBER, value, startColumn);
  }

  private scanIdentifier(first: string, startColumn: number): void {
    let value = first;
    while (this.isAlphaNumeric(this.peek())) {
      value += this.advance();
    }
    const type = KEYWORDS[value] ?? TokenType.IDENTIFIER;
    this.addToken(type, value, startColumn);
  }

  private skipWhitespace(): void {
    while (!this.isAtEnd()) {
      const char = this.peek();
      if (char === ' ' || char === '\t' || char === '\r') {
        this.advance();
      } else if (char === '\n') {
        this.line++;
        this.column = 0;
        this.advance();
      } else {
        break;
      }
    }
  }

  private isAtEnd(): boolean {
    return this.pos >= this.source.length;
  }

  private peek(): string {
    return this.source[this.pos] ?? '\0';
  }

  private peekNext(): string {
    return this.source[this.pos + 1] ?? '\0';
  }

  private advance(): string {
    const char = this.source[this.pos];
    this.pos++;
    this.column++;
    return char;
  }

  private addToken(type: TokenType, value: string, column: number): void {
    this.tokens.push({ type, value, line: this.line, column });
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isHexDigit(char: string): boolean {
    return (char >= '0' && char <= '9') ||
           (char >= 'a' && char <= 'f') ||
           (char >= 'A' && char <= 'F');
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_';
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }
}
