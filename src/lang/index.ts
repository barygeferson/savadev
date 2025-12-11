import { Lexer } from './lexer';
import { Parser } from './parser';
import { Interpreter } from './interpreter';
import { SdevError } from './errors';

export interface ExecutionResult {
  success: boolean;
  output: string[];
  error?: string;
}

export function execute(source: string): ExecutionResult {
  const output: string[] = [];

  try {
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    const parser = new Parser(tokens);
    const ast = parser.parse();

    const interpreter = new Interpreter((msg) => output.push(msg));
    interpreter.interpret(ast);

    return { success: true, output };
  } catch (e) {
    if (e instanceof SdevError) {
      return { success: false, output, error: e.message };
    }
    return { success: false, output, error: String(e) };
  }
}

export { Lexer } from './lexer';
export { Parser } from './parser';
export { Interpreter } from './interpreter';
export { SdevError } from './errors';
export * from './tokens';
export * from './ast';
