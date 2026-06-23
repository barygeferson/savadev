// SDEV Web Toolkit — produces a full HTML document (HTML + CSS + JS) consumed
// by WebPreviewPanel.tsx. Mix the high-level DSL (page/div/style/script) with
// raw passthrough (raw_html / raw_css / raw_js) for anything not covered.

import { SdevFunction, stringify } from './builtins';

export interface WebState {
  /** Document title shown in the preview header / browser tab. */
  title: string;
  /** Optional `<head>` extras (raw HTML). */
  head: string[];
  /** Element stack — each entry is a buffer for that container's children. */
  stack: string[][];
  /** Accumulated <style> rules. */
  css: string[];
  /** Accumulated <script> source. */
  js: string[];
  /** True once any web builtin has run (so the IDE knows to flip to the web panel). */
  produced: boolean;
}

export type WebEmitCallback = (state: WebState) => void;

/* ──────────────────────────────────────────────────────────────────────── */

function asStr(v: unknown, fb = ''): string {
  if (v === null || v === undefined) return fb;
  return typeof v === 'string' ? v : stringify(v);
}
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
function escapeAttr(s: string): string {
  return s.replace(/[&"]/g, (c) => ({ '&': '&amp;', '"': '&quot;' }[c]!));
}
function renderAttrs(attrs: Record<string, unknown> | undefined): string {
  if (!attrs) return '';
  const parts: string[] = [];
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v === null || v === undefined) continue;
    if (v === true) { parts.push(k); continue; }
    parts.push(`${k}="${escapeAttr(asStr(v))}"`);
  }
  return parts.length ? ' ' + parts.join(' ') : '';
}
function cssRuleFromDict(selector: string, dict: Record<string, unknown>): string {
  const decls = Object.entries(dict)
    .map(([k, v]) => `  ${k.replace(/_/g, '-')}: ${asStr(v)};`)
    .join('\n');
  return `${selector} {\n${decls}\n}`;
}

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

/** Every HTML element gets a convenience builtin. Container ones also get `open_X` / `endX`. */
const ELEMENT_TAGS = [
  // structure
  'div', 'span', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav',
  'figure', 'figcaption', 'address', 'hgroup',
  // headings & text
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'pre', 'code',
  'em', 'strong', 'small', 'mark', 'cite', 'q', 'abbr', 'sub', 'sup',
  'b', 'i', 'u', 's', 'del', 'ins', 'kbd', 'samp', 'var', 'time',
  // links & media
  'a', 'img', 'picture', 'source', 'video', 'audio', 'iframe', 'embed', 'object',
  'canvas', 'svg', 'map', 'area',
  // lists
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  // tables
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  // forms
  'form', 'input', 'textarea', 'button', 'select', 'option', 'optgroup',
  'label', 'fieldset', 'legend', 'datalist', 'output', 'progress', 'meter',
  // interactive
  'details', 'summary', 'dialog', 'menu',
  // misc
  'hr', 'br',
];

/* ──────────────────────────────────────────────────────────────────────── */

