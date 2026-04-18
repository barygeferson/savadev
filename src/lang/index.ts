import { Lexer, LexerOptions } from './lexer';
import { Parser } from './parser';
import { Interpreter } from './interpreter';
import { SdevError } from './errors';

export interface ExecutionResult {
  success: boolean;
  output: string[];
  error?: string;
  /** Language detected/used by the built-in translator, if any. */
  detectedLanguage?: string | null;
}

export interface ExecuteOptions extends LexerOptions {}

export function execute(source: string, options: ExecuteOptions = {}): ExecutionResult {
  const output: string[] = [];

  try {
    const lexer = new Lexer(source, options);
    const tokens = lexer.tokenize();

    const parser = new Parser(tokens);
    const ast = parser.parse();

    const interpreter = new Interpreter((msg) => output.push(msg));
    interpreter.interpret(ast);

    return { success: true, output, detectedLanguage: lexer.detectedLanguage };
  } catch (e) {
    if (e instanceof SdevError) {
      return { success: false, output, error: e.message };
    }
    if (e instanceof Error) {
      return { success: false, output, error: e.message };
    }
    return { success: false, output, error: String(e) };
  }
}

export { Lexer } from './lexer';
export { Parser } from './parser';
export { Interpreter } from './interpreter';
export { SdevError } from './errors';
export {
  translateSource,
  detectLanguage,
  hasNonAscii,
  SUPPORTED_LANGUAGES,
  KEYWORD_TABLES,
} from './translator';
export * from './tokens';
export * from './ast';
