import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { User, LogIn, LogOut, UserCircle, Cloud, Share2, Loader2, FolderOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCloudFiles } from '@/hooks/useCloudFiles';

interface Props {
  currentName: string;
  currentContent: string;
  currentCloudId?: string | null;
  onCloudIdChange?: (id: string) => void;
  onLoadFile: (name: string, content: string, cloudId: string) => void;
}

export function UserMenu({ currentName, currentContent, currentCloudId, onCloudIdChange, onLoadFile }: Props) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { files, saveFile, refresh } = useCloudFiles();
  const [openSave, setOpenSave] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [openOpen, setOpenOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saveName, setSaveName] = useState(currentName);
  const [gistTitle, setGistTitle] = useState(currentName);
  const [gistDesc, setGistDesc] = useState('');

  const handleCloudSave = async () => {
    if (!user) { navigate('/auth'); return; }
    setBusy(true);
    try {
      const result = await saveFile(saveName || 'untitled.sdev', currentContent, currentCloudId ?? undefined);
      if (result && !currentCloudId && onCloudIdChange) onCloudIdChange(result.id);
      toast.success('Saved to cloud');
      setOpenSave(false);
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setBusy(false);
    }
  };

  const handleOpenCloud = async () => {
    if (!user) { navigate('/auth'); return; }
    setBusy(true);
    try {
      await refresh();
      setOpenOpen(true);
    } catch (e) {
      toast.error('Failed to load cloud files');
    } finally {
      setBusy(false);
    }
  };

  const handleShareGist = async () => {
    if (!user) { navigate('/auth'); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from('gists')
        .insert({ user_id: user.id, title: gistTitle || 'Untitled snippet', description: gistDesc || null, content: currentContent })
        .select()
        .single();
      if (error) throw error;
      const url = `${window.location.origin}/g/${data.slug}`;
      await navigator.clipboard.writeText(url);
      toast.success('Public link copied: ' + url);
      setOpenShare(false);
    } catch (e) {
      toast.error('Failed to create gist');
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => navigate('/auth')}>
        <LogIn className="w-3 h-3" /> Sign in
      </Button>
    );
  }

  const initials = (user.email || '?').slice(0, 2).toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-neon-cyan to-neon-violet flex items-center justify-center text-[8px] font-bold text-background">
              {initials}
            </div>
            <span className="hidden sm:inline truncate max-w-[100px]">{user.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card border-border/50">
          <DropdownMenuLabel className="text-xs text-muted-foreground truncate">{user.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { setSaveName(currentName); setOpenSave(true); }} className="gap-2 text-xs cursor-pointer">
            <Cloud className="w-3.5 h-3.5 text-neon-cyan" /> {currentCloudId ? 'Update in cloud' : 'Save to cloud'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenCloud} className="gap-2 text-xs cursor-pointer" disabled={busy}>
            <FolderOpen className="w-3.5 h-3.5 text-neon-green" /> Open from cloud
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setGistTitle(currentName); setOpenShare(true); }} className="gap-2 text-xs cursor-pointer">
            <Share2 className="w-3.5 h-3.5 text-neon-violet" /> Share as public gist
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/account')} className="gap-2 text-xs cursor-pointer">
            <UserCircle className="w-3.5 h-3.5" /> Account & history
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut()} className="gap-2 text-xs cursor-pointer text-destructive">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save dialog */}
      <Dialog open={openSave} onOpenChange={setOpenSave}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentCloudId ? 'Update cloud file' : 'Save to cloud'}</DialogTitle>
            <DialogDescription>Store the current file in your account so you can reopen it later.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>File name</Label>
            <Input value={saveName} onChange={(e) => setSaveName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenSave(false)}>Cancel</Button>
            <Button onClick={handleCloudSave} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Open dialog */}
      <Dialog open={openOpen} onOpenChange={setOpenOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Open from cloud</DialogTitle>
            <DialogDescription>Choose one of your saved files from the cloud workspace.</DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-1">
            {busy && <p className="text-sm text-muted-foreground text-center py-6">Loading saved files…</p>}
            {!busy && files.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No saved files yet.</p>}
            {files.map(f => (
              <button
                key={f.id}
                onClick={() => { onLoadFile(f.name, f.content, f.id); setOpenOpen(false); toast.success('Loaded ' + f.name); }}
                className="w-full text-left p-2 rounded hover:bg-muted/40 text-sm font-mono"
              >
                <div className="truncate">{f.name}</div>
                <div className="text-xs text-muted-foreground">{new Date(f.updated_at).toLocaleString()}</div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share dialog */}
      <Dialog open={openShare} onOpenChange={setOpenShare}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share as public gist</DialogTitle>
            <DialogDescription>Create a public link for the current code.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={gistTitle} onChange={(e) => setGistTitle(e.target.value)} />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea value={gistDesc} onChange={(e) => setGistDesc(e.target.value)} rows={2} />
            </div>
            <p className="text-xs text-muted-foreground">A public link will be generated and copied to your clipboard.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenShare(false)}>Cancel</Button>
            <Button onClick={handleShareGist} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Create gist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
