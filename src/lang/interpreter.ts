import * as AST from './ast';
import { Environment } from './environment';
import { SdevError, ReturnException } from './errors';
import { createBuiltins, SdevFunction, isTruthy, stringify, OutputCallback } from './builtins';

export class Interpreter {
  private globalEnv: Environment;
  private output: OutputCallback;

  constructor(output: OutputCallback) {
    this.output = output;
    this.globalEnv = new Environment();
    
    // Register built-in functions
    const builtins = createBuiltins(output);
    builtins.forEach((fn, name) => {
      this.globalEnv.define(name, fn);
    });
  }

  interpret(program: AST.Program): unknown {
    let result: unknown = null;
    for (const stmt of program.statements) {
      result = this.execute(stmt, this.globalEnv);
    }
    return result;
  }

  private execute(node: AST.ASTNode, env: Environment): unknown {
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
      case 'BinaryExpr':
        return this.executeBinary(node, env);
      case 'UnaryExpr':
        return this.executeUnary(node, env);
      case 'CallExpr':
        return this.executeCall(node, env);
      case 'IndexExpr':
        return this.executeIndex(node, env);
      case 'MemberExpr':
        return this.executeMember(node, env);
      case 'ArrayLiteral':
        return node.elements.map((el) => this.execute(el, env));
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
      case 'IfStatement':
        return this.executeIf(node, env);
      case 'WhileStatement':
        return this.executeWhile(node, env);
      case 'ForEachStatement':
        return this.executeForEach(node, env);
      case 'FuncDeclaration':
        return this.executeFuncDecl(node, env);
      case 'ReturnStatement':
        return this.executeReturn(node, env);
      case 'BlockStatement':
        return this.executeBlock(node, env);
      case 'ExpressionStatement':
        return this.execute(node.expression, env);
      default:
        throw new SdevError(`Unknown node type: ${(node as { type: string }).type}`, 0);
    }
  }

  private executeProgram(node: AST.Program, env: Environment): unknown {
    let result: unknown = null;
    for (const stmt of node.statements) {
      result = this.execute(stmt, env);
    }
    return result;
  }

  private executeBinary(node: AST.BinaryExpr, env: Environment): unknown {
    // Short-circuit evaluation for also/either
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
        throw new SdevError("Cannot use '+' with these types", node.line);
      case '-':
        return this.requireNumbers(left, right, '-', node.line, (a, b) => a - b);
      case '*':
        if (typeof left === 'number' && typeof right === 'number') return left * right;
        if (typeof left === 'string' && typeof right === 'number') return left.repeat(right);
        if (typeof left === 'number' && typeof right === 'string') return right.repeat(left);
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

  private executeUnary(node: AST.UnaryExpr, env: Environment): unknown {
    const operand = this.execute(node.operand, env);

    switch (node.operator) {
      case '-':
        if (typeof operand !== 'number') {
          throw new SdevError("Cannot use '-' with non-number", node.line);
        }
        return -operand;
      case 'isnt':
        return !isTruthy(operand);
      default:
        throw new SdevError(`Unknown unary operator: ${node.operator}`, node.line);
    }
  }

  private executeCall(node: AST.CallExpr, env: Environment): unknown {
    const callee = this.execute(node.callee, env);
    const args = node.args.map((arg) => this.execute(arg, env));

    if (!callee || typeof callee !== 'object' || !('type' in callee)) {
      throw new SdevError('Cannot call non-function', node.line);
    }

    const fn = callee as SdevFunction;
    if (fn.type !== 'builtin' && fn.type !== 'user' && fn.type !== 'lambda') {
      throw new SdevError('Cannot call non-function', node.line);
    }

    return fn.call(args, node.line);
  }

  private executeIndex(node: AST.IndexExpr, env: Environment): unknown {
    const obj = this.execute(node.object, env);
    const index = this.execute(node.index, env);

    if (Array.isArray(obj)) {
      if (typeof index !== 'number') {
        throw new SdevError('List index must be a number', node.line);
      }
      const idx = index < 0 ? obj.length + index : index;
      if (idx < 0 || idx >= obj.length) {
        throw new SdevError('List index out of bounds', node.line);
      }
      return obj[idx];
    }

    if (typeof obj === 'string') {
      if (typeof index !== 'number') {
        throw new SdevError('String index must be a number', node.line);
      }
      const idx = index < 0 ? obj.length + index : index;
      if (idx < 0 || idx >= obj.length) {
        throw new SdevError('String index out of bounds', node.line);
      }
      return obj[idx];
    }

    if (obj && typeof obj === 'object') {
      const key = stringify(index);
      return (obj as Record<string, unknown>)[key];
    }

    throw new SdevError('Cannot index this type', node.line);
  }

  private executeMember(node: AST.MemberExpr, env: Environment): unknown {
    const obj = this.execute(node.object, env);
    
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      return (obj as Record<string, unknown>)[node.property];
    }

    throw new SdevError('Cannot access property on this type', node.line);
  }

  private executeDict(node: AST.DictLiteral, env: Environment): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const entry of node.entries) {
      const key = stringify(this.execute(entry.key, env));
      const value = this.execute(entry.value, env);
      result[key] = value;
    }
    return result;
  }

  private executeLambda(node: AST.LambdaExpr, env: Environment): SdevFunction {
    return {
      type: 'lambda' as const,
      call: (args: unknown[], callLine: number) => {
        if (args.length !== node.params.length) {
          throw new SdevError(
            `Lambda expects ${node.params.length} arguments, got ${args.length}`,
            callLine
          );
        }

        const lambdaEnv = new Environment(env);
        for (let i = 0; i < node.params.length; i++) {
          lambdaEnv.define(node.params[i], args[i]);
        }

        return this.execute(node.body, lambdaEnv);
      },
    };
  }

  private executeLet(node: AST.LetStatement, env: Environment): void {
    const value = this.execute(node.value, env);
    env.define(node.name, value);
  }

  private executeAssign(node: AST.AssignStatement, env: Environment): unknown {
    const value = this.execute(node.value, env);
    env.set(node.name, value, node.line);
    return value;
  }

  private executeIndexAssign(node: AST.IndexAssignStatement, env: Environment): unknown {
    const obj = this.execute(node.object, env);
    const index = this.execute(node.index, env);
    const value = this.execute(node.value, env);

    if (Array.isArray(obj)) {
      if (typeof index !== 'number') {
        throw new SdevError('List index must be a number', node.line);
      }
      const idx = index < 0 ? obj.length + index : index;
      if (idx < 0 || idx >= obj.length) {
        throw new SdevError('List index out of bounds', node.line);
      }
      obj[idx] = value;
      return value;
    }

    if (obj && typeof obj === 'object') {
      const key = stringify(index);
      (obj as Record<string, unknown>)[key] = value;
      return value;
    }

    throw new SdevError('Cannot assign to index of this type', node.line);
  }

  private executeIf(node: AST.IfStatement, env: Environment): unknown {
    const condition = this.execute(node.condition, env);
    
    if (isTruthy(condition)) {
      return this.execute(node.thenBranch, env);
    } else if (node.elseBranch) {
      return this.execute(node.elseBranch, env);
    }
    
    return null;
  }

  private executeWhile(node: AST.WhileStatement, env: Environment): unknown {
    let result: unknown = null;
    let iterations = 0;
    const maxIterations = 100000;
    
    while (isTruthy(this.execute(node.condition, env))) {
      result = this.execute(node.body, env);
      iterations++;
      if (iterations > maxIterations) {
        throw new SdevError('Maximum loop iterations exceeded (possible infinite loop)', node.line);
      }
    }
    
    return result;
  }

  private executeForEach(node: AST.ForEachStatement, env: Environment): unknown {
    const iterable = this.execute(node.iterable, env);
    
    if (!Array.isArray(iterable) && typeof iterable !== 'string') {
      throw new SdevError('Can only iterate through lists or strings', node.line);
    }

    let result: unknown = null;
    const items = Array.isArray(iterable) ? iterable : iterable.split('');
    let iterations = 0;
    const maxIterations = 100000;

    for (const item of items) {
      const loopEnv = new Environment(env);
      loopEnv.define(node.variable, item);
      result = this.execute(node.body, loopEnv);
      iterations++;
      if (iterations > maxIterations) {
        throw new SdevError('Maximum loop iterations exceeded', node.line);
      }
    }

    return result;
  }

  private executeFuncDecl(node: AST.FuncDeclaration, env: Environment): void {
    const func: SdevFunction = {
      type: 'user',
      call: (args: unknown[], callLine: number) => {
        if (args.length !== node.params.length) {
          throw new SdevError(
            `Function '${node.name}' expects ${node.params.length} arguments, got ${args.length}`,
            callLine
          );
        }

        const funcEnv = new Environment(env);
        for (let i = 0; i < node.params.length; i++) {
          funcEnv.define(node.params[i], args[i]);
        }

        try {
          this.execute(node.body, funcEnv);
          return null;
        } catch (e) {
          if (e instanceof ReturnException) {
            return e.value;
          }
          throw e;
        }
      },
    };

    env.define(node.name, func);
  }

  private executeReturn(node: AST.ReturnStatement, env: Environment): never {
    const value = node.value ? this.execute(node.value, env) : null;
    throw new ReturnException(value);
  }

  private executeBlock(node: AST.BlockStatement, env: Environment): unknown {
    const blockEnv = new Environment(env);
    let result: unknown = null;
    
    for (const stmt of node.statements) {
      result = this.execute(stmt, blockEnv);
    }
    
    return result;
  }

  private requireNumbers<T>(
    left: unknown,
    right: unknown,
    op: string,
    line: number,
    fn: (a: number, b: number) => T
  ): T {
    if (typeof left !== 'number' || typeof right !== 'number') {
      throw new SdevError(`Cannot use '${op}' with non-numbers`, line);
    }
    return fn(left, right);
  }

  private isEqual(a: unknown, b: unknown): boolean {
    if (a === null && b === null) return true;
    if (a === null || b === null) return false;
    if (typeof a !== typeof b) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((v, i) => this.isEqual(v, b[i]));
    }
    return a === b;
  }
}
