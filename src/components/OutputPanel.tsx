import { cn } from '@/lib/utils';
import { Terminal, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface OutputPanelProps {
  lines: string[];
  error?: string;
}

export function OutputPanel({ lines, error }: OutputPanelProps) {
  const hasOutput = lines.length > 0 || error;

  return (
    <div className="rounded-lg border border-border/50 glass overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono text-foreground">output</span>
        </div>
        <div className="flex items-center gap-2">
          {error ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-destructive/20 text-destructive">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-xs font-mono">error</span>
            </div>
          ) : hasOutput ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-neon-green/20 text-neon-green">
              <CheckCircle2 className="w-3 h-3" />
              <span className="text-xs font-mono">success</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Output content */}
      <div className="min-h-[120px] max-h-[300px] overflow-auto p-4 font-mono text-sm bg-background/30">
        {!hasOutput && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="animate-pulse">▌</span>
            <span className="text-muted-foreground/50 italic">Awaiting execution...</span>
          </div>
        )}
        {lines.map((line, i) => (
          <div key={i} className="text-foreground whitespace-pre-wrap leading-6">
            <span className="text-primary mr-2">{'>'}</span>
            {line}
          </div>
        ))}
        {error && (
          <div className={cn('whitespace-pre-wrap leading-6', lines.length > 0 && 'mt-3 pt-3 border-t border-destructive/30')}>
            <div className="flex items-start gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
