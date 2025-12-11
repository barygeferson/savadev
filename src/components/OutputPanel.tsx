import { cn } from '@/lib/utils';

interface OutputPanelProps {
  lines: string[];
  error?: string;
}

export function OutputPanel({ lines, error }: OutputPanelProps) {
  const hasOutput = lines.length > 0 || error;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center px-4 py-2 bg-muted/50 border-b border-border">
        <span className="text-sm font-medium text-muted-foreground">Output</span>
        {error && (
          <span className="ml-2 px-2 py-0.5 text-xs rounded bg-destructive/20 text-destructive">
            Error
          </span>
        )}
      </div>
      <div className="min-h-[120px] max-h-[300px] overflow-auto p-4 font-mono text-sm">
        {!hasOutput && (
          <span className="text-muted-foreground italic">Run your code to see output...</span>
        )}
        {lines.map((line, i) => (
          <div key={i} className="text-foreground whitespace-pre-wrap">
            {line}
          </div>
        ))}
        {error && (
          <div className={cn('text-destructive whitespace-pre-wrap', lines.length > 0 && 'mt-2')}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
