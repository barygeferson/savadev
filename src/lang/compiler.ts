// ============================================================
// sdev AST → Bytecode Compiler
// ============================================================
import * as AST from './ast';
import { OpCode, Instruction, FunctionDef, Chunk, BYTECODE_VERSION } from './bytecode';
import { SdevError } from './errors';

class FunctionCompiler {
  code: Instruction[] = [];
  functions: FunctionDef[] = [];
  name: string;
  params: string[];

  constructor(name: string, params: string[]) {
    this.name = name;
    this.params = params;
  }

  emit(op: OpCode, operand: number | string | boolean | undefined, line: number): number {
    this.code.push({ op, operand, line });
    return this.code.length - 1; // index of emitted instruction
  }

  // Emit a placeholder JUMP and return its index so it can be patched
  emitJump(op: OpCode, line: number): number {
    return this.emit(op, -1, line);
  }

  // Patch a previously emitted jump instruction to point to current position
  patchJump(jumpIndex: number): void {
    this.code[jumpIndex].operand = this.code.length;
  }

  currentPos(): number {
    return this.code.length;
  }
}

export class Compiler {
  compile(program: AST.Program): Chunk {
    const fn = new FunctionCompiler('', []);
    this.compileStatements(program.statements, fn);
    fn.emit(OpCode.HALT, undefined, 0);
    return {
      version: BYTECODE_VERSION,
      entry: { name: '', params: [], code: fn.code, functions: fn.functions },
    };
  }

  private compileStatements(stmts: AST.ASTNode[], fn: FunctionCompiler): void {
    for (const stmt of stmts) {
      this.compileNode(stmt, fn);
    }
  }

