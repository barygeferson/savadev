import { X } from 'lucide-react';
import type { IdeFile } from './types';

interface Props {
  files: IdeFile[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

export function IdeTabs({ files, activeId, onSelect, onClose }: Props) {
  return (
    <div className="flex items-end gap-0 overflow-x-auto flex-shrink-0 bg-background/30 border-b border-border/40 scrollbar-none">
      {files.map(file => {
        const isActive = file.id === activeId;
        return (
          <div
            key={file.id}
            onClick={() => onSelect(file.id)}
            className={`
              group relative flex items-center gap-2 px-4 py-2.5 cursor-pointer border-t-2 transition-all flex-shrink-0 text-xs font-mono
              ${isActive
                ? 'border-t-primary bg-background/60 text-foreground'
                : 'border-t-transparent bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20'
              }
            `}
          >
            <span className="truncate max-w-[120px]">{file.name}</span>
            {files.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); onClose(file.id); }}
                className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
