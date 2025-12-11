import { Token, TokenType } from './tokens';
import * as AST from './ast';
import { SdevError } from './errors';

export class Parser {
  private tokens: Token[];
  private pos: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): AST.Program {
    const statements: AST.ASTNode[] = [];
    while (!this.isAtEnd()) {
      statements.push(this.parseStatement());
    }
    return { type: 'Program', statements, line: 1 };
  }

  private parseStatement(): AST.ASTNode {
    if (this.check(TokenType.LET)) return this.parseLetStatement();
    if (this.check(TokenType.FUNC)) return this.parseFuncDeclaration();
    if (this.check(TokenType.IF)) return this.parseIfStatement();
    if (this.check(TokenType.WHILE)) return this.parseWhileStatement();
    if (this.check(TokenType.RETURN)) return this.parseReturnStatement();
    if (this.check(TokenType.LBRACE)) return this.parseBlockStatement();
    return this.parseExpressionStatement();
  }

  private parseLetStatement(): AST.LetStatement {
    const letToken = this.consume(TokenType.LET, "Expected 'let'");
    const name = this.consume(TokenType.IDENTIFIER, "Expected variable name").value;
    this.consume(TokenType.ASSIGN, "Expected '='");
    const value = this.parseExpression();
    this.consume(TokenType.SEMICOLON, "Expected ';'");
    return { type: 'LetStatement', name, value, line: letToken.line };
  }

  private parseFuncDeclaration(): AST.FuncDeclaration {
    const funcToken = this.consume(TokenType.FUNC, "Expected 'func'");
    const name = this.consume(TokenType.IDENTIFIER, "Expected function name").value;
    this.consume(TokenType.LPAREN, "Expected '('");
    
    const params: string[] = [];
    if (!this.check(TokenType.RPAREN)) {
      do {
        params.push(this.consume(TokenType.IDENTIFIER, "Expected parameter name").value);
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RPAREN, "Expected ')'");
    
    const body = this.parseBlockStatement();
    return { type: 'FuncDeclaration', name, params, body, line: funcToken.line };
  }

  private parseIfStatement(): AST.IfStatement {
    const ifToken = this.consume(TokenType.IF, "Expected 'if'");
    const condition = this.parseExpression();
    const thenBranch = this.parseBlockStatement();
    
    let elseBranch: AST.BlockStatement | AST.IfStatement | undefined;
    if (this.match(TokenType.ELSE)) {
      if (this.check(TokenType.IF)) {
        elseBranch = this.parseIfStatement();
      } else {
        elseBranch = this.parseBlockStatement();
      }
    }
    
    return { type: 'IfStatement', condition, thenBranch, elseBranch, line: ifToken.line };
  }

  private parseWhileStatement(): AST.WhileStatement {
    const whileToken = this.consume(TokenType.WHILE, "Expected 'while'");
    const condition = this.parseExpression();
    const body = this.parseBlockStatement();
    return { type: 'WhileStatement', condition, body, line: whileToken.line };
  }

  private parseReturnStatement(): AST.ReturnStatement {
    const returnToken = this.consume(TokenType.RETURN, "Expected 'return'");
    let value: AST.ASTNode | undefined;
    if (!this.check(TokenType.SEMICOLON)) {
      value = this.parseExpression();
    }
    this.consume(TokenType.SEMICOLON, "Expected ';'");
    return { type: 'ReturnStatement', value, line: returnToken.line };
  }

  private parseBlockStatement(): AST.BlockStatement {
    const braceToken = this.consume(TokenType.LBRACE, "Expected '{'");
    const statements: AST.ASTNode[] = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      statements.push(this.parseStatement());
    }
    this.consume(TokenType.RBRACE, "Expected '}'");
    return { type: 'BlockStatement', statements, line: braceToken.line };
  }

  private parseExpressionStatement(): AST.ExpressionStatement | AST.AssignStatement | AST.IndexAssignStatement {
    const expr = this.parseExpression();
    
    // Check for assignment
    if (this.match(TokenType.ASSIGN)) {
      const value = this.parseExpression();
      this.consume(TokenType.SEMICOLON, "Expected ';'");
      
      if (expr.type === 'Identifier') {
        return { type: 'AssignStatement', name: expr.name, value, line: expr.line };
      }
      if (expr.type === 'IndexExpr') {
        return { type: 'IndexAssignStatement', object: expr.object, index: expr.index, value, line: expr.line };
      }
      throw new SdevError('Invalid assignment target', expr.line);
    }
    
    this.consume(TokenType.SEMICOLON, "Expected ';'");
    return { type: 'ExpressionStatement', expression: expr, line: expr.line };
  }

  private parseExpression(): AST.ASTNode {
    return this.parseOr();
  }

  private parseOr(): AST.ASTNode {
    let left = this.parseAnd();
    while (this.match(TokenType.OR)) {
      const operator = '||';
      const right = this.parseAnd();
      left = { type: 'BinaryExpr', operator, left, right, line: left.line };
    }
    return left;
  }

  private parseAnd(): AST.ASTNode {
    let left = this.parseEquality();
    while (this.match(TokenType.AND)) {
      const operator = '&&';
      const right = this.parseEquality();
      left = { type: 'BinaryExpr', operator, left, right, line: left.line };
    }
    return left;
  }

  private parseEquality(): AST.ASTNode {
    let left = this.parseComparison();
    while (this.match(TokenType.EQ, TokenType.NEQ)) {
      const operator = this.previous().value;
      const right = this.parseComparison();
      left = { type: 'BinaryExpr', operator, left, right, line: left.line };
    }
    return left;
  }

  private parseComparison(): AST.ASTNode {
    let left = this.parseTerm();
    while (this.match(TokenType.LT, TokenType.GT, TokenType.LTE, TokenType.GTE)) {
      const operator = this.previous().value;
      const right = this.parseTerm();
      left = { type: 'BinaryExpr', operator, left, right, line: left.line };
    }
    return left;
  }

  private parseTerm(): AST.ASTNode {
    let left = this.parseFactor();
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous().value;
      const right = this.parseFactor();
      left = { type: 'BinaryExpr', operator, left, right, line: left.line };
    }
    return left;
  }

  private parseFactor(): AST.ASTNode {
    let left = this.parseUnary();
    while (this.match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT)) {
      const operator = this.previous().value;
      const right = this.parseUnary();
      left = { type: 'BinaryExpr', operator, left, right, line: left.line };
    }
    return left;
  }

  private parseUnary(): AST.ASTNode {
    if (this.match(TokenType.MINUS, TokenType.NOT)) {
      const operator = this.previous().value;
      const operand = this.parseUnary();
      return { type: 'UnaryExpr', operator, operand, line: this.previous().line };
    }
    return this.parseCall();
  }

  private parseCall(): AST.ASTNode {
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
      } else {
        break;
      }
    }
    
    return expr;
  }

  private finishCall(callee: AST.ASTNode): AST.CallExpr {
    const args: AST.ASTNode[] = [];
    if (!this.check(TokenType.RPAREN)) {
      do {
        args.push(this.parseExpression());
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RPAREN, "Expected ')'");
    return { type: 'CallExpr', callee, args, line: callee.line };
  }

  private parsePrimary(): AST.ASTNode {
    const token = this.peek();

    if (this.match(TokenType.NUMBER)) {
      return { type: 'NumberLiteral', value: parseFloat(token.value), line: token.line };
    }

    if (this.match(TokenType.STRING)) {
      return { type: 'StringLiteral', value: token.value, line: token.line };
    }

    if (this.match(TokenType.TRUE)) {
      return { type: 'BooleanLiteral', value: true, line: token.line };
    }

    if (this.match(TokenType.FALSE)) {
      return { type: 'BooleanLiteral', value: false, line: token.line };
    }

    if (this.match(TokenType.NULL)) {
      return { type: 'NullLiteral', line: token.line };
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return { type: 'Identifier', name: token.value, line: token.line };
    }

    if (this.match(TokenType.LPAREN)) {
      const expr = this.parseExpression();
      this.consume(TokenType.RPAREN, "Expected ')'");
      return expr;
    }

    if (this.match(TokenType.LBRACKET)) {
      return this.parseArrayLiteral(token.line);
    }

    if (this.match(TokenType.LBRACE)) {
      return this.parseDictLiteral(token.line);
    }

    throw new SdevError(`Unexpected token: '${token.value}'`, token.line, token.column);
  }

  private parseArrayLiteral(line: number): AST.ArrayLiteral {
    const elements: AST.ASTNode[] = [];
    if (!this.check(TokenType.RBRACKET)) {
      do {
        elements.push(this.parseExpression());
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RBRACKET, "Expected ']'");
    return { type: 'ArrayLiteral', elements, line };
  }

  private parseDictLiteral(line: number): AST.DictLiteral {
    const entries: { key: AST.ASTNode; value: AST.ASTNode }[] = [];
    if (!this.check(TokenType.RBRACE)) {
      do {
        const key = this.parseExpression();
        this.consume(TokenType.COLON, "Expected ':'");
        const value = this.parseExpression();
        entries.push({ key, value });
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RBRACE, "Expected '}'");
    return { type: 'DictLiteral', entries, line };
  }

  // Helper methods
  private peek(): Token {
    return this.tokens[this.pos];
  }

  private previous(): Token {
    return this.tokens[this.pos - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private check(type: TokenType): boolean {
    return !this.isAtEnd() && this.peek().type === type;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.pos++;
    return this.previous();
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new SdevError(message, this.peek().line, this.peek().column);
  }
}
