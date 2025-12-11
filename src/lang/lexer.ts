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
      '{': TokenType.LBRACE,
      '}': TokenType.RBRACE,
      '[': TokenType.LBRACKET,
      ']': TokenType.RBRACKET,
      ',': TokenType.COMMA,
      ';': TokenType.SEMICOLON,
      ':': TokenType.COLON,
      '.': TokenType.DOT,
      '+': TokenType.PLUS,
      '-': TokenType.MINUS,
      '*': TokenType.STAR,
      '%': TokenType.PERCENT,
    };

    if (singleTokens[char]) {
      this.addToken(singleTokens[char], char, startColumn);
      return;
    }

    // Two character tokens or single
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

    if (char === '=') {
      if (this.peek() === '=') {
        this.advance();
        this.addToken(TokenType.EQ, '==', startColumn);
      } else {
        this.addToken(TokenType.ASSIGN, '=', startColumn);
      }
      return;
    }

    if (char === '!') {
      if (this.peek() === '=') {
        this.advance();
        this.addToken(TokenType.NEQ, '!=', startColumn);
      } else {
        this.addToken(TokenType.NOT, '!', startColumn);
      }
      return;
    }

    if (char === '<') {
      if (this.peek() === '=') {
        this.advance();
        this.addToken(TokenType.LTE, '<=', startColumn);
      } else {
        this.addToken(TokenType.LT, '<', startColumn);
      }
      return;
    }

    if (char === '>') {
      if (this.peek() === '=') {
        this.advance();
        this.addToken(TokenType.GTE, '>=', startColumn);
      } else {
        this.addToken(TokenType.GT, '>', startColumn);
      }
      return;
    }

    if (char === '&' && this.peek() === '&') {
      this.advance();
      this.addToken(TokenType.AND, '&&', startColumn);
      return;
    }

    if (char === '|' && this.peek() === '|') {
      this.advance();
      this.addToken(TokenType.OR, '||', startColumn);
      return;
    }

    // String literals
    if (char === '"' || char === "'") {
      this.scanString(char, startColumn);
      return;
    }

    // Numbers
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
    while (this.isDigit(this.peek())) {
      value += this.advance();
    }
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      value += this.advance(); // the dot
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

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_';
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }
}
