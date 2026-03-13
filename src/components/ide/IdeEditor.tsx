import { useRef, useEffect } from 'react';
import { SyntaxHighlighter } from './SyntaxHighlighter';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onRun?: () => void;
  fileName?: string;
}

export function IdeEditor({ value, onChange, onRun, fileName }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Sync scroll between textarea and highlight overlay
  const syncScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.addEventListener('scroll', syncScroll);
      return () => ta.removeEventListener('scroll', syncScroll);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun?.();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = value.substring(0, start) + '  ' + value.substring(end);
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
    // Auto-close :: with ;;
    if (e.key === ':' && e.currentTarget.value[e.currentTarget.selectionStart - 1] === ':') {
      // user just typed the second colon – handled below
    }
  };

  const lines = value.split('\n');


  return (
    <div className="relative flex h-full bg-background/40 overflow-hidden font-mono text-sm leading-6">
      {/* Line numbers */}
      <div className="flex-shrink-0 w-12 overflow-hidden text-right pt-4 pb-4 pr-3 select-none bg-background/20 border-r border-border/20">
        {lines.map((_, i) => (
          <div key={i} className="text-xs text-muted-foreground/40 leading-6">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Highlight layer (read-only, underneath) */}
      <div
        ref={highlightRef}
        aria-hidden
        className="absolute left-12 top-0 bottom-0 right-0 pointer-events-none overflow-hidden whitespace-pre-wrap break-words p-4 text-sm leading-6"
        style={{ fontFamily: "'JetBrains Mono', monospace", tabSize: 2, wordBreak: 'break-all' }}
      >
        <SyntaxHighlighter code={value} />
        {/* trailing space to keep height */}
        {'\n'}
      </div>

      {/* Actual textarea (transparent text, on top) */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className="flex-1 p-4 bg-transparent resize-none focus:outline-none text-transparent caret-primary leading-6 overflow-auto z-10"
        style={{ fontFamily: "'JetBrains Mono', monospace", tabSize: 2 }}
      />
    </div>
  );
}
