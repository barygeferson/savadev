import { Zap, Cpu, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import type { IdeFile, RunMode } from './types';

interface Props {
  statusMsg: string;
  runMode: RunMode;
  activeFile?: IdeFile;
  lines: number;
  chars: number;
  cursor: { line: number; col: number };
  selection: number;
  execTime: number | null;
  error: boolean;
}

export function IdeStatusBar({ statusMsg, runMode, activeFile, lines, chars, cursor, selection, execTime, error }: Props) {
  return (
    <div className="flex items-center justify-between px-3 py-0.5 border-t border-border/40 bg-primary/5 flex-shrink-0 text-[11px] font-mono select-none">
      <div className="flex items-center gap-3 text-muted-foreground">
        <span className={`flex items-center gap-1 font-medium ${error ? 'text-destructive' : 'text-neon-green'}`}>
          {error
            ? <><AlertTriangle className="w-3 h-3" /> {statusMsg}</>
            : <><CheckCircle2 className="w-3 h-3" /> {statusMsg}</>
          }
        </span>
        <span className="flex items-center gap-1">
          {runMode === 'interpreter'
            ? <><Zap className="w-3 h-3 text-neon-cyan" /> Interpreter</>
            : <><Cpu className="w-3 h-3 text-neon-violet" /> Bytecode VM</>
          }
        </span>
        {execTime !== null && (
          <span className="flex items-center gap-1 text-muted-foreground/70">
            <Clock className="w-3 h-3" /> {execTime}ms
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 text-muted-foreground">
        {activeFile && (
          <>
            {selection > 0 && <span className="text-primary">{selection} selected</span>}
            <span>Ln {cursor.line}, Col {cursor.col}</span>
            <span>{lines} lines</span>
            <span>{chars} chars</span>
            <span className="text-primary/80">sdev</span>
          </>
        )}
        <span className="text-neon-green animate-pulse">● Online</span>
      </div>
    </div>
  );
}
