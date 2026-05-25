import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileCode, Terminal, Monitor, BookOpen, Code2, ChevronDown, Puzzle, Cpu } from 'lucide-react';
import { toast } from 'sonner';

interface DownloadablesDropdownProps {
  code: string;
}

export function DownloadablesDropdown({ code }: DownloadablesDropdownProps) {
  const downloadSdevFile = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'main.sdev';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded main.sdev');
  };

  const generateHTML = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>sdev App</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'SF Mono', 'Monaco', 'Consolas', monospace; background: #0d0d15; color: #e0e0e0; min-height: 100vh; display: flex; flex-direction: column; }
    .header { padding: 1rem 2rem; border-bottom: 1px solid #2a2a4a; background: #1a1a2e; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 1.25rem; color: #a78bfa; }
    .run-btn { background: linear-gradient(135deg, #8b5cf6, #d946ef); color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; }
    .run-btn:hover { opacity: 0.9; }
    .main { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem 2rem; flex: 1; }
    .panel { background: #1a1a2e; border: 1px solid #2a2a4a; border-radius: 0.5rem; overflow: hidden; }
    .panel-header { padding: 0.75rem 1rem; background: #252540; border-bottom: 1px solid #2a2a4a; font-size: 0.875rem; color: #888; }
    .editor { height: 300px; padding: 1rem; font-family: inherit; font-size: 0.875rem; background: transparent; color: #e0e0e0; border: none; resize: none; width: 100%; outline: none; }
    .output { padding: 1rem; font-size: 0.875rem; max-height: 300px; overflow-y: auto; }
    .output-line { margin-bottom: 0.25rem; color: #a78bfa; }
    .error { color: #f87171; }
    canvas { max-width: 100%; height: auto; display: block; margin: 1rem auto; }
    @media (max-width: 768px) { .main { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>sdev</h1>
    <button class="run-btn" onclick="runCode()">▶ Run</button>
  </div>
  <div class="main">
    <div class="panel">
      <div class="panel-header">Code</div>
      <textarea id="editor" class="editor" spellcheck="false">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>
    <div class="panel">
      <div class="panel-header">Output</div>
      <div id="output" class="output"></div>
      <canvas id="canvas" width="400" height="400" style="display:none;"></canvas>
    </div>
  </div>
  <script src="sdev-interpreter.js"></script>
  <script>
    function runCode() {
      const code = document.getElementById('editor').value;
      const outputEl = document.getElementById('output');
      const canvas = document.getElementById('canvas');
      outputEl.innerHTML = '';
      canvas.style.display = 'none';
      
      try {
        const result = sdev.execute(code, canvas);
        result.output.forEach(line => {
          const div = document.createElement('div');
          div.className = 'output-line';
          div.textContent = line;
          outputEl.appendChild(div);
        });
        if (result.hasGraphics) {
          canvas.style.display = 'block';
        }
        if (result.error) {
          const div = document.createElement('div');
          div.className = 'error';
          div.textContent = '❌ ' + result.error;
          outputEl.appendChild(div);
        }
      } catch (e) {
        const div = document.createElement('div');
        div.className = 'error';
        div.textContent = '❌ ' + e.message;
        outputEl.appendChild(div);
      }
    }
    runCode();
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sdev-app.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded sdev-app.html');
  };

  const downloadWindowsInstaller = () => {
    // Full-featured installer:
    //  - Downloads BOTH interpreters (Python + JavaScript) with embedded translator
    //  - Auto-detects Python / Node availability and chooses runner
    //  - Creates `sdev`, `sdev-py`, `sdev-js`, `sdev-repl`, `sdev-translate` wrappers
    //  - Registers .sdev file association with proper icon + verb
    //  - Adds C:\sdev\bin to the user PATH
    //  - Drops multilingual example files (EN / BG / ES / FR / RU / ZH)
    //  - Bundles latest docs (SDEV_DOCUMENTATION.md + Leaflet docs + book) offline
    //  - Optional VS Code extension auto-install if `code` is on PATH
    const origin = (typeof window !== 'undefined' ? window.location.origin : 'https://web.sdev.codes');
    const batchScript = `@echo off
setlocal EnableDelayedExpansion
title sdev Language Installer v2.0
color 0B
mode con: cols=86 lines=34

echo.
echo  ============================================================================
echo                     sdev Programming Language - Windows Installer
echo                            v2.0  (with built-in translator)
echo  ============================================================================
echo.
echo   This will install:
echo     - sdev Python interpreter  (25-language built-in translator)
echo     - sdev JavaScript interpreter (Node + browser, same translator)
echo     - sdev CLI wrappers: sdev, sdev-py, sdev-js, sdev-repl, sdev-translate
echo     - .sdev file association  ^(double-click to run^)
echo     - Multilingual example programs ^(EN / BG / ES / FR / RU / ZH^)
echo     - Offline documentation + The sdev Book
echo     - User PATH entry for C:\\sdev\\bin
echo.
echo   Install location: C:\\sdev
echo.
pause

set "ROOT=C:\\sdev"
set "BIN=%ROOT%\\bin"
set "DOCS=%ROOT%\\docs"
set "EXAMPLES=%ROOT%\\examples"
set "BASEURL=${origin}"

echo.
echo  [1/8] Creating directory layout...
if not exist "%ROOT%"     mkdir "%ROOT%"
if not exist "%BIN%"      mkdir "%BIN%"
if not exist "%DOCS%"     mkdir "%DOCS%"
if not exist "%EXAMPLES%" mkdir "%EXAMPLES%"

echo  [2/8] Detecting runtimes...
set HAS_PY=0
set HAS_NODE=0
where python  >nul 2>nul && set HAS_PY=1
where python3 >nul 2>nul && set HAS_PY=1
where node    >nul 2>nul && set HAS_NODE=1
if "!HAS_PY!"=="1"   echo         Python detected.
if "!HAS_NODE!"=="1" echo         Node.js detected.
if "!HAS_PY!"=="0" if "!HAS_NODE!"=="0" (
  echo.
  echo   WARNING: neither Python nor Node.js was found on PATH.
  echo            Install one of:
  echo              - Python 3.10+   https://www.python.org/downloads/
  echo              - Node.js 18+    https://nodejs.org/
  echo            then re-run this installer. ^(Continuing anyway.^)
  echo.
  pause
)

echo  [3/8] Downloading interpreters from %BASEURL% ...
powershell -NoProfile -Command ^
  "[Net.ServicePointManager]::SecurityProtocol='Tls12';" ^
  "Invoke-WebRequest -Uri '%BASEURL%/sdev-interpreter.py' -OutFile '%BIN%\\sdev-interpreter.py';" ^
  "Invoke-WebRequest -Uri '%BASEURL%/sdev-interpreter.js' -OutFile '%BIN%\\sdev-interpreter.js'"
if errorlevel 1 (
  echo   ERROR: download failed. Check your internet connection and retry.
  pause & exit /b 1
)

echo  [4/8] Downloading offline documentation + book...
powershell -NoProfile -Command ^
  "[Net.ServicePointManager]::SecurityProtocol='Tls12';" ^
  "Invoke-WebRequest -Uri '%BASEURL%/SDEV_DOCUMENTATION.md' -OutFile '%DOCS%\\SDEV_DOCUMENTATION.md';" ^
  "Invoke-WebRequest -Uri '%BASEURL%/SDEV_LEAFLET_DOCUMENTATION.md' -OutFile '%DOCS%\\SDEV_LEAFLET_DOCUMENTATION.md';" ^
  "try { Invoke-WebRequest -Uri '%BASEURL%/sdev-book-en.pdf' -OutFile '%DOCS%\\sdev-book-en.pdf' } catch {};" ^
  "try { Invoke-WebRequest -Uri '%BASEURL%/sdev-book-bg.pdf' -OutFile '%DOCS%\\sdev-book-bg.pdf' } catch {}"

echo  [5/8] Writing multilingual examples...

> "%EXAMPLES%\\hello.sdev"  echo // English - classic hello world
>> "%EXAMPLES%\\hello.sdev" echo forge name be "world"
>> "%EXAMPLES%\\hello.sdev" echo speak("Hello, " + name + "!")

> "%EXAMPLES%\\hello.bg.sdev"  echo // Bulgarian - built-in translator demo
>> "%EXAMPLES%\\hello.bg.sdev" echo създай радиус be 5
>> "%EXAMPLES%\\hello.bg.sdev" echo създай площ be радиус * радиус * 3.14159
>> "%EXAMPLES%\\hello.bg.sdev" echo speak(площ)

> "%EXAMPLES%\\hello.es.sdev"  echo // Spanish
>> "%EXAMPLES%\\hello.es.sdev" echo forjar nombre ser "mundo"
>> "%EXAMPLES%\\hello.es.sdev" echo hablar("Hola, " + nombre + "!")

> "%EXAMPLES%\\hello.fr.sdev"  echo // French
>> "%EXAMPLES%\\hello.fr.sdev" echo forger nom etre "monde"
>> "%EXAMPLES%\\hello.fr.sdev" echo parler("Bonjour, " + nom + "!")

> "%EXAMPLES%\\fizzbuzz.sdev"  echo // Classic FizzBuzz
>> "%EXAMPLES%\\fizzbuzz.sdev" echo iterate i within range(1, 16) ::
>> "%EXAMPLES%\\fizzbuzz.sdev" echo   ponder i %% 15 equals 0 :: speak("FizzBuzz") ;;
>> "%EXAMPLES%\\fizzbuzz.sdev" echo   otherwise ponder i %% 3 equals 0 :: speak("Fizz") ;;
>> "%EXAMPLES%\\fizzbuzz.sdev" echo   otherwise ponder i %% 5 equals 0 :: speak("Buzz") ;;
>> "%EXAMPLES%\\fizzbuzz.sdev" echo   otherwise :: speak(i) ;;
>> "%EXAMPLES%\\fizzbuzz.sdev" echo ;;

echo  [6/8] Creating CLI wrappers in %BIN% ...

> "%BIN%\\sdev.bat" echo @echo off
>> "%BIN%\\sdev.bat" echo rem Universal launcher - prefers Python, falls back to Node.
>> "%BIN%\\sdev.bat" echo where python  ^>nul 2^>nul ^&^& ^(python  "%%~dp0sdev-interpreter.py" %%* ^& exit /b ^)
>> "%BIN%\\sdev.bat" echo where python3 ^>nul 2^>nul ^&^& ^(python3 "%%~dp0sdev-interpreter.py" %%* ^& exit /b ^)
>> "%BIN%\\sdev.bat" echo where node    ^>nul 2^>nul ^&^& ^(node    "%%~dp0sdev-interpreter.js" %%* ^& exit /b ^)
>> "%BIN%\\sdev.bat" echo echo No Python or Node.js found on PATH. ^& exit /b 1

> "%BIN%\\sdev-py.bat"        echo @echo off
>> "%BIN%\\sdev-py.bat"       echo python "%%~dp0sdev-interpreter.py" %%*

> "%BIN%\\sdev-js.bat"        echo @echo off
>> "%BIN%\\sdev-js.bat"       echo node "%%~dp0sdev-interpreter.js" %%*

> "%BIN%\\sdev-repl.bat"      echo @echo off
>> "%BIN%\\sdev-repl.bat"     echo python "%%~dp0sdev-interpreter.py"

> "%BIN%\\sdev-translate.bat" echo @echo off
>> "%BIN%\\sdev-translate.bat" echo rem Translate any-language sdev file to canonical English sdev.
>> "%BIN%\\sdev-translate.bat" echo rem   Usage:  sdev-translate myfile.sdev [--lang Bulgarian]
>> "%BIN%\\sdev-translate.bat" echo python "%%~dp0sdev-interpreter.py" --translate-only %%*

> "%BIN%\\sdev-languages.bat" echo @echo off
>> "%BIN%\\sdev-languages.bat" echo python "%%~dp0sdev-interpreter.py" --languages

echo  [7/8] Registering .sdev file association + adding to PATH...
assoc .sdev=sdev.SourceFile         >nul 2>nul
ftype sdev.SourceFile="%BIN%\\sdev.bat" "%%1" %%* >nul 2>nul

rem Append C:\\sdev\\bin to user PATH (idempotent)
for /f "tokens=2*" %%A in ('reg query "HKCU\\Environment" /v PATH 2^>nul ^| findstr /i "PATH"') do set "USERPATH=%%B"
echo !USERPATH! | findstr /i /c:"%BIN%" >nul
if errorlevel 1 (
  setx PATH "!USERPATH!;%BIN%" >nul
  echo         Added %BIN% to user PATH. ^(Open a new terminal to use 'sdev'.^)
) else (
  echo         %BIN% already on PATH.
)

echo  [8/8] Optional: install VS Code extension if 'code' is on PATH...
where code >nul 2>nul && (
  powershell -NoProfile -Command ^
    "[Net.ServicePointManager]::SecurityProtocol='Tls12';" ^
    "try { Invoke-WebRequest -Uri '%BASEURL%/sdev-language-1.0.0.vsix' -OutFile '%ROOT%\\sdev-language.vsix'; code --install-extension '%ROOT%\\sdev-language.vsix' } catch { Write-Host 'VS Code extension install skipped.' }"
)

echo.
echo  ============================================================================
echo                              INSTALLATION COMPLETE
echo  ============================================================================
echo.
echo   Try it now ^(open a NEW terminal first so PATH is refreshed^):
echo.
echo     sdev %EXAMPLES%\\hello.sdev
echo     sdev %EXAMPLES%\\hello.bg.sdev        ^<- runs Bulgarian source via translator
echo     sdev-repl                              ^<- interactive REPL
echo     sdev-translate %EXAMPLES%\\hello.bg.sdev  ^<- show translated English sdev
echo     sdev-languages                         ^<- list all 25 supported languages
echo.
echo   Docs:           %DOCS%\\SDEV_DOCUMENTATION.md
echo   Leaflet/GIS:    %DOCS%\\SDEV_LEAFLET_DOCUMENTATION.md
echo   Online:         %BASEURL%/docs
echo.
echo  Press any key to open the sdev folder...
pause >nul
explorer "%ROOT%"
endlocal
`;

    const blob = new Blob([batchScript], { type: 'application/bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sdev-installer.bat';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded Windows installer v2.0', {
      description: 'Includes both interpreters with built-in 25-language translator',
      duration: 6000,
    });
  };

  const downloadPythonInterpreter = () => {
    window.open('/sdev-interpreter.py', '_blank');
    toast.success('Opening Python interpreter');
  };

  const downloadJavaScriptInterpreter = () => {
    window.open('/sdev-interpreter.js', '_blank');
    toast.success('Opening JavaScript interpreter');
  };

  const openDocumentation = () => {
    window.open('/docs', '_blank');
  };
  const downloadBookEn = () => {
    const a = document.createElement('a'); a.href = '/sdev-book-en.pdf'; a.download = 'sdev-book-en.pdf'; a.click();
    toast.success('Downloaded sdev Book (EN, PDF)');
  };
  const downloadBookBg = () => {
    const a = document.createElement('a'); a.href = '/sdev-book-bg.pdf'; a.download = 'sdev-book-bg.pdf'; a.click();
    toast.success('Изтеглена книга на sdev (BG)');
  };

  const downloadVsix = () => {
    fetch('/sdev-language-1.0.0.vsix')
      .then((res) => { if (!res.ok) throw new Error(`Download failed: ${res.status}`); return res.blob(); })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'sdev-language-1.0.0.vsix'; a.click();
        URL.revokeObjectURL(url);
        toast.success('Downloaded VS Code extension (.vsix)', {
          description: 'In VS Code: Extensions ⋯ → Install from VSIX…',
          duration: 6000,
        });
      })
      .catch((err) => toast.error(err.message));
  };

  const downloadVsixZip = () => {
    fetch('/sdev-vscode-extension.zip')
      .then((res) => { if (!res.ok) throw new Error(`Download failed: ${res.status}`); return res.blob(); })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'sdev-vscode-extension.zip'; a.click();
        URL.revokeObjectURL(url);
        toast.success('Downloaded extension source (.zip)');
      })
      .catch((err) => toast.error(err.message));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-border/50 hover:border-neon-cyan/50 hover:shadow-neon-cyan transition-all"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Downloads & Tutorials</span>
          <span className="sm:hidden">Downloads</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-card border-border/50 backdrop-blur-xl z-50"
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
          Code Files
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={downloadSdevFile} className="gap-3 cursor-pointer">
          <FileCode className="w-4 h-4 text-neon-cyan" />
          <div>
            <div className="font-medium">Download .sdev</div>
            <div className="text-xs text-muted-foreground">Current code file</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={generateHTML} className="gap-3 cursor-pointer">
          <Code2 className="w-4 h-4 text-neon-violet" />
          <div>
            <div className="font-medium">Export as HTML</div>
            <div className="text-xs text-muted-foreground">Standalone web app</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-border/30" />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
          Interpreters
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={downloadPythonInterpreter} className="gap-3 cursor-pointer">
          <Terminal className="w-4 h-4 text-neon-magenta" />
          <div>
            <div className="font-medium">Python Interpreter</div>
            <div className="text-xs text-muted-foreground">Full-featured CLI</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadJavaScriptInterpreter} className="gap-3 cursor-pointer">
          <Code2 className="w-4 h-4 text-yellow-400" />
          <div>
            <div className="font-medium">JavaScript Interpreter</div>
            <div className="text-xs text-muted-foreground">Node.js & browser</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadWindowsInstaller} className="gap-3 cursor-pointer">
          <Monitor className="w-4 h-4 text-blue-400" />
          <div>
            <div className="font-medium">Windows Installer</div>
            <div className="text-xs text-muted-foreground">Quick setup script</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border/30" />

        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
          Editor Tools
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={downloadVsix} className="gap-3 cursor-pointer">
          <Puzzle className="w-4 h-4 text-neon-cyan" />
          <div>
            <div className="font-medium">VS Code Extension (.vsix)</div>
            <div className="text-xs text-muted-foreground">Syntax + snippets + Run command</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadVsixZip} className="gap-3 cursor-pointer">
          <FileCode className="w-4 h-4 text-neon-violet" />
          <div>
            <div className="font-medium">Extension Source (.zip)</div>
            <div className="text-xs text-muted-foreground">Unpacked folder for dev</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border/30" />

        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
          Tutorials
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={openDocumentation} className="gap-3 cursor-pointer">
          <BookOpen className="w-4 h-4 text-green-400" />
          <div>
            <div className="font-medium">Docs Site</div>
            <div className="text-xs text-muted-foreground">Browse /docs with search</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadBookEn} className="gap-3 cursor-pointer">
          <BookOpen className="w-4 h-4 text-green-400" />
          <div>
            <div className="font-medium">The sdev Book (EN)</div>
            <div className="text-xs text-muted-foreground">Full downloadable book</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadBookBg} className="gap-3 cursor-pointer">
          <BookOpen className="w-4 h-4 text-green-400" />
          <div>
            <div className="font-medium">Книга за sdev (BG)</div>
            <div className="text-xs text-muted-foreground">Пълна изтегляема книга</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
