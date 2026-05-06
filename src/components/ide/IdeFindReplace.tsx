import { useEffect, useRef, useState } from 'react';
import { Search, Replace, ChevronUp, ChevronDown, X, CaseSensitive, Regex, WholeWord } from 'lucide-react';

interface Props {
  value: string;
  onChange: (next: string) => void;
  onClose: () => void;
  onJump: (start: number, end: number) => void;
  initialQuery?: string;
}

export interface MatchInfo {
  start: number;
  end: number;
}

export function findMatches(text: string, query: string, opts: { caseSensitive: boolean; wholeWord: boolean; regex: boolean }): MatchInfo[] {
  if (!query) return [];
  let pattern: RegExp;
  try {
    if (opts.regex) {
      pattern = new RegExp(query, opts.caseSensitive ? 'g' : 'gi');
    } else {
      const esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wrapped = opts.wholeWord ? `\\b${esc}\\b` : esc;
      pattern = new RegExp(wrapped, opts.caseSensitive ? 'g' : 'gi');
    }
  } catch { return []; }
  const out: MatchInfo[] = [];
  let m;
  while ((m = pattern.exec(text))) {
    if (m[0].length === 0) { pattern.lastIndex++; continue; }
    out.push({ start: m.index, end: m.index + m[0].length });
  }
  return out;
}

export function FindReplacePanel({ value, onChange, onClose, onJump, initialQuery = '' }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [replace, setReplace] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [regex, setRegex] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);

  const matches = findMatches(value, query, { caseSensitive, wholeWord, regex });

  useEffect(() => {
    if (matches.length === 0) return;
    const i = Math.min(active, matches.length - 1);
    onJump(matches[i].start, matches[i].end);
  }, [query, caseSensitive, wholeWord, regex, active]);

  const next = () => setActive(i => (i + 1) % Math.max(1, matches.length));
  const prev = () => setActive(i => (i - 1 + matches.length) % Math.max(1, matches.length));

  const replaceOne = () => {
    if (matches.length === 0) return;
    const m = matches[Math.min(active, matches.length - 1)];
    onChange(value.slice(0, m.start) + replace + value.slice(m.end));
  };
  const replaceAll = () => {
    if (matches.length === 0) return;
    let result = '';
    let last = 0;
    for (const m of matches) { result += value.slice(last, m.start) + replace; last = m.end; }
    result += value.slice(last);
    onChange(result);
  };

  return (
    <div className="absolute top-2 right-4 z-30 bg-card/95 backdrop-blur border border-border/60 rounded-md shadow-xl p-2 w-[420px] flex flex-col gap-1.5"
         onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div className="flex items-center gap-1">
        <button onClick={() => setShowReplace(s => !s)} className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted/30" title="Toggle Replace">
          {showReplace ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>
        <div className="flex items-center gap-1 flex-1 bg-background/40 border border-border/40 rounded px-2 h-7">
          <Search className="w-3 h-3 text-muted-foreground" />
          <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setActive(0); }}
                 onKeyDown={e => { if (e.key === 'Enter') (e.shiftKey ? prev() : next()); }}
                 placeholder="Find" className="flex-1 bg-transparent outline-none text-xs font-mono" />
          <span className="text-[10px] text-muted-foreground/70 font-mono">
            {matches.length === 0 ? '0/0' : `${Math.min(active + 1, matches.length)}/${matches.length}`}
          </span>
        </div>
        <button onClick={() => setCaseSensitive(v => !v)} className={`p-1 rounded ${caseSensitive ? 'bg-primary/20 text-primary' : 'hover:bg-muted/30 text-muted-foreground'}`} title="Match Case">
          <CaseSensitive className="w-3 h-3" />
        </button>
        <button onClick={() => setWholeWord(v => !v)} className={`p-1 rounded ${wholeWord ? 'bg-primary/20 text-primary' : 'hover:bg-muted/30 text-muted-foreground'}`} title="Whole Word">
          <WholeWord className="w-3 h-3" />
        </button>
        <button onClick={() => setRegex(v => !v)} className={`p-1 rounded ${regex ? 'bg-primary/20 text-primary' : 'hover:bg-muted/30 text-muted-foreground'}`} title="Regex">
          <Regex className="w-3 h-3" />
        </button>
        <button onClick={prev} className="p-1 rounded hover:bg-muted/30 text-muted-foreground" title="Previous (Shift+Enter)"><ChevronUp className="w-3 h-3" /></button>
        <button onClick={next} className="p-1 rounded hover:bg-muted/30 text-muted-foreground" title="Next (Enter)"><ChevronDown className="w-3 h-3" /></button>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted/30 text-muted-foreground" title="Close (Esc)"><X className="w-3 h-3" /></button>
      </div>
      {showReplace && (
        <div className="flex items-center gap-1">
          <div className="w-5" />
          <div className="flex items-center gap-1 flex-1 bg-background/40 border border-border/40 rounded px-2 h-7">
            <Replace className="w-3 h-3 text-muted-foreground" />
            <input value={replace} onChange={e => setReplace(e.target.value)}
                   placeholder="Replace" className="flex-1 bg-transparent outline-none text-xs font-mono" />
          </div>
          <button onClick={replaceOne} className="text-[10px] font-mono px-2 h-7 rounded border border-border/40 hover:bg-muted/30">Replace</button>
          <button onClick={replaceAll} className="text-[10px] font-mono px-2 h-7 rounded border border-border/40 hover:bg-muted/30">All</button>
        </div>
      )}
    </div>
  );
}
