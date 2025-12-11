import { useState, useCallback, useRef } from 'react';
import { execute } from '@/lang';
import { CodeEditor } from '@/components/CodeEditor';
import { OutputPanel } from '@/components/OutputPanel';
import { ExampleCode } from '@/components/ExampleCode';
import { LanguageReference } from '@/components/LanguageReference';
import { CanvasPanel, CanvasHandle } from '@/components/CanvasPanel';
import { DownloadPanel } from '@/components/DownloadPanel';
import { Button } from '@/components/ui/button';
import { Play, Sparkles } from 'lucide-react';
import { GraphicsCommand, TurtleState, createGraphicsBuiltins } from '@/lang/graphics';
import { Lexer } from '@/lang/lexer';
import { Parser } from '@/lang/parser';
import { Interpreter } from '@/lang/interpreter';
import { Environment } from '@/lang/environment';
import { createBuiltins } from '@/lang/builtins';
import { SdevError, ReturnException } from '@/lang/errors';

const DEFAULT_CODE = `// Welcome to sdev!
// A unique, expressive programming language

forge message be "Hello, World!"
speak(message)

// Try graphics! Click "Turtle" or "Canvas" examples
`;

const Index = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string>();
  const [graphicsCommands, setGraphicsCommands] = useState<GraphicsCommand[]>([]);
  const [showCanvas, setShowCanvas] = useState(false);
  const canvasRef = useRef<CanvasHandle>(null);

  const runCode = useCallback(() => {
    const outputLines: string[] = [];
    const commands: GraphicsCommand[] = [];
    let turtleState: TurtleState = { x: 200, y: 200, angle: -90, penDown: true, color: '#00ff88', width: 2 };

    try {
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      const env = new Environment();
      const builtins = createBuiltins((msg) => outputLines.push(msg));
      builtins.forEach((fn, name) => env.define(name, fn));

      const gfxBuiltins = createGraphicsBuiltins(
        (cmd) => commands.push(cmd),
        () => turtleState,
        (state) => { turtleState = { ...turtleState, ...state }; }
      );
      gfxBuiltins.forEach((fn, name) => env.define(name, fn));

      const interpreter = new Interpreter((msg) => outputLines.push(msg));
      (interpreter as unknown as { globalEnv: Environment }).globalEnv = env;
      interpreter.interpret(ast);

      setOutput(outputLines);
      setError(undefined);
      setGraphicsCommands(commands);
      if (commands.length > 0) setShowCanvas(true);
    } catch (e) {
      setOutput(outputLines);
      if (e instanceof SdevError) {
        setError(e.message);
      } else {
        setError(String(e));
      }
    }
  }, [code]);

  const handleExampleSelect = useCallback((exampleCode: string) => {
    setCode(exampleCode);
    setOutput([]);
    setError(undefined);
    setGraphicsCommands([]);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">sdev</h1>
              <p className="text-xs text-muted-foreground">A unique programming language</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DownloadPanel code={code} />
            <Button onClick={runCode} size="lg" className="gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0">
              <Play className="w-4 h-4" />
              Run
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Try an example:</p>
              <ExampleCode onSelect={handleExampleSelect} />
            </div>
            <CodeEditor value={code} onChange={setCode} onRun={runCode} placeholder="// Write your sdev code here..." />
            <OutputPanel lines={output} error={error} />
            {showCanvas && <CanvasPanel ref={canvasRef} commands={graphicsCommands} />}
          </div>

          <div className="space-y-4">
            <LanguageReference />
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-medium text-sm mb-3 text-foreground">Import Libraries</h3>
              <p className="text-xs text-muted-foreground mb-2">Use GitHub Gists to share code:</p>
              <code className="text-xs text-violet-400 block bg-muted p-2 rounded">summon "gist:abc123"</code>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>sdev — Where code becomes poetry</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
