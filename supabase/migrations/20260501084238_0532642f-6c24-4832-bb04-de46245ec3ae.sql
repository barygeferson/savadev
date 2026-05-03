
-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CODE FILES
CREATE TABLE public.code_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'sdev',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.code_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own files" ON public.code_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own files" ON public.code_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own files" ON public.code_files FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own files" ON public.code_files FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_code_files_user ON public.code_files(user_id);
CREATE TRIGGER code_files_updated_at BEFORE UPDATE ON public.code_files
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- GISTS (public shareable snippets)
CREATE TABLE public.gists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE DEFAULT substr(md5(random()::text), 1, 10),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'sdev',
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view gists" ON public.gists FOR SELECT USING (true);
CREATE POLICY "Users create own gists" ON public.gists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own gists" ON public.gists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own gists" ON public.gists FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_gists_user ON public.gists(user_id);
CREATE INDEX idx_gists_slug ON public.gists(slug);
CREATE TRIGGER gists_updated_at BEFORE UPDATE ON public.gists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RUN HISTORY
CREATE TABLE public.run_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT,
  code_snippet TEXT NOT NULL,
  output TEXT,
  status TEXT NOT NULL DEFAULT 'success',
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.run_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own runs" ON public.run_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own runs" ON public.run_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own runs" ON public.run_history FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_run_history_user_time ON public.run_history(user_id, created_at DESC);

-- STARRED SNIPPETS
CREATE TABLE public.starred_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gist_id UUID NOT NULL REFERENCES public.gists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, gist_id)
);
ALTER TABLE public.starred_snippets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own stars" ON public.starred_snippets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own stars" ON public.starred_snippets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own stars" ON public.starred_snippets FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_stars_user ON public.starred_snippets(user_id);
