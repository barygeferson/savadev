import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { IdeFileTree } from '@/components/ide/IdeFileTree';
import { IdeEditor } from '@/components/ide/IdeEditor';
import { IdeTabs } from '@/components/ide/IdeTabs';
import { IdeTerminal } from '@/components/ide/IdeTerminal';
import { IdeStatusBar } from '@/components/ide/IdeStatusBar';
import { IdeCommandPalette } from '@/components/ide/IdeCommandPalette';
import { IdeSearchPanel } from '@/components/ide/IdeSearchPanel';
import { IdeSettingsPanel } from '@/components/ide/IdeSettingsPanel';
import { CanvasPanel, CanvasHandle } from '@/components/CanvasPanel';
import type { GraphicsCommand, TurtleState } from '@/lang/graphics';
import { createGraphicsBuiltins } from '@/lang/graphics';
import { Lexer } from '@/lang/lexer';
import { Parser } from '@/lang/parser';
import { Interpreter } from '@/lang/interpreter';
import { Environment } from '@/lang/environment';
import { createBuiltins } from '@/lang/builtins';
import { SdevError } from '@/lang/errors';
import { Compiler } from '@/lang/compiler';
import { VM } from '@/lang/vm';
import { Button } from '@/components/ui/button';
import {
  Play, Zap, ArrowLeft, Download, Cpu, Save, Settings,
  ChevronDown, Search, Terminal, Code, BookOpen, RotateCcw,
  Maximize2, Minimize2, SplitSquareHorizontal, FolderOpen, Command,
  Bug, Palette, X, Languages, RefreshCw, CheckCircle2, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import type { IdeFile, SidePanel, IdeSettings } from '@/components/ide/types';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCodeTranslation, mightNeedTranslation } from '@/hooks/useCodeTranslation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STARTER_FILES: IdeFile[] = [
  {
    id: '1',
    name: 'main.sdev',
    content: `// ═══════════════════════════════════════
// Welcome to the sdev IDE!
// Press Ctrl+Enter to run your code
// ═══════════════════════════════════════

forge message be "Hello, World!"
speak(message)

// Functions:
conjure greet(name) ::
  yield "Hello, " + name + "!"
;;

speak(greet("sdev"))

// Lists and higher-order functions:
forge nums be [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
forge evens be sift(nums, x -> x % 2 equals 0)
forge doubled be each(evens, x -> x * 2)
speak("Doubled evens:", doubled)
`,
  },
  {
    id: '2',
    name: 'graphics.sdev',
    content: `// Psychedelic Turtle Spiral
canvas(400, 400)
clear("#0d0d15")
turtle()

forge i be 0
cycle i < 200 ::
  pencolor(hue(i * 1.8))
  penwidth(1 + i * 0.02)
  forward(i * 0.7)
  right(29)
  i be i + 1
;;
`,
  },
  {
    id: '3',
    name: 'oop.sdev',
    content: `// Object-Oriented Programming in sdev

essence Animal ::
  conjure init(self, name, sound) ::
    self.name be name
    self.sound be sound
    self.energy be 100
  ;;

  conjure speak(self) ::
    speak(self.name + " says: " + self.sound + "!")
  ;;

  conjure eat(self, food) ::
    self.energy be self.energy + 20
    speak(self.name + " eats " + food + " (energy: " + morph(self.energy, "text") + ")")
  ;;
;;

essence Dog extend Animal ::
  conjure init(self, name, breed) ::
    super.init(name, "Woof")
    self.breed be breed
  ;;

  conjure fetch(self) ::
    self.energy be self.energy - 15
    speak(self.name + " the " + self.breed + " fetches the ball!")
  ;;
;;

forge buddy be new Dog("Buddy", "Golden Retriever")
buddy.speak()
buddy.eat("kibble")
buddy.fetch()
speak("Energy left:", buddy.energy)
`,
  },
  {
    id: '4',
    name: 'algorithms.sdev',
    content: `// Classic Algorithms

// Fibonacci (recursive)
conjure fib(n) ::
  ponder n <= 1 :: yield n ;;
  yield fib(n - 1) + fib(n - 2)
;;

speak("Fibonacci:")
forge i be 0
cycle i < 10 ::
  speak("  fib(" + morph(i, "text") + ") =", fib(i))
  i be i + 1
;;

// Bubble sort
conjure bubbleSort(arr) ::
  forge n be measure(arr)
  forge sorted be clone(arr)
  forge i be 0
  cycle i < n ::
    forge j be 0
    cycle j < n - i - 1 ::
      ponder sorted[j] > sorted[j + 1] ::
        forge temp be sorted[j]
        sorted[j] be sorted[j + 1]
        sorted[j + 1] be temp
      ;;
      j be j + 1
    ;;
    i be i + 1
  ;;
  yield sorted
;;

forge arr be [64, 34, 25, 12, 22, 11, 90]
speak("\\nOriginal:", arr)
speak("Sorted:", bubbleSort(arr))

// Binary search
conjure binarySearch(arr, target) ::
  forge left be 0
  forge right be measure(arr) - 1
  cycle left <= right ::
    forge mid be ground((left + right) / 2)
    ponder arr[mid] equals target ::
      yield mid
    ;; otherwise ponder arr[mid] < target ::
      left be mid + 1
    ;; otherwise ::
      right be mid - 1
    ;;
  ;;
  yield -1
;;

forge sorted be [1, 3, 5, 7, 9, 11, 13, 15]
speak("\\nBinary search for 7:", binarySearch(sorted, 7))
speak("Binary search for 6:", binarySearch(sorted, 6))
`,
  },
  {
    id: '5',
    name: 'data-structures.sdev',
    content: `// Data Structures Demo

speak("=== Stack ===")
forge stack be Stack()
stack.push(10)
stack.push(20)
stack.push(30)
speak("Push 10, 20, 30")
speak("Peek:", stack.peek())
speak("Pop:", stack.pop())
speak("Size:", stack.size())

speak("")
speak("=== Queue ===")
forge queue be Queue()
queue.enqueue("first")
queue.enqueue("second")
queue.enqueue("third")
speak("Dequeue:", queue.dequeue())
speak("Peek:", queue.peek())

speak("")
speak("=== Set ===")
forge s be Set()
s.add(1)
s.add(2)
s.add(2)
s.add(3)
speak("Set values (no dupes):", s.values())
speak("Has 2:", s.has(2))
s.remove(2)
speak("After removing 2:", s.values())

speak("")
speak("=== Map ===")
forge m be Map()
m.set("name", "Alice")
m.set("age", 30)
m.set("city", "NYC")
speak("Get name:", m.get("name"))
speak("Keys:", m.keys())
speak("Has age:", m.has("age"))
`,
  },
];