  private compileNode(node: AST.ASTNode, fn: FunctionCompiler): void {
    switch (node.type) {
      case 'Program':
        this.compileStatements(node.statements, fn);
        break;

      case 'NumberLiteral':
        fn.emit(OpCode.PUSH_NUM, node.value, node.line);
        break;

      case 'StringLiteral':
        fn.emit(OpCode.PUSH_STR, node.value, node.line);
        break;

      case 'BooleanLiteral':
        fn.emit(OpCode.PUSH_BOOL, node.value, node.line);
        break;

      case 'NullLiteral':
        fn.emit(OpCode.PUSH_NULL, undefined, node.line);
        break;

      case 'Identifier':
        fn.emit(OpCode.LOAD, node.name, node.line);
        break;

      case 'LetStatement':
        this.compileNode(node.value, fn);
        fn.emit(OpCode.DEFINE, node.name, node.line);
        break;

      case 'AssignStatement':
        this.compileNode(node.value, fn);
        fn.emit(OpCode.STORE, node.name, node.line);
        break;

      case 'IndexAssignStatement':
        this.compileNode(node.object, fn);
        this.compileNode(node.index, fn);
        this.compileNode(node.value, fn);
        fn.emit(OpCode.INDEX_SET, undefined, node.line);
        break;

      case 'ExpressionStatement':
        this.compileNode(node.expression, fn);
        fn.emit(OpCode.POP, undefined, node.line); // discard result
        break;

      case 'BinaryExpr':
        this.compileBinary(node, fn);
        break;

      case 'UnaryExpr':
        this.compileNode(node.operand, fn);
        if (node.operator === '-') fn.emit(OpCode.NEG, undefined, node.line);
        else if (node.operator === 'isnt') fn.emit(OpCode.NOT, undefined, node.line);
        else throw new SdevError(`Unknown unary op: ${node.operator}`, node.line);
        break;

      case 'CallExpr':
        // Push callee
        this.compileNode(node.callee, fn);
        // Push args
        for (const arg of node.args) this.compileNode(arg, fn);
        fn.emit(OpCode.CALL, node.args.length, node.line);
        break;

      case 'IndexExpr':
        this.compileNode(node.object, fn);
        this.compileNode(node.index, fn);
        fn.emit(OpCode.INDEX_GET, undefined, node.line);
        break;

      case 'MemberExpr':
        this.compileNode(node.object, fn);
        fn.emit(OpCode.MEMBER_GET, node.property, node.line);
        break;

      case 'ArrayLiteral':
        for (const el of node.elements) this.compileNode(el, fn);
        fn.emit(OpCode.MAKE_LIST, node.elements.length, node.line);
        break;

      case 'DictLiteral':
        for (const entry of node.entries) {
          this.compileNode(entry.key, fn);
          this.compileNode(entry.value, fn);
        }
        fn.emit(OpCode.MAKE_DICT, node.entries.length, node.line);
        break;

      case 'LambdaExpr': {
        const lambdaFn = new FunctionCompiler('<lambda>', node.params);
        // Lambda body may be a block or single expression
        if (node.body.type === 'BlockStatement') {
          this.compileStatements(node.body.statements, lambdaFn);
          lambdaFn.emit(OpCode.PUSH_NULL, undefined, node.line);
          lambdaFn.emit(OpCode.RETURN, undefined, node.line);
        } else {
          this.compileNode(node.body, lambdaFn);
          lambdaFn.emit(OpCode.RETURN, undefined, node.line);
        }
        const def: FunctionDef = { name: '<lambda>', params: node.params, code: lambdaFn.code, functions: lambdaFn.functions };
        const idx = fn.functions.length;
        fn.functions.push(def);
        fn.emit(OpCode.MAKE_FUNC, idx, node.line);
        break;
      }

      case 'FuncDeclaration': {
        const funcFn = new FunctionCompiler(node.name, node.params);
        this.compileStatements(node.body.statements, funcFn);
        funcFn.emit(OpCode.PUSH_NULL, undefined, node.line);
        funcFn.emit(OpCode.RETURN, undefined, node.line);
        const def: FunctionDef = { name: node.name, params: node.params, code: funcFn.code, functions: funcFn.functions };
        const idx = fn.functions.length;
        fn.functions.push(def);
        fn.emit(OpCode.MAKE_FUNC, idx, node.line);
        fn.emit(OpCode.DEFINE, node.name, node.line);
        break;
      }

      case 'ReturnStatement':
        if (node.value) this.compileNode(node.value, fn);
        else fn.emit(OpCode.PUSH_NULL, undefined, node.line);
        fn.emit(OpCode.RETURN, undefined, node.line);
        break;

      case 'BlockStatement':
        this.compileStatements(node.statements, fn);
        break;

      case 'IfStatement':
        this.compileIf(node, fn);
        break;

      case 'WhileStatement':
        this.compileWhile(node, fn);
        break;

      case 'ForEachStatement':
        this.compileForEach(node, fn);
        break;

      default:
        throw new SdevError(`Compiler: unknown node type ${(node as { type: string }).type}`, 0);
    }
  }

  private compileBinary(node: AST.BinaryExpr, fn: FunctionCompiler): void {
    // Short-circuit for also (AND) and either (OR)
    if (node.operator === 'also') {
      this.compileNode(node.left, fn);
      fn.emit(OpCode.DUP, undefined, node.line);
      const jumpFalse = fn.emitJump(OpCode.JUMP_IF_FALSE, node.line);
      fn.emit(OpCode.POP, undefined, node.line); // pop dup'd left
      this.compileNode(node.right, fn);
      fn.patchJump(jumpFalse);
      return;
    }
    if (node.operator === 'either') {
      this.compileNode(node.left, fn);
      fn.emit(OpCode.DUP, undefined, node.line);
      const jumpTrue = fn.emitJump(OpCode.JUMP_IF_TRUE, node.line);
      fn.emit(OpCode.POP, undefined, node.line);
      this.compileNode(node.right, fn);
      fn.patchJump(jumpTrue);
      return;
    }

    this.compileNode(node.left, fn);
    this.compileNode(node.right, fn);

    const opMap: Record<string, OpCode> = {
      '+': OpCode.ADD, '-': OpCode.SUB, '*': OpCode.MUL,
      '/': OpCode.DIV, '%': OpCode.MOD, '^': OpCode.POW,
      'equals': OpCode.EQ, 'differs': OpCode.NEQ, '<>': OpCode.NEQ,
      '<': OpCode.LT, '>': OpCode.GT, '<=': OpCode.LTE, '>=': OpCode.GTE,
    };
    const op = opMap[node.operator];
    if (!op) throw new SdevError(`Unknown binary op: ${node.operator}`, node.line);
    fn.emit(op, undefined, node.line);
  }

