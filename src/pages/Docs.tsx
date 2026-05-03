import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Download, FileCode, Code2, Sparkles, Terminal, Globe, Layers, Wrench, Cpu, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Section { id: string; title: string; body: JSX.Element }
interface DocCategory { id: string; title: string; icon: React.ComponentType<{ className?: string }>; sections: Section[] }

const CATEGORIES: DocCategory[] = [
  {
    id: 'getting-started', title: 'Getting Started', icon: Sparkles, sections: [
      { id: 'overview', title: 'Overview', body: <>
        <p>sdev is a modern programming language with a uniquely human-readable syntax. Verbs like <code>forge</code>, <code>conjure</code>, and <code>summon</code> replace the algebraic shorthand of older languages, making code feel like prose.</p>
        <p>This documentation covers everything from your first program to advanced kernel-level features. For a deep dive, download the full <Link to="#downloads" className="text-primary underline">sdev Book</Link>.</p>
      </>},
      { id: 'install', title: 'Installation', body: <>
        <p>You have three options:</p>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Web IDE</strong> — zero install, open <Link to="/ide" className="text-primary underline">/ide</Link></li>
          <li><strong>JavaScript runtime</strong> — <code>node sdev-interpreter.js file.sdev</code></li>
          <li><strong>Python runtime</strong> — <code>python sdev-interpreter.py file.sdev</code></li>
        </ul>
      </>},
      { id: 'hello', title: 'Hello World', body: <>
        <pre className="bg-card border border-border rounded-md p-4 text-sm font-mono overflow-x-auto"><code>{`speak("Hello, world!")`}</code></pre>
      </>},
    ],
  },
  {
    id: 'language', title: 'Language Reference', icon: Code2, sections: [
      { id: 'variables', title: 'Variables', body: <>
        <p>Declare with <code>forge</code>, bind with <code>be</code>, mark immutable with <code>eternal</code>.</p>
        <pre className="bg-card border border-border rounded-md p-4 text-sm font-mono overflow-x-auto"><code>{`forge name be "Ada"\neternal forge PI be 3.14159`}</code></pre>
      </>},
      { id: 'control', title: 'Control Flow', body: <>
        <p>Branch with <code>if/then/else</code> and <code>when</code>. Loop with <code>while</code>, <code>until</code>, <code>for ... in</code>. Exit with <code>escape</code>; skip with <code>skip</code>.</p>
      </>},
      { id: 'functions', title: 'Functions', body: <>
        <pre className="bg-card border border-border rounded-md p-4 text-sm font-mono overflow-x-auto"><code>{`conjure greet(name be "stranger"):\n  speak("Hello, " + name)\nend`}</code></pre>
      </>},
      { id: 'classes', title: 'Classes (essence/summon)', body: <>
        <pre className="bg-card border border-border rounded-md p-4 text-sm font-mono overflow-x-auto"><code>{`essence Dog:\n  forge name\n  conjure bark(): speak(name + " woofs!") end\nend\n\nforge rex be summon Dog(name: "Rex")\nrex.bark()`}</code></pre>
      </>},
      { id: 'errors', title: 'Errors', body: <p>Use <code>attempt ... rescue err: ... finally: ... end</code> and <code>raise "msg"</code>.</p>},
      { id: 'async', title: 'Concurrency', body: <p>Use <code>dispatch fn()</code> to start, <code>await</code> to wait. <code>await all([...])</code> for parallel.</p>},
    ],
  },
  {
    id: 'ui', title: 'UI Toolkit', icon: Layers, sections: [
      { id: 'window', title: 'Windows', body: <>
        <p><code>window(title, width, height)</code> opens a window. End with <code>endwindow</code>.</p>
        <pre className="bg-card border border-border rounded-md p-4 text-sm font-mono overflow-x-auto"><code>{`window("My App", 480, 600)\n  heading("Welcome", 1)\n  paragraph("Hello there.")\nendwindow`}</code></pre>
      </>},
      { id: 'widgets', title: 'Widgets', body: <>
        <p>Available: <code>label</code>, <code>heading</code>, <code>paragraph</code>, <code>button(label, onclick, variant?)</code>, <code>input(bind, placeholder)</code>, <code>textarea</code>, <code>checkbox(bind, label)</code>, <code>slider(bind, min, max, step)</code>, <code>select(bind, options)</code>, <code>image(src, w, h, alt)</code>, <code>progress</code>, <code>divider</code>, <code>spacer</code>.</p>
      </>},
      { id: 'layout', title: 'Layout', body: <p>Group widgets with <code>row/endrow</code>, <code>column/endcolumn</code>, <code>group(title)/endgroup</code>, <code>tabs/endtabs</code> + <code>tab(title)/endtab</code>.</p>},
      { id: 'tables', title: 'Tables & Menus', body: <>
        <pre className="bg-card border border-border rounded-md p-4 text-sm font-mono overflow-x-auto"><code>{`table(["Name","Age"], [["Ada",36]])\n\nmenu("File")\n  menuitem("New", () => speak("new"))\nendmenu`}</code></pre>
      </>},
      { id: 'reactive', title: 'Reactive Values', body: <p>Read with <code>uiget("name")</code>, write with <code>uiset("name", v)</code>. Inputs auto-bind by name.</p>},
    ],
  },
  {
    id: 'stdlib', title: 'Standard Library', icon: Wrench, sections: [
      { id: 'io', title: 'I/O', body: <p><code>speak</code>, <code>whisper</code>, <code>shout</code>, <code>ask</code>, <code>readFile</code>, <code>writeFile</code>.</p>},
      { id: 'math', title: 'Math', body: <p><code>magnitude</code>, <code>least</code>, <code>greatest</code>, <code>root</code>, <code>ground</code>, <code>elevate</code>, <code>random</code>, <code>sin</code>, <code>cos</code>, <code>tan</code>, <code>log</code>.</p>},
      { id: 'collections', title: 'Collections', body: <p><code>gather</code>, <code>pluck</code>, <code>portion</code>, <code>each</code>, <code>sift</code>, <code>fold</code>, <code>seek</code>, <code>every</code>, <code>some</code>, <code>zip</code>, <code>enumerate</code>.</p>},
      { id: 'strings', title: 'Strings', body: <p><code>upper</code>, <code>lower</code>, <code>trim</code>, <code>reverse</code>, <code>contains</code>, <code>replace</code>, <code>shatter</code>, <code>weave</code>, <code>regex</code>.</p>},
    ],
  },
  {
    id: 'advanced', title: 'Advanced', icon: Cpu, sections: [
      { id: 'js-interop', title: 'JavaScript Interop', body: <pre className="bg-card border border-border rounded-md p-4 text-sm font-mono overflow-x-auto"><code>{`js { console.log("native") }`}</code></pre>},
      { id: 'matrix', title: 'Matrix Math', body: <p><code>matrix</code>, <code>matmul</code>, <code>inverse</code>, <code>transpose</code>, <code>det</code>.</p>},
      { id: 'kernel', title: 'Kernel & Tasks', body: <p><code>spawn(fn)</code>, <code>schedule()</code>, <code>syscall(name, args)</code>, <code>gc()</code>.</p>},
      { id: 'bytecode', title: 'Bytecode', body: <p>Compile with <code>--compile</code>, run <code>.sdevc</code> with <code>--exec</code>.</p>},
    ],
  },
  {
    id: 'maps', title: 'Maps & GIS', icon: Globe, sections: [
      { id: 'leaflet', title: 'Leaflet Integration', body: <>
        <p>Full mapping API powered by Leaflet. See <a href="/SDEV_LEAFLET_DOCUMENTATION.md" className="text-primary underline" target="_blank" rel="noreferrer">the Leaflet docs</a>.</p>
        <pre className="bg-card border border-border rounded-md p-4 text-sm font-mono overflow-x-auto"><code>{`map(42.7, 23.3, 12)\nmarker(42.7, 23.3, "Sofia")`}</code></pre>
      </>},
    ],
  },
  {
    id: 'tooling', title: 'Tooling', icon: Terminal, sections: [
      { id: 'ide', title: 'Web IDE', body: <p>Visit <Link to="/ide" className="text-primary underline">/ide</Link> for the full editor with file tree, tabs, command palette, terminal, and live App preview.</p>},
      { id: 'vscode', title: 'VS Code Extension', body: <p>Download <code>.vsix</code> from the Downloads menu. Provides syntax + snippets + Run command.</p>},
      { id: 'cli', title: 'Command-Line', body: <p>Both interpreters expose a CLI for running, compiling, and starting a REPL.</p>},
    ],
  },
  {
    id: 'downloads', title: 'Downloads', icon: Download, sections: [
      { id: 'book', title: 'The sdev Book', body: <>
        <p>The complete book — over 25 chapters covering every language feature, the standard library, the UI toolkit, advanced topics, a cookbook, and a glossary.</p>
        <div className="flex gap-3 flex-wrap mt-3">
          <a href="/sdev-book-en.md" download className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 hover:border-primary transition"><BookOpen className="w-4 h-4" />English (.md)</a>
          <a href="/sdev-book-bg.md" download className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 hover:border-primary transition"><BookOpen className="w-4 h-4" />Български (.md)</a>
          <a href="/SDEV_DOCUMENTATION.md" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 hover:border-primary transition"><FileCode className="w-4 h-4" />Full Reference</a>
        </div>
      </>},
      { id: 'runtimes', title: 'Runtimes', body: <>
        <div className="flex gap-3 flex-wrap">
          <a href="/sdev-interpreter.js" download className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 hover:border-primary transition"><Code2 className="w-4 h-4" />JS interpreter</a>
          <a href="/sdev-interpreter.py" download className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 hover:border-primary transition"><Terminal className="w-4 h-4" />Python interpreter</a>
        </div>
      </>},
    ],
  },
];

