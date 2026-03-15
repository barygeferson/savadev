import { useRef, useEffect } from 'react';
import { SyntaxHighlighter } from './SyntaxHighlighter';
import type { IdeSettings } from './types';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onRun?: () => void;
  fileName?: string;
  settings?: Partial<IdeSettings>;
  onCursorChange?: (pos: { line: number; col: number }) => void;
  onSelectionChange?: (count: number) => void;
}

export function IdeEditor({ value, onChange, onRun, fileName, settings, onCursorChange, onSelectionChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const fontSize = settings?.fontSize ?? 14;
  const tabSize = settings?.tabSize ?? 2;
  const fontFamily = settings?.fontFamily ?? 'JetBrains Mono';
  const showLineNumbers = settings?.lineNumbers !== false;
  const wordWrap = settings?.wordWrap ?? false;

  const syncScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.addEventListener('scroll', syncScroll, { passive: true });
      return () => ta.removeEventListener('scroll', syncScroll);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun?.();
      return;
    }
    const ta = e.currentTarget;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;

    if (e.key === 'Tab') {
      e.preventDefault();
      const indent = ' '.repeat(tabSize);
      if (start !== end) {
        // Multi-line indent
        const before = value.substring(0, start);
        const selected = value.substring(start, end);
        const after = value.substring(end);
        if (e.shiftKey) {
          // Unindent
          const unindented = selected.replace(new RegExp(`^${indent}`, 'gm'), '');
          onChange(before + unindented + after);
        } else {
          const indented = selected.replace(/^/gm, indent);
          onChange(before + indented + after);
        }
        return;
      }
      const next = value.substring(0, start) + indent + value.substring(end);
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + tabSize;
      });
      return;
    }

    // Auto-indent on Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const currentLine = value.substring(lineStart, start);
      const indentMatch = currentLine.match(/^(\s*)/);
      const currentIndent = indentMatch ? indentMatch[1] : '';
      const prevChar = value[start - 1];
      const extraIndent = prevChar === ':' ? ' '.repeat(tabSize) : '';
      const newline = '\n' + currentIndent + extraIndent;
      onChange(value.substring(0, start) + newline + value.substring(end));
      requestAnimationFrame(() => {
        const newPos = start + newline.length;
        ta.selectionStart = ta.selectionEnd = newPos;
      });
      return;
    }

    // Auto-close brackets
    const pairs: Record<string, string> = { '(': ')', '[': ']', '"': '"', "'": "'" };
    if (pairs[e.key] && start === end) {
      e.preventDefault();
      const close = pairs[e.key];
      onChange(value.substring(0, start) + e.key + close + value.substring(end));
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 1;
      });
      return;
    }
    // Skip over closing bracket if already there
    const closers = new Set([')', ']', '"', "'", ';;']);
    if (closers.has(e.key) && value[start] === e.key) {
      e.preventDefault();
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 1;
      });
      return;
    }
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    const pos = ta.selectionStart;
    const text = ta.value.substring(0, pos);
    const lines = text.split('\n');
    onCursorChange?.({ line: lines.length, col: lines[lines.length - 1].length + 1 });
    onSelectionChange?.(Math.abs(ta.selectionEnd - ta.selectionStart));
  };

  const lines = value.split('\n');
  const lineHeight = Math.round(fontSize * 1.6);
  const fontStyle = `${fontSize}px/${lineHeight}px '${fontFamily}', 'Fira Code', monospace`;

  return (
    <div className="relative flex h-full bg-background/40 overflow-hidden" style={{ fontSize }}>
      {/* Line numbers */}
      {showLineNumbers && (
        <div
          ref={lineNumbersRef}
          className="flex-shrink-0 w-12 overflow-hidden text-right pt-4 pb-4 pr-3 select-none bg-background/20 border-r border-border/20"
          style={{ lineHeight: `${lineHeight}px`, font: fontStyle }}
        >
          {lines.map((_, i) => (
            <div key={i} className="text-xs text-muted-foreground/40" style={{ lineHeight: `${lineHeight}px` }}>
              {i + 1}
            </div>
          ))}
        </div>
      )}

      {/* Highlight overlay */}
      <div
        ref={highlightRef}
        aria-hidden
        className={`absolute overflow-hidden pointer-events-none p-4 ${showLineNumbers ? 'left-12' : 'left-0'} top-0 bottom-0 right-0`}
        style={{
          font: fontStyle,
          whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
          wordBreak: wordWrap ? 'break-all' : 'normal',
          overflowX: wordWrap ? 'hidden' : 'auto',
          tabSize,
        }}
      >
        <SyntaxHighlighter code={value} />
        {'\n'}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        onClick={handleSelect}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        className={`flex-1 p-4 bg-transparent resize-none focus:outline-none text-transparent caret-primary overflow-auto z-10`}
        style={{
          font: fontStyle,
          tabSize,
          whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
          overflowX: wordWrap ? 'hidden' : 'auto',
        }}
      />
    </div>
  );
}
