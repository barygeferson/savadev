// Deep technical reference of the SDEV implementation.
// Injected into AI prompts so the assistants can answer questions about
// the lexer, parser, interpreter, compiler, VM, kernel, builtins, etc.
//
// Keep this in sync with src/lang/* when the implementation changes.

export const SDEV_INTERNALS = `
## SDEV IMPLEMENTATION INTERNALS (deep reference)

SDEV's reference implementation is written in TypeScript and lives in
\`src/lang/\`. It is a tree-walking interpreter PLUS a stack-based bytecode
compiler/VM, sharing a single lexer, parser and AST. The whole pipeline
runs in the browser (IDE) and in Node (CLI). The Python and standalone JS
distributions mirror this behaviour 1:1.

### Pipeline overview
Source text → \`lexer.ts\` (tokens) → \`parser.ts\` (AST) → either
\`interpreter.ts\` (tree-walk) or \`compiler.ts\` (bytecode) → \`vm.ts\`
(stack VM). The IDE's "Compiler" mode now reuses the full \`Interpreter\`
runtime so OOP, classes, web/UI/graphics builtins all work identically.

### Files (what each one does)
- \`tokens.ts\` — Token kind enum + keyword table. Keywords include
  \`forge be conjure yield ponder otherwise cycle iterate through
  equals differs also either isnt yep nope void link as from\`.
  Block delimiters are \`::\` (open) and \`;;\` (close); \`{ }\` is reserved
  for dict literals only.
- \`lexer.ts\` — Hand-written scanner. Tracks line/column, supports
  \`//\` line comments and \`/* */\` block comments, string escapes,
  numeric literals (int, float, scientific), \`::\`/\`;;\` block tokens,
  and the \`{\` \`}\` \`:\` tokens used by dict literals.
- \`ast.ts\` — Union \`ASTNode\` with NumberLiteral, StringLiteral,
  Identifier, BinaryExpr, UnaryExpr, TernaryExpr, AwaitExpr, CallExpr,
  IndexExpr, MemberExpr, ArrayLiteral, DictLiteral, LambdaExpr,
  Let/Assign/IndexAssign/MemberAssign, If/While/ForEach/ForIn,
  FuncDeclaration, Return/Break/Continue, TryStatement,
  ClassDeclaration, NewExpr, BlockStatement, ExpressionStatement,
  Program. Each node carries a \`line\` for error reporting.
- \`parser.ts\` — Recursive-descent Pratt-style parser. Precedence
  (low→high): ternary \`?:\`, logical \`either\`, logical \`also\`,
  equality (\`equals\`/\`differs\`/\`<>\`), comparison, additive,
  multiplicative, power \`^\` (right-assoc), unary \`-\`/\`isnt\`,
  call/index/member, primary. Parses dict literals as
  \`{ key: expr, "str": expr, ident: expr }\` and arrays as \`[ ... ]\`.
  Block-headed statements (\`conjure\`, \`ponder\`, \`cycle\`, \`iterate\`,
  \`class\`, \`try\`) require \`::\` … \`;;\`.
- \`linker.ts\` — Pre-parse pass that resolves \`link\` directives:
  \`link "file.sdev"\` inlines the file, \`link "math.sdev" as math\`
  inlines + prefixes top-level names with \`math_\`, and
  \`link a, b from "x.sdev"\` is sugar for the inline form.
  Resolves filenames case-insensitively, supports nested links, and
  detects cycles with a clear error.
- \`environment.ts\` — Lexically scoped variable environment with
  parent pointer, \`define\`, \`get\`, \`set\`, and \`assign\` that walks
  up to the defining scope. Used by both the interpreter and class
  instances.
- \`interpreter.ts\` — Visitor that evaluates AST nodes. Implements
  closures (lambdas capture the active environment), call frames,
  ReturnSignal / BreakSignal / ContinueSignal exceptions for control
  flow, \`try\`/\`catch\` mapping to JS errors, dynamic dispatch on
  classes (methods stored on the class, \`this\` rebound per call),
  and number coercion for math on numeric strings. Hosts the global
  environment populated by \`builtins.ts\`.
- \`builtins.ts\` — Standard library: I/O (\`speak\`, \`whisper\`,
  \`shout\`, \`input\`), type ops (\`essence\`, \`morph\`), math
  (\`root\`, \`ground\`, \`elevate\`, \`magnitude\`, \`PI\`, \`TAU\`, \`E\`,
  \`INFINITY\`), collections (\`measure\`, \`gather\`, \`pluck\`, \`sort\`,
  \`sift\`, \`each\`, \`fold\`, \`find\`, \`sum\`, \`reverse\`, \`unique\`,
  \`join\`, \`split\`), strings, regex, base conversion, time,
  randomness.
- \`advanced.ts\` — Pro features: file I/O shims, hashing, base64,
  JSON, async helpers, OS-level glue, pointer/buffer primitives.
- \`matrix.ts\` — Matrix/linear-algebra helpers (creation, transpose,
  multiply, determinant, inverse, eigen helpers).
- \`graphics.ts\` — Canvas backend: \`canvas\`, \`clear\`, \`fill\`,
  \`stroke\`, \`rect\`, \`circle\`, \`ellipse\`, \`line\`, \`triangle\`,
  \`star\`, \`heart\`, \`point\`, \`text\`, plus turtle graphics
  (\`turtle\`, \`forward\`, \`right\`, \`left\`, \`pendown/up\`, …) and
  \`hue(h,s,l)\` HSL colors.
- \`ui.ts\` — UI widget runtime used by the IDE App preview: \`app\`,
  \`button\`, \`textbox\`, \`label\`, \`slider\`, etc. When an app root is
  active, the UI \`input\` widget overrides the language's \`input()\`.
- \`web.ts\` — Web DSL. Builtins for every HTML5 tag
  (\`open_div\`/\`close_div\`, \`h1\`, \`p\`, \`img\`, \`a\`, …), CSS
  (\`style(selector, props)\`, \`keyframes\`), JS (\`on(id, event, fn)\`,
  \`script\`, \`onclick\`), and raw passthrough (\`raw_html\`, \`raw_css\`,
  \`raw_js\`). Calling \`page()\` triggers the IDE to switch to the WEB
  tab and render the generated document in an iframe.
- \`bytecode.ts\` — Opcode enum and chunk layout: constant pool,
  instruction array, line table. Opcodes cover PUSH/POP, arithmetic,
  comparison, logical, JUMP/JUMP_IF_FALSE, CALL, RETURN, GET/SET
  global+local, MAKE_LIST, MAKE_DICT, GET_INDEX, SET_INDEX,
  MAKE_CLOSURE, CLASS, METHOD, NEW, GET_PROP, SET_PROP.
- \`compiler.ts\` — Walks the AST and emits a bytecode chunk. Handles
  scope analysis for locals vs globals, patches forward jumps for
  \`ponder\`/\`cycle\`, lowers \`iterate\` into a counted loop, and
  produces a \`.sdevc\` binary when serialized.
- \`vm.ts\` — Stack-based VM that consumes chunks. Maintains value
  stack and call-frame stack, dispatches opcodes in a tight loop,
  delegates host calls to the same builtins table as the interpreter.
- \`kernel.ts\` — Virtual OS kernel layered over the VM: cooperative
  task scheduler, syscalls (file, time, ipc), a mark-and-sweep GC for
  long-running programs, and a process table.
- \`translator.ts\` — 26-language source translator. Holds 500+
  keyword/builtin mappings and rewrites foreign-language source into
  canonical English sdev before lexing.
- \`gist.ts\` — \`summon\` package system: validates a GitHub Gist ID,
  fetches files over HTTPS with redirect/scheme guards, caches them,
  then feeds them through the linker/parser.
- \`errors.ts\` — Shared \`SdevError\` with kind (\`Syntax\`, \`Runtime\`,
  \`Type\`, \`Name\`), line, column, and rendered banner used by the IDE
  Problems panel.
- \`index.ts\` — Public façade: \`run(source)\`, \`compile(source)\`,
  \`link(source, files)\`, exported types.

### Control-flow & semantics highlights
- All blocks are \`::\` … \`;;\`. \`{ }\` is ONLY dict literals.
- Assignment is \`be\`, never \`=\`. Declaration is \`forge name be expr\`.
- \`yield\` returns from a \`conjure\`. Bare \`yield\` returns \`void\`.
- \`isnt\` is logical NOT; \`also\`/\`either\` are AND/OR (short-circuit).
- \`equals\`/\`differs\` are deep-equal for lists and tomes.
- Numbers are JS doubles. \`^\` is power (right-associative).
- Strings are immutable; \`+\` concatenates and coerces numbers.
- Lists and tomes are reference types; \`gather\` clones shallowly.
- Closures capture by reference (lexical scope).
- Classes: \`class Name :: forge field be 0  conjure method(self,...) :: ... ;; ;;\`.
  Instantiate with \`new Name(args)\`, access fields with \`obj.field\`.

### Error model
Every error carries \`line\`/\`col\`. Runtime errors are thrown as
\`SdevError\` and surfaced in the IDE Problems panel + terminal. Common
shapes: \`Unexpected character\`, \`Expected ;; to close block\`,
\`Unknown identifier\`, \`Type mismatch\`, \`Cycle in link graph\`.

### IDE / runtime integration
- \`src/pages/IDE.tsx\` owns the workspace, runs code through the linker
  + interpreter, and routes output to Terminal / Canvas / App / Web
  panels depending on which builtins the program calls.
- The "Compiler" toggle still runs the full \`Interpreter\` for feature
  parity; the bytecode VM is used by the CLI and \`.sdevc\` toolchain.
- \`useWorkspaceSync\` persists files to Cloud; \`useCloudFiles\` reads
  them back for the linker resolver.

When answering "how does sdev do X?", cite the relevant file (e.g.
"the precedence climb lives in \`parser.ts\` parseBinary") and explain
the algorithm in plain language.
`;
