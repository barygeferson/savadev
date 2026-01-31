import { useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  placeholder?: string;
}

export function CodeEditor({ value, onChange, onRun, placeholder }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(300, textarea.scrollHeight) + 'px';
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun?.();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  };

  const lineCount = value.split('\n').length;

  return (
    <div className="relative rounded-lg border border-border/50 glass overflow-hidden group hover:border-primary/30 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/80" />
            <div className="w-3 h-3 rounded-full bg-neon-orange/80" />
            <div className="w-3 h-3 rounded-full bg-neon-green/80" />
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-foreground">main.sdev</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
          <span>{lineCount} lines</span>
          <span className="hidden sm:inline">Ctrl+Enter to execute</span>
        </div>
      </div>

      {/* Editor content */}
      <div className="relative flex">
        {/* Line numbers */}
        <div className="flex-shrink-0 w-12 py-4 text-right pr-3 select-none border-r border-border/30 bg-background/30">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="text-xs font-mono text-muted-foreground/50 leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          spellCheck={false}
          className="flex-1 min-h-[300px] p-4 font-mono text-sm bg-transparent resize-none focus:outline-none text-foreground placeholder:text-muted-foreground leading-6"
          style={{ tabSize: 2 }}
        />
      </div>

      {/* Glow effect on focus */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
        <div className="absolute inset-0 rounded-lg shadow-neon-cyan" />
      </div>
    </div>
  );
}
