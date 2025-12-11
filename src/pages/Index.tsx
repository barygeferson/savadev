import { useState, useCallback } from 'react';
import { execute } from '@/lang';
import { CodeEditor } from '@/components/CodeEditor';
import { OutputPanel } from '@/components/OutputPanel';
import { ExampleCode } from '@/components/ExampleCode';
import { LanguageReference } from '@/components/LanguageReference';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

const DEFAULT_CODE = `// Welcome to sdev!
// A simple, beginner-friendly programming language

let message = "Hello, World!";
print(message);

// Try the examples below or write your own code!
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">sdev</h1>
              <p className="text-xs text-muted-foreground">A simple programming language</p>
            </div>
          </div>
          <Button onClick={runCode} size="lg" className="gap-2">
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
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>sdev — A beginner-friendly programming language built with TypeScript</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
