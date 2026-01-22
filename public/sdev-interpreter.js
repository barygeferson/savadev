/**
 * SDEV JavaScript Interpreter
 * A complete standalone interpreter for the sdev programming language
 * Can run in Node.js or browser environments
 * 
 * Usage (Node.js): 
 *   node sdev-interpreter.js script.sdev
 * 
 * Usage (Browser):
 *   const interpreter = new SdevInterpreter();
 *   const result = interpreter.run(code);
 */

// ============= TOKENS =============
const TokenType = {
  // Literals
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  IDENTIFIER: 'IDENTIFIER',
  
  // Keywords
  FORGE: 'FORGE',
  CONJURE: 'CONJURE',
  PONDER: 'PONDER',
  OTHERWISE: 'OTHERWISE',
  CYCLE: 'CYCLE',
  YIELD: 'YIELD',
  YEET: 'YEET',
  SKIP: 'SKIP',
  YEP: 'YEP',
  NOPE: 'NOPE',
  VOID: 'VOID',
  WITHIN: 'WITHIN',
  BE: 'BE',
  SUMMON: 'SUMMON',
  ALSO: 'ALSO',
  EITHER: 'EITHER',
  ISNT: 'ISNT',
  EQUALS: 'EQUALS',
  DIFFERS: 'DIFFERS',
  ESSENCE: 'ESSENCE',
  EXTEND: 'EXTEND',
  SELF: 'SELF',
  SUPER: 'SUPER',
  NEW: 'NEW',
  ASYNC: 'ASYNC',
  AWAIT: 'AWAIT',
  SPAWN: 'SPAWN',
  ATTEMPT: 'ATTEMPT',
  RESCUE: 'RESCUE',
  
  // Operators
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  STAR: 'STAR',
  SLASH: 'SLASH',
  PERCENT: 'PERCENT',
  CARET: 'CARET',
  
  // Comparison
  LESS: 'LESS',
  MORE: 'MORE',
  ATMOST: 'ATMOST',
  ATLEAST: 'ATLEAST',
  
  // Delimiters
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  LBRACKET: 'LBRACKET',
  RBRACKET: 'RBRACKET',
  COMMA: 'COMMA',
  DOT: 'DOT',
  COLON: 'COLON',
  DOUBLE_COLON: 'DOUBLE_COLON',
  DOUBLE_SEMI: 'DOUBLE_SEMI',
  ARROW: 'ARROW',
  PIPE: 'PIPE',
  TILDE: 'TILDE',
  
  EOF: 'EOF'
};

const KEYWORDS = {
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
  'summon': TokenType.SUMMON,
  'also': TokenType.ALSO,
  'either': TokenType.EITHER,
  'isnt': TokenType.ISNT,
  'equals': TokenType.EQUALS,
  'differs': TokenType.DIFFERS,
  'essence': TokenType.ESSENCE,
  'extend': TokenType.EXTEND,
  'self': TokenType.SELF,
  'super': TokenType.SUPER,
  'new': TokenType.NEW,
  'async': TokenType.ASYNC,
  'await': TokenType.AWAIT,
  'spawn': TokenType.SPAWN,
  'attempt': TokenType.ATTEMPT,
  'rescue': TokenType.RESCUE
};

// ============= ERRORS =============
class SdevError extends Error {
  constructor(message, line, column) {
    const location = column !== undefined 
      ? `[line ${line}, col ${column}]` 
      : `[line ${line}]`;
    super(`${location} ${message}`);
    this.name = 'SdevError';
    this.line = line;
    this.column = column;
  }
}

class ReturnException {
  constructor(value) {
    this.value = value;
  }
}

class BreakException {}
class ContinueException {}

// ============= LEXER =============
class Lexer {
  constructor(source) {
    this.source = source;
    this.pos = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
  }

  tokenize() {
    while (!this.isAtEnd()) {
      this.scanToken();
    }
    this.tokens.push({ type: TokenType.EOF, value: '', line: this.line, column: this.column });
    return this.tokens;
  }

  scanToken() {
    this.skipWhitespace();
    if (this.isAtEnd()) return;

    const startColumn = this.column;
    const char = this.advance();

    const singleTokens = {
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
      '~': TokenType.TILDE
    };

    if (singleTokens[char]) {
      this.addToken(singleTokens[char], char, startColumn);
      return;
    }

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
      return;
    }

    if (char === '/') {
      if (this.peek() === '/') {
        while (!this.isAtEnd() && this.peek() !== '\n') {
          this.advance();
        }
        return;
      }
      this.addToken(TokenType.SLASH, char, startColumn);
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

    if (char === '"' || char === "'" || char === '`') {
      this.scanString(char, startColumn);
      return;
    }

    if (this.isDigit(char)) {
      this.scanNumber(char, startColumn);
      return;
    }

    if (this.isAlpha(char)) {
      this.scanIdentifier(char, startColumn);
      return;
    }

    throw new SdevError(`Unexpected character: '${char}'`, this.line, startColumn);
  }

