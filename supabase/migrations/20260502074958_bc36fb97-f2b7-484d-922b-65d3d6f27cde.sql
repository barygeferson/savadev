
-- FOLDERS table
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own folders" ON public.folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own folders" ON public.folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own folders" ON public.folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own folders" ON public.folders FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_folders_user_parent ON public.folders(user_id, parent_id);
CREATE TRIGGER folders_updated_at BEFORE UPDATE ON public.folders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Augment code_files
ALTER TABLE public.code_files ADD COLUMN folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL;
ALTER TABLE public.code_files ADD COLUMN is_open BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.code_files ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.code_files ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
CREATE INDEX idx_code_files_folder ON public.code_files(folder_id);