export function createWebBuiltins(emit: WebEmitCallback): Map<string, SdevFunction> {
  const builtins = new Map<string, SdevFunction>();

  const state: WebState = {
    title: 'sdev Web App',
    head: [],
    stack: [[]],   // root buffer
    css: [],
    js: [],
    produced: false,
  };

  const top = () => state.stack[state.stack.length - 1];
  const push = (html: string) => { top().push(html); };
  const mark = () => { state.produced = true; emit(state); };

  /** Parse element function args:
   *   tag()                           → text='', attrs={}
   *   tag("hello")                    → text='hello'
   *   tag({ class: "x" })             → attrs={class:"x"}
   *   tag("hello", { class: "x" })    → text='hello', attrs={class:"x"}
   */
  function parseElArgs(args: unknown[]): { text: string; attrs: Record<string, unknown> } {
    let text = '';
    let attrs: Record<string, unknown> = {};
    if (args.length === 1) {
      if (isPlainObject(args[0])) attrs = args[0];
      else text = asStr(args[0]);
    } else if (args.length >= 2) {
      if (isPlainObject(args[0])) {
        attrs = args[0];
        if (isPlainObject(args[1])) Object.assign(attrs, args[1]);
        else text = asStr(args[1]);
      } else {
        text = asStr(args[0]);
        if (isPlainObject(args[1])) attrs = args[1];
      }
    }
    return { text, attrs };
  }

  function emitElement(tag: string, args: unknown[]) {
    const { text, attrs } = parseElArgs(args);
    if (VOID_TAGS.has(tag)) {
      push(`<${tag}${renderAttrs(attrs)}>`);
    } else {
      push(`<${tag}${renderAttrs(attrs)}>${escapeHtml(text)}</${tag}>`);
    }
    mark();
  }

  function openElement(tag: string, args: unknown[]) {
    const { attrs } = parseElArgs(args);
    push(`<${tag}${renderAttrs(attrs)}>`);
    state.stack.push([]);
    mark();
  }

  function closeElementGeneric() {
    if (state.stack.length <= 1) return;
    const inner = state.stack.pop()!.join('');
    // Replace the opening tag entry in the parent with opening + inner + close
    // We stored only the open tag earlier; just append children + a matching close.
    // The latest entry in parent IS the open tag — append inner & close after it.
    const parent = top();
    parent.push(inner);
    // Re-derive last tag name from the most recent <name ...> that we wrote.
    // Easier: caller passes name to close_<name>. For generic close(), scan back.
    // Since openElement always writes <tag...> as the entry preceding our pushed
    // buffer, scan parent backwards for the most recent open without a close.
    // Simpler approach: keep a parallel name stack.
  }

  // Cleaner: maintain a parallel name stack so close() knows the tag.
  const nameStack: string[] = [];
  function openEl(tag: string, args: unknown[]) {
    const { attrs } = parseElArgs(args);
    push(`<${tag}${renderAttrs(attrs)}>`);
    state.stack.push([]);
    nameStack.push(tag);
    mark();
  }
  function closeEl() {
    if (state.stack.length <= 1 || nameStack.length === 0) return;
    const tag = nameStack.pop()!;
    const inner = state.stack.pop()!.join('');
    top().push(inner + `</${tag}>`);
    mark();
  }

  /* ─────────────────────────── Page lifecycle ─────────────────────────── */

  builtins.set('page', { type: 'builtin', call: (args: unknown[]) => {
    state.title = asStr(args[0], 'sdev Web App');
    state.head.length = 0;
    state.stack.length = 0; state.stack.push([]);
    state.css.length = 0;
    state.js.length = 0;
    nameStack.length = 0;
    mark();
    return null;
  }});

  builtins.set('endpage', { type: 'builtin', call: () => {
    // Auto-close anything still open.
    while (nameStack.length) closeEl();
    mark();
    return null;
  }});

  builtins.set('title', { type: 'builtin', call: (args: unknown[]) => {
    state.title = asStr(args[0], state.title); mark(); return null;
  }});

  builtins.set('meta', { type: 'builtin', call: (args: unknown[]) => {
    const attrs = isPlainObject(args[0]) ? args[0] : {};
    state.head.push(`<meta${renderAttrs(attrs)}>`); mark(); return null;
  }});

  builtins.set('link', { type: 'builtin', call: (args: unknown[]) => {
    const attrs = isPlainObject(args[0]) ? args[0] : { rel: asStr(args[0]), href: asStr(args[1]) };
    state.head.push(`<link${renderAttrs(attrs)}>`); mark(); return null;
  }});

  /* ─────────────────────────── Generic builders ─────────────────────────── */

  // tag(name, text?, attrs?)  — works for any HTML tag, even ones we didn't list.
  builtins.set('tag', { type: 'builtin', call: (args: unknown[]) => {
    const name = asStr(args[0], 'div');
    emitElement(name, args.slice(1));
    return null;
  }});

  // open(name, attrs?)  /  close()
  builtins.set('open', { type: 'builtin', call: (args: unknown[]) => {
    const name = asStr(args[0], 'div');
    openEl(name, args.slice(1));
    return null;
  }});
  builtins.set('close', { type: 'builtin', call: () => { closeEl(); return null; }});

  /* ─────────────────────────── CSS ─────────────────────────── */

  // style(selector, props_dict)  — or  style(raw_css_string)
  builtins.set('style', { type: 'builtin', call: (args: unknown[]) => {
    if (args.length === 1 && typeof args[0] === 'string') {
      state.css.push(args[0]);
    } else {
      const selector = asStr(args[0], '*');
      const dict = isPlainObject(args[1]) ? args[1] : {};
      state.css.push(cssRuleFromDict(selector, dict));
    }
    mark();
    return null;
  }});

  builtins.set('keyframes', { type: 'builtin', call: (args: unknown[]) => {
    const name = asStr(args[0], 'kf');
    const steps = isPlainObject(args[1]) ? args[1] : {};
    const body = Object.entries(steps)
      .map(([k, v]) => isPlainObject(v) ? `  ${k} { ${Object.entries(v).map(([p, pv]) => `${p.replace(/_/g, '-')}: ${asStr(pv)}`).join('; ')} }` : '')
      .join('\n');
    state.css.push(`@keyframes ${name} {\n${body}\n}`);
    mark(); return null;
  }});

  /* ─────────────────────────── JS ─────────────────────────── */

  builtins.set('script', { type: 'builtin', call: (args: unknown[]) => {
    state.js.push(asStr(args[0])); mark(); return null;
  }});

  // onclick("#id", "alert('hi')")
  builtins.set('onclick', { type: 'builtin', call: (args: unknown[]) => {
    const sel = asStr(args[0]);
    const code = asStr(args[1]);
    state.js.push(`document.querySelectorAll(${JSON.stringify(sel)}).forEach(el => el.addEventListener('click', () => { ${code} }));`);
    mark(); return null;
  }});

  // on("input", "#id", "...")  — generic event
  builtins.set('on', { type: 'builtin', call: (args: unknown[]) => {
    const evt = asStr(args[0]);
    const sel = asStr(args[1]);
    const code = asStr(args[2]);
    state.js.push(`document.querySelectorAll(${JSON.stringify(sel)}).forEach(el => el.addEventListener(${JSON.stringify(evt)}, (event) => { ${code} }));`);
    mark(); return null;
  }});

  /* ─────────────────────────── Raw passthrough ─────────────────────────── */

  builtins.set('raw_html', { type: 'builtin', call: (args: unknown[]) => { push(asStr(args[0])); mark(); return null; }});
  builtins.set('raw_css',  { type: 'builtin', call: (args: unknown[]) => { state.css.push(asStr(args[0])); mark(); return null; }});
  builtins.set('raw_js',   { type: 'builtin', call: (args: unknown[]) => { state.js.push(asStr(args[0])); mark(); return null; }});

  /* ─────────────────────────── Element helpers ─────────────────────────── */

  // Self-contained element function for every tag.
  for (const tagName of ELEMENT_TAGS) {
    // Avoid clobbering names that collide with other domains.
    // Reserved by other modules: input (UI), select (UI), button (UI),
    // textarea (UI), label (UI), progress (UI), table (UI), menu (UI),
    // option (UI), image (UI), title (we already define above).
    // For these, expose ONLY the html_* / open_* form to keep both worlds working.
    const collides = ['input', 'select', 'button', 'textarea', 'label', 'progress',
      'table', 'menu', 'option', 'image', 'title', 'meta', 'link', 'script',
      'style', 'on', 'open', 'close', 'tag', 'page', 'header', 'footer',
      'form', 'video', 'audio'].includes(tagName);

    if (!collides) {
      builtins.set(tagName, {
        type: 'builtin',
        call: (args: unknown[]) => { emitElement(tagName, args); return null; },
      });
    }

    // Always expose html_<tag> as the unambiguous form.
    builtins.set(`html_${tagName}`, {
      type: 'builtin',
      call: (args: unknown[]) => { emitElement(tagName, args); return null; },
    });

    // Container open/close (skip for void elements).
    if (!VOID_TAGS.has(tagName)) {
      builtins.set(`open_${tagName}`, {
        type: 'builtin',
        call: (args: unknown[]) => { openEl(tagName, args); return null; },
      });
      builtins.set(`end_${tagName}`, {
        type: 'builtin',
        call: () => { closeEl(); return null; },
      });
    }
  }

  return builtins;
}

/* ──────────────────────────────────────────────────────────────────────── */

/** Render a complete HTML document from the captured state. */
export function renderWebDocument(state: WebState): string {
  const body = state.stack[0]?.join('') ?? '';
  const css = state.css.join('\n\n');
  const js = state.js.join('\n\n');
  const head = state.head.join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(state.title)}</title>
${head}
<style>
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; line-height: 1.5; color: #0b1220; background: #ffffff; }
${css}
</style>
</head>
<body>
${body}
<script>
${js}
</script>
</body>
</html>`;
}
