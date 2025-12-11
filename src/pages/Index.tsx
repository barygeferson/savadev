import { useState, useCallback } from 'react';
import { execute } from '@/lang';
import { CodeEditor } from '@/components/CodeEditor';
import { OutputPanel } from '@/components/OutputPanel';
import { ExampleCode } from '@/components/ExampleCode';
import { LanguageReference } from '@/components/LanguageReference';
import { Button } from '@/components/ui/button';
import { Play, Sparkles } from 'lucide-react';

const DEFAULT_CODE = `// Welcome to sdev!
// A unique, expressive programming language

forge message be "Hello, World!"
speak(message)

// Try the examples below or write your own!
// Use 'forge' for variables, 'conjure' for functions
// Blocks use '::' and ';;' instead of braces
`;

const Index = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string>();

  const runCode = useCallback(() => {
    const result = execute(code);
    setOutput(result.output);
    setError(result.error);
  }, [code]);

  const handleExampleSelect = useCallback((exampleCode: string) => {
    setCode(exampleCode);
    setOutput([]);
    setError(undefined);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          <Button onClick={runCode} size="lg" className="gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0">
            <Play className="w-4 h-4" />
            Run
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Editor Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Examples */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Try an example:</p>
              <ExampleCode onSelect={handleExampleSelect} />
            </div>

            {/* Code Editor */}
            <CodeEditor
              value={code}
              onChange={setCode}
              onRun={runCode}
              placeholder="// Write your sdev code here..."
            />

            {/* Output */}
            <OutputPanel lines={output} error={error} />
          </div>

          {/* Reference Column */}
          <div className="space-y-4">
            <LanguageReference />
            
            {/* Quick cheatsheet */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-medium text-sm mb-3 text-foreground">Quick Cheatsheet</h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Variable:</span>
                  <span className="text-violet-400">forge x be 10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Function:</span>
                  <span className="text-violet-400">conjure fn() :: ;;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">If:</span>
                  <span className="text-violet-400">ponder cond :: ;;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loop:</span>
                  <span className="text-violet-400">cycle cond :: ;;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lambda:</span>
                  <span className="text-violet-400">(x) -&gt; x * 2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pipe:</span>
                  <span className="text-violet-400">data |&gt; each(fn)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>sdev — Where code becomes poetry ✨</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
