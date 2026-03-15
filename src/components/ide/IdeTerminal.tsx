import { useEffect, useRef } from 'react';
import { Terminal, AlertTriangle, CheckCircle2, Trash2, Clock, ChevronRight } from 'lucide-react';

interface Props {
  lines: string[];
  error?: string;
  execTime?: number | null;
  onClear: () => void;
}

export function IdeTerminal({ lines, error, execTime, onClear }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasOutput = lines.length > 0 || error;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines, error]);

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-border/30 bg-muted/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          {hasOutput && !error && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-neon-green/70">
              <CheckCircle2 className="w-2.5 h-2.5" />
              {lines.length} line{lines.length !== 1 ? 's' : ''} of output
            </span>
          )}
          {error && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-destructive/80">
              <AlertTriangle className="w-2.5 h-2.5" />
              Error
            </span>
          )}
          {execTime != null && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/50">
              <Clock className="w-2.5 h-2.5" />
              {execTime}ms
            </span>
          )}
        </div>
        <button
          onClick={onClear}
          className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          title="Clear output"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-auto p-3 font-mono text-xs space-y-0.5">
        {!hasOutput && (
          <div className="flex items-center gap-2 text-muted-foreground/40 italic">
            <span className="animate-pulse text-primary">▌</span>
            Awaiting execution… press <kbd className="font-mono text-[10px] border border-border/40 rounded px-1 py-0.5 mx-1">Ctrl+Enter</kbd> to run
          </div>
        )}
        {lines.map((line, i) => (
          <div key={i} className="flex items-start gap-2 whitespace-pre-wrap leading-5 group">
            <ChevronRight className="w-3 h-3 text-primary mt-0.5 flex-shrink-0 opacity-60 group-hover:opacity-100" />
            <span className="text-foreground">{line}</span>
          </div>
        ))}
        {error && (
          <div className="mt-2 p-2 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-2 text-destructive whitespace-pre-wrap">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-bold text-[10px] uppercase tracking-wider mb-1">Runtime Error</div>
              <span>{error}</span>
            </div>
          </div>
        )}
        {hasOutput && !error && (
          <div className="mt-2 flex items-center gap-1.5 text-neon-green/60 text-[10px] border-t border-border/20 pt-2">
            <CheckCircle2 className="w-3 h-3" />
            Program exited successfully {execTime != null && `in ${execTime}ms`}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
