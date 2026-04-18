import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileCode, Terminal, Monitor, BookOpen, Code2, ChevronDown, Puzzle } from 'lucide-react';
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
    const batchScript = `@echo off
title sdev Language Installer
color 0A
echo.
echo  ========================================
echo     sdev Programming Language Installer
echo  ========================================
echo.
echo  Installing sdev to C:\\sdev...
echo.

if not exist "C:\\sdev" mkdir "C:\\sdev"
if not exist "C:\\sdev\\bin" mkdir "C:\\sdev\\bin"

echo  Creating example file...
(
echo // Welcome to sdev!
echo forge message be "Hello from sdev!"
echo speak^(message^)
echo.
echo // Download interpreter from: https://sdev-lang.dev
) > "C:\\sdev\\example.sdev"

echo.
echo  ========================================
echo     Installation Complete!
echo  ========================================
echo.
echo  Download the Python or JavaScript interpreter from:
echo    https://sdev-lang.dev/downloads
echo.
echo  Press any key to open sdev folder...
pause >nul
explorer "C:\\sdev"
`;

    const blob = new Blob([batchScript], { type: 'application/bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sdev-installer.bat';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded Windows installer');
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
    window.open('/SDEV_DOCUMENTATION.md', '_blank');
    toast.success('Opening documentation');
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
            <div className="font-medium">Documentation</div>
            <div className="text-xs text-muted-foreground">Complete reference guide</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