const SNIPPETS: Record<string, string> = {
  'hello': 'speak("Hello, World!")\n',
  'forge': 'forge $1 be $2\n',
  'conjure': 'conjure $1($2) ::\n  $3\n;;\n',
  'ponder': 'ponder $1 ::\n  $2\n;;\n',
  'cycle': 'cycle $1 ::\n  $2\n;;\n',
  'within': 'within $1 be $2 ::\n  $3\n;;\n',
  'class': 'essence $1 ::\n  conjure init(self) ::\n    $2\n  ;;\n;;\n',
};

let fileIdCounter = 10;
type BottomPanel = 'terminal' | 'canvas';

const DEFAULT_SETTINGS: IdeSettings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: false,
  theme: 'dark',
  minimap: false,
  lineNumbers: true,
  autoSave: true,
  fontFamily: 'JetBrains Mono',
};

// Load/save to localStorage
const LS_FILES = 'sdev-ide-files';
const LS_ACTIVE = 'sdev-ide-active';
const LS_OPEN = 'sdev-ide-open';
const LS_SETTINGS = 'sdev-ide-settings';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch {
    return fallback;
  }
}

const SUPPORTED_LANGUAGES = [
  { value: 'auto', label: '🌐 Auto-detect' },
  { value: 'Spanish', label: '🇪🇸 Spanish' },
  { value: 'French', label: '🇫🇷 French' },
  { value: 'German', label: '🇩🇪 German' },
  { value: 'Portuguese', label: '🇧🇷 Portuguese' },
  { value: 'Italian', label: '🇮🇹 Italian' },
  { value: 'Dutch', label: '🇳🇱 Dutch' },
  { value: 'Russian', label: '🇷🇺 Russian' },
  { value: 'Chinese', label: '🇨🇳 Chinese' },
  { value: 'Japanese', label: '🇯🇵 Japanese' },
  { value: 'Korean', label: '🇰🇷 Korean' },
  { value: 'Arabic', label: '🇸🇦 Arabic' },
  { value: 'Hindi', label: '🇮🇳 Hindi' },
  { value: 'Turkish', label: '🇹🇷 Turkish' },
  { value: 'Polish', label: '🇵🇱 Polish' },
  { value: 'Swedish', label: '🇸🇪 Swedish' },
  { value: 'Norwegian', label: '🇳🇴 Norwegian' },
  { value: 'Danish', label: '🇩🇰 Danish' },
  { value: 'Finnish', label: '🇫🇮 Finnish' },
  { value: 'Greek', label: '🇬🇷 Greek' },
  { value: 'Hebrew', label: '🇮🇱 Hebrew' },
  { value: 'Ukrainian', label: '🇺🇦 Ukrainian' },
  { value: 'Czech', label: '🇨🇿 Czech' },
  { value: 'Romanian', label: '🇷🇴 Romanian' },
  { value: 'Hungarian', label: '🇭🇺 Hungarian' },
  { value: 'Bulgarian', label: '🇧🇬 Bulgarian' },
  { value: 'English', label: '🇬🇧 English (no translate)' },
];

