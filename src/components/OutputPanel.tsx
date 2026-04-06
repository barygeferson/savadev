import { cn } from '@/lib/utils';
import { Terminal, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface OutputPanelProps {
  lines: string[];
  error?: string;
}

export function OutputPanel({ lines, error }: OutputPanelProps) {
  const hasOutput = lines.length > 0 || error;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">output</span>
        </div>
        {error ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-mono">
            <AlertTriangle className="w-3 h-3" />
            error
          </div>
        ) : hasOutput ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-green/10 text-brand-green text-xs font-mono">
            <CheckCircle2 className="w-3 h-3" />
            ok
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="min-h-[120px] max-h-[320px] overflow-auto p-4 font-mono text-sm bg-card">
        {!hasOutput && (
          <div className="flex items-center gap-2 text-muted-foreground/40">
            <span className="animate-pulse text-primary/40">▌</span>
            <span className="text-xs italic">Awaiting execution...</span>
          </div>
        )}
        {lines.map((line, i) => (
          <div key={i} className="text-foreground/80 whitespace-pre-wrap leading-6">
            <span className="text-muted-foreground mr-2 select-none">{'>'}</span>
            {line}
          </div>
        ))}
        {error && (
          <div className={cn('whitespace-pre-wrap leading-6', lines.length > 0 && 'mt-3 pt-3 border-t border-destructive/20')}>
            <div className="flex items-start gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
