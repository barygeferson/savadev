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
    if (this.check(TokenType.FORGE)) return this.parseForgeStatement();
    if (this.check(TokenType.CONJURE)) return this.parseConjureDeclaration();
    if (this.check(TokenType.PONDER)) return this.parsePonderStatement();
    if (this.check(TokenType.CYCLE)) return this.parseCycleStatement();
    if (this.check(TokenType.YIELD)) return this.parseYieldStatement();
    if (this.check(TokenType.DOUBLE_COLON)) return this.parseBlockStatement();
    return this.parseExpressionStatement();
  }

  // forge name be value
  private parseForgeStatement(): AST.LetStatement {
    const forgeToken = this.consume(TokenType.FORGE, "Expected 'forge'");
    const name = this.consume(TokenType.IDENTIFIER, "Expected variable name").value;
    this.consume(TokenType.BE, "Expected 'be'");
    const value = this.parseExpression();
    return { type: 'LetStatement', name, value, line: forgeToken.line };
  }

  // conjure name(params) :: body ;;
  private parseConjureDeclaration(): AST.FuncDeclaration {
    const conjureToken = this.consume(TokenType.CONJURE, "Expected 'conjure'");
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
    return { type: 'FuncDeclaration', name, params, body, line: conjureToken.line };
  }

  // ponder condition :: body ;; otherwise :: body ;;
  private parsePonderStatement(): AST.IfStatement {
    const ponderToken = this.consume(TokenType.PONDER, "Expected 'ponder'");
    const condition = this.parseExpression();
    const thenBranch = this.parseBlockStatement();
    
    let elseBranch: AST.BlockStatement | AST.IfStatement | undefined;
    if (this.match(TokenType.OTHERWISE)) {
      if (this.check(TokenType.PONDER)) {
        elseBranch = this.parsePonderStatement();
      } else {
        elseBranch = this.parseBlockStatement();
      }
    }
    
    return { type: 'IfStatement', condition, thenBranch, elseBranch, line: ponderToken.line };
  }

  // cycle condition :: body ;;
  private parseCycleStatement(): AST.WhileStatement {
    const cycleToken = this.consume(TokenType.CYCLE, "Expected 'cycle'");
    const condition = this.parseExpression();
    const body = this.parseBlockStatement();
    return { type: 'WhileStatement', condition, body, line: cycleToken.line };
  }

  // yield value
  private parseYieldStatement(): AST.ReturnStatement {
    const yieldToken = this.consume(TokenType.YIELD, "Expected 'yield'");
    let value: AST.ASTNode | undefined;
    if (!this.check(TokenType.DOUBLE_SEMI) && !this.isAtEnd()) {
      // Check if next token starts an expression
      if (!this.check(TokenType.FORGE) && !this.check(TokenType.CONJURE) && 
          !this.check(TokenType.PONDER) && !this.check(TokenType.CYCLE)) {
        value = this.parseExpression();
      }
    }
    return { type: 'ReturnStatement', value, line: yieldToken.line };
  }

  // :: statements ;;
  private parseBlockStatement(): AST.BlockStatement {
    const colonToken = this.consume(TokenType.DOUBLE_COLON, "Expected '::'");
    const statements: AST.ASTNode[] = [];
    while (!this.check(TokenType.DOUBLE_SEMI) && !this.isAtEnd()) {
      statements.push(this.parseStatement());
    }
    this.consume(TokenType.DOUBLE_SEMI, "Expected ';;'");
    return { type: 'BlockStatement', statements, line: colonToken.line };
  }

  private parseExpressionStatement(): AST.ExpressionStatement | AST.AssignStatement | AST.IndexAssignStatement {
    const expr = this.parseExpression();
    
    // Check for assignment with 'be'
    if (this.match(TokenType.BE)) {
      const value = this.parseExpression();
      
      if (expr.type === 'Identifier') {
        return { type: 'AssignStatement', name: expr.name, value, line: expr.line };
      }
      if (expr.type === 'IndexExpr') {
        return { type: 'IndexAssignStatement', object: expr.object, index: expr.index, value, line: expr.line };
      }
      throw new SdevError('Invalid assignment target', expr.line);
    }
    
    return { type: 'ExpressionStatement', expression: expr, line: expr.line };
  }

  private parseExpression(): AST.ASTNode {
    return this.parsePipe();
  }

  // Pipe operator |>
  private parsePipe(): AST.ASTNode {
    let left = this.parseOr();
    
    while (this.match(TokenType.PIPE)) {
      const right = this.parseOr();
      // Transform a |> b into b(a)
      if (right.type === 'CallExpr') {
        // Insert left as first argument
        right.args.unshift(left);
        left = right;
      } else if (right.type === 'Identifier') {
        // Transform into call
        left = { type: 'CallExpr', callee: right, args: [left], line: left.line };
      } else {
        throw new SdevError('Pipe target must be a function or call', right.line);
      }
    }
    
    return left;
  }

  private parseOr(): AST.ASTNode {
    let left = this.parseAnd();
    while (this.match(TokenType.EITHER)) {
      const right = this.parseAnd();
      left = { type: 'BinaryExpr', operator: 'either', left, right, line: left.line };
    }
    return left;
  }

  private parseAnd(): AST.ASTNode {
    let left = this.parseEquality();
    while (this.match(TokenType.ALSO)) {
      const right = this.parseEquality();
      left = { type: 'BinaryExpr', operator: 'also', left, right, line: left.line };
    }
    return left;
  }

  private parseEquality(): AST.ASTNode {
    let left = this.parseComparison();
    while (this.match(TokenType.EQUALS, TokenType.DIFFERS)) {
      const operator = this.previous().type === TokenType.EQUALS ? 'equals' : 'differs';
      const right = this.parseComparison();
      left = { type: 'BinaryExpr', operator, left, right, line: left.line };
    }
    return left;
  }

  private parseComparison(): AST.ASTNode {
    let left = this.parseTerm();
    while (this.match(TokenType.LESS, TokenType.MORE, TokenType.ATMOST, TokenType.ATLEAST)) {
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
    let left = this.parsePower();
    while (this.match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT)) {
      const operator = this.previous().value;
      const right = this.parsePower();
      left = { type: 'BinaryExpr', operator, left, right, line: left.line };
    }
    return left;
  }

  private parsePower(): AST.ASTNode {
    let left = this.parseUnary();
    while (this.match(TokenType.CARET)) {
      const right = this.parseUnary();
      left = { type: 'BinaryExpr', operator: '^', left, right, line: left.line };
    }
    return left;
  }

  private parseUnary(): AST.ASTNode {
    if (this.match(TokenType.MINUS, TokenType.ISNT)) {
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
      } else if (this.match(TokenType.ARROW)) {
        // Lambda: x -> expr becomes a lambda
        if (expr.type === 'Identifier') {
          const body = this.parseExpression();
          expr = { type: 'LambdaExpr', params: [expr.name], body, line: expr.line } as AST.LambdaExpr;
        } else {
          throw new SdevError('Invalid lambda syntax', expr.line);
        }
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

    if (this.match(TokenType.YEP)) {
      return { type: 'BooleanLiteral', value: true, line: token.line };
    }

    if (this.match(TokenType.NOPE)) {
      return { type: 'BooleanLiteral', value: false, line: token.line };
    }

    if (this.match(TokenType.VOID)) {
      return { type: 'NullLiteral', line: token.line };
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return { type: 'Identifier', name: token.value, line: token.line };
    }

    if (this.match(TokenType.LPAREN)) {
      // Could be grouping or multi-param lambda
      const exprs: AST.ASTNode[] = [];
      const names: string[] = [];
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
      
      // Check for lambda arrow
      if (this.match(TokenType.ARROW)) {
        if (!isLambdaParams) {
          throw new SdevError('Invalid lambda parameters', token.line);
        }
        const body = this.parseExpression();
        return { type: 'LambdaExpr', params: names, body, line: token.line } as AST.LambdaExpr;
      }
      
      // Just grouping - return single expression
      if (exprs.length === 1) return exprs[0];
      throw new SdevError('Unexpected multiple expressions', token.line);
    }

    if (this.match(TokenType.LBRACKET)) {
      return this.parseArrayLiteral(token.line);
    }

    if (this.match(TokenType.DOUBLE_COLON)) {
      // Inline dict with :: key: value, key: value ;;
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
