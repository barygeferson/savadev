import { Terminal, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';

interface Props {
  lines: string[];
  error?: string;
  onClear: () => void;
}

export function IdeTerminal({ lines, error, onClear }: Props) {
  const hasOutput = lines.length > 0 || error;

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* Panel tabs bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/40 bg-muted/20 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono text-primary border-b-2 border-primary">
            <Terminal className="w-3 h-3" />
            OUTPUT
          </button>
        </div>
        <button
          onClick={onClear}
          className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          title="Clear output"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-auto p-3 font-mono text-xs">
        {!hasOutput && (
          <div className="flex items-center gap-2 text-muted-foreground/50 italic">
            <span className="animate-pulse">▌</span>
            Awaiting execution…
          </div>
        )}
        {lines.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap leading-5 py-0.5">
            <span className="text-primary mr-2 select-none">›</span>
            <span className="text-foreground">{line}</span>
          </div>
        ))}
        {error && (
          <div className="mt-2 flex items-start gap-2 text-destructive whitespace-pre-wrap">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {hasOutput && !error && (
          <div className="mt-1 flex items-center gap-1.5 text-neon-green text-xs">
            <CheckCircle2 className="w-3 h-3" />
            Program exited successfully
          </div>
        )}
      </div>
    </div>
  );
}