  scanString(quote, startColumn) {
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
        const escapes = { 'n': '\n', 't': '\t', 'r': '\r', '\\': '\\', '"': '"', "'": "'", '`': '`' };
        value += escapes[escaped] ?? escaped;
      } else {
        value += this.advance();
      }
    }
    if (this.isAtEnd()) {
      throw new SdevError('Unterminated string', this.line, startColumn);
    }
    this.advance();
    this.addToken(TokenType.STRING, value, startColumn);
  }

  scanNumber(first, startColumn) {
    let value = first;
    while (this.isDigit(this.peek())) {
      value += this.advance();
    }
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      value += this.advance();
      while (this.isDigit(this.peek())) {
        value += this.advance();
      }
    }
    this.addToken(TokenType.NUMBER, value, startColumn);
  }

  scanIdentifier(first, startColumn) {
    let value = first;
    while (this.isAlphaNumeric(this.peek())) {
      value += this.advance();
    }
    const type = KEYWORDS[value] ?? TokenType.IDENTIFIER;
    this.addToken(type, value, startColumn);
  }

  skipWhitespace() {
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

  isAtEnd() { return this.pos >= this.source.length; }
  peek() { return this.source[this.pos] ?? '\0'; }
  peekNext() { return this.source[this.pos + 1] ?? '\0'; }
  
  advance() {
    const char = this.source[this.pos];
    this.pos++;
    this.column++;
    return char;
  }

  addToken(type, value, column) {
    this.tokens.push({ type, value, line: this.line, column });
  }

  isDigit(char) { return char >= '0' && char <= '9'; }
  isAlpha(char) { return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_'; }
  isAlphaNumeric(char) { return this.isAlpha(char) || this.isDigit(char); }
}

// ============= PARSER =============
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  parse() {
    const statements = [];
    while (!this.isAtEnd()) {
      statements.push(this.parseStatement());
    }
    return { type: 'Program', statements, line: 1 };
  }

  parseStatement() {
    if (this.check(TokenType.FORGE)) return this.parseForgeStatement();
    if (this.check(TokenType.CONJURE)) return this.parseConjureDeclaration();
    if (this.check(TokenType.ASYNC)) return this.parseAsyncConjure();
    if (this.check(TokenType.PONDER)) return this.parsePonderStatement();
    if (this.check(TokenType.CYCLE)) return this.parseCycleStatement();
    if (this.check(TokenType.WITHIN)) return this.parseWithinStatement();
    if (this.check(TokenType.YIELD)) return this.parseYieldStatement();
    if (this.check(TokenType.YEET)) return this.parseYeetStatement();
    if (this.check(TokenType.SKIP)) return this.parseSkipStatement();
    if (this.check(TokenType.ESSENCE)) return this.parseEssenceDeclaration();
    if (this.check(TokenType.ATTEMPT)) return this.parseAttemptStatement();
    if (this.check(TokenType.DOUBLE_COLON)) return this.parseBlockStatement();
    return this.parseExpressionStatement();
  }

  parseForgeStatement() {
    const forgeToken = this.consume(TokenType.FORGE, "Expected 'forge'");
    const name = this.consume(TokenType.IDENTIFIER, "Expected variable name").value;
    this.consume(TokenType.BE, "Expected 'be'");
    const value = this.parseExpression();
    return { type: 'LetStatement', name, value, line: forgeToken.line };
  }

  parseConjureDeclaration() {
    const conjureToken = this.consume(TokenType.CONJURE, "Expected 'conjure'");
    const name = this.consume(TokenType.IDENTIFIER, "Expected function name").value;
    this.consume(TokenType.LPAREN, "Expected '('");
    
    const params = [];
    const defaults = [];
    if (!this.check(TokenType.RPAREN)) {
      do {
        const paramName = this.consume(TokenType.IDENTIFIER, "Expected parameter name").value;
        params.push(paramName);
        if (this.match(TokenType.BE)) {
          defaults.push(this.parseExpression());
        } else {
          defaults.push(undefined);
        }
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RPAREN, "Expected ')'");
    
    const body = this.parseBlockStatement();
    return { type: 'FuncDeclaration', name, params, defaults, body, line: conjureToken.line };
  }

  parseAsyncConjure() {
    const asyncToken = this.consume(TokenType.ASYNC, "Expected 'async'");
    this.consume(TokenType.CONJURE, "Expected 'conjure'");
    const name = this.consume(TokenType.IDENTIFIER, "Expected function name").value;
    this.consume(TokenType.LPAREN, "Expected '('");
    
    const params = [];
    if (!this.check(TokenType.RPAREN)) {
      do {
        params.push(this.consume(TokenType.IDENTIFIER, "Expected parameter name").value);
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RPAREN, "Expected ')'");
    
    const body = this.parseBlockStatement();
    return { type: 'AsyncFuncDeclaration', name, params, body, line: asyncToken.line };
  }

  parseEssenceDeclaration() {
    const essenceToken = this.consume(TokenType.ESSENCE, "Expected 'essence'");
    const name = this.consume(TokenType.IDENTIFIER, "Expected class name").value;
    
    let parent = null;
    if (this.match(TokenType.EXTEND)) {
      parent = this.consume(TokenType.IDENTIFIER, "Expected parent class name").value;
    }
    
    this.consume(TokenType.DOUBLE_COLON, "Expected '::'");
    
    const methods = [];
    while (!this.check(TokenType.DOUBLE_SEMI) && !this.isAtEnd()) {
      if (this.check(TokenType.CONJURE)) {
        const method = this.parseConjureDeclaration();
        methods.push(method);
      } else {
        throw new SdevError('Expected method declaration inside essence', this.peek().line);
      }
    }
    
    this.consume(TokenType.DOUBLE_SEMI, "Expected ';;'");
    return { type: 'EssenceDeclaration', name, parent, methods, line: essenceToken.line };
  }

  parsePonderStatement() {
    const ponderToken = this.consume(TokenType.PONDER, "Expected 'ponder'");
    const condition = this.parseExpression();
    const thenBranch = this.parseBlockStatement();
    
    let elseBranch = null;
    if (this.match(TokenType.OTHERWISE)) {
      if (this.check(TokenType.PONDER)) {
        elseBranch = this.parsePonderStatement();
      } else {
        elseBranch = this.parseBlockStatement();
      }
    }
    
    return { type: 'IfStatement', condition, thenBranch, elseBranch, line: ponderToken.line };
  }

  parseCycleStatement() {
    const cycleToken = this.consume(TokenType.CYCLE, "Expected 'cycle'");
    const condition = this.parseExpression();
    const body = this.parseBlockStatement();
    return { type: 'WhileStatement', condition, body, line: cycleToken.line };
  }

  parseWithinStatement() {
    const withinToken = this.consume(TokenType.WITHIN, "Expected 'within'");
    const varName = this.consume(TokenType.IDENTIFIER, "Expected variable name").value;
    this.consume(TokenType.BE, "Expected 'be'");
    const iterable = this.parseExpression();
    const body = this.parseBlockStatement();
    return { type: 'ForInStatement', varName, iterable, body, line: withinToken.line };
  }

  parseYieldStatement() {
    const yieldToken = this.consume(TokenType.YIELD, "Expected 'yield'");
    let value = null;
    if (!this.check(TokenType.DOUBLE_SEMI) && !this.isAtEnd()) {
      if (!this.check(TokenType.FORGE) && !this.check(TokenType.CONJURE) && 
          !this.check(TokenType.PONDER) && !this.check(TokenType.CYCLE)) {
        value = this.parseExpression();
      }
    }
    return { type: 'ReturnStatement', value, line: yieldToken.line };
  }

  parseYeetStatement() {
    const yeetToken = this.consume(TokenType.YEET, "Expected 'yeet'");
    return { type: 'BreakStatement', line: yeetToken.line };
  }

  parseSkipStatement() {
    const skipToken = this.consume(TokenType.SKIP, "Expected 'skip'");
    return { type: 'ContinueStatement', line: skipToken.line };
  }

  parseAttemptStatement() {
    const attemptToken = this.consume(TokenType.ATTEMPT, "Expected 'attempt'");
    const tryBlock = this.parseBlockStatement();
    
    let catchVar = null;
    let catchBlock = null;
    if (this.match(TokenType.RESCUE)) {
      if (this.check(TokenType.IDENTIFIER)) {
        catchVar = this.consume(TokenType.IDENTIFIER, "Expected error variable").value;
      }
      catchBlock = this.parseBlockStatement();
    }
    
    return { type: 'TryCatchStatement', tryBlock, catchVar, catchBlock, line: attemptToken.line };
  }

  parseBlockStatement() {
    const colonToken = this.consume(TokenType.DOUBLE_COLON, "Expected '::'");
    const statements = [];
    while (!this.check(TokenType.DOUBLE_SEMI) && !this.isAtEnd()) {
      statements.push(this.parseStatement());
    }
    this.consume(TokenType.DOUBLE_SEMI, "Expected ';;'");
    return { type: 'BlockStatement', statements, line: colonToken.line };
  }

  parseExpressionStatement() {
    const expr = this.parseExpression();
    
    if (this.match(TokenType.BE)) {
      const value = this.parseExpression();
      
      if (expr.type === 'Identifier') {
        return { type: 'AssignStatement', name: expr.name, value, line: expr.line };
      }
      if (expr.type === 'IndexExpr') {
        return { type: 'IndexAssignStatement', object: expr.object, index: expr.index, value, line: expr.line };
      }
      if (expr.type === 'MemberExpr') {
        return { type: 'MemberAssignStatement', object: expr.object, property: expr.property, value, line: expr.line };
      }
      throw new SdevError('Invalid assignment target', expr.line);
    }
    
    return { type: 'ExpressionStatement', expression: expr, line: expr.line };
  }

  parseExpression() {
    return this.parseTernary();
  }

  parseTernary() {
    let condition = this.parsePipe();
    
    if (this.match(TokenType.TILDE)) {
      const thenExpr = this.parseExpression();
      this.consume(TokenType.COLON, "Expected ':' in ternary");
      const elseExpr = this.parseExpression();
      return { type: 'TernaryExpr', condition, thenExpr, elseExpr, line: condition.line };
    }
    
    return condition;
  }

  parsePipe() {
    let left = this.parseOr();
    
    while (this.match(TokenType.PIPE)) {
      const right = this.parseOr();
      if (right.type === 'CallExpr') {
        right.args.unshift(left);
        left = right;
      } else if (right.type === 'Identifier') {
        left = { type: 'CallExpr', callee: right, args: [left], line: left.line };
      } else {
        throw new SdevError('Pipe target must be a function or call', right.line);
      }
    }
    
    return left;
  }

  parseOr() {
    let left = this.parseAnd();
    while (this.match(TokenType.EITHER)) {
      const right = this.parseAnd();
      left = { type: 'BinaryExpr', operator: 'either', left, right, line: left.line };
    }
    return left;
  }

  parseAnd() {
    let left = this.parseEquality();
    while (this.match(TokenType.ALSO)) {
      const right = this.parseEquality();
      left = { type: 'BinaryExpr', operator: 'also', left, right, line: left.line };
    }
    return left;
  }

  parseEquality() {
    let left = this.parseComparison();
    while (this.match(TokenType.EQUALS, TokenType.DIFFERS)) {
      const operator = this.previous().type === TokenType.EQUALS ? 'equals' : 'differs';
      const right = this.parseComparison();
      left = { type: 'BinaryExpr', operator, left, right, line: left.line };
    }
    return left;
  }

  parseComparison() {
    let left = this.parseTerm();
    while (this.match(TokenType.LESS, TokenType.MORE, TokenType.ATMOST, TokenType.ATLEAST)) {
      const operator = this.previous().value;
      const right = this.parseTerm();
      left = { type: 'BinaryExpr', operator, left, right, line: left.line };
    }
    return left;
  }

  parseTerm() {
    let left = this.parseFactor();
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous().value;
      const right = this.parseFactor();
      left = { type: 'BinaryExpr', operator, left, right, line: left.line };
    }
    return left;
  }

  parseFactor() {
    let left = this.parsePower();
    while (this.match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT)) {
      const operator = this.previous().value;
      const right = this.parsePower();
      left = { type: 'BinaryExpr', operator, left, right, line: left.line };
    }
    return left;
  }

  parsePower() {
    let left = this.parseUnary();
    while (this.match(TokenType.CARET)) {
      const right = this.parseUnary();
      left = { type: 'BinaryExpr', operator: '^', left, right, line: left.line };
    }
    return left;
  }

  parseUnary() {
    if (this.match(TokenType.MINUS, TokenType.ISNT)) {
      const operator = this.previous().value;
      const operand = this.parseUnary();
      return { type: 'UnaryExpr', operator, operand, line: this.previous().line };
    }
    if (this.match(TokenType.AWAIT)) {
      const expr = this.parseUnary();
      return { type: 'AwaitExpr', expression: expr, line: this.previous().line };
    }
    if (this.match(TokenType.SPAWN)) {
      const expr = this.parseUnary();
      return { type: 'SpawnExpr', expression: expr, line: this.previous().line };
    }
    if (this.match(TokenType.NEW)) {
      const className = this.consume(TokenType.IDENTIFIER, "Expected class name").value;
      this.consume(TokenType.LPAREN, "Expected '('");
      const args = [];
      if (!this.check(TokenType.RPAREN)) {
        do {
          args.push(this.parseExpression());
        } while (this.match(TokenType.COMMA));
      }
      this.consume(TokenType.RPAREN, "Expected ')'");
      return { type: 'NewExpr', className, args, line: this.previous().line };
    }
    return this.parseCall();
  }

  parseCall() {
    let expr = this.parsePrimary();
    
    while (true) {
      if (this.match(TokenType.LPAREN)) {
        expr = this.finishCall(expr);
      } else if (this.match(TokenType.LBRACKET)) {
        const index = this.parseExpression();
        this.consume(TokenType.RBRACKET, "Expected ']'");
        expr = { type: 'IndexExpr', object: expr, index, line: expr.line };
      } else if (this.match(TokenType.DOT)) {
        const property = this.consume(TokenType.IDENTIFIER, "Expected property name").value;
        expr = { type: 'MemberExpr', object: expr, property, line: expr.line };
      } else if (this.match(TokenType.ARROW)) {
        if (expr.type === 'Identifier') {
          const body = this.parseExpression();
          expr = { type: 'LambdaExpr', params: [expr.name], body, line: expr.line };
        } else {
          throw new SdevError('Invalid lambda syntax', expr.line);
        }
      } else {
        break;
      }
    }
    
    return expr;
  }

  finishCall(callee) {
    const args = [];
    if (!this.check(TokenType.RPAREN)) {
      do {
        args.push(this.parseExpression());
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RPAREN, "Expected ')'");
    return { type: 'CallExpr', callee, args, line: callee.line };
  }

  parsePrimary() {
    const token = this.peek();

    if (this.match(TokenType.NUMBER)) {
      return { type: 'NumberLiteral', value: parseFloat(token.value), line: token.line };
    }

    if (this.match(TokenType.STRING)) {
      return { type: 'StringLiteral', value: token.value, line: token.line };
    }

    if (this.match(TokenType.YEP)) {
      return { type: 'BooleanLiteral', value: true, line: token.line };
    }

    if (this.match(TokenType.NOPE)) {
      return { type: 'BooleanLiteral', value: false, line: token.line };
    }

    if (this.match(TokenType.VOID)) {
      return { type: 'NullLiteral', line: token.line };
    }

    if (this.match(TokenType.SELF)) {
      return { type: 'SelfExpr', line: token.line };
    }

    if (this.match(TokenType.SUPER)) {
      this.consume(TokenType.DOT, "Expected '.' after 'super'");
      const method = this.consume(TokenType.IDENTIFIER, "Expected superclass method name").value;
      return { type: 'SuperExpr', method, line: token.line };
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return { type: 'Identifier', name: token.value, line: token.line };
    }

    if (this.match(TokenType.LPAREN)) {
      const exprs = [];
      const names = [];
      let isLambdaParams = true;
      
      if (!this.check(TokenType.RPAREN)) {
        do {
          const expr = this.parseExpression();
          exprs.push(expr);
          if (expr.type !== 'Identifier') isLambdaParams = false;
          else names.push(expr.name);
        } while (this.match(TokenType.COMMA));
      }
      this.consume(TokenType.RPAREN, "Expected ')'");
      
      if (this.match(TokenType.ARROW)) {
        if (!isLambdaParams) {
          throw new SdevError('Invalid lambda parameters', token.line);
        }
        const body = this.parseExpression();
        return { type: 'LambdaExpr', params: names, body, line: token.line };
      }
      
      if (exprs.length === 1) return exprs[0];
      throw new SdevError('Unexpected multiple expressions', token.line);
    }

    if (this.match(TokenType.LBRACKET)) {
      return this.parseArrayLiteral(token.line);
    }

    if (this.match(TokenType.DOUBLE_COLON)) {
      return this.parseDictLiteral(token.line);
    }

    throw new SdevError(`Unexpected token: '${token.value}'`, token.line, token.column);
  }

  parseArrayLiteral(line) {
    const elements = [];
    if (!this.check(TokenType.RBRACKET)) {
      do {
        elements.push(this.parseExpression());
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RBRACKET, "Expected ']'");
    return { type: 'ArrayLiteral', elements, line };
  }

  parseDictLiteral(line) {
    const entries = [];
    if (!this.check(TokenType.DOUBLE_SEMI)) {
      do {
        const key = this.parseExpression();
        this.consume(TokenType.COLON, "Expected ':'");
        const value = this.parseExpression();
        entries.push({ key, value });
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.DOUBLE_SEMI, "Expected ';;'");
    return { type: 'DictLiteral', entries, line };
  }

  peek() { return this.tokens[this.pos]; }
  previous() { return this.tokens[this.pos - 1]; }
  isAtEnd() { return this.peek().type === TokenType.EOF; }
  check(...types) { return !this.isAtEnd() && types.includes(this.peek().type); }
  
  match(...types) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  advance() {
    if (!this.isAtEnd()) this.pos++;
    return this.previous();
  }

  consume(type, message) {
    if (this.check(type)) return this.advance();
    throw new SdevError(message, this.peek().line, this.peek().column);
  }
}

// ============= ENVIRONMENT =============
class Environment {
  constructor(parent = null) {
    this.values = new Map();
    this.parent = parent;
  }

  define(name, value) {
    this.values.set(name, value);
  }

  get(name, line) {
    if (this.values.has(name)) {
      return this.values.get(name);
    }
    if (this.parent) {
      return this.parent.get(name, line);
    }
    throw new SdevError(`Undefined variable: '${name}'`, line);
  }

  set(name, value, line) {
    if (this.values.has(name)) {
      this.values.set(name, value);
      return;
    }
    if (this.parent) {
      this.parent.set(name, value, line);
      return;
    }
    throw new SdevError(`Undefined variable: '${name}'`, line);
  }

  has(name) {
    return this.values.has(name) || (this.parent && this.parent.has(name));
  }
}

// ============= SDEV TYPES =============
class SdevClass {
  constructor(name, parent, methods) {
    this.name = name;
    this.parent = parent;
    this.methods = methods;
  }

  findMethod(name) {
    if (this.methods.has(name)) {
      return this.methods.get(name);
    }
    if (this.parent) {
      return this.parent.findMethod(name);
    }
    return null;
  }

  toString() {
    return `<essence ${this.name}>`;
  }
}

class SdevInstance {
  constructor(klass) {
    this.klass = klass;
    this.fields = new Map();
  }

  get(name, line) {
    if (this.fields.has(name)) {
      return this.fields.get(name);
    }
    const method = this.klass.findMethod(name);
    if (method) {
      return this.bindMethod(method);
    }
    throw new SdevError(`Undefined property: '${name}'`, line);
  }

  set(name, value) {
    this.fields.set(name, value);
  }

  bindMethod(method) {
    return {
      type: 'bound_method',
      instance: this,
      method: method,
      call: (args, line) => method.call([this, ...args], line)
    };
  }

  toString() {
    return `<${this.klass.name} instance>`;
  }
}

class SdevVector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(other) { return new SdevVector2(this.x + other.x, this.y + other.y); }
  sub(other) { return new SdevVector2(this.x - other.x, this.y - other.y); }
  scale(s) { return new SdevVector2(this.x * s, this.y * s); }
  dot(other) { return this.x * other.x + this.y * other.y; }
  length() { return Math.sqrt(this.x * this.x + this.y * this.y); }
  normalize() {
    const len = this.length();
    return len > 0 ? new SdevVector2(this.x / len, this.y / len) : new SdevVector2(0, 0);
  }
  distance(other) { return this.sub(other).length(); }
  angle() { return Math.atan2(this.y, this.x); }
  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new SdevVector2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  toString() { return `Vector2(${this.x}, ${this.y})`; }
}

class SdevSprite {
  constructor(id, x, y, width, height) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.rotation = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.visible = true;
    this.color = '#ffffff';
    this.image = null;
  }

  moveTo(x, y) { this.x = x; this.y = y; }
  moveBy(dx, dy) { this.x += dx; this.y += dy; }
  rotateTo(angle) { this.rotation = angle; }
  rotateBy(angle) { this.rotation += angle; }
  scaleTo(sx, sy) { this.scaleX = sx; this.scaleY = sy ?? sx; }

  collidesWith(other) {
    return !(this.x + this.width < other.x ||
             other.x + other.width < this.x ||
             this.y + this.height < other.y ||
             other.y + other.height < this.y);
  }

  toString() { return `<Sprite ${this.id} at (${this.x}, ${this.y})>`; }
}

// ============= DATA STRUCTURES =============
class SdevSet {
  constructor(items = []) {
    this.items = new Set(items);
  }
  add(item) { this.items.add(item); return this; }
  remove(item) { this.items.delete(item); return this; }
  has(item) { return this.items.has(item); }
  size() { return this.items.size; }
  toList() { return Array.from(this.items); }
  union(other) { return new SdevSet([...this.items, ...other.items]); }
  intersect(other) { return new SdevSet([...this.items].filter(x => other.has(x))); }
  toString() { return `Set{${Array.from(this.items).join(', ')}}`; }
}

class SdevMap {
  constructor() {
    this.items = new Map();
  }
  set(key, value) { this.items.set(key, value); return this; }
  get(key) { return this.items.get(key); }
  has(key) { return this.items.has(key); }
  remove(key) { this.items.delete(key); return this; }
  keys() { return Array.from(this.items.keys()); }
  values() { return Array.from(this.items.values()); }
  size() { return this.items.size; }
  toString() { return `Map{${Array.from(this.items).map(([k,v]) => `${k}: ${v}`).join(', ')}}`; }
}

class SdevQueue {
  constructor() { this.items = []; }
  enqueue(item) { this.items.push(item); return this; }
  dequeue() { return this.items.shift(); }
  peek() { return this.items[0]; }
  isEmpty() { return this.items.length === 0; }
  size() { return this.items.length; }
  toString() { return `Queue[${this.items.join(' <- ')}]`; }
}

class SdevStack {
  constructor() { this.items = []; }
  push(item) { this.items.push(item); return this; }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
  isEmpty() { return this.items.length === 0; }
  size() { return this.items.length; }
  toString() { return `Stack[${this.items.join(' | ')}]`; }
}

class SdevLinkedList {
  constructor() { this.head = null; this.tail = null; this._size = 0; }
  
  append(value) {
    const node = { value, next: null };
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    this._size++;
    return this;
  }
  
  prepend(value) {
    const node = { value, next: this.head };
    this.head = node;
    if (!this.tail) this.tail = node;
    this._size++;
    return this;
  }
  
  removeFirst() {
    if (!this.head) return null;
    const value = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this._size--;
    return value;
  }
  
  toList() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
  
  size() { return this._size; }
  isEmpty() { return this._size === 0; }
  toString() { return `LinkedList[${this.toList().join(' -> ')}]`; }
}

// ============= INTERPRETER =============
class Interpreter {
  constructor(outputCallback = console.log) {
    this.output = outputCallback;
    this.globalEnv = new Environment();
    this.graphicsCommands = [];
    this.sprites = new Map();
    this.spriteIdCounter = 0;
    this.turtleState = { x: 200, y: 200, angle: 0, penDown: true, color: '#ffffff', width: 2 };
    this.registerBuiltins();
  }

  registerBuiltins() {
    const builtins = this.createBuiltins();
    for (const [name, fn] of builtins) {
      this.globalEnv.define(name, fn);
    }
  }

  createBuiltins() {
    const builtins = new Map();
    const self = this;

    // I/O
    builtins.set('speak', { type: 'builtin', call: (args) => { self.output(args.map(a => stringify(a)).join(' ')); return null; }});
    builtins.set('whisper', { type: 'builtin', call: (args) => { self.output(args.map(a => stringify(a)).join('')); return null; }});
    builtins.set('shout', { type: 'builtin', call: (args) => { self.output(args.map(a => stringify(a)).join(' ').toUpperCase()); return null; }});

    // Type operations
    builtins.set('measure', { type: 'builtin', call: (args, line) => {
      const arg = args[0];
      if (typeof arg === 'string') return arg.length;
      if (Array.isArray(arg)) return arg.length;
      if (arg && typeof arg === 'object') return Object.keys(arg).length;
      throw new SdevError('measure() argument must be string, list, or dict', line);
    }});

    builtins.set('morph', { type: 'builtin', call: (args, line) => {
      const [val, targetType] = args;
      switch (targetType) {
        case 'number': return typeof val === 'number' ? val : parseFloat(val);
        case 'text': return stringify(val);
        case 'truth': return isTruthy(val);
        default: throw new SdevError(`Unknown type: ${targetType}`, line);
      }
    }});

    builtins.set('essence', { type: 'builtin', call: (args) => {
      const val = args[0];
      if (val === null) return 'void';
      if (typeof val === 'number') return 'number';
      if (typeof val === 'string') return 'text';
      if (typeof val === 'boolean') return 'truth';
      if (Array.isArray(val)) return 'list';
      if (val instanceof SdevInstance) return val.klass.name;
      if (val instanceof SdevVector2) return 'Vector2';
      if (val instanceof SdevSprite) return 'Sprite';
      if (val && val.type) return 'conjuration';
      if (typeof val === 'object') return 'tome';
      return 'mystery';
    }});

    // Sequences
    builtins.set('sequence', { type: 'builtin', call: (args, line) => {
      let start = 0, end = 0, step = 1;
      if (args.length === 1) { end = args[0]; }
      else if (args.length === 2) { start = args[0]; end = args[1]; }
      else { start = args[0]; end = args[1]; step = args[2]; }
      if (step === 0) throw new SdevError('sequence() step cannot be 0', line);
      const result = [];
      if (step > 0) { for (let i = start; i < end; i += step) result.push(i); }
      else { for (let i = start; i > end; i += step) result.push(i); }
      return result;
    }});

    // Functional
    builtins.set('each', { type: 'builtin', call: (args, line) => {
      const [arr, fn] = args;
      if (!Array.isArray(arr)) throw new SdevError('First argument must be a list', line);
      return arr.map((item, idx) => fn.call([item, idx], line));
    }});

    builtins.set('sift', { type: 'builtin', call: (args, line) => {
      const [arr, fn] = args;
      if (!Array.isArray(arr)) throw new SdevError('First argument must be a list', line);
      return arr.filter(item => isTruthy(fn.call([item], line)));
    }});

    builtins.set('fold', { type: 'builtin', call: (args, line) => {
      const [arr, initial, fn] = args;
      if (!Array.isArray(arr)) throw new SdevError('First argument must be a list', line);
      return arr.reduce((acc, item) => fn.call([acc, item], line), initial);
    }});

    // List operations
    builtins.set('gather', { type: 'builtin', call: (args, line) => {
      const [arr, item] = args;
      if (!Array.isArray(arr)) throw new SdevError('First argument must be a list', line);
      arr.push(item);
      return arr;
    }});

    builtins.set('pluck', { type: 'builtin', call: (args, line) => {
      const arr = args[0];
      if (!Array.isArray(arr)) throw new SdevError('Argument must be a list', line);
      return arr.pop();
    }});

    builtins.set('portion', { type: 'builtin', call: (args) => {
      const [arr, start, end] = args;
      return arr.slice(start, end);
    }});

    builtins.set('weave', { type: 'builtin', call: (args) => {
      const [arr, sep] = args;
      return arr.map(stringify).join(sep);
    }});

    builtins.set('shatter', { type: 'builtin', call: (args) => {
      const [str, sep] = args;
      return str.split(sep);
    }});

    // String operations
    builtins.set('upper', { type: 'builtin', call: (args) => args[0].toUpperCase() });
    builtins.set('lower', { type: 'builtin', call: (args) => args[0].toLowerCase() });
    builtins.set('trim', { type: 'builtin', call: (args) => args[0].trim() });
    builtins.set('reverse', { type: 'builtin', call: (args) => {
      const val = args[0];
      if (typeof val === 'string') return val.split('').reverse().join('');
      if (Array.isArray(val)) return [...val].reverse();
      return val;
    }});
    builtins.set('contains', { type: 'builtin', call: (args) => {
      const [haystack, needle] = args;
      if (typeof haystack === 'string') return haystack.includes(needle);
      if (Array.isArray(haystack)) return haystack.includes(needle);
      return false;
    }});

    // Dict operations
    builtins.set('inscriptions', { type: 'builtin', call: (args) => Object.keys(args[0]) });
    builtins.set('contents', { type: 'builtin', call: (args) => Object.values(args[0]) });

    // Math
    builtins.set('magnitude', { type: 'builtin', call: (args) => Math.abs(args[0]) });
    builtins.set('least', { type: 'builtin', call: (args) => {
      if (args.length === 1 && Array.isArray(args[0])) return Math.min(...args[0]);
      return Math.min(...args);
    }});
    builtins.set('greatest', { type: 'builtin', call: (args) => {
      if (args.length === 1 && Array.isArray(args[0])) return Math.max(...args[0]);
      return Math.max(...args);
    }});
    builtins.set('root', { type: 'builtin', call: (args) => Math.sqrt(args[0]) });
    builtins.set('ground', { type: 'builtin', call: (args) => Math.floor(args[0]) });
    builtins.set('elevate', { type: 'builtin', call: (args) => Math.ceil(args[0]) });
    builtins.set('nearby', { type: 'builtin', call: (args) => Math.round(args[0]) });
    builtins.set('chaos', { type: 'builtin', call: () => Math.random() });
    builtins.set('sin', { type: 'builtin', call: (args) => Math.sin(args[0]) });
    builtins.set('cos', { type: 'builtin', call: (args) => Math.cos(args[0]) });
    builtins.set('tan', { type: 'builtin', call: (args) => Math.tan(args[0]) });
    builtins.set('asin', { type: 'builtin', call: (args) => Math.asin(args[0]) });
    builtins.set('acos', { type: 'builtin', call: (args) => Math.acos(args[0]) });
    builtins.set('atan', { type: 'builtin', call: (args) => Math.atan(args[0]) });
    builtins.set('atan2', { type: 'builtin', call: (args) => Math.atan2(args[0], args[1]) });
    builtins.set('log', { type: 'builtin', call: (args) => Math.log(args[0]) });
    builtins.set('log10', { type: 'builtin', call: (args) => Math.log10(args[0]) });
    builtins.set('exp', { type: 'builtin', call: (args) => Math.exp(args[0]) });
    builtins.set('PI', { type: 'builtin', call: () => Math.PI });
    builtins.set('TAU', { type: 'builtin', call: () => Math.PI * 2 });
    builtins.set('E', { type: 'builtin', call: () => Math.E });

    // Random
    builtins.set('randint', { type: 'builtin', call: (args) => {
      const [min, max] = args;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }});
    builtins.set('pick', { type: 'builtin', call: (args) => {
      const arr = args[0];
      return arr[Math.floor(Math.random() * arr.length)];
    }});
    builtins.set('shuffle', { type: 'builtin', call: (args) => {
      const arr = [...args[0]];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }});

    // JSON
    builtins.set('etch', { type: 'builtin', call: (args) => JSON.stringify(args[0]) });
    builtins.set('unetch', { type: 'builtin', call: (args, line) => {
      try { return JSON.parse(args[0]); }
      catch { throw new SdevError('Invalid JSON', line); }
    }});

    // Vector2
    builtins.set('Vector2', { type: 'builtin', call: (args) => new SdevVector2(args[0] ?? 0, args[1] ?? 0) });

    // Data structures
    builtins.set('Set', { type: 'builtin', call: (args) => new SdevSet(args[0] ?? []) });
    builtins.set('Map', { type: 'builtin', call: () => new SdevMap() });
    builtins.set('Queue', { type: 'builtin', call: () => new SdevQueue() });
    builtins.set('Stack', { type: 'builtin', call: () => new SdevStack() });
    builtins.set('LinkedList', { type: 'builtin', call: () => new SdevLinkedList() });

    // Time
    builtins.set('now', { type: 'builtin', call: () => Date.now() });
    builtins.set('delay', { type: 'builtin', call: (args) => new Promise(resolve => setTimeout(resolve, args[0])) });

    // Graphics
    this.registerGraphicsBuiltins(builtins);

    return builtins;
  }

  registerGraphicsBuiltins(builtins) {
    const self = this;

    // Canvas setup
    builtins.set('canvas', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'canvas', width: args[0], height: args[1] });
      return null;
    }});
    builtins.set('clear', { type: 'builtin', call: () => { self.graphicsCommands.push({ type: 'clear' }); return null; }});
    builtins.set('background', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'background', color: args[0] });
      return null;
    }});

    // Drawing state
    builtins.set('stroke', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'stroke', color: args[0] });
      return null;
    }});
    builtins.set('fill', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'fill', color: args[0] });
      return null;
    }});
    builtins.set('lineWidth', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'lineWidth', width: args[0] });
      return null;
    }});
    builtins.set('noStroke', { type: 'builtin', call: () => {
      self.graphicsCommands.push({ type: 'noStroke' });
      return null;
    }});
    builtins.set('noFill', { type: 'builtin', call: () => {
      self.graphicsCommands.push({ type: 'noFill' });
      return null;
    }});

    // Shapes
    builtins.set('rect', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'rect', x: args[0], y: args[1], width: args[2], height: args[3], radius: args[4] ?? 0 });
      return null;
    }});
    builtins.set('circle', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'circle', x: args[0], y: args[1], radius: args[2] });
      return null;
    }});
    builtins.set('ellipse', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'ellipse', x: args[0], y: args[1], rx: args[2], ry: args[3] });
      return null;
    }});
    builtins.set('line', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'line', x1: args[0], y1: args[1], x2: args[2], y2: args[3] });
      return null;
    }});
    builtins.set('arc', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'arc', x: args[0], y: args[1], radius: args[2], startAngle: args[3], endAngle: args[4] });
      return null;
    }});
    builtins.set('star', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'star', x: args[0], y: args[1], outerRadius: args[2], innerRadius: args[3], points: args[4] ?? 5 });
      return null;
    }});
    builtins.set('heart', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'heart', x: args[0], y: args[1], size: args[2] });
      return null;
    }});
    builtins.set('polygon', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'polygon', x: args[0], y: args[1], radius: args[2], sides: args[3] });
      return null;
    }});

    // Text
    builtins.set('text', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'text', text: args[0], x: args[1], y: args[2] });
      return null;
    }});
    builtins.set('fontSize', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'fontSize', size: args[0] });
      return null;
    }});
    builtins.set('fontFamily', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'fontFamily', family: args[0] });
      return null;
    }});

    // Gradients
    builtins.set('linearGradient', { type: 'builtin', call: (args) => {
      const [x1, y1, x2, y2, ...stops] = args;
      self.graphicsCommands.push({ type: 'linearGradient', x1, y1, x2, y2, stops });
      return null;
    }});
    builtins.set('radialGradient', { type: 'builtin', call: (args) => {
      const [x, y, r, ...stops] = args;
      self.graphicsCommands.push({ type: 'radialGradient', x, y, r, stops });
      return null;
    }});

    // Transformations
    builtins.set('translate', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'translate', x: args[0], y: args[1] });
      return null;
    }});
    builtins.set('rotate', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'rotate', angle: args[0] });
      return null;
    }});
    builtins.set('scale', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'scale', x: args[0], y: args[1] ?? args[0] });
      return null;
    }});
    builtins.set('save', { type: 'builtin', call: () => { self.graphicsCommands.push({ type: 'save' }); return null; }});
    builtins.set('restore', { type: 'builtin', call: () => { self.graphicsCommands.push({ type: 'restore' }); return null; }});
    builtins.set('resetTransform', { type: 'builtin', call: () => { self.graphicsCommands.push({ type: 'resetTransform' }); return null; }});

    // Path drawing
    builtins.set('beginPath', { type: 'builtin', call: () => { self.graphicsCommands.push({ type: 'beginPath' }); return null; }});
    builtins.set('closePath', { type: 'builtin', call: () => { self.graphicsCommands.push({ type: 'closePath' }); return null; }});
    builtins.set('moveTo', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'moveTo', x: args[0], y: args[1] });
      return null;
    }});
    builtins.set('lineTo', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'lineTo', x: args[0], y: args[1] });
      return null;
    }});
    builtins.set('quadraticTo', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'quadraticTo', cpx: args[0], cpy: args[1], x: args[2], y: args[3] });
      return null;
    }});
    builtins.set('bezierTo', { type: 'builtin', call: (args) => {
      self.graphicsCommands.push({ type: 'bezierTo', cp1x: args[0], cp1y: args[1], cp2x: args[2], cp2y: args[3], x: args[4], y: args[5] });
      return null;
    }});
    builtins.set('strokePath', { type: 'builtin', call: () => { self.graphicsCommands.push({ type: 'strokePath' }); return null; }});
    builtins.set('fillPath', { type: 'builtin', call: () => { self.graphicsCommands.push({ type: 'fillPath' }); return null; }});

    // Sprites
    builtins.set('createSprite', { type: 'builtin', call: (args) => {
      const id = `sprite_${self.spriteIdCounter++}`;
      const sprite = new SdevSprite(id, args[0] ?? 0, args[1] ?? 0, args[2] ?? 50, args[3] ?? 50);
      self.sprites.set(id, sprite);
      return sprite;
    }});
    builtins.set('drawSprite', { type: 'builtin', call: (args) => {
      const sprite = args[0];
      if (sprite instanceof SdevSprite && sprite.visible) {
        self.graphicsCommands.push({
          type: 'sprite',
          x: sprite.x, y: sprite.y,
          width: sprite.width, height: sprite.height,
          rotation: sprite.rotation,
          scaleX: sprite.scaleX, scaleY: sprite.scaleY,
          color: sprite.color, image: sprite.image
        });
      }
      return null;
    }});
    builtins.set('spriteCollides', { type: 'builtin', call: (args) => {
      const [a, b] = args;
      if (a instanceof SdevSprite && b instanceof SdevSprite) {
        return a.collidesWith(b);
      }
      return false;
    }});

    // Turtle graphics
    builtins.set('forward', { type: 'builtin', call: (args) => {
      const dist = args[0];
      const rad = self.turtleState.angle * Math.PI / 180;
      const newX = self.turtleState.x + Math.cos(rad) * dist;
      const newY = self.turtleState.y + Math.sin(rad) * dist;
      if (self.turtleState.penDown) {
        self.graphicsCommands.push({
          type: 'turtleLine',
          x1: self.turtleState.x, y1: self.turtleState.y,
          x2: newX, y2: newY,
          color: self.turtleState.color, width: self.turtleState.width
        });
      }
      self.turtleState.x = newX;
      self.turtleState.y = newY;
      return null;
    }});
    builtins.set('backward', { type: 'builtin', call: (args) => {
      const dist = args[0];
      const rad = self.turtleState.angle * Math.PI / 180;
      const newX = self.turtleState.x - Math.cos(rad) * dist;
      const newY = self.turtleState.y - Math.sin(rad) * dist;
      if (self.turtleState.penDown) {
        self.graphicsCommands.push({
          type: 'turtleLine',
          x1: self.turtleState.x, y1: self.turtleState.y,
          x2: newX, y2: newY,
          color: self.turtleState.color, width: self.turtleState.width
        });
      }
      self.turtleState.x = newX;
      self.turtleState.y = newY;
      return null;
    }});
    builtins.set('left', { type: 'builtin', call: (args) => { self.turtleState.angle -= args[0]; return null; }});
    builtins.set('right', { type: 'builtin', call: (args) => { self.turtleState.angle += args[0]; return null; }});
    builtins.set('penUp', { type: 'builtin', call: () => { self.turtleState.penDown = false; return null; }});
    builtins.set('penDown', { type: 'builtin', call: () => { self.turtleState.penDown = true; return null; }});
    builtins.set('penColor', { type: 'builtin', call: (args) => { self.turtleState.color = args[0]; return null; }});
    builtins.set('penWidth', { type: 'builtin', call: (args) => { self.turtleState.width = args[0]; return null; }});
    builtins.set('goto', { type: 'builtin', call: (args) => {
      if (self.turtleState.penDown) {
        self.graphicsCommands.push({
          type: 'turtleLine',
          x1: self.turtleState.x, y1: self.turtleState.y,
          x2: args[0], y2: args[1],
          color: self.turtleState.color, width: self.turtleState.width
        });
      }
      self.turtleState.x = args[0];
      self.turtleState.y = args[1];
      return null;
    }});
    builtins.set('setHeading', { type: 'builtin', call: (args) => { self.turtleState.angle = args[0]; return null; }});
    builtins.set('home', { type: 'builtin', call: () => {
      if (self.turtleState.penDown) {
        self.graphicsCommands.push({
          type: 'turtleLine',
          x1: self.turtleState.x, y1: self.turtleState.y,
          x2: 200, y2: 200,
          color: self.turtleState.color, width: self.turtleState.width
        });
      }
      self.turtleState.x = 200;
      self.turtleState.y = 200;
      self.turtleState.angle = 0;
      return null;
    }});
    builtins.set('getX', { type: 'builtin', call: () => self.turtleState.x });
    builtins.set('getY', { type: 'builtin', call: () => self.turtleState.y });
    builtins.set('getHeading', { type: 'builtin', call: () => self.turtleState.angle });
    builtins.set('drawTurtle', { type: 'builtin', call: () => {
      self.graphicsCommands.push({
        type: 'turtle',
        x: self.turtleState.x, y: self.turtleState.y,
        angle: self.turtleState.angle,
        color: self.turtleState.color
      });
      return null;
    }});

    // ============= LEAFLET MAP FUNCTIONS =============
    // Store maps and layers
    self.leafletMaps = new Map();
    self.leafletLayers = new Map();
    self.leafletIdCounter = 0;

    // Check if Leaflet is available
    const hasLeaflet = () => typeof L !== 'undefined';

    // createMap(containerId, lat, lng, zoom)
    builtins.set('createMap', { type: 'builtin', call: (args) => {
      if (!hasLeaflet()) throw new SdevError('Leaflet library not loaded', 0);
      const [containerId, lat, lng, zoom] = args;
      const map = L.map(containerId).setView([lat, lng], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      const id = `map_${self.leafletIdCounter++}`;
      self.leafletMaps.set(id, map);
      return { _leafletType: 'map', _id: id, _map: map };
    }});

    // setMapView(map, lat, lng, zoom)
    builtins.set('setMapView', { type: 'builtin', call: (args) => {
      const [mapObj, lat, lng, zoom] = args;
      if (mapObj?._map) mapObj._map.setView([lat, lng], zoom);
      return null;
    }});

    // getMapCenter(map)
    builtins.set('getMapCenter', { type: 'builtin', call: (args) => {
      const mapObj = args[0];
      if (mapObj?._map) {
        const center = mapObj._map.getCenter();
        return { lat: center.lat, lng: center.lng };
      }
      return null;
    }});

    // getMapZoom(map)
    builtins.set('getMapZoom', { type: 'builtin', call: (args) => {
      const mapObj = args[0];
      return mapObj?._map ? mapObj._map.getZoom() : 0;
    }});

    // getMapBounds(map)
    builtins.set('getMapBounds', { type: 'builtin', call: (args) => {
      const mapObj = args[0];
      if (mapObj?._map) {
        const bounds = mapObj._map.getBounds();
        return {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        };
      }
      return null;
    }});

    // addMarker(map, lat, lng, popupText?)
    builtins.set('addMarker', { type: 'builtin', call: (args) => {
      const [mapObj, lat, lng, popupText] = args;
      if (mapObj?._map) {
        const marker = L.marker([lat, lng]).addTo(mapObj._map);
        if (popupText) marker.bindPopup(popupText);
        const id = `marker_${self.leafletIdCounter++}`;
        self.leafletLayers.set(id, marker);
        return { _leafletType: 'marker', _id: id, _layer: marker };
      }
      return null;
    }});

    // addMarkerIcon(map, lat, lng, iconUrl, iconSize, popupText?)
    builtins.set('addMarkerIcon', { type: 'builtin', call: (args) => {
      const [mapObj, lat, lng, iconUrl, iconSize, popupText] = args;
      if (mapObj?._map) {
        const icon = L.icon({
          iconUrl: iconUrl,
          iconSize: Array.isArray(iconSize) ? iconSize : [32, 32]
        });
        const marker = L.marker([lat, lng], { icon }).addTo(mapObj._map);
        if (popupText) marker.bindPopup(popupText);
        const id = `marker_${self.leafletIdCounter++}`;
        self.leafletLayers.set(id, marker);
        return { _leafletType: 'marker', _id: id, _layer: marker };
      }
      return null;
    }});

    // removeMarker(map, marker)
    builtins.set('removeMarker', { type: 'builtin', call: (args) => {
      const [mapObj, markerObj] = args;
      if (mapObj?._map && markerObj?._layer) {
        mapObj._map.removeLayer(markerObj._layer);
      }
      return null;
    }});

    // setMarkerPosition(marker, lat, lng)
    builtins.set('setMarkerPosition', { type: 'builtin', call: (args) => {
      const [markerObj, lat, lng] = args;
      if (markerObj?._layer) markerObj._layer.setLatLng([lat, lng]);
      return null;
    }});

    // getMarkerPosition(marker)
    builtins.set('getMarkerPosition', { type: 'builtin', call: (args) => {
      const markerObj = args[0];
      if (markerObj?._layer) {
        const pos = markerObj._layer.getLatLng();
        return { lat: pos.lat, lng: pos.lng };
      }
      return null;
    }});

    // setMarkerDraggable(marker, draggable)
    builtins.set('setMarkerDraggable', { type: 'builtin', call: (args) => {
      const [markerObj, draggable] = args;
      if (markerObj?._layer) {
        if (draggable) markerObj._layer.dragging.enable();
        else markerObj._layer.dragging.disable();
      }
      return null;
    }});

    // bindPopup(marker, content)
    builtins.set('bindPopup', { type: 'builtin', call: (args) => {
      const [obj, content] = args;
      if (obj?._layer) obj._layer.bindPopup(content);
      return null;
    }});

    // bindTooltip(marker, content)
    builtins.set('bindTooltip', { type: 'builtin', call: (args) => {
      const [obj, content] = args;
      if (obj?._layer) obj._layer.bindTooltip(content);
      return null;
    }});

    // openPopup(marker)
    builtins.set('openPopup', { type: 'builtin', call: (args) => {
      const obj = args[0];
      if (obj?._layer) obj._layer.openPopup();
      return null;
    }});

    // addCircle(map, lat, lng, radius, options?)
    builtins.set('addCircle', { type: 'builtin', call: (args) => {
      const [mapObj, lat, lng, radius, options] = args;
      if (mapObj?._map) {
        const circle = L.circle([lat, lng], { radius, ...options }).addTo(mapObj._map);
        const id = `circle_${self.leafletIdCounter++}`;
        self.leafletLayers.set(id, circle);
        return { _leafletType: 'circle', _id: id, _layer: circle };
      }
      return null;
    }});

    // addCircleMarker(map, lat, lng, radius, options?)
    builtins.set('addCircleMarker', { type: 'builtin', call: (args) => {
      const [mapObj, lat, lng, radius, options] = args;
      if (mapObj?._map) {
        const marker = L.circleMarker([lat, lng], { radius, ...options }).addTo(mapObj._map);
        const id = `circleMarker_${self.leafletIdCounter++}`;
        self.leafletLayers.set(id, marker);
        return { _leafletType: 'circleMarker', _id: id, _layer: marker };
      }
      return null;
    }});

    // addRectangle(map, lat1, lng1, lat2, lng2, options?)
    builtins.set('addRectangle', { type: 'builtin', call: (args) => {
      const [mapObj, lat1, lng1, lat2, lng2, options] = args;
      if (mapObj?._map) {
        const rect = L.rectangle([[lat1, lng1], [lat2, lng2]], options).addTo(mapObj._map);
        const id = `rect_${self.leafletIdCounter++}`;
        self.leafletLayers.set(id, rect);
        return { _leafletType: 'rectangle', _id: id, _layer: rect };
      }
      return null;
    }});

    // addPolyline(map, points, options?)
    builtins.set('addPolyline', { type: 'builtin', call: (args) => {
      const [mapObj, points, options] = args;
      if (mapObj?._map && Array.isArray(points)) {
        const line = L.polyline(points, options).addTo(mapObj._map);
        const id = `polyline_${self.leafletIdCounter++}`;
        self.leafletLayers.set(id, line);
        return { _leafletType: 'polyline', _id: id, _layer: line };
      }
      return null;
    }});

    // addPolygon(map, points, options?)
    builtins.set('addPolygon', { type: 'builtin', call: (args) => {
      const [mapObj, points, options] = args;
      if (mapObj?._map && Array.isArray(points)) {
        const poly = L.polygon(points, options).addTo(mapObj._map);
        const id = `polygon_${self.leafletIdCounter++}`;
        self.leafletLayers.set(id, poly);
        return { _leafletType: 'polygon', _id: id, _layer: poly };
      }
      return null;
    }});

    // addMultiPolygon(map, polygons, options?)
    builtins.set('addMultiPolygon', { type: 'builtin', call: (args) => {
      const [mapObj, polygons, options] = args;
      if (mapObj?._map && Array.isArray(polygons)) {
        const poly = L.polygon(polygons, options).addTo(mapObj._map);
        const id = `multipolygon_${self.leafletIdCounter++}`;
        self.leafletLayers.set(id, poly);
        return { _leafletType: 'multipolygon', _id: id, _layer: poly };
      }
      return null;
    }});

    // addTileLayer(map, urlTemplate, options?)
    builtins.set('addTileLayer', { type: 'builtin', call: (args) => {
      const [mapObj, urlTemplate, options] = args;
      if (mapObj?._map) {
        const layer = L.tileLayer(urlTemplate, options).addTo(mapObj._map);
        const id = `tile_${self.leafletIdCounter++}`;
        self.leafletLayers.set(id, layer);
        return { _leafletType: 'tileLayer', _id: id, _layer: layer };
      }
      return null;
    }});

    // createLayerGroup()
    builtins.set('createLayerGroup', { type: 'builtin', call: () => {
      if (!hasLeaflet()) throw new SdevError('Leaflet library not loaded', 0);
      const group = L.layerGroup();
      const id = `group_${self.leafletIdCounter++}`;
      self.leafletLayers.set(id, group);
      return { _leafletType: 'layerGroup', _id: id, _layer: group };
    }});

    // addLayerToMap(map, layer)
    builtins.set('addLayerToMap', { type: 'builtin', call: (args) => {
      const [mapObj, layerObj] = args;
      if (mapObj?._map && layerObj?._layer) {
        layerObj._layer.addTo(mapObj._map);
      }
      return null;
    }});

    // removeLayerFromMap(map, layer)
    builtins.set('removeLayerFromMap', { type: 'builtin', call: (args) => {
      const [mapObj, layerObj] = args;
      if (mapObj?._map && layerObj?._layer) {
        mapObj._map.removeLayer(layerObj._layer);
      }
      return null;
    }});

    // clearLayer(layer)
    builtins.set('clearLayer', { type: 'builtin', call: (args) => {
      const layerObj = args[0];
      if (layerObj?._layer && typeof layerObj._layer.clearLayers === 'function') {
        layerObj._layer.clearLayers();
      }
      return null;
    }});

    // onMapClick(map, callback)
    builtins.set('onMapClick', { type: 'builtin', call: (args) => {
      const [mapObj, callback] = args;
      if (mapObj?._map && callback) {
        mapObj._map.on('click', (e) => {
          const event = { lat: e.latlng.lat, lng: e.latlng.lng };
          self.callFunction(callback, [event]);
        });
      }
      return null;
    }});

    // onMapZoom(map, callback)
    builtins.set('onMapZoom', { type: 'builtin', call: (args) => {
      const [mapObj, callback] = args;
      if (mapObj?._map && callback) {
        mapObj._map.on('zoomend', () => {
          self.callFunction(callback, [{}]);
        });
      }
      return null;
    }});

    // onMapMove(map, callback)
    builtins.set('onMapMove', { type: 'builtin', call: (args) => {
      const [mapObj, callback] = args;
      if (mapObj?._map && callback) {
        mapObj._map.on('moveend', () => {
          self.callFunction(callback, [{}]);
        });
      }
      return null;
    }});

    // onMarkerClick(marker, callback)
    builtins.set('onMarkerClick', { type: 'builtin', call: (args) => {
      const [markerObj, callback] = args;
      if (markerObj?._layer && callback) {
        markerObj._layer.on('click', () => {
          self.callFunction(callback, [{}]);
        });
      }
      return null;
    }});

    // onMarkerDrag(marker, callback)
    builtins.set('onMarkerDrag', { type: 'builtin', call: (args) => {
      const [markerObj, callback] = args;
      if (markerObj?._layer && callback) {
        markerObj._layer.on('dragend', () => {
          self.callFunction(callback, [{}]);
        });
      }
      return null;
    }});

    // addZoomControl(map, position?)
    builtins.set('addZoomControl', { type: 'builtin', call: (args) => {
      const [mapObj, position] = args;
      if (mapObj?._map) {
        L.control.zoom({ position: position || 'topleft' }).addTo(mapObj._map);
      }
      return null;
    }});

    // addScaleControl(map, options?)
    builtins.set('addScaleControl', { type: 'builtin', call: (args) => {
      const [mapObj, options] = args;
      if (mapObj?._map) {
        L.control.scale(options || {}).addTo(mapObj._map);
      }
      return null;
    }});

    // addAttributionControl(map, prefix?)
    builtins.set('addAttributionControl', { type: 'builtin', call: (args) => {
      const [mapObj, prefix] = args;
      if (mapObj?._map) {
        L.control.attribution({ prefix: prefix || '' }).addTo(mapObj._map);
      }
      return null;
    }});

    // addLayerControl(map, baseLayers, overlays)
    builtins.set('addLayerControl', { type: 'builtin', call: (args) => {
      const [mapObj, baseLayers, overlays] = args;
      if (mapObj?._map) {
        const bases = {};
        const overs = {};
        if (baseLayers && typeof baseLayers === 'object') {
          for (const [k, v] of Object.entries(baseLayers)) {
            if (v?._layer) bases[k] = v._layer;
          }
        }
        if (overlays && typeof overlays === 'object') {
          for (const [k, v] of Object.entries(overlays)) {
            if (v?._layer) overs[k] = v._layer;
          }
        }
        L.control.layers(bases, overs).addTo(mapObj._map);
      }
      return null;
    }});

    // addGeoJSON(map, geoJsonData, options?)
    builtins.set('addGeoJSON', { type: 'builtin', call: (args) => {
      const [mapObj, data, options] = args;
      if (mapObj?._map) {
        const layer = L.geoJSON(data, options).addTo(mapObj._map);
        const id = `geojson_${self.leafletIdCounter++}`;
        self.leafletLayers.set(id, layer);
        return { _leafletType: 'geoJSON', _id: id, _layer: layer };
      }
      return null;
    }});

    // latLng(lat, lng)
    builtins.set('latLng', { type: 'builtin', call: (args) => {
      return { lat: args[0], lng: args[1] };
    }});

    // distance(lat1, lng1, lat2, lng2)
    builtins.set('distance', { type: 'builtin', call: (args) => {
      if (!hasLeaflet()) {
        // Haversine formula fallback
        const [lat1, lng1, lat2, lng2] = args;
        const R = 6371000; // Earth radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      }
      const p1 = L.latLng(args[0], args[1]);
      const p2 = L.latLng(args[2], args[3]);
      return p1.distanceTo(p2);
    }});

    // boundsContains(bounds, lat, lng)
    builtins.set('boundsContains', { type: 'builtin', call: (args) => {
      const [bounds, lat, lng] = args;
      if (bounds && typeof bounds === 'object') {
        return lat >= bounds.south && lat <= bounds.north &&
               lng >= bounds.west && lng <= bounds.east;
      }
      return false;
    }});

    // fitBounds(map, lat1, lng1, lat2, lng2)
    builtins.set('fitBounds', { type: 'builtin', call: (args) => {
      const [mapObj, lat1, lng1, lat2, lng2] = args;
      if (mapObj?._map) {
        mapObj._map.fitBounds([[lat1, lng1], [lat2, lng2]]);
      }
      return null;
    }});

    // invalidateSize(map)
    builtins.set('invalidateSize', { type: 'builtin', call: (args) => {
      const mapObj = args[0];
      if (mapObj?._map) mapObj._map.invalidateSize();
      return null;
    }});
  }

  // Helper to call user functions from event handlers
  callFunction(fn, args) {
    if (fn.type === 'lambda' || fn.type === 'user') {
      const funcEnv = new Environment(fn.closure || this.globalEnv);
      const params = fn.params || [];
      for (let i = 0; i < params.length; i++) {
        funcEnv.define(params[i], args[i] ?? null);
      }
      try {
        return this.execute(fn.body, funcEnv);
      } catch (e) {
        if (e instanceof ReturnException) return e.value;
        throw e;
      }
    } else if (fn.type === 'builtin') {
      return fn.call(args);
    }
    return null;
  }

  interpret(program) {
    let result = null;
    for (const stmt of program.statements) {
      result = this.execute(stmt, this.globalEnv);
    }
    return result;
  }

  execute(node, env) {
    switch (node.type) {
      case 'Program':
        return this.executeProgram(node, env);
      case 'NumberLiteral':
        return node.value;
      case 'StringLiteral':
        return node.value;
      case 'BooleanLiteral':
        return node.value;
      case 'NullLiteral':
        return null;
      case 'Identifier':
        return env.get(node.name, node.line);
      case 'SelfExpr':
        return env.get('self', node.line);
      case 'SuperExpr':
        return this.executeSuperExpr(node, env);
      case 'BinaryExpr':
        return this.executeBinary(node, env);
      case 'UnaryExpr':
        return this.executeUnary(node, env);
      case 'TernaryExpr':
        return this.executeTernary(node, env);
      case 'CallExpr':
        return this.executeCall(node, env);
      case 'IndexExpr':
        return this.executeIndex(node, env);
      case 'MemberExpr':
        return this.executeMember(node, env);
      case 'NewExpr':
        return this.executeNew(node, env);
      case 'AwaitExpr':
        return this.execute(node.expression, env);
      case 'SpawnExpr':
        return Promise.resolve(this.execute(node.expression, env));
      case 'ArrayLiteral':
        return node.elements.map(el => this.execute(el, env));
      case 'DictLiteral':
        return this.executeDict(node, env);
      case 'LambdaExpr':
        return this.executeLambda(node, env);
      case 'LetStatement':
        return this.executeLet(node, env);
      case 'AssignStatement':
        return this.executeAssign(node, env);
      case 'IndexAssignStatement':
        return this.executeIndexAssign(node, env);
      case 'MemberAssignStatement':
        return this.executeMemberAssign(node, env);
      case 'IfStatement':
        return this.executeIf(node, env);
      case 'WhileStatement':
        return this.executeWhile(node, env);
      case 'ForInStatement':
        return this.executeForIn(node, env);
      case 'FuncDeclaration':
        return this.executeFuncDecl(node, env);
      case 'AsyncFuncDeclaration':
        return this.executeAsyncFuncDecl(node, env);
      case 'EssenceDeclaration':
        return this.executeEssenceDecl(node, env);
      case 'ReturnStatement':
        return this.executeReturn(node, env);
      case 'BreakStatement':
        throw new BreakException();
      case 'ContinueStatement':
        throw new ContinueException();
      case 'TryCatchStatement':
        return this.executeTryCatch(node, env);
      case 'BlockStatement':
        return this.executeBlock(node, env);
      case 'ExpressionStatement':
        return this.execute(node.expression, env);
      default:
        throw new SdevError(`Unknown node type: ${node.type}`, node.line || 0);
    }
  }

  executeProgram(node, env) {
    let result = null;
    for (const stmt of node.statements) {
      result = this.execute(stmt, env);
    }
    return result;
  }

  executeBinary(node, env) {
    if (node.operator === 'also') {
      const left = this.execute(node.left, env);
      if (!isTruthy(left)) return left;
      return this.execute(node.right, env);
    }
    if (node.operator === 'either') {
      const left = this.execute(node.left, env);
      if (isTruthy(left)) return left;
      return this.execute(node.right, env);
    }

    const left = this.execute(node.left, env);
    const right = this.execute(node.right, env);

    switch (node.operator) {
      case '+':
        if (typeof left === 'number' && typeof right === 'number') return left + right;
        if (typeof left === 'string' || typeof right === 'string') return stringify(left) + stringify(right);
        if (Array.isArray(left) && Array.isArray(right)) return [...left, ...right];
        if (left instanceof SdevVector2 && right instanceof SdevVector2) return left.add(right);
        throw new SdevError("Cannot use '+' with these types", node.line);
      case '-':
        if (left instanceof SdevVector2 && right instanceof SdevVector2) return left.sub(right);
        return this.requireNumbers(left, right, '-', node.line, (a, b) => a - b);
      case '*':
        if (typeof left === 'number' && typeof right === 'number') return left * right;
        if (typeof left === 'string' && typeof right === 'number') return left.repeat(right);
        if (typeof left === 'number' && typeof right === 'string') return right.repeat(left);
        if (left instanceof SdevVector2 && typeof right === 'number') return left.scale(right);
        throw new SdevError("Cannot use '*' with these types", node.line);
      case '/':
        return this.requireNumbers(left, right, '/', node.line, (a, b) => {
          if (b === 0) throw new SdevError('Division by zero', node.line);
          return a / b;
        });
      case '%':
        return this.requireNumbers(left, right, '%', node.line, (a, b) => a % b);
      case '^':
        return this.requireNumbers(left, right, '^', node.line, (a, b) => Math.pow(a, b));
      case '<':
        return this.requireNumbers(left, right, '<', node.line, (a, b) => a < b);
      case '>':
        return this.requireNumbers(left, right, '>', node.line, (a, b) => a > b);
      case '<=':
        return this.requireNumbers(left, right, '<=', node.line, (a, b) => a <= b);
      case '>=':
        return this.requireNumbers(left, right, '>=', node.line, (a, b) => a >= b);
      case 'equals':
        return this.isEqual(left, right);
      case 'differs':
      case '<>':
        return !this.isEqual(left, right);
      default:
        throw new SdevError(`Unknown operator: ${node.operator}`, node.line);
    }
  }

  executeUnary(node, env) {
    const operand = this.execute(node.operand, env);

    switch (node.operator) {
      case '-':
        if (typeof operand !== 'number') throw new SdevError("Cannot use '-' with non-number", node.line);
        return -operand;
      case 'isnt':
        return !isTruthy(operand);
      default:
        throw new SdevError(`Unknown unary operator: ${node.operator}`, node.line);
    }
  }

  executeTernary(node, env) {
    const condition = this.execute(node.condition, env);
    return isTruthy(condition) 
      ? this.execute(node.thenExpr, env) 
      : this.execute(node.elseExpr, env);
  }

  executeCall(node, env) {
    const callee = this.execute(node.callee, env);
    const args = node.args.map(arg => this.execute(arg, env));

    if (callee instanceof SdevClass) {
      const instance = new SdevInstance(callee);
      const init = callee.findMethod('init');
      if (init) {
        const bound = instance.bindMethod(init);
        bound.call(args, node.line);
      }
      return instance;
    }

    if (!callee || typeof callee !== 'object' || !('call' in callee)) {
      throw new SdevError('Cannot call non-function', node.line);
    }

    return callee.call(args, node.line);
  }

  executeIndex(node, env) {
    const obj = this.execute(node.object, env);
    const index = this.execute(node.index, env);

    if (Array.isArray(obj)) {
      const idx = index < 0 ? obj.length + index : index;
      if (idx < 0 || idx >= obj.length) throw new SdevError('List index out of bounds', node.line);
      return obj[idx];
    }

    if (typeof obj === 'string') {
      const idx = index < 0 ? obj.length + index : index;
      if (idx < 0 || idx >= obj.length) throw new SdevError('String index out of bounds', node.line);
      return obj[idx];
    }

    if (obj && typeof obj === 'object') {
      return obj[stringify(index)];
    }

    throw new SdevError('Cannot index this type', node.line);
  }

  executeMember(node, env) {
    const obj = this.execute(node.object, env);
    const prop = node.property;

    // Handle special methods for built-in types
    if (Array.isArray(obj)) {
      const listMethods = {
        length: () => obj.length,
        push: (item) => { obj.push(item); return obj; },
        pop: () => obj.pop(),
        first: () => obj[0],
        last: () => obj[obj.length - 1],
        isEmpty: () => obj.length === 0,
        reverse: () => [...obj].reverse(),
        sort: () => [...obj].sort((a, b) => a - b),
        join: (sep) => obj.join(sep ?? ','),
        includes: (item) => obj.includes(item),
        indexOf: (item) => obj.indexOf(item),
        slice: (start, end) => obj.slice(start, end),
        map: (fn) => obj.map((item, idx) => fn.call([item, idx], node.line)),
        filter: (fn) => obj.filter(item => isTruthy(fn.call([item], node.line))),
        reduce: (fn, init) => obj.reduce((acc, item) => fn.call([acc, item], node.line), init)
      };
      if (listMethods[prop]) {
        return { type: 'builtin', call: (args) => listMethods[prop](...args) };
      }
    }

    if (typeof obj === 'string') {
      const strMethods = {
        length: () => obj.length,
        upper: () => obj.toUpperCase(),
        lower: () => obj.toLowerCase(),
        trim: () => obj.trim(),
        split: (sep) => obj.split(sep ?? ''),
        chars: () => obj.split(''),
        includes: (sub) => obj.includes(sub),
        startsWith: (sub) => obj.startsWith(sub),
        endsWith: (sub) => obj.endsWith(sub),
        indexOf: (sub) => obj.indexOf(sub),
        replace: (old, newStr) => obj.replace(old, newStr),
        slice: (start, end) => obj.slice(start, end),
        repeat: (n) => obj.repeat(n)
      };
      if (strMethods[prop]) {
        return { type: 'builtin', call: (args) => strMethods[prop](...args) };
      }
    }

    if (obj instanceof SdevVector2) {
      const vecMethods = {
        x: () => obj.x, y: () => obj.y,
        add: (other) => obj.add(other),
        sub: (other) => obj.sub(other),
        scale: (s) => obj.scale(s),
        dot: (other) => obj.dot(other),
        length: () => obj.length(),
        normalize: () => obj.normalize(),
        distance: (other) => obj.distance(other),
        angle: () => obj.angle(),
        rotate: (angle) => obj.rotate(angle)
      };
      if (vecMethods[prop]) {
        return { type: 'builtin', call: (args) => vecMethods[prop](...args) };
      }
    }

    if (obj instanceof SdevSprite) {
      const spriteMethods = {
        x: () => obj.x, y: () => obj.y,
        width: () => obj.width, height: () => obj.height,
        moveTo: (x, y) => { obj.moveTo(x, y); return obj; },
        moveBy: (dx, dy) => { obj.moveBy(dx, dy); return obj; },
        rotateTo: (angle) => { obj.rotateTo(angle); return obj; },
        rotateBy: (angle) => { obj.rotateBy(angle); return obj; },
        scaleTo: (sx, sy) => { obj.scaleTo(sx, sy); return obj; },
        show: () => { obj.visible = true; return obj; },
        hide: () => { obj.visible = false; return obj; },
        setColor: (color) => { obj.color = color; return obj; }
      };
      if (spriteMethods[prop]) {
        return { type: 'builtin', call: (args) => spriteMethods[prop](...args) };
      }
    }

    // Data structure methods
    if (obj instanceof SdevSet) {
      const setMethods = {
        add: (item) => obj.add(item),
        remove: (item) => obj.remove(item),
        has: (item) => obj.has(item),
        size: () => obj.size(),
        toList: () => obj.toList(),
        union: (other) => obj.union(other),
        intersect: (other) => obj.intersect(other)
      };
      if (setMethods[prop]) return { type: 'builtin', call: (args) => setMethods[prop](...args) };
    }

    if (obj instanceof SdevMap) {
      const mapMethods = {
        set: (k, v) => obj.set(k, v),
        get: (k) => obj.get(k),
        has: (k) => obj.has(k),
        remove: (k) => obj.remove(k),
        keys: () => obj.keys(),
        values: () => obj.values(),
        size: () => obj.size()
      };
      if (mapMethods[prop]) return { type: 'builtin', call: (args) => mapMethods[prop](...args) };
    }

    if (obj instanceof SdevQueue) {
      const queueMethods = {
        enqueue: (item) => obj.enqueue(item),
        dequeue: () => obj.dequeue(),
        peek: () => obj.peek(),
        isEmpty: () => obj.isEmpty(),
        size: () => obj.size()
      };
      if (queueMethods[prop]) return { type: 'builtin', call: (args) => queueMethods[prop](...args) };
    }

    if (obj instanceof SdevStack) {
      const stackMethods = {
        push: (item) => obj.push(item),
        pop: () => obj.pop(),
        peek: () => obj.peek(),
        isEmpty: () => obj.isEmpty(),
        size: () => obj.size()
      };
      if (stackMethods[prop]) return { type: 'builtin', call: (args) => stackMethods[prop](...args) };
    }

    if (obj instanceof SdevLinkedList) {
      const llMethods = {
        append: (val) => obj.append(val),
        prepend: (val) => obj.prepend(val),
        removeFirst: () => obj.removeFirst(),
        toList: () => obj.toList(),
        size: () => obj.size(),
        isEmpty: () => obj.isEmpty()
      };
      if (llMethods[prop]) return { type: 'builtin', call: (args) => llMethods[prop](...args) };
    }

    if (obj instanceof SdevInstance) {
      return obj.get(prop, node.line);
    }

    if (obj && typeof obj === 'object') {
      return obj[prop];
    }

    throw new SdevError('Cannot access property on this type', node.line);
  }

  executeNew(node, env) {
    const klass = env.get(node.className, node.line);
    if (!(klass instanceof SdevClass)) {
      throw new SdevError(`'${node.className}' is not a class`, node.line);
    }
    const instance = new SdevInstance(klass);
    const init = klass.findMethod('init');
    if (init) {
      const args = node.args.map(arg => this.execute(arg, env));
      const bound = instance.bindMethod(init);
      bound.call(args, node.line);
    }
    return instance;
  }

  executeSuperExpr(node, env) {
    const instance = env.get('self', node.line);
    if (!(instance instanceof SdevInstance)) {
      throw new SdevError("'super' outside of class method", node.line);
    }
    const parentClass = instance.klass.parent;
    if (!parentClass) {
      throw new SdevError('No parent class', node.line);
    }
    const method = parentClass.findMethod(node.method);
    if (!method) {
      throw new SdevError(`Undefined method '${node.method}' in parent class`, node.line);
    }
    return instance.bindMethod(method);
  }

  executeDict(node, env) {
    const result = {};
    for (const entry of node.entries) {
      const key = stringify(this.execute(entry.key, env));
      const value = this.execute(entry.value, env);
      result[key] = value;
    }
    return result;
  }

  executeLambda(node, env) {
    const self = this;
    return {
      type: 'lambda',
      call: (args, callLine) => {
        const lambdaEnv = new Environment(env);
        for (let i = 0; i < node.params.length; i++) {
          lambdaEnv.define(node.params[i], args[i] ?? null);
        }
        return self.execute(node.body, lambdaEnv);
      }
    };
  }

  executeLet(node, env) {
    const value = this.execute(node.value, env);
    env.define(node.name, value);
  }

  executeAssign(node, env) {
    const value = this.execute(node.value, env);
    env.set(node.name, value, node.line);
    return value;
  }

  executeIndexAssign(node, env) {
    const obj = this.execute(node.object, env);
    const index = this.execute(node.index, env);
    const value = this.execute(node.value, env);

    if (Array.isArray(obj)) {
      const idx = index < 0 ? obj.length + index : index;
      obj[idx] = value;
      return value;
    }

    if (obj && typeof obj === 'object') {
      obj[stringify(index)] = value;
      return value;
    }

    throw new SdevError('Cannot assign to index of this type', node.line);
  }

  executeMemberAssign(node, env) {
    const obj = this.execute(node.object, env);
    const value = this.execute(node.value, env);

    if (obj instanceof SdevInstance) {
      obj.set(node.property, value);
      return value;
    }

    if (obj instanceof SdevSprite) {
      obj[node.property] = value;
      return value;
    }

    if (obj && typeof obj === 'object') {
      obj[node.property] = value;
      return value;
    }

    throw new SdevError('Cannot assign to property of this type', node.line);
  }

  executeIf(node, env) {
    const condition = this.execute(node.condition, env);
    
    if (isTruthy(condition)) {
      return this.execute(node.thenBranch, env);
    } else if (node.elseBranch) {
      return this.execute(node.elseBranch, env);
    }
    
    return null;
  }

  executeWhile(node, env) {
    let result = null;
    let iterations = 0;
    const maxIterations = 100000;
    
    while (isTruthy(this.execute(node.condition, env))) {
      try {
        result = this.execute(node.body, env);
      } catch (e) {
        if (e instanceof BreakException) break;
        if (e instanceof ContinueException) continue;
        throw e;
      }
      iterations++;
      if (iterations > maxIterations) {
        throw new SdevError('Maximum loop iterations exceeded (possible infinite loop)', node.line);
      }
    }
    
    return result;
  }

  executeForIn(node, env) {
    const iterable = this.execute(node.iterable, env);
    let result = null;

    if (!Array.isArray(iterable) && typeof iterable !== 'string') {
      throw new SdevError('Can only iterate over lists or strings', node.line);
    }

    const items = Array.isArray(iterable) ? iterable : iterable.split('');
    
    for (const item of items) {
      const loopEnv = new Environment(env);
      loopEnv.define(node.varName, item);
      
      try {
        result = this.execute(node.body, loopEnv);
      } catch (e) {
        if (e instanceof BreakException) break;
        if (e instanceof ContinueException) continue;
        throw e;
      }
    }

    return result;
  }

  executeFuncDecl(node, env) {
    const self = this;
    const func = {
      type: 'user',
      call: (args, callLine) => {
        const funcEnv = new Environment(env);
        for (let i = 0; i < node.params.length; i++) {
          const defaultVal = node.defaults && node.defaults[i] !== undefined
            ? self.execute(node.defaults[i], env)
            : null;
          funcEnv.define(node.params[i], args[i] !== undefined ? args[i] : defaultVal);
        }

        try {
          self.execute(node.body, funcEnv);
          return null;
        } catch (e) {
          if (e instanceof ReturnException) {
            return e.value;
          }
          throw e;
        }
      }
    };

    env.define(node.name, func);
  }

  executeAsyncFuncDecl(node, env) {
    const self = this;
    const func = {
      type: 'async',
      call: async (args, callLine) => {
        const funcEnv = new Environment(env);
        for (let i = 0; i < node.params.length; i++) {
          funcEnv.define(node.params[i], args[i] ?? null);
        }

        try {
          await self.execute(node.body, funcEnv);
          return null;
        } catch (e) {
          if (e instanceof ReturnException) {
            return e.value;
          }
          throw e;
        }
      }
    };

    env.define(node.name, func);
  }

  executeEssenceDecl(node, env) {
    let parentClass = null;
    if (node.parent) {
      parentClass = env.get(node.parent, node.line);
      if (!(parentClass instanceof SdevClass)) {
        throw new SdevError(`'${node.parent}' is not a class`, node.line);
      }
    }

    const methods = new Map();
    const self = this;

    for (const method of node.methods) {
      methods.set(method.name, {
        type: 'method',
        call: (args, callLine) => {
          const instance = args[0];
          const methodArgs = args.slice(1);
          const methodEnv = new Environment(env);
          methodEnv.define('self', instance);

          for (let i = 0; i < method.params.length; i++) {
            methodEnv.define(method.params[i], methodArgs[i] ?? null);
          }

          try {
            self.execute(method.body, methodEnv);
            return null;
          } catch (e) {
            if (e instanceof ReturnException) {
              return e.value;
            }
            throw e;
          }
        }
      });
    }

    const klass = new SdevClass(node.name, parentClass, methods);
    env.define(node.name, klass);
  }

  executeReturn(node, env) {
    const value = node.value ? this.execute(node.value, env) : null;
    throw new ReturnException(value);
  }

  executeTryCatch(node, env) {
    try {
      return this.execute(node.tryBlock, env);
    } catch (e) {
      if (e instanceof ReturnException || e instanceof BreakException || e instanceof ContinueException) {
        throw e;
      }
      if (node.catchBlock) {
        const catchEnv = new Environment(env);
        if (node.catchVar) {
          catchEnv.define(node.catchVar, e.message || String(e));
        }
        return this.execute(node.catchBlock, catchEnv);
      }
      return null;
    }
  }

  executeBlock(node, env) {
    const blockEnv = new Environment(env);
    let result = null;
    
    for (const stmt of node.statements) {
      result = this.execute(stmt, blockEnv);
    }
    
    return result;
  }

  requireNumbers(left, right, op, line, fn) {
    if (typeof left !== 'number' || typeof right !== 'number') {
      throw new SdevError(`Cannot use '${op}' with non-numbers`, line);
    }
    return fn(left, right);
  }

  isEqual(a, b) {
    if (a === null && b === null) return true;
    if (a === null || b === null) return false;
    if (typeof a !== typeof b) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((v, i) => this.isEqual(v, b[i]));
    }
    if (a instanceof SdevVector2 && b instanceof SdevVector2) {
      return a.x === b.x && a.y === b.y;
    }
    return a === b;
  }

  getGraphicsCommands() {
    return this.graphicsCommands;
  }

  resetGraphics() {
    this.graphicsCommands = [];
    this.turtleState = { x: 200, y: 200, angle: 0, penDown: true, color: '#ffffff', width: 2 };
  }

  run(source) {
    this.resetGraphics();
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    return this.interpret(ast);
  }
}

