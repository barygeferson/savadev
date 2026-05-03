import { useState, useMemo } from 'react';
import { FileCode, FolderOpen, Folder, Plus, Trash2, Edit3, Check, X, Upload, ChevronRight, ChevronDown, FolderPlus, Cloud } from 'lucide-react';
import type { IdeFile, IdeFolder } from './types';

interface Props {
  files: IdeFile[];
  folders: IdeFolder[];
  activeId: string;
  onSelect: (id: string) => void;
  onNewFile: (folderId: string | null) => void;
  onNewFolder: (parentId: string | null) => void;
  onDelete: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onToggleFolder: (id: string) => void;
  onUpload?: () => void;
  syncStatus?: 'synced' | 'syncing' | 'local';
}

export function IdeFileTree({
  files, folders, activeId, onSelect, onNewFile, onNewFolder, onDelete, onDeleteFolder,
  onRename, onRenameFolder, onToggleFolder, onUpload, syncStatus = 'local',
}: Props) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');

  const tree = useMemo(() => {
    const childFolders = (parentId: string | null) => folders.filter(f => f.parentId === parentId);
    const childFiles = (folderId: string | null) => files.filter(f => (f.folderId ?? null) === folderId);
    return { childFolders, childFiles };
  }, [files, folders]);

  const startRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameVal(currentName);
  };

  const commitRename = (id: string, isFolder: boolean) => {
    const v = renameVal.trim();
    if (v) (isFolder ? onRenameFolder : onRename)(id, v);
    setRenamingId(null);
  };

  const renderRow = (params: {
    id: string; name: string; depth: number; isFolder: boolean; expanded?: boolean; modified?: boolean;
  }) => {
    const { id, name, depth, isFolder, expanded, modified } = params;
    const Icon = isFolder ? (expanded ? ChevronDown : ChevronRight) : FileCode;
    const FolderIcon = expanded ? FolderOpen : Folder;
    const isActive = !isFolder && activeId === id;
    return (
      <div
        key={id}
        onClick={() => isFolder ? onToggleFolder(id) : onSelect(id)}
        style={{ paddingLeft: 8 + depth * 12 }}
        className={`
          group flex items-center gap-1.5 pr-2 py-1 cursor-pointer transition-all text-xs font-mono
          ${isActive ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground border-l-2 border-transparent'}
        `}
      >
        {isFolder ? <Icon className="w-3 h-3 flex-shrink-0" /> : <span className="w-3" />}
        {isFolder ? <FolderIcon className="w-3.5 h-3.5 flex-shrink-0 text-neon-orange" /> : <FileCode className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />}
        {renamingId === id ? (
          <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
            <input
              autoFocus
              value={renameVal}
              onChange={e => setRenameVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') commitRename(id, isFolder);
                if (e.key === 'Escape') setRenamingId(null);
              }}
              className="flex-1 bg-background/60 border border-border/50 rounded px-1 py-0.5 text-xs text-foreground outline-none focus:border-primary/50"
            />
            <button onClick={() => commitRename(id, isFolder)} className="text-neon-green"><Check className="w-3 h-3" /></button>
            <button onClick={() => setRenamingId(null)} className="text-muted-foreground"><X className="w-3 h-3" /></button>
          </div>
        ) : (
          <>
            <span className="flex-1 truncate">{name}</span>
            {modified && <span className="w-1.5 h-1.5 rounded-full bg-neon-orange flex-shrink-0" />}
            <div className="hidden group-hover:flex items-center gap-1">
              {isFolder && (
                <button onClick={e => { e.stopPropagation(); onNewFile(id); }} className="p-0.5 hover:text-neon-cyan" title="New file"><Plus className="w-2.5 h-2.5" /></button>
              )}
              {isFolder && (
                <button onClick={e => { e.stopPropagation(); onNewFolder(id); }} className="p-0.5 hover:text-neon-cyan" title="New folder"><FolderPlus className="w-2.5 h-2.5" /></button>
              )}
              <button onClick={e => { e.stopPropagation(); startRename(id, name); }} className="p-0.5 hover:text-neon-cyan" title="Rename"><Edit3 className="w-2.5 h-2.5" /></button>
              <button onClick={e => { e.stopPropagation(); isFolder ? onDeleteFolder(id) : onDelete(id); }} className="p-0.5 hover:text-destructive" title="Delete"><Trash2 className="w-2.5 h-2.5" /></button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderFolder = (folder: IdeFolder, depth: number): React.ReactNode => {
    const expanded = folder.expanded ?? true;
    return (
      <div key={folder.id}>
        {renderRow({ id: folder.id, name: folder.name, depth, isFolder: true, expanded })}
        {expanded && (
          <>
            {tree.childFolders(folder.id).map(f => renderFolder(f, depth + 1))}
            {tree.childFiles(folder.id).map(file => renderRow({ id: file.id, name: file.name, depth: depth + 1, isFolder: false, modified: file.modified }))}
          </>
        )}
      </div>
    );
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
          {syncStatus === 'syncing' && <Cloud className="w-3 h-3 text-neon-cyan animate-pulse" />}
          {syncStatus === 'synced' && <Cloud className="w-3 h-3 text-neon-green" />}
          {onUpload && (
            <button onClick={onUpload} className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-neon-cyan" title="Open file">
              <Upload className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={() => onNewFolder(null)} className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-neon-cyan" title="New folder">
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onNewFile(null)} className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-neon-cyan" title="New file">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {tree.childFolders(null).map(f => renderFolder(f, 0))}
        {tree.childFiles(null).map(file => renderRow({ id: file.id, name: file.name, depth: 0, isFolder: false, modified: file.modified }))}
        {files.length === 0 && folders.length === 0 && (
          <div className="text-xs text-muted-foreground/60 text-center py-6 px-3">No files yet. Click + to create one.</div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border/20 px-3 py-1.5 flex items-center gap-2">
        <span className="text-[10px] font-mono text-muted-foreground/40">{files.length} file{files.length !== 1 ? 's' : ''}</span>
        {folders.length > 0 && <span className="text-[10px] font-mono text-muted-foreground/40">· {folders.length} folder{folders.length !== 1 ? 's' : ''}</span>}
      </div>
    </div>
  );
}
