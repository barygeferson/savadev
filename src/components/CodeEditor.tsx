import { useRef, useEffect } from 'react';

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
      textarea.style.height = Math.max(320, textarea.scrollHeight) + 'px';
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
    <div className="rounded-xl border border-border bg-card overflow-hidden group hover:border-primary/20 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-rose/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-brand-amber/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-brand-green/50" />
          </div>
          <span className="text-xs font-mono text-muted-foreground">main.sdev</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
          <span>{lineCount} lines</span>
          <span className="hidden sm:inline opacity-50">⌘+Enter to run</span>
        </div>
      </div>

      {/* Editor */}
      <div className="relative flex">
        {/* Line numbers */}
        <div className="flex-shrink-0 w-10 py-4 text-right pr-2 select-none border-r border-border/50 bg-muted/10">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="text-[11px] font-mono text-muted-foreground/30 leading-6">
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
          className="flex-1 min-h-[320px] p-4 font-mono text-sm bg-transparent resize-none focus:outline-none text-foreground placeholder:text-muted-foreground/40 leading-6"
          style={{ tabSize: 2 }}
        />
      </div>
    </div>
  );
}
