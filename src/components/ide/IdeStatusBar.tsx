import { Zap, Cpu, AlertTriangle, CheckCircle2, Clock, GitBranch, Wifi } from 'lucide-react';
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
    <div className={`flex items-center justify-between h-6 pl-0 pr-0 border-t border-border/40 flex-shrink-0 text-[11px] font-mono select-none ${error ? 'bg-destructive/90 text-destructive-foreground' : 'bg-primary/90 text-primary-foreground'}`}>
      {/* Left segments */}
      <div className="flex items-center h-full">
        <span className="flex items-center gap-1.5 px-3 h-full hover:bg-black/15 cursor-default">
          <GitBranch className="w-3 h-3" />
          main
        </span>
        <span className="flex items-center gap-1.5 px-3 h-full hover:bg-black/15 cursor-default">
          {error
            ? <><AlertTriangle className="w-3 h-3" /> {statusMsg}</>
            : <><CheckCircle2 className="w-3 h-3" /> {statusMsg}</>
          }
        </span>
        <span className="flex items-center gap-1.5 px-3 h-full hover:bg-black/15 cursor-default">
          {runMode === 'interpreter'
            ? <><Zap className="w-3 h-3" /> Interpreter</>
            : <><Cpu className="w-3 h-3" /> Bytecode VM</>
          }
        </span>
        {execTime !== null && (
          <span className="flex items-center gap-1.5 px-3 h-full hover:bg-black/15 cursor-default">
            <Clock className="w-3 h-3" /> {execTime}ms
          </span>
        )}
      </div>

      {/* Right segments */}
      <div className="flex items-center h-full">
        {activeFile && (
          <>
            {selection > 0 && <span className="px-3 h-full flex items-center hover:bg-black/15">{selection} sel</span>}
            <span className="px-3 h-full flex items-center hover:bg-black/15">Ln {cursor.line}, Col {cursor.col}</span>
            <span className="px-3 h-full flex items-center hover:bg-black/15">{lines} L · {chars} ch</span>
            <span className="px-3 h-full flex items-center hover:bg-black/15">UTF-8</span>
            <span className="px-3 h-full flex items-center hover:bg-black/15">LF</span>
            <span className="px-3 h-full flex items-center hover:bg-black/15 font-semibold">sdev</span>
          </>
        )}
        <span className="flex items-center gap-1.5 px-3 h-full hover:bg-black/15">
          <Wifi className="w-3 h-3" /> Online
        </span>
      </div>
    </div>
  );
}
