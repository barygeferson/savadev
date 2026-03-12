// ============================================================
// sdev Bytecode / IR Definition
// ============================================================

export enum OpCode {
  // Stack
  PUSH_NUM    = 'PUSH_NUM',
  PUSH_STR    = 'PUSH_STR',
  PUSH_BOOL   = 'PUSH_BOOL',
  PUSH_NULL   = 'PUSH_NULL',
  POP         = 'POP',
  DUP         = 'DUP',

  // Variables
  LOAD        = 'LOAD',
  STORE       = 'STORE',
  DEFINE      = 'DEFINE',

  // Arithmetic
  ADD         = 'ADD',
  SUB         = 'SUB',
  MUL         = 'MUL',
  DIV         = 'DIV',
  MOD         = 'MOD',
  POW         = 'POW',
  NEG         = 'NEG',

  // Comparison
  EQ          = 'EQ',
  NEQ         = 'NEQ',
  LT          = 'LT',
  GT          = 'GT',
  LTE         = 'LTE',
  GTE         = 'GTE',

  // Logical
  AND         = 'AND',
  OR          = 'OR',
  NOT         = 'NOT',

  // Control flow
  JUMP        = 'JUMP',      // unconditional jump to absolute index
  JUMP_IF_FALSE = 'JUMP_IF_FALSE', // pop + jump if falsy
  JUMP_IF_TRUE  = 'JUMP_IF_TRUE',  // pop + jump if truthy (for OR short-circuit)

  // Functions
  MAKE_FUNC   = 'MAKE_FUNC', // operand = FunctionDef index in chunk.functions
  CALL        = 'CALL',      // operand = arg count
  RETURN      = 'RETURN',

  // Collections
  MAKE_LIST   = 'MAKE_LIST', // operand = element count
  MAKE_DICT   = 'MAKE_DICT', // operand = entry count (pairs on stack)
  INDEX_GET   = 'INDEX_GET',
  INDEX_SET   = 'INDEX_SET',
  MEMBER_GET  = 'MEMBER_GET', // operand = property name

  // Misc
  PIPE        = 'PIPE',
  HALT        = 'HALT',
}

export interface Instruction {
  op: OpCode;
  operand?: number | string | boolean;
  line: number;
}

/** A compiled function body (also used for the top-level program) */
export interface FunctionDef {
  name: string;       // '' for anonymous / top-level
  params: string[];
  code: Instruction[];
  // Nested functions defined inside this function
  functions: FunctionDef[];
}

/** The root compilation unit */
export interface Chunk {
  version: number;    // bytecode format version
  entry: FunctionDef; // top-level code
}

export const BYTECODE_VERSION = 1;

// -------- Pretty printer --------
export function disassemble(fn: FunctionDef, indent = ''): string {
  const lines: string[] = [];
  const label = fn.name ? `<func ${fn.name}(${fn.params.join(', ')})>` : '<main>';
  lines.push(`${indent}${label}:`);
  fn.code.forEach((ins, i) => {
    const op = ins.op.padEnd(18);
    const operand = ins.operand !== undefined ? String(ins.operand) : '';
    lines.push(`${indent}  ${String(i).padStart(4, '0')}  ${op} ${operand}`);
  });
  for (const nested of fn.functions) {
    lines.push('');
    lines.push(disassemble(nested, indent + '  '));
  }
  return lines.join('\n');
}
