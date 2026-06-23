import { useMemo, useRef } from 'react';
import { Globe, ExternalLink, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WebState } from '@/lang/web';
import { renderWebDocument } from '@/lang/web';

interface Props {
  state: WebState | null;
}

export function WebPreviewPanel({ state }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const doc = useMemo(() => (state ? renderWebDocument(state) : ''), [state]);

  if (!state || !state.produced) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2 p-6">
        <Globe className="w-10 h-10 opacity-30" />
        <div className="text-sm">No web page yet</div>
        <div className="text-xs opacity-60 text-center max-w-md">
          Call <code className="font-mono text-primary">page("My Site")</code> in your code to start
          building HTML/CSS/JS. Use <code className="font-mono text-primary">div</code>,{' '}
          <code className="font-mono text-primary">h1</code>,{' '}
          <code className="font-mono text-primary">style(...)</code>,{' '}
          <code className="font-mono text-primary">script("...")</code>, or raw passthrough
          like <code className="font-mono text-primary">raw_html("...")</code>.
        </div>
      </div>
    );
  }

  const openInNewTab = () => {
    const blob = new Blob([doc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    // Revoke after a delay so the new tab has time to load
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const reload = () => {
    if (iframeRef.current) iframeRef.current.srcdoc = doc;
  };

  const download = () => {
    const blob = new Blob([doc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (state.title || 'page').replace(/[^\w.-]+/g, '_') + '.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-muted/10">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-card/40">
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-xs font-mono text-muted-foreground truncate flex-1">{state.title}</span>
        <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={reload}>
          <RefreshCw className="w-3.5 h-3.5" /> Reload
        </Button>
        <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={download}>
          <Download className="w-3.5 h-3.5" /> .html
        </Button>
        <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={openInNewTab}>
          <ExternalLink className="w-3.5 h-3.5" /> Open in new tab
        </Button>
      </div>
      <div className="flex-1 bg-white">
        <iframe
          ref={iframeRef}
          title="sdev web preview"
          sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
          srcDoc={doc}
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}
