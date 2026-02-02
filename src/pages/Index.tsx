import { useState, useCallback, useRef } from 'react';
import { CodeEditor } from '@/components/CodeEditor';
import { OutputPanel } from '@/components/OutputPanel';
import { ExampleCode } from '@/components/ExampleCode';
import { LanguageReference } from '@/components/LanguageReference';
import { CanvasPanel, CanvasHandle } from '@/components/CanvasPanel';
import { DownloadablesDropdown } from '@/components/DownloadablesDropdown';
import { CodeTranslator } from '@/components/CodeTranslator';
import { Button } from '@/components/ui/button';
import { Play, Zap, Wand2, Terminal, ChevronDown } from 'lucide-react';
import { GraphicsCommand, TurtleState, createGraphicsBuiltins } from '@/lang/graphics';
import { Lexer } from '@/lang/lexer';
import { Parser } from '@/lang/parser';
import { Interpreter } from '@/lang/interpreter';
import { Environment } from '@/lang/environment';
import { createBuiltins } from '@/lang/builtins';
import { SdevError } from '@/lang/errors';

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
  const [showTranslator, setShowTranslator] = useState(false);
  const [showReference, setShowReference] = useState(false);
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
      
      // Add math constants directly
      env.define('PI', Math.PI);
      env.define('TAU', Math.PI * 2);
      env.define('E', Math.E);

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

  const handleTranslatedCode = useCallback((translatedCode: string) => {
    setCode(translatedCode);
    setShowTranslator(false);
    setOutput([]);
    setError(undefined);
    setGraphicsCommands([]);
  }, []);

  return (
    <div className="min-h-screen bg-background cyber-grid relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-neon-magenta/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-violet/5 rounded-full blur-[200px] pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-border/50 glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-magenta rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold gradient-text tracking-wider">SDEV</h1>
              <p className="text-xs text-muted-foreground font-mono">{'>'} code_becomes_poetry</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <DownloadablesDropdown code={code} />
            <Button 
              onClick={() => setShowTranslator(!showTranslator)} 
              variant={showTranslator ? "secondary" : "outline"}
              className="gap-2 border-border/50 hover:border-neon-violet/50 hover:shadow-neon-violet transition-all"
            >
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">Translate</span>
            </Button>
            <Button 
              onClick={runCode} 
              className="gap-2 bg-gradient-to-r from-neon-cyan to-neon-violet hover:shadow-neon-cyan transition-all border-0 text-primary-foreground font-semibold"
            >
              <Play className="w-4 h-4" />
              Execute
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 glass mb-4">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-muted-foreground">version 1.0.0</span>
          </div>
        </div>

        {/* Example selector */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3 font-mono">
            <span className="text-primary">$</span> select_example:
          </p>
          <ExampleCode onSelect={handleExampleSelect} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main editor area */}
          <div className="lg:col-span-2 space-y-6">
            <CodeEditor value={code} onChange={setCode} onRun={runCode} placeholder="// Write your sdev code here..." />
            <OutputPanel lines={output} error={error} />
            {showCanvas && <CanvasPanel ref={canvasRef} commands={graphicsCommands} onClose={() => setShowCanvas(false)} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Translator Panel */}
            {showTranslator && (
              <div className="gradient-border">
                <CodeTranslator onTranslated={handleTranslatedCode} />
              </div>
            )}

            {/* Quick Reference Toggle */}
            <button
              onClick={() => setShowReference(!showReference)}
              className="w-full flex items-center justify-between p-4 rounded-lg border border-border/50 glass hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium text-foreground">Language Reference</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showReference ? 'rotate-180' : ''}`} />
            </button>

            {showReference && <LanguageReference />}

            {/* Info card */}
            <div className="rounded-lg border border-border/50 glass p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neon-magenta/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-secondary" />
                </div>
                <h3 className="font-semibold text-foreground">Import Libraries</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Use GitHub Gists to share and import code modules:
              </p>
              <div className="rounded-lg bg-background/50 border border-border/50 p-3">
                <code className="text-sm font-mono">
                  <span className="text-primary">summon</span>{' '}
                  <span className="text-secondary">"gist:abc123"</span>
                </code>
              </div>
            </div>

            {/* Keyboard shortcuts */}
            <div className="rounded-lg border border-border/50 glass p-5 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Shortcuts</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Run code</span>
                  <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">Ctrl+Enter</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Insert tab</span>
                  <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">Tab</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border/50 mt-16 py-8 glass">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-display text-lg gradient-text">SDEV</span>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              {'>'} where_code_becomes_poetry
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="animate-flicker">◉ System Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
