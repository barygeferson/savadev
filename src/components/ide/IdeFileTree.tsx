import { useState } from 'react';
import { FileCode, FolderOpen, Plus, Trash2, Edit3, Check, X, Upload } from 'lucide-react';
import type { IdeFile } from './types';

interface Props {
  files: IdeFile[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onUpload?: () => void;
}

export function IdeFileTree({ files, activeId, onSelect, onNew, onDelete, onRename, onUpload }: Props) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');

  const startRename = (file: IdeFile) => {
    setRenamingId(file.id);
    setRenameVal(file.name);
  };

  const commitRename = (id: string) => {
    if (renameVal.trim()) onRename(id, renameVal.trim());
    setRenamingId(null);
  };

  return (
    <div className="flex flex-col h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-3.5 h-3.5 text-neon-cyan" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Explorer</span>
        </div>
        <div className="flex items-center gap-1">
          {onUpload && (
            <button onClick={onUpload} className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-neon-cyan transition-colors" title="Open file">
              <Upload className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={onNew} className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-neon-cyan transition-colors" title="New file">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Project folder */}
      <div className="px-2 py-1.5 border-b border-border/20">
        <div className="flex items-center gap-1.5 px-1.5 py-1">
          <FolderOpen className="w-3.5 h-3.5 text-neon-orange" />
          <span className="text-xs font-mono text-muted-foreground">sdev-project</span>
          <span className="ml-auto text-[10px] text-muted-foreground/40">{files.length}</span>
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto py-1">
        {files.map(file => (
          <div
            key={file.id}
            onClick={() => onSelect(file.id)}
            className={`
              group flex items-center gap-2 px-4 py-1.5 cursor-pointer transition-all text-xs font-mono
              ${activeId === file.id
                ? 'bg-primary/10 text-primary border-l-2 border-primary'
                : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground border-l-2 border-transparent'
              }
            `}
          >
            <FileCode className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
            {renamingId === file.id ? (
              <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
                <input
                  autoFocus
                  value={renameVal}
                  onChange={e => setRenameVal(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitRename(file.id);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  className="flex-1 bg-background/60 border border-border/50 rounded px-1 py-0.5 text-xs text-foreground outline-none focus:border-primary/50"
                />
                <button onClick={() => commitRename(file.id)} className="text-neon-green hover:opacity-80">
                  <Check className="w-3 h-3" />
                </button>
                <button onClick={() => setRenamingId(null)} className="text-muted-foreground hover:opacity-80">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <span className="flex-1 truncate">{file.name}</span>
                {(file as IdeFile & { modified?: boolean }).modified && (
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-orange flex-shrink-0" title="Unsaved changes" />
                )}
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={e => { e.stopPropagation(); startRename(file); }}
                    className="p-0.5 hover:text-neon-cyan transition-colors"
                    title="Rename"
                  >
                    <Edit3 className="w-2.5 h-2.5" />
                  </button>
                  {files.length > 1 && (
                    <button
                      onClick={e => { e.stopPropagation(); onDelete(file.id); }}
                      className="p-0.5 hover:text-destructive transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border/20 px-3 py-1.5 flex items-center gap-2">
        <span className="text-[10px] font-mono text-muted-foreground/40">{files.length} file{files.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
