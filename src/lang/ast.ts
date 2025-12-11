export type ASTNode =
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | NullLiteral
  | Identifier
  | BinaryExpr
  | UnaryExpr
  | CallExpr
  | IndexExpr
  | MemberExpr
  | ArrayLiteral
  | DictLiteral
  | LambdaExpr
  | LetStatement
  | AssignStatement
  | IndexAssignStatement
  | IfStatement
  | WhileStatement
  | FuncDeclaration
  | ReturnStatement
  | BlockStatement
  | ExpressionStatement
  | Program;

export interface NumberLiteral {
  type: 'NumberLiteral';
  value: number;
  line: number;
}

export interface StringLiteral {
  type: 'StringLiteral';
  value: string;
  line: number;
}

export interface BooleanLiteral {
  type: 'BooleanLiteral';
  value: boolean;
  line: number;
}

export interface NullLiteral {
  type: 'NullLiteral';
  line: number;
}

export interface Identifier {
  type: 'Identifier';
  name: string;
  line: number;
}

export interface BinaryExpr {
  type: 'BinaryExpr';
  operator: string;
  left: ASTNode;
  right: ASTNode;
  line: number;
}

export interface UnaryExpr {
  type: 'UnaryExpr';
  operator: string;
  operand: ASTNode;
  line: number;
}

export interface CallExpr {
  type: 'CallExpr';
  callee: ASTNode;
  args: ASTNode[];
  line: number;
}

export interface IndexExpr {
  type: 'IndexExpr';
  object: ASTNode;
  index: ASTNode;
  line: number;
}

export interface MemberExpr {
  type: 'MemberExpr';
  object: ASTNode;
  property: string;
  line: number;
}

export interface ArrayLiteral {
  type: 'ArrayLiteral';
  elements: ASTNode[];
  line: number;
}

export interface DictLiteral {
  type: 'DictLiteral';
  entries: { key: ASTNode; value: ASTNode }[];
  line: number;
}

export interface LambdaExpr {
  type: 'LambdaExpr';
  params: string[];
  body: ASTNode;
  line: number;
}

export interface LetStatement {
  type: 'LetStatement';
  name: string;
  value: ASTNode;
  line: number;
}

export interface AssignStatement {
  type: 'AssignStatement';
  name: string;
  value: ASTNode;
  line: number;
}

export interface IndexAssignStatement {
  type: 'IndexAssignStatement';
  object: ASTNode;
  index: ASTNode;
  value: ASTNode;
  line: number;
}

export interface IfStatement {
  type: 'IfStatement';
  condition: ASTNode;
  thenBranch: BlockStatement;
  elseBranch?: BlockStatement | IfStatement;
  line: number;
}

export interface WhileStatement {
  type: 'WhileStatement';
  condition: ASTNode;
  body: BlockStatement;
  line: number;
}

export interface FuncDeclaration {
  type: 'FuncDeclaration';
  name: string;
  params: string[];
  body: BlockStatement;
  line: number;
}

export interface ReturnStatement {
  type: 'ReturnStatement';
  value?: ASTNode;
  line: number;
}

export interface BlockStatement {
  type: 'BlockStatement';
  statements: ASTNode[];
  line: number;
}

export interface ExpressionStatement {
  type: 'ExpressionStatement';
  expression: ASTNode;
  line: number;
}

export interface Program {
  type: 'Program';
  statements: ASTNode[];
  line: number;
}

export type ExpressionNode = Exclude<ASTNode, Program>;