export default function Docs() {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string>('overview');

  const filtered = useMemo(() => {
    if (!query.trim()) return CATEGORIES;
    const q = query.toLowerCase();
    return CATEGORIES.map(cat => ({
      ...cat,
      sections: cat.sections.filter(s => s.title.toLowerCase().includes(q) || cat.title.toLowerCase().includes(q)),
    })).filter(c => c.sections.length > 0);
  }, [query]);

  useEffect(() => { document.title = 'sdev Documentation'; }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border/60 backdrop-blur-xl sticky top-0 z-40 bg-background/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <h1 className="text-xl font-bold tracking-tight">sdev <span className="text-muted-foreground font-normal">/ Documentation</span></h1>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/ide"><Button size="sm" variant="outline" className="gap-2"><Terminal className="w-4 h-4" />Open IDE</Button></Link>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3 space-y-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search docs…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>
          <ScrollArea className="h-[calc(100vh-220px)] pr-3">
            <nav className="space-y-6">
              {filtered.map(cat => {
                const Icon = cat.icon;
                return (
                  <div key={cat.id}>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.title}</span>
                    </div>
                    <ul className="space-y-1">
                      {cat.sections.map(s => (
                        <li key={s.id}>
                          <a
                            href={`#${s.id}`}
                            onClick={() => setActiveId(s.id)}
                            className={`block text-sm rounded px-2 py-1 transition ${activeId === s.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'}`}
                          >{s.title}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </nav>
          </ScrollArea>
        </aside>

        {/* Content */}
        <main className="col-span-12 md:col-span-9 space-y-12 pb-24">
          {filtered.map(cat => (
            <section key={cat.id} className="space-y-8">
              <h2 className="text-3xl font-bold tracking-tight border-b border-border/60 pb-2">{cat.title}</h2>
              {cat.sections.map(s => (
                <article key={s.id} id={s.id} className="scroll-mt-24 space-y-3">
                  <h3 className="text-xl font-semibold">{s.title}</h3>
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed text-foreground/90 [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-primary [&_code]:text-[0.85em]">
                    {s.body}
                  </div>
                </article>
              ))}
            </section>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground">No matches for "{query}".</p>
          )}
        </main>
      </div>
    </div>
  );
}
