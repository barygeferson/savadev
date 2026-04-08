// ============================================================
// sdev AST → Bytecode Compiler (v2 - OS-capable)
// ============================================================
import * as AST from './ast';
import { OpCode, Instruction, FunctionDef, Chunk, BYTECODE_VERSION, BYTECODE_MAGIC, ConstantPool, DebugInfo } from './bytecode';
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
    return this.code.length - 1;
  }

  emitJump(op: OpCode, line: number): number {
    return this.emit(op, -1, line);
  }

  patchJump(jumpIndex: number): void {
    this.code[jumpIndex].operand = this.code.length;
  }

  currentPos(): number {
    return this.code.length;
  }
}

export class Compiler {
  private constants: ConstantPool = { numbers: [], strings: [] };
  private debugInfo: DebugInfo = { sourceMap: [], localNames: [] };

  compile(program: AST.Program): Chunk {
    this.constants = { numbers: [], strings: [] };
    this.debugInfo = { sourceMap: [], localNames: [] };
    const fn = new FunctionCompiler('', []);
    this.compileStatements(program.statements, fn);
    fn.emit(OpCode.HALT, undefined, 0);
    return {
      version: BYTECODE_VERSION,
      magic: BYTECODE_MAGIC,
      entry: { name: '', params: [], code: fn.code, functions: fn.functions },
      constants: this.constants,
      debug: this.debugInfo,
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

      case 'MemberAssignStatement':
        this.compileNode(node.object, fn);
        this.compileNode(node.value, fn);
        fn.emit(OpCode.MEMBER_SET, node.property, node.line);
        break;

      case 'ExpressionStatement':
        this.compileNode(node.expression, fn);
        fn.emit(OpCode.POP, undefined, node.line);
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

      case 'TernaryExpr':
        this.compileNode(node.condition, fn);
        const jumpFalseT = fn.emitJump(OpCode.JUMP_IF_FALSE, node.line);
        this.compileNode(node.thenExpr, fn);
        const jumpEndT = fn.emitJump(OpCode.JUMP, node.line);
        fn.patchJump(jumpFalseT);
        this.compileNode(node.elseExpr, fn);
        fn.patchJump(jumpEndT);
        break;

      case 'CallExpr':
        this.compileNode(node.callee, fn);
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

      case 'ForInStatement':
        this.compileForIn(node, fn);
        break;

      case 'TryStatement':
        // Try-catch: compile try block, if error jump to catch
        // We implement this by wrapping in a special pattern
        // For now, compile both blocks sequentially with error handling via CALL
        this.compileTryCatch(node, fn);
        break;

      case 'BreakStatement':
        // Handled by loop compilation via jump patching
        // For now emit a NOP placeholder
        fn.emit(OpCode.NOP, undefined, node.line);
        break;

      case 'ContinueStatement':
        fn.emit(OpCode.NOP, undefined, node.line);
        break;

      case 'ClassDeclaration':
        this.compileClass(node, fn);
        break;

      case 'NewExpr':
        this.compileNode(node.className, fn);
        for (const arg of node.args) this.compileNode(arg, fn);
        fn.emit(OpCode.CALL, node.args.length + 0, node.line);
        break;

      case 'AwaitExpr':
        // In synchronous VM, await just evaluates the expression
        this.compileNode(node.operand, fn);
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
      fn.emit(OpCode.POP, undefined, node.line);
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

    // Pipe operator
    if (node.operator === '|>') {
      this.compileNode(node.left, fn);
      this.compileNode(node.right, fn);
      fn.emit(OpCode.SWAP, undefined, node.line);
      fn.emit(OpCode.CALL, 1, node.line);
      return;
    }

    this.compileNode(node.left, fn);
    this.compileNode(node.right, fn);

    const opMap: Record<string, OpCode> = {
      '+': OpCode.ADD, '-': OpCode.SUB, '*': OpCode.MUL,
      '/': OpCode.DIV, '%': OpCode.MOD, '^': OpCode.POW,
      'equals': OpCode.EQ, 'differs': OpCode.NEQ, '<>': OpCode.NEQ,
      '<': OpCode.LT, '>': OpCode.GT, '<=': OpCode.LTE, '>=': OpCode.GTE,
      '==': OpCode.EQ, '!=': OpCode.NEQ,
      '&': OpCode.BIT_AND, '|': OpCode.BIT_OR, '~': OpCode.BIT_XOR,
      '<<': OpCode.BIT_SHL, '>>': OpCode.BIT_SHR,
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
    const iterVar = `__iter_${node.line}`;
    const idxVar = `__idx_${node.line}`;

    this.compileNode(node.iterable, fn);
    fn.emit(OpCode.DEFINE, iterVar, node.line);

    fn.emit(OpCode.PUSH_NUM, 0, node.line);
    fn.emit(OpCode.DEFINE, idxVar, node.line);

    const loopStart = fn.currentPos();
    // len(__iter) > __idx
    fn.emit(OpCode.LOAD, 'len', node.line);
    fn.emit(OpCode.LOAD, iterVar, node.line);
    fn.emit(OpCode.CALL, 1, node.line);
    fn.emit(OpCode.LOAD, idxVar, node.line);
    fn.emit(OpCode.GT, undefined, node.line);
    const exitJump = fn.emitJump(OpCode.JUMP_IF_FALSE, node.line);

    // item = __iter[__idx]
    fn.emit(OpCode.LOAD, iterVar, node.line);
    fn.emit(OpCode.LOAD, idxVar, node.line);
    fn.emit(OpCode.INDEX_GET, undefined, node.line);
    fn.emit(OpCode.DEFINE, node.variable, node.line);

    this.compileStatements(node.body.statements, fn);

    // __idx = __idx + 1
    fn.emit(OpCode.LOAD, idxVar, node.line);
    fn.emit(OpCode.PUSH_NUM, 1, node.line);
    fn.emit(OpCode.ADD, undefined, node.line);
    fn.emit(OpCode.STORE, idxVar, node.line);

    fn.emit(OpCode.JUMP, loopStart, node.line);
    fn.patchJump(exitJump);
  }

  private compileForIn(node: AST.ForInStatement, fn: FunctionCompiler): void {
    // ForIn is same as ForEach in sdev
    const iterVar = `__iter_${node.line}`;
    const idxVar = `__idx_${node.line}`;

    this.compileNode(node.iterable, fn);
    fn.emit(OpCode.DEFINE, iterVar, node.line);

    fn.emit(OpCode.PUSH_NUM, 0, node.line);
    fn.emit(OpCode.DEFINE, idxVar, node.line);

    const loopStart = fn.currentPos();
    fn.emit(OpCode.LOAD, 'len', node.line);
    fn.emit(OpCode.LOAD, iterVar, node.line);
    fn.emit(OpCode.CALL, 1, node.line);
    fn.emit(OpCode.LOAD, idxVar, node.line);
    fn.emit(OpCode.GT, undefined, node.line);
    const exitJump = fn.emitJump(OpCode.JUMP_IF_FALSE, node.line);

    fn.emit(OpCode.LOAD, iterVar, node.line);
    fn.emit(OpCode.LOAD, idxVar, node.line);
    fn.emit(OpCode.INDEX_GET, undefined, node.line);
    fn.emit(OpCode.DEFINE, node.variable, node.line);

    this.compileStatements(node.body.statements, fn);

    fn.emit(OpCode.LOAD, idxVar, node.line);
    fn.emit(OpCode.PUSH_NUM, 1, node.line);
    fn.emit(OpCode.ADD, undefined, node.line);
    fn.emit(OpCode.STORE, idxVar, node.line);

    fn.emit(OpCode.JUMP, loopStart, node.line);
    fn.patchJump(exitJump);
  }

  private compileTryCatch(node: AST.TryStatement, fn: FunctionCompiler): void {
    // Compile try block as a function, call it, catch errors
    const tryFn = new FunctionCompiler('<try>', []);
    this.compileStatements(node.tryBlock.statements, tryFn);
    tryFn.emit(OpCode.PUSH_NULL, undefined, node.line);
    tryFn.emit(OpCode.RETURN, undefined, node.line);
    const tryDef: FunctionDef = { name: '<try>', params: [], code: tryFn.code, functions: tryFn.functions };
    const tryIdx = fn.functions.length;
    fn.functions.push(tryDef);

    const catchFn = new FunctionCompiler('<catch>', [node.errorVar]);
    this.compileStatements(node.catchBlock.statements, catchFn);
    catchFn.emit(OpCode.PUSH_NULL, undefined, node.line);
    catchFn.emit(OpCode.RETURN, undefined, node.line);
    const catchDef: FunctionDef = { name: '<catch>', params: [node.errorVar], code: catchFn.code, functions: catchFn.functions };
    const catchIdx = fn.functions.length;
    fn.functions.push(catchDef);

    // Load __tryCatch builtin, push tryFn, catchFn, call
    fn.emit(OpCode.LOAD, '__tryCatch', node.line);
    fn.emit(OpCode.MAKE_FUNC, tryIdx, node.line);
    fn.emit(OpCode.MAKE_FUNC, catchIdx, node.line);
    fn.emit(OpCode.CALL, 2, node.line);
    fn.emit(OpCode.POP, undefined, node.line);
  }

  private compileClass(node: AST.ClassDeclaration, fn: FunctionCompiler): void {
    // Compile class as a constructor function that returns an object with methods
    const ctorFn = new FunctionCompiler(node.name, []);

    // Find init method
    const initMethod = node.methods.find(m => m.name === 'init');
    const otherMethods = node.methods.filter(m => m.name !== 'init');

    // If there's an init, use its params for the constructor
    if (initMethod) {
      ctorFn.params = initMethod.params.filter(p => p !== 'self');
    }

    // Create 'self' object
    ctorFn.emit(OpCode.MAKE_DICT, 0, node.line);
    ctorFn.emit(OpCode.DEFINE, 'self', node.line);

    // Compile init body if present
    if (initMethod) {
      for (const stmt of initMethod.body.statements) {
        this.compileNode(stmt, ctorFn);
      }
    }

    // Add other methods to self
    for (const method of otherMethods) {
      const methodFn = new FunctionCompiler(method.name, method.params);
      this.compileStatements(method.body.statements, methodFn);
      methodFn.emit(OpCode.PUSH_NULL, undefined, node.line);
      methodFn.emit(OpCode.RETURN, undefined, node.line);
      const methodDef: FunctionDef = { name: method.name, params: method.params, code: methodFn.code, functions: methodFn.functions };
      const methodIdx = ctorFn.functions.length;
      ctorFn.functions.push(methodDef);

      ctorFn.emit(OpCode.LOAD, 'self', node.line);
      ctorFn.emit(OpCode.MAKE_FUNC, methodIdx, node.line);
      ctorFn.emit(OpCode.MEMBER_SET, method.name, node.line);
    }

    // Return self
    ctorFn.emit(OpCode.LOAD, 'self', node.line);
    ctorFn.emit(OpCode.RETURN, undefined, node.line);

    const def: FunctionDef = { name: node.name, params: ctorFn.params, code: ctorFn.code, functions: ctorFn.functions };
    const idx = fn.functions.length;
    fn.functions.push(def);
    fn.emit(OpCode.MAKE_FUNC, idx, node.line);
    fn.emit(OpCode.DEFINE, node.name, node.line);
  }
}