  private compileIf(node: AST.IfStatement, fn: FunctionCompiler): void {
    this.compileNode(node.condition, fn);
    const jumpFalse = fn.emitJump(OpCode.JUMP_IF_FALSE, node.line);
    this.compileStatements(node.thenBranch.statements, fn);
    if (node.elseBranch) {
      const jumpEnd = fn.emitJump(OpCode.JUMP, node.line);
      fn.patchJump(jumpFalse);
      this.compileNode(node.elseBranch, fn);
      fn.patchJump(jumpEnd);
    } else {
      fn.patchJump(jumpFalse);
    }
  }

  private compileWhile(node: AST.WhileStatement, fn: FunctionCompiler): void {
    const loopStart = fn.currentPos();
    this.compileNode(node.condition, fn);
    const exitJump = fn.emitJump(OpCode.JUMP_IF_FALSE, node.line);
    this.compileStatements(node.body.statements, fn);
    fn.emit(OpCode.JUMP, loopStart, node.line);
    fn.patchJump(exitJump);
  }

  private compileForEach(node: AST.ForEachStatement, fn: FunctionCompiler): void {
    // Strategy: convert to a while loop using hidden iterator index
    // We push the iterable, then use a special pattern:
    //   __iter = iterable
    //   __i = 0
    //   cycle __i < len(__iter) :: item = __iter[__i]; body; __i = __i + 1 ;;
    const iterVar = `__iter_${node.line}`;
    const idxVar = `__idx_${node.line}`;

    // forge __iter = iterable
    this.compileNode(node.iterable, fn);
    fn.emit(OpCode.DEFINE, iterVar, node.line);

    // forge __idx = 0
    fn.emit(OpCode.PUSH_NUM, 0, node.line);
    fn.emit(OpCode.DEFINE, idxVar, node.line);

    // loop start: check __idx < len(__iter)
    const loopStart = fn.currentPos();
    fn.emit(OpCode.LOAD, iterVar, node.line);
    fn.emit(OpCode.LOAD, 'len', node.line);
    fn.emit(OpCode.LOAD, iterVar, node.line);
    fn.emit(OpCode.CALL, 1, node.line); // len(__iter)
    fn.emit(OpCode.LOAD, idxVar, node.line);
    fn.emit(OpCode.GT, undefined, node.line); // len > idx
    const exitJump = fn.emitJump(OpCode.JUMP_IF_FALSE, node.line);

    // item = __iter[__idx]
    fn.emit(OpCode.LOAD, iterVar, node.line);
    fn.emit(OpCode.LOAD, idxVar, node.line);
    fn.emit(OpCode.INDEX_GET, undefined, node.line);
    fn.emit(OpCode.DEFINE, node.variable, node.line);

    // body
    this.compileStatements(node.body.statements, fn);

    // __idx = __idx + 1
    fn.emit(OpCode.LOAD, idxVar, node.line);
    fn.emit(OpCode.PUSH_NUM, 1, node.line);
    fn.emit(OpCode.ADD, undefined, node.line);
    fn.emit(OpCode.STORE, idxVar, node.line);

    fn.emit(OpCode.JUMP, loopStart, node.line);
    fn.patchJump(exitJump);
  }
}
