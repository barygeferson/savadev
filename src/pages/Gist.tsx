import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Star, Copy, Play, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GistView {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  language: string;
  view_count: number;
  user_id: string;
  created_at: string;
}

export default function Gist() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gist, setGist] = useState<GistView | null>(null);
  const [author, setAuthor] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [starred, setStarred] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase.from('gists').select('*').eq('slug', slug).maybeSingle();
      if (!data) { setLoading(false); return; }
      setGist(data as GistView);
      // Bump view count (best-effort)
      await supabase.from('gists').update({ view_count: (data.view_count ?? 0) + 1 }).eq('id', data.id);

      const { data: prof } = await supabase.from('profiles').select('display_name').eq('user_id', data.user_id).maybeSingle();
      if (prof?.display_name) setAuthor(prof.display_name);

      if (user) {
        const { data: star } = await supabase.from('starred_snippets').select('id').eq('user_id', user.id).eq('gist_id', data.id).maybeSingle();
        setStarred(!!star);
      }
      setLoading(false);
    })();
  }, [slug, user]);

  const toggleStar = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!gist) return;
    if (starred) {
      await supabase.from('starred_snippets').delete().eq('user_id', user.id).eq('gist_id', gist.id);
      setStarred(false);
    } else {
      await supabase.from('starred_snippets').insert({ user_id: user.id, gist_id: gist.id });
      setStarred(true);
    }
  };

  const openInIDE = () => {
    if (!gist) return;
    sessionStorage.setItem('sdev:imported_code', gist.content);
    sessionStorage.setItem('sdev:imported_name', gist.title);
    navigate('/ide');
  };

  const copyCode = () => {
    if (!gist) return;
    navigator.clipboard.writeText(gist.content);
    toast.success('Code copied');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>;
  if (!gist) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">Gist not found.</p>
      <Link to="/" className="text-sm underline">Go home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight">{gist.title}</h1>
        {gist.description && <p className="text-muted-foreground mt-2">{gist.description}</p>}
        <div className="text-sm text-muted-foreground mt-3">
          by {author || 'anon'} · {gist.view_count} views
        </div>

        <div className="flex gap-2 my-4">
          <Button onClick={openInIDE}><Play className="h-4 w-4 mr-2" />Open in IDE</Button>
          <Button variant="outline" onClick={copyCode}><Copy className="h-4 w-4 mr-2" />Copy</Button>
          <Button variant={starred ? 'default' : 'outline'} onClick={toggleStar}>
            <Star className={`h-4 w-4 mr-2 ${starred ? 'fill-current' : ''}`} />
            {starred ? 'Starred' : 'Star'}
          </Button>
        </div>

        <Card className="p-0 overflow-hidden">
          <pre className="text-sm font-mono p-4 overflow-x-auto bg-muted/20"><code>{gist.content}</code></pre>
        </Card>
      </div>
    </div>
  );
}
