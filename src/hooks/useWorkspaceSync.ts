import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { IdeFile, IdeFolder } from '@/components/ide/types';

interface SnapshotInput {
  files: IdeFile[];
  folders: IdeFolder[];
  openIds: string[];
  activeId: string | null;
}

interface HydratedWorkspace {
  files: IdeFile[];
  folders: IdeFolder[];
  openIds: string[];
  activeId: string | null;
  hasRemoteData: boolean;
}

/**
 * Cloud workspace sync.
 * - On login, hydrate the user's files + folders + open tabs from cloud.
 * - On any change, debounce-write the entire workspace back.
 *
 * Cloud is the source of truth WHEN a user is signed in. Guests keep using
 * localStorage (handled separately in the IDE page).
 */
export function useWorkspaceSync(snapshot: SnapshotInput | null, enabled: boolean) {
  const { user } = useAuth();
  const [hydrated, setHydrated] = useState<HydratedWorkspace | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [hydrationDone, setHydrationDone] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Maps local id → cloud uuid so updates target the same row
  const fileCloudMap = useRef<Map<string, string>>(new Map());
  const folderCloudMap = useRef<Map<string, string>>(new Map());

  // ──────────────────── Hydrate on login ────────────────────
  useEffect(() => {
    if (!user) { setHydrated(null); setHydrationDone(false); return; }
    setHydrationDone(false);
    (async () => {
      const [{ data: foldersData }, { data: filesData }] = await Promise.all([
        supabase.from('folders').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('code_files').select('*').eq('user_id', user.id).order('sort_order'),
      ]);
      const folders: IdeFolder[] = (foldersData ?? []).map(f => {
        const localId = `cf-${f.id}`;
        folderCloudMap.current.set(localId, f.id);
        return { id: localId, name: f.name, parentId: f.parent_id ? `cf-${f.parent_id}` : null, cloudId: f.id, expanded: true };
      });
      const files: IdeFile[] = (filesData ?? []).map(f => {
        const localId = `c-${f.id}`;
        fileCloudMap.current.set(localId, f.id);
        return {
          id: localId,
          name: f.name,
          content: f.content,
          folderId: f.folder_id ? `cf-${f.folder_id}` : null,
          cloudId: f.id,
        };
      });
      const openIds = files.filter(f => filesData!.find(x => x.id === f.cloudId)?.is_open).map(f => f.id);
      const activeRow = filesData?.find(x => x.is_active);
      const activeId = activeRow ? `c-${activeRow.id}` : (files[0]?.id ?? null);
      setHydrated({
        files,
        folders,
        openIds: openIds.length ? openIds : (files.length ? [files[0].id] : []),
        activeId,
        hasRemoteData: files.length > 0 || folders.length > 0,
      });
      setHydrationDone(true);
    })();
  }, [user]);

  // ──────────────────── Debounced full snapshot upsert ────────────────────
  const flush = useCallback(async (snap: SnapshotInput) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      // 1) Upsert folders (new ones get cloud ids, existing get updated)
      for (const folder of snap.folders) {
        const cloudId = folder.cloudId ?? folderCloudMap.current.get(folder.id);
        const parentCloudId = folder.parentId ? (snap.folders.find(f => f.id === folder.parentId)?.cloudId ?? folderCloudMap.current.get(folder.parentId) ?? null) : null;
        if (cloudId) {
          await supabase.from('folders').update({ name: folder.name, parent_id: parentCloudId }).eq('id', cloudId);
        } else {
          const { data } = await supabase.from('folders').insert({ user_id: user.id, name: folder.name, parent_id: parentCloudId }).select('id').single();
          if (data) folderCloudMap.current.set(folder.id, data.id);
        }
      }
      // 2) Upsert files
      for (let i = 0; i < snap.files.length; i++) {
        const file = snap.files[i];
        const cloudId = file.cloudId ?? fileCloudMap.current.get(file.id);
        const folderCloudId = file.folderId ? (snap.folders.find(f => f.id === file.folderId)?.cloudId ?? folderCloudMap.current.get(file.folderId) ?? null) : null;
        const row = {
          name: file.name,
          content: file.content,
          folder_id: folderCloudId,
          is_open: snap.openIds.includes(file.id),
          is_active: file.id === snap.activeId,
          sort_order: i,
        };
        if (cloudId) {
          await supabase.from('code_files').update(row).eq('id', cloudId);
        } else {
          const { data } = await supabase.from('code_files').insert({ ...row, user_id: user.id }).select('id').single();
          if (data) fileCloudMap.current.set(file.id, data.id);
        }
      }
      // 3) Delete cloud rows that no longer exist locally
      const localFileCloudIds = new Set(snap.files.map(f => f.cloudId ?? fileCloudMap.current.get(f.id)).filter(Boolean));
      const localFolderCloudIds = new Set(snap.folders.map(f => f.cloudId ?? folderCloudMap.current.get(f.id)).filter(Boolean));
      const { data: existingFiles } = await supabase.from('code_files').select('id').eq('user_id', user.id);
      for (const row of existingFiles ?? []) {
        if (!localFileCloudIds.has(row.id)) await supabase.from('code_files').delete().eq('id', row.id);
      }
      const { data: existingFolders } = await supabase.from('folders').select('id').eq('user_id', user.id);
      for (const row of existingFolders ?? []) {
        if (!localFolderCloudIds.has(row.id)) await supabase.from('folders').delete().eq('id', row.id);
      }
      setLastSavedAt(Date.now());
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!enabled || !user || !snapshot || !hydrationDone) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => flush(snapshot), 1200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [snapshot, enabled, user, flush, hydrationDone]);

  return { hydrated, isSyncing, lastSavedAt };
}
