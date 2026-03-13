import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { IdeFileTree } from '@/components/ide/IdeFileTree';
import { IdeEditor } from '@/components/ide/IdeEditor';
import { IdeTabs } from '@/components/ide/IdeTabs';
import { IdeTerminal } from '@/components/ide/IdeTerminal';
import { CanvasPanel, CanvasHandle } from '@/components/CanvasPanel';
import { GraphicsCommand, TurtleState, createGraphicsBuiltins } from '@/lang/graphics';
import { Lexer } from '@/lang/lexer';
import { Parser } from '@/lang/parser';
import { Interpreter } from '@/lang/interpreter';
import { Environment } from '@/lang/environment';
import { createBuiltins } from '@/lang/builtins';
import { SdevError } from '@/lang/errors';
import { Compiler } from '@/lang/compiler';
import { VM } from '@/lang/vm';
import { Button } from '@/components/ui/button';
import { Play, Zap, ArrowLeft, Download, Cpu, Save, Settings, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import type { IdeFile } from '@/components/ide/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STARTER_FILES: IdeFile[] = [
  {
    id: '1',
    name: 'main.sdev',
    content: `// Welcome to sdev IDE!
forge message be "Hello, World!"
speak(message)

// Try a function:
conjure greet(name) ::
  yield "Hello, " + name + "!"
;;

speak(greet("sdev"))
`,
  },
  {
    id: '2',
    name: 'graphics.sdev',
    content: `// Turtle spiral
canvas(400, 400)
clear("#0d0d15")
turtle()

forge i be 0
cycle i < 100 ::
  pencolor(hue(i * 3))
  forward(i * 0.6)
  right(30)
  i be i + 1
;;
`,
  },
  {
    id: '3',
    name: 'fibonacci.sdev',
    content: `// Fibonacci sequence
conjure fib(n) ::
  ponder n <= 1 :: yield n ;;
  yield fib(n - 1) + fib(n - 2)
;;

forge i be 0
cycle i < 10 ::
  speak("fib(" + morph(i, "text") + ") = " + morph(fib(i), "text"))
  i be i + 1
;;
`,
  },
];

let fileIdCounter = 10;

type RunMode = 'interpreter' | 'vm';

