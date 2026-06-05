import { X, FileCode2, Circle } from 'lucide-react';
import type { IdeFile } from './types';

interface Props {
  files: IdeFile[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

function fileColor(name: string) {
  if (name.endsWith('.sdev')) return 'text-primary';
  if (name.endsWith('.md')) return 'text-brand-mist';
  if (name.endsWith('.json')) return 'text-brand-amber';
  if (name.endsWith('.js') || name.endsWith('.ts')) return 'text-brand-green';
  return 'text-muted-foreground';
}

export function IdeTabs({ files, activeId, onSelect, onClose }: Props) {
  return (
    <div className="flex items-end gap-1 px-1 pt-1 overflow-x-auto flex-shrink-0 bg-background/40 border-b border-border/40 scrollbar-none">
      {files.map(file => {
        const isActive = file.id === activeId;
        return (
          <div
            key={file.id}
            onClick={() => onSelect(file.id)}
            className={`
              group relative flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 cursor-pointer rounded-t-md
              transition-all flex-shrink-0 text-xs font-mono select-none
              ${isActive
                ? 'bg-card text-foreground shadow-[0_-2px_0_0_hsl(var(--primary))_inset]'
                : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }
            `}
          >
            <FileCode2 className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? fileColor(file.name) : 'opacity-60'}`} />
            <span className="truncate max-w-[140px]">{file.name}</span>
            <button
              onClick={e => { e.stopPropagation(); if (files.length > 1) onClose(file.id); }}
              className={`
                ml-1 w-4 h-4 flex items-center justify-center rounded
                hover:bg-muted/60 hover:text-destructive transition-all
                ${isActive ? 'opacity-70' : 'opacity-0 group-hover:opacity-70'}
              `}
              aria-label="Close tab"
            >
              {file.modified
                ? <Circle className="w-2 h-2 fill-current" />
                : <X className="w-3 h-3" />
              }
            </button>
          </div>
        );
      })}
      <div className="flex-1 border-b border-border/40 self-stretch" />
    </div>
  );
}