export default function IDEPage() {
  const navigate = useNavigate();

  // Persistent state
  const [files, setFiles] = useState<IdeFile[]>(() => loadFromStorage(LS_FILES, STARTER_FILES));
  const [activeId, setActiveId] = useState<string>(() => loadFromStorage(LS_ACTIVE, '1'));
  const [openIds, setOpenIds] = useState<string[]>(() => loadFromStorage(LS_OPEN, ['1']));
  const [settings, setSettings] = useState<IdeSettings>(() => loadFromStorage(LS_SETTINGS, DEFAULT_SETTINGS));

  // UI state
  const [sidePanel, setSidePanel] = useState<SidePanel>('explorer');
  const [bottomPanel, setBottomPanel] = useState<BottomPanel>('terminal');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [runMode, setRunMode] = useState<'interpreter' | 'vm'>('interpreter');

  // Translation state
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [translatedContent, setTranslatedContent] = useState<Map<string, string>>(new Map());
  const [showTranslated, setShowTranslated] = useState(false);
  const { isTranslating, lastResult, translate } = useCodeTranslation();

  // Execution state
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [graphicsCommands, setGraphicsCommands] = useState<GraphicsCommand[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Ready');
  const [execTime, setExecTime] = useState<number | null>(null);

  // Cursor position
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [selection, setSelection] = useState(0);

  const canvasRef = useRef<CanvasHandle>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeFile = files.find(f => f.id === activeId);
  const openFiles = openIds.map(id => files.find(f => f.id === id)).filter(Boolean) as IdeFile[];

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(LS_FILES, JSON.stringify(files));
  }, [files]);
  useEffect(() => {
    localStorage.setItem(LS_ACTIVE, JSON.stringify(activeId));
    localStorage.setItem(LS_OPEN, JSON.stringify(openIds));
  }, [activeId, openIds]);
  useEffect(() => {
    localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'p') { e.preventDefault(); setShowCommandPalette(true); }
      if (ctrl && e.key === 'Enter') { e.preventDefault(); runCode(); }
      if (ctrl && e.key === 's') { e.preventDefault(); downloadCurrentFile(); toast.success('File saved!'); }
      if (ctrl && e.key === 'b') { e.preventDefault(); setSidePanel(p => p === 'explorer' ? null : 'explorer'); }
      if (ctrl && e.key === 'f') { e.preventDefault(); setSidePanel(p => p === 'search' ? null : 'search'); }
      if (e.key === 'Escape') { setShowCommandPalette(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeFile]);

  const updateActiveContent = useCallback((content: string) => {
    setFiles(prev => prev.map(f => f.id === activeId ? { ...f, content, modified: true } : f));
    if (settings.autoSave) {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        setFiles(prev => prev.map(f => f.id === activeId ? { ...f, modified: false } : f));
        setStatusMsg('Auto-saved');
        setTimeout(() => setStatusMsg('Ready'), 1500);
      }, 1500);
    }
  }, [activeId, settings.autoSave]);

  const runCode = useCallback(async () => {
    if (!activeFile) return;

    let code = activeFile.content;
    const outputLines: string[] = [];
    const commands: GraphicsCommand[] = [];
    let turtleState: TurtleState = { x: 200, y: 200, angle: -90, penDown: true, color: '#00ff88', width: 2 };
    setIsRunning(true);
    setStatusMsg('Running…');

    // Auto-translate if needed
    const needsTranslation = selectedLanguage !== 'English' &&
      (selectedLanguage !== 'auto' || mightNeedTranslation(code));

    if (needsTranslation) {
      setStatusMsg('Translating…');
      const result = await translate(code, selectedLanguage);
      if (result) {
        // Cache translated version per file
        setTranslatedContent(prev => {
          const next = new Map(prev);
          next.set(activeFile.id + ':' + code.slice(0, 40), result.translated);
          return next;
        });
        code = result.translated;
        if (!result.fromCache) {
          toast.success(`Translated from ${result.detectedLanguage} → English`, {
            description: 'Translation cached for next run',
            duration: 3000,
          });
        }
      } else {
        toast.error('Translation failed — running original code');
      }
    }

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
        env.define('INFINITY', Infinity);
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
      setExecTime(elapsed);
      if (commands.length > 0) {
        setShowCanvas(true);
        setBottomPanel('canvas');
      }
      setStatusMsg(`✓ Done in ${elapsed}ms`);
    } catch (e) {
      setOutput(outputLines);
      const msg = e instanceof SdevError ? e.message : String(e);
      setError(msg);
      setExecTime(null);
      setStatusMsg('✗ Error');
      setBottomPanel('terminal');
    } finally {
      setIsRunning(false);
    }
  }, [activeFile, runMode, selectedLanguage, translate]);

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
    setOpenIds(prev => {
      const next = prev.filter(x => x !== id);
      if (activeId === id && next.length > 0) setActiveId(next[next.length - 1]);
      return next;
    });
  }, [activeId]);

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
    a.href = url; a.download = activeFile.name; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllFiles = () => {
    files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = file.name; a.click();
      URL.revokeObjectURL(url);
    });
    toast.success(`Downloaded ${files.length} files`);
  };

  const downloadElectron = () => {
    const pkg = JSON.stringify({
      name: "sdev-ide", version: "1.0.0",
      description: "sdev IDE – desktop edition",
      main: "main.js",
      scripts: { start: "electron .", build: "electron-builder" },
      dependencies: { electron: "^28.0.0" },
      devDependencies: { "electron-builder": "^24.0.0" },
      build: { appId: "dev.sdev.ide", productName: "sdev IDE", directories: { output: "dist-electron" } }
    }, null, 2);
    const mainJs = `const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
function createWindow() {
  const win = new BrowserWindow({
    width: 1400, height: 900, minWidth: 900, minHeight: 600,
    titleBarStyle: 'hiddenInset', backgroundColor: '#0d0e1a',
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });
  win.loadURL('https://s-dev.lovable.app/ide');
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
}
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });`;
    const readme = `# sdev IDE – Desktop Edition\n\n## Quick Start\n\n1. Install Node.js (https://nodejs.org)\n2. Open terminal here\n3. Run:\n\n\`\`\`bash\nnpm install\nnpm start\n\`\`\`\n\n## Build installer\n\`\`\`bash\nnpm run build\n\`\`\`\n`;
    [{ name: 'package.json', content: pkg }, { name: 'main.js', content: mainJs }, { name: 'README.md', content: readme }]
      .forEach(({ name, content }) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = name; a.click();
        URL.revokeObjectURL(url);
      });
    toast.success('Downloaded Electron wrapper! See README for setup.');
  };

  const uploadFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.sdev,.txt';
    input.multiple = true;
    input.onchange = (e) => {
      const inputEl = e.target as HTMLInputElement;
      Array.from(inputEl.files || []).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const id = String(++fileIdCounter);
          const newFile: IdeFile = { id, name: file.name, content: ev.target?.result as string };
          setFiles(prev => [...prev, newFile]);
          setOpenIds(prev => [...prev, id]);
          setActiveId(id);
          toast.success(`Opened ${file.name}`);
        };
        reader.readAsText(file);
      });
    };
    input.click();
  };

  const resetToDefaults = () => {
    setFiles(STARTER_FILES);
    setActiveId('1');
    setOpenIds(['1']);
    setOutput([]);
    setError(undefined);
    toast.info('Reset to default files');
  };

  const currentContent = activeFile?.content ?? '';
  const currentLines = currentContent.split('\n').length;
  const currentChars = currentContent.length;

  const sidebarIcons = [
    { id: 'explorer' as SidePanel, icon: FolderOpen, label: 'Explorer (Ctrl+B)', shortcut: '⌃B' },
    { id: 'search' as SidePanel, icon: Search, label: 'Search (Ctrl+F)', shortcut: '⌃F' },
    { id: 'settings' as SidePanel, icon: Settings, label: 'Settings', shortcut: '' },
  ];

  return (
    <TooltipProvider delayDuration={400}>
      <div className={`flex flex-col h-screen bg-background overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>

        {/* ── Title / Menu Bar ── */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/40 bg-muted/10 flex-shrink-0 select-none">
          {/* Left */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted/30">
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Back to Playground</TooltipContent>
            </Tooltip>
            <div className="w-px h-4 bg-border/50" />
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-display font-bold text-sm gradient-text hidden sm:block">SDEV IDE</span>
            </div>
            <div className="w-px h-4 bg-border/50" />
            {/* Menu items */}
            <div className="hidden md:flex items-center">
              {/* File Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded transition-all font-mono">File</button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52 bg-card border-border/50">
                  <DropdownMenuItem onClick={newFile} className="text-xs gap-2 cursor-pointer">
                    <Code className="w-3.5 h-3.5" /> New File <span className="ml-auto text-muted-foreground">⌃N</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={uploadFile} className="text-xs gap-2 cursor-pointer">
                    <FolderOpen className="w-3.5 h-3.5" /> Open File…
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={downloadCurrentFile} className="text-xs gap-2 cursor-pointer">
                    <Save className="w-3.5 h-3.5" /> Save <span className="ml-auto text-muted-foreground">⌃S</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadAllFiles} className="text-xs gap-2 cursor-pointer">
                    <Download className="w-3.5 h-3.5" /> Save All Files
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={downloadElectron} className="text-xs gap-2 cursor-pointer">
                    <Download className="w-3.5 h-3.5" /> Download Desktop App
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={resetToDefaults} className="text-xs gap-2 cursor-pointer text-destructive">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset to Defaults
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Edit Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded transition-all font-mono">Edit</button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52 bg-card border-border/50">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Snippets</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.entries(SNIPPETS).map(([name, snippet]) => (
                    <DropdownMenuItem key={name} onClick={() => {
                      if (!activeFile) return;
                      updateActiveContent(activeFile.content + snippet.replace(/\$[0-9]/g, ''));
                      toast.success(`Inserted ${name} snippet`);
                    }} className="text-xs gap-2 cursor-pointer font-mono">
                      {name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded transition-all font-mono">View</button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52 bg-card border-border/50">
                  <DropdownMenuItem onClick={() => setSidePanel(p => p === 'explorer' ? null : 'explorer')} className="text-xs gap-2 cursor-pointer">
                    <FolderOpen className="w-3.5 h-3.5" /> Explorer <span className="ml-auto text-muted-foreground">⌃B</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSidePanel(p => p === 'search' ? null : 'search')} className="text-xs gap-2 cursor-pointer">
                    <Search className="w-3.5 h-3.5" /> Search <span className="ml-auto text-muted-foreground">⌃F</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setBottomPanel('terminal')} className="text-xs gap-2 cursor-pointer">
                    <Terminal className="w-3.5 h-3.5" /> Terminal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setBottomPanel('canvas'); setShowCanvas(true); }} className="text-xs gap-2 cursor-pointer">
                    <Palette className="w-3.5 h-3.5" /> Canvas
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsFullscreen(f => !f)} className="text-xs gap-2 cursor-pointer">
                    {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Run Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded transition-all font-mono">Run</button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52 bg-card border-border/50">
                  <DropdownMenuItem onClick={runCode} className="text-xs gap-2 cursor-pointer">
                    <Play className="w-3.5 h-3.5 text-neon-green" /> Run Program <span className="ml-auto text-muted-foreground">⌃↵</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setRunMode('interpreter')} className="text-xs gap-2 cursor-pointer">
                    <Zap className="w-3.5 h-3.5 text-neon-cyan" /> Tree-walk Interpreter {runMode === 'interpreter' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRunMode('vm')} className="text-xs gap-2 cursor-pointer">
                    <Cpu className="w-3.5 h-3.5 text-neon-violet" /> Bytecode VM {runMode === 'vm' && '✓'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Help Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded transition-all font-mono">Help</button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52 bg-card border-border/50">
                  <DropdownMenuItem onClick={() => window.open('/SDEV_DOCUMENTATION.md', '_blank')} className="text-xs gap-2 cursor-pointer">
                    <BookOpen className="w-3.5 h-3.5" /> Documentation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowCommandPalette(true)} className="text-xs gap-2 cursor-pointer">
                    <Command className="w-3.5 h-3.5" /> Command Palette <span className="ml-auto text-muted-foreground">⌃P</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Keyboard Shortcuts</DropdownMenuLabel>
                  <div className="px-2 py-1 text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between"><span>Run code</span><kbd className="font-mono">⌃↵</kbd></div>
                    <div className="flex justify-between"><span>Save file</span><kbd className="font-mono">⌃S</kbd></div>
                    <div className="flex justify-between"><span>Command palette</span><kbd className="font-mono">⌃P</kbd></div>
                    <div className="flex justify-between"><span>Toggle explorer</span><kbd className="font-mono">⌃B</kbd></div>
                    <div className="flex justify-between"><span>Toggle search</span><kbd className="font-mono">⌃F</kbd></div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Right: quick actions */}
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowCommandPalette(true)}>
                  <Command className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Command Palette (Ctrl+P)</TooltipContent>
            </Tooltip>

            {/* Language selector */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 border border-border/40 rounded-md px-1.5 h-7 bg-background/20">
                  <Languages className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="h-5 w-[90px] border-0 bg-transparent text-xs p-0 focus:ring-0 font-mono text-muted-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border/50 max-h-64">
                      {SUPPORTED_LANGUAGES.map(lang => (
                        <SelectItem key={lang.value} value={lang.value} className="text-xs font-mono cursor-pointer">
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <div className="font-semibold mb-1">Code Language</div>
                  <div>Write sdev in your language.</div>
                  <div>AI translates to English on first run,</div>
                  <div>then caches for instant future runs.</div>
                  {lastResult && <div className="mt-1 text-primary">Last: {lastResult.detectedLanguage} {lastResult.fromCache ? '(cached ⚡)' : '(translated ✨)'}</div>}
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Show translated source toggle */}
            {lastResult && lastResult.detectedLanguage !== 'English' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                    onClick={() => setShowTranslated(v => !v)}
                  >
                    {showTranslated ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showTranslated ? 'Show original code' : 'Show English translation'}</TooltipContent>
              </Tooltip>
            )}

            <div className="flex items-center gap-1 border border-border/40 rounded-md overflow-hidden">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setRunMode('interpreter')}
                    className={`px-2 py-1 text-xs font-mono transition-all ${runMode === 'interpreter' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'}`}
                  >
                    <Zap className="w-3 h-3 inline mr-1" />Interp
                  </button>
                </TooltipTrigger>
                <TooltipContent>Tree-walk Interpreter</TooltipContent>
              </Tooltip>
              <div className="w-px h-4 bg-border/40" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setRunMode('vm')}
                    className={`px-2 py-1 text-xs font-mono transition-all ${runMode === 'vm' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'}`}
                  >
                    <Cpu className="w-3 h-3 inline mr-1" />VM
                  </button>
                </TooltipTrigger>
                <TooltipContent>Bytecode VM</TooltipContent>
              </Tooltip>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={downloadCurrentFile} className="gap-1.5 text-xs border-border/50 h-7">
                  <Save className="w-3 h-3" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save file (Ctrl+S)</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 text-xs border-border/50 h-7 px-2">
                      <Download className="w-3 h-3" />
                      <ChevronDown className="w-2.5 h-2.5 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Downloads</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-52 bg-card border-border/50">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Downloads</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={downloadCurrentFile} className="gap-2 text-xs cursor-pointer">
                  <Save className="w-3.5 h-3.5 text-neon-cyan" /> Current file (.sdev)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadAllFiles} className="gap-2 text-xs cursor-pointer">
                  <Download className="w-3.5 h-3.5 text-neon-green" /> All files
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={downloadElectron} className="gap-2 text-xs cursor-pointer">
                  <Bug className="w-3.5 h-3.5 text-neon-violet" />
                  <div>
                    <div className="font-medium">Electron Desktop App</div>
                    <div className="text-muted-foreground text-[10px]">Windows / Mac / Linux</div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="sm"
              onClick={runCode}
              disabled={isRunning || isTranslating}
              className="gap-1.5 bg-gradient-to-r from-neon-cyan to-neon-violet border-0 text-primary-foreground font-semibold h-7 text-xs min-w-[64px]"
            >
              {isTranslating ? (
                <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Translating</span>
              ) : isRunning ? (
                <span className="flex items-center gap-1"><span className="animate-spin">⟳</span> Running</span>
              ) : (
                <><Play className="w-3 h-3" /> Run</>
              )}
            </Button>
          </div>
        </div>

        {/* ── Activity Bar + Main Body ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Activity Bar */}
          <div className="w-10 flex-shrink-0 flex flex-col items-center py-2 gap-1 border-r border-border/40 bg-background/30">
            {sidebarIcons.map(({ id, icon: Icon, label }) => (
              <Tooltip key={id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSidePanel(p => p === id ? null : id)}
                    className={`w-8 h-8 flex items-center justify-center rounded transition-all ${
                      sidePanel === id ? 'text-foreground border-l-2 border-primary bg-muted/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/20 border-l-2 border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            ))}
            <div className="flex-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsFullscreen(f => !f)}
                  className="w-8 h-8 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-all"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</TooltipContent>
            </Tooltip>
          </div>

          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* Sidebar panel */}
            {sidePanel && (
              <>
                <ResizablePanel defaultSize={18} minSize={12} maxSize={35} className="flex flex-col border-r border-border/40 bg-background/20">
                  {sidePanel === 'explorer' && (
                    <IdeFileTree
                      files={files}
                      activeId={activeId}
                      onSelect={selectFile}
                      onNew={newFile}
                      onDelete={deleteFile}
                      onRename={renameFile}
                      onUpload={uploadFile}
                    />
                  )}
                  {sidePanel === 'search' && (
                    <IdeSearchPanel
                      files={files}
                      onSelectFile={selectFile}
                    />
                  )}
                  {sidePanel === 'settings' && (
                    <IdeSettingsPanel settings={settings} onChange={setSettings} />
                  )}
                </ResizablePanel>
                <ResizableHandle withHandle />
              </>
            )}

            {/* Editor + Terminal */}
            <ResizablePanel defaultSize={sidePanel ? 82 : 100} className="flex flex-col">
              <ResizablePanelGroup direction="vertical">
                {/* Editor */}
                <ResizablePanel defaultSize={65} minSize={25}>
                  <div className="flex flex-col h-full">
                    <IdeTabs files={openFiles} activeId={activeId} onSelect={selectFile} onClose={closeTab} />
                    {/* Translation banner */}
                    {lastResult && lastResult.detectedLanguage !== 'English' && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border-b border-primary/20 text-xs font-mono">
                        <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                        <span className="text-primary">
                          {lastResult.fromCache ? '⚡ Cached translation' : '✨ Translated'} from <strong>{lastResult.detectedLanguage}</strong> → English
                        </span>
                        <button
                          onClick={() => setShowTranslated(v => !v)}
                          className="ml-auto flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showTranslated ? <><EyeOff className="w-3 h-3" /> Show original</> : <><Eye className="w-3 h-3" /> View English</>}
                        </button>
                      </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                      {activeFile ? (
                        showTranslated && lastResult ? (
                          <div className="flex flex-col h-full">
                            <div className="px-3 py-1 text-[10px] font-mono text-muted-foreground bg-muted/10 border-b border-border/30 flex items-center gap-2">
                              <Eye className="w-3 h-3" />
                              English translation (read-only) — edit your original to make changes
                            </div>
                            <IdeEditor
                              key={activeFile.id + '-translated'}
                              value={lastResult.translated}
                              onChange={() => {}}
                              fileName={activeFile.name}
                              settings={settings}
                            />
                          </div>
                        ) : (
                          <IdeEditor
                            key={activeFile.id}
                            value={activeFile.content}
                            onChange={updateActiveContent}
                            onRun={runCode}
                            fileName={activeFile.name}
                            settings={settings}
                            onCursorChange={setCursor}
                            onSelectionChange={setSelection}
                          />
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 gap-4">
                          <SplitSquareHorizontal className="w-12 h-12 opacity-20" />
                          <div className="text-sm font-mono text-center">
                            <div>No file open</div>
                            <div className="text-xs mt-1">Select a file from the Explorer or create a new one</div>
                          </div>
                          <Button variant="outline" size="sm" onClick={newFile} className="text-xs gap-2">
                            <Code className="w-3.5 h-3.5" /> New File
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Bottom panel */}
                <ResizablePanel defaultSize={35} minSize={15} maxSize={65}>
                  {/* Panel tabs */}
                  <div className="flex items-center border-b border-border/40 bg-muted/10 flex-shrink-0">
                    <button
                      onClick={() => setBottomPanel('terminal')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border-b-2 transition-all ${bottomPanel === 'terminal' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                      <Terminal className="w-3 h-3" /> OUTPUT
                      {error && <span className="w-1.5 h-1.5 rounded-full bg-destructive ml-1" />}
                    </button>
                    {showCanvas && (
                      <button
                        onClick={() => setBottomPanel('canvas')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border-b-2 transition-all ${bottomPanel === 'canvas' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                      >
                        <Palette className="w-3 h-3" /> CANVAS
                      </button>
                    )}
                    <div className="flex-1" />
                    {showCanvas && (
                      <button onClick={() => setShowCanvas(false)} className="p-1 mr-1 text-muted-foreground hover:text-foreground transition-colors rounded">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {bottomPanel === 'terminal' && (
                    <IdeTerminal
                      lines={output}
                      error={error}
                      execTime={execTime}
                      onClear={() => { setOutput([]); setError(undefined); setExecTime(null); }}
                    />
                  )}
                  {bottomPanel === 'canvas' && showCanvas && (
                    <div className="h-full overflow-auto p-2 bg-background/30">
                      <CanvasPanel ref={canvasRef} commands={graphicsCommands} onClose={() => setShowCanvas(false)} />
                    </div>
                  )}
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* ── Status Bar ── */}
        <IdeStatusBar
          statusMsg={statusMsg}
          runMode={runMode}
          activeFile={activeFile}
          lines={currentLines}
          chars={currentChars}
          cursor={cursor}
          selection={selection}
          execTime={execTime}
          error={!!error}
        />

        {/* Command Palette */}
        {showCommandPalette && (
          <IdeCommandPalette
            files={files}
            onClose={() => setShowCommandPalette(false)}
            onSelectFile={(id) => { selectFile(id); setShowCommandPalette(false); }}
            onNewFile={() => { newFile(); setShowCommandPalette(false); }}
            onRun={() => { runCode(); setShowCommandPalette(false); }}
            onTogglePanel={(panel) => { setSidePanel(p => p === panel ? null : panel); setShowCommandPalette(false); }}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