export default function IDEPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<IdeFile[]>(STARTER_FILES);
  const [activeId, setActiveId] = useState('1');
  const [openIds, setOpenIds] = useState<string[]>(['1']);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [graphicsCommands, setGraphicsCommands] = useState<GraphicsCommand[]>([]);
  const [showCanvas, setShowCanvas] = useState(false);
  const [runMode, setRunMode] = useState<RunMode>('interpreter');
  const [statusMsg, setStatusMsg] = useState('Ready');
  const [lineCount, setLineCount] = useState(0);
  const canvasRef = useRef<CanvasHandle>(null);

  const activeFile = files.find(f => f.id === activeId);
  const openFiles = openIds.map(id => files.find(f => f.id === id)).filter(Boolean) as IdeFile[];

  const updateActiveContent = useCallback((content: string) => {
    setFiles(prev => prev.map(f => f.id === activeId ? { ...f, content } : f));
    setLineCount(content.split('\n').length);
  }, [activeId]);

  const runCode = useCallback(() => {
    if (!activeFile) return;
    const code = activeFile.content;
    const outputLines: string[] = [];
    const commands: GraphicsCommand[] = [];
    let turtleState: TurtleState = { x: 200, y: 200, angle: -90, penDown: true, color: '#00ff88', width: 2 };
    const t0 = performance.now();

    try {
      if (runMode === 'interpreter') {
        const lexer = new Lexer(code);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        const env = new Environment();
        const builtins = createBuiltins((msg) => outputLines.push(msg));
        builtins.forEach((fn, name) => env.define(name, fn));
        env.define('PI', Math.PI);
        env.define('TAU', Math.PI * 2);
        env.define('E', Math.E);
        const gfx = createGraphicsBuiltins(
          (cmd) => commands.push(cmd),
          () => turtleState,
          (state) => { turtleState = { ...turtleState, ...state }; }
        );
        gfx.forEach((fn, name) => env.define(name, fn));
        const interpreter = new Interpreter((msg) => outputLines.push(msg));
        (interpreter as unknown as { globalEnv: Environment }).globalEnv = env;
        interpreter.interpret(ast);
      } else {
        const lexer = new Lexer(code);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        const compiler = new Compiler();
        const chunk = compiler.compile(ast);
        const vm = new VM((msg) => outputLines.push(msg));
        vm.run(chunk);
      }

      const elapsed = Math.round((performance.now() - t0) * 10) / 10;
      setOutput(outputLines);
      setError(undefined);
      setGraphicsCommands(commands);
      if (commands.length > 0) setShowCanvas(true);
      setStatusMsg(`✓ Ran in ${elapsed}ms`);
    } catch (e) {
      setOutput(outputLines);
      const msg = e instanceof SdevError ? e.message : String(e);
      setError(msg);
      setStatusMsg('✗ Error');
    }
  }, [activeFile, runMode]);

  const newFile = useCallback(() => {
    const id = String(++fileIdCounter);
    const name = `untitled${fileIdCounter}.sdev`;
    const file: IdeFile = { id, name, content: `// ${name}\n` };
    setFiles(prev => [...prev, file]);
    setOpenIds(prev => [...prev, id]);
    setActiveId(id);
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setOpenIds(prev => prev.filter(x => x !== id));
    if (activeId === id) {
      const remaining = openIds.filter(x => x !== id);
      setActiveId(remaining[0] ?? files.find(f => f.id !== id)?.id ?? '');
    }
  }, [activeId, openIds, files]);

  const renameFile = useCallback((id: string, name: string) => {
    const safe = name.endsWith('.sdev') ? name : name + '.sdev';
    setFiles(prev => prev.map(f => f.id === id ? { ...f, name: safe } : f));
  }, []);

  const selectFile = useCallback((id: string) => {
    setActiveId(id);
    setOpenIds(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const closeTab = useCallback((id: string) => {
    const next = openIds.filter(x => x !== id);
    setOpenIds(next);
    if (activeId === id && next.length > 0) setActiveId(next[next.length - 1]);
  }, [openIds, activeId]);

  const downloadCurrentFile = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${activeFile.name}`);
  };

  const downloadElectron = () => {
    const pkg = JSON.stringify({
      name: "sdev-ide",
      version: "1.0.0",
      description: "sdev IDE – desktop edition",
      main: "main.js",
      scripts: {
        start: "electron .",
        build: "electron-builder"
      },
      dependencies: {
        electron: "^28.0.0"
      },
      devDependencies: {
        "electron-builder": "^24.0.0"
      },
      build: {
        appId: "dev.sdev.ide",
        productName: "sdev IDE",
        directories: { output: "dist-electron" }
      }
    }, null, 2);

    const mainJs = `const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0d0e1a',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the published sdev IDE
  win.loadURL('https://s-dev.lovable.app/ide');
  
  // Open external links in browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // DevTools in dev mode
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
`;

    const readme = `# sdev IDE – Desktop Edition

## Quick Start

1. Make sure you have **Node.js** installed (https://nodejs.org)
2. Open a terminal in this folder
3. Run:

\`\`\`bash
npm install
npm start
\`\`\`

This opens the sdev IDE as a native desktop window!

## Build a distributable installer

\`\`\`bash
npm run build
\`\`\`

The installer will be in the \`dist-electron/\` folder.

## Requirements
- Node.js 18+
- Windows / macOS / Linux
`;

    // Download all 3 files
    const downloads = [
      { name: 'package.json', content: pkg },
      { name: 'main.js', content: mainJs },
      { name: 'README.md', content: readme },
    ];

    downloads.forEach(({ name, content }) => {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    });

    toast.success('Downloaded Electron wrapper (3 files)! See README for setup.');
  };

  const currentContent = activeFile?.content ?? '';
  const currentLines = currentContent.split('\n').length;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* ── Title Bar ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-muted/10 flex-shrink-0 select-none">
        {/* Left: back + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Playground</span>
          </button>
          <div className="w-px h-4 bg-border/50" />
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-display font-bold text-sm gradient-text">SDEV IDE</span>
          </div>
          {activeFile && (
            <>
              <div className="w-px h-4 bg-border/50" />
              <span className="text-xs font-mono text-muted-foreground">{activeFile.name}</span>
            </>
          )}
        </div>

        {/* Center: menu bar */}
        <div className="hidden md:flex items-center gap-1">
          {(['File', 'Edit', 'View', 'Run', 'Help'] as const).map(item => (
            <button key={item} className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded transition-all font-mono">
              {item}
            </button>
          ))}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* Run mode toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border/50 h-7">
                {runMode === 'interpreter' ? <Zap className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
                <span className="hidden sm:inline">{runMode === 'interpreter' ? 'Interpreter' : 'VM'}</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-border/50">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Execution Mode</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setRunMode('interpreter')} className="gap-2 text-xs cursor-pointer">
                <Zap className="w-3.5 h-3.5 text-neon-cyan" />
                <div>
                  <div className="font-medium">Tree-walk Interpreter</div>
                  <div className="text-muted-foreground">Fast, full feature support</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRunMode('vm')} className="gap-2 text-xs cursor-pointer">
                <Cpu className="w-3.5 h-3.5 text-neon-violet" />
                <div>
                  <div className="font-medium">Bytecode VM</div>
                  <div className="text-muted-foreground">Compiled execution</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            variant="outline"
            onClick={downloadCurrentFile}
            className="gap-1.5 text-xs border-border/50 h-7"
          >
            <Save className="w-3 h-3" />
            <span className="hidden sm:inline">Save</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border/50 h-7">
                <Download className="w-3 h-3" />
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-card border-border/50">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Downloads</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={downloadCurrentFile} className="gap-2 text-xs cursor-pointer">
                <Save className="w-3.5 h-3.5 text-neon-cyan" />
                Download current file (.sdev)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={downloadElectron} className="gap-2 text-xs cursor-pointer">
                <Settings className="w-3.5 h-3.5 text-neon-violet" />
                <div>
                  <div className="font-medium">Electron Desktop App</div>
                  <div className="text-muted-foreground">Installs on Windows/Mac/Linux</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            onClick={runCode}
            className="gap-1.5 bg-gradient-to-r from-neon-cyan to-neon-violet border-0 text-primary-foreground font-semibold h-7 text-xs"
          >
            <Play className="w-3 h-3" />
            Run
          </Button>
        </div>
      </div>

      {/* ── Main Body ── */}
      <div className="flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Sidebar: file explorer */}
          <ResizablePanel defaultSize={16} minSize={10} maxSize={30} className="flex flex-col border-r border-border/40 bg-background/20">
            <IdeFileTree
              files={files}
              activeId={activeId}
              onSelect={selectFile}
              onNew={newFile}
              onDelete={deleteFile}
              onRename={renameFile}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center: editor + terminal */}
          <ResizablePanel defaultSize={84} className="flex flex-col">
            <ResizablePanelGroup direction="vertical">
              {/* Editor area */}
              <ResizablePanel defaultSize={68} minSize={30}>
                <div className="flex flex-col h-full">
                  {/* Tabs */}
                  <IdeTabs
                    files={openFiles}
                    activeId={activeId}
                    onSelect={selectFile}
                    onClose={closeTab}
                  />
                  {/* Editor */}
                  <div className="flex-1 overflow-hidden">
                    {activeFile ? (
                      <IdeEditor
                        key={activeFile.id}
                        value={activeFile.content}
                        onChange={updateActiveContent}
                        onRun={runCode}
                        fileName={activeFile.name}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground/50 text-sm font-mono">
                        No file open — select one from the explorer
                      </div>
                    )}
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Terminal / output */}
              <ResizablePanel defaultSize={32} minSize={15} maxSize={60}>
                <ResizablePanelGroup direction="horizontal">
                  <ResizablePanel defaultSize={showCanvas ? 60 : 100} minSize={40}>
                    <IdeTerminal
                      lines={output}
                      error={error}
                      onClear={() => { setOutput([]); setError(undefined); }}
                    />
                  </ResizablePanel>
                  {showCanvas && (
                    <>
                      <ResizableHandle withHandle />
                      <ResizablePanel defaultSize={40} minSize={25}>
                        <div className="h-full overflow-auto p-2 bg-background/30">
                          <CanvasPanel
                            ref={canvasRef}
                            commands={graphicsCommands}
                            onClose={() => setShowCanvas(false)}
                          />
                        </div>
                      </ResizablePanel>
                    </>
                  )}
                </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* ── Status Bar ── */}
      <div className="flex items-center justify-between px-4 py-1 border-t border-border/40 bg-primary/5 flex-shrink-0 text-xs font-mono">
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="text-primary font-medium">{statusMsg}</span>
          <span>{runMode === 'interpreter' ? '⚡ Interpreter' : '🔷 Bytecode VM'}</span>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          {activeFile && <span>Ln {currentLines}</span>}
          <span>sdev</span>
          <span className="text-neon-green animate-pulse">● Online</span>
        </div>
      </div>
    </div>
  );
}