// ============= HELPER FUNCTIONS =============
function stringify(value) {
  if (value === null || value === undefined) return 'void';
  if (typeof value === 'boolean') return value ? 'yep' : 'nope';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    return '[' + value.map(stringify).join(', ') + ']';
  }
  if (value instanceof SdevVector2) return value.toString();
  if (value instanceof SdevSprite) return value.toString();
  if (value instanceof SdevInstance) return value.toString();
  if (value instanceof SdevClass) return value.toString();
  if (value instanceof SdevSet) return value.toString();
  if (value instanceof SdevMap) return value.toString();
  if (value instanceof SdevQueue) return value.toString();
  if (value instanceof SdevStack) return value.toString();
  if (value instanceof SdevLinkedList) return value.toString();
  if (typeof value === 'object') {
    if (value.type === 'builtin' || value.type === 'user' || value.type === 'lambda' || value.type === 'method') {
      return '<conjuration>';
    }
    const entries = Object.entries(value)
      .map(([k, v]) => `${k}: ${stringify(v)}`)
      .join(', ');
    return ':: ' + entries + ' ;;';
  }
  return String(value);
}

function isTruthy(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

// ============= MAIN (for Node.js CLI usage) =============
if (typeof process !== 'undefined' && process.argv) {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    const fs = require('fs');
    const filename = args[0];
    
    try {
      const code = fs.readFileSync(filename, 'utf8');
      const interpreter = new Interpreter(console.log);
      interpreter.run(code);
    } catch (e) {
      if (e.code === 'ENOENT') {
        console.error(`Error: File not found: ${filename}`);
      } else if (e instanceof SdevError) {
        console.error(`Error: ${e.message}`);
      } else {
        console.error(`Error: ${e.message}`);
      }
      process.exit(1);
    }
  }
}

// ============= EXPORTS =============
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Interpreter,
    Lexer,
    Parser,
    Environment,
    SdevError,
    SdevClass,
    SdevInstance,
    SdevVector2,
    SdevSprite,
    SdevSet,
    SdevMap,
    SdevQueue,
    SdevStack,
    SdevLinkedList,
    stringify,
    isTruthy
  };
}

// For browser usage
if (typeof window !== 'undefined') {
  window.SdevInterpreter = Interpreter;
  window.SdevLexer = Lexer;
  window.SdevParser = Parser;
  
  // Leaflet integration helper
  window.SdevLeaflet = {
    version: '1.0.0',
    requiredLeafletVersion: '1.9.4',
    isAvailable: () => typeof L !== 'undefined',
    init: (containerId, lat, lng, zoom) => {
      if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded. Include Leaflet CSS and JS before using sdev maps.');
        return null;
      }
      const interpreter = new Interpreter();
      return interpreter.run(`createMap("${containerId}", ${lat}, ${lng}, ${zoom})`);
    }
  };
}
