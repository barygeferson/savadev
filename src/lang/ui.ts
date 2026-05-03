// SDev UI Toolkit — produces declarative UI commands consumed by AppPreviewPanel.tsx
import { SdevError } from './errors';
import { SdevFunction, stringify } from './builtins';

export type UiNodeType =
  | 'window' | 'row' | 'column' | 'group' | 'tabs' | 'tab'
  | 'label' | 'heading' | 'paragraph'
  | 'button' | 'input' | 'textarea' | 'checkbox' | 'slider'
  | 'select' | 'option'
  | 'image' | 'divider' | 'spacer' | 'progress'
  | 'table' | 'menu' | 'menuitem' | 'dialog';

export interface UiNode {
  id: number;
  type: UiNodeType;
  props: Record<string, unknown>;
  children: number[]; // ordered child ids
  parent: number | null;
  // Event handler IDs (handler => sdev callable)
  handlers: Record<string, number>;
}

export interface UiCallback {
  fn: (args: unknown[]) => unknown;
}

export interface UiState {
  nodes: Map<number, UiNode>;
  rootId: number | null;
  // Reactive variables (bound to inputs/checkboxes/sliders)
  values: Map<string, unknown>;
}

export type UiEmitCallback = (state: UiState) => void;

export function createUiBuiltins(
  emit: UiEmitCallback,
  registerHandler: (cb: UiCallback) => number
): Map<string, SdevFunction> {
  const builtins = new Map<string, SdevFunction>();
  const state: UiState = { nodes: new Map(), rootId: null, values: new Map() };
  let nextId = 1;
  // Stack of currently-open container IDs for fluent building.
  const containerStack: number[] = [];

  const currentParent = (): number | null =>
    containerStack.length > 0 ? containerStack[containerStack.length - 1] : state.rootId;

  function pushNode(type: UiNodeType, props: Record<string, unknown>, opts: { container?: boolean; isRoot?: boolean } = {}): UiNode {
    const id = nextId++;
    const parent = opts.isRoot ? null : currentParent();
    const node: UiNode = { id, type, props, children: [], parent, handlers: {} };
    state.nodes.set(id, node);
    if (parent !== null) {
      const p = state.nodes.get(parent);
      if (p) p.children.push(id);
    }
    if (opts.isRoot) state.rootId = id;
    if (opts.container) containerStack.push(id);
    emit(state);
    return node;
  }

  function pop() {
    if (containerStack.length > 0) containerStack.pop();
    emit(state);
  }

  function asString(v: unknown, fallback = ''): string {
    if (v === null || v === undefined) return fallback;
    return typeof v === 'string' ? v : stringify(v);
  }
  function asNumber(v: unknown, fallback = 0): number {
    if (typeof v === 'number') return v;
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  function asBool(v: unknown): boolean { return !!v; }

  // Helper: callable arg (for onclick etc.)
  function asHandler(v: unknown): number | null {
    if (!v || typeof v !== 'object') return null;
    const fn = v as { type?: string; call?: (args: unknown[]) => unknown };
    if (fn.type !== 'builtin' && fn.type !== 'user' && fn.type !== 'lambda') return null;
    if (typeof fn.call !== 'function') return null;
    return registerHandler({ fn: (args) => fn.call!(args) });
  }

  // ───────────────────────── Containers ─────────────────────────
  builtins.set('window', { type: 'builtin', call: (args: unknown[], line: number) => {
    const title = asString(args[0], 'sdev App');
    const width = asNumber(args[1], 480);
    const height = asNumber(args[2], 600);
    // Reset state
    state.nodes.clear();
    state.rootId = null;
    state.values.clear();
    containerStack.length = 0;
    nextId = 1;
    pushNode('window', { title, width, height }, { container: true, isRoot: true });
    return null;
  }});

  builtins.set('endwindow', { type: 'builtin', call: () => { pop(); return null; }});

  builtins.set('row', { type: 'builtin', call: () => { pushNode('row', { gap: 8 }, { container: true }); return null; }});
  builtins.set('endrow', { type: 'builtin', call: () => { pop(); return null; }});
  builtins.set('column', { type: 'builtin', call: () => { pushNode('column', { gap: 8 }, { container: true }); return null; }});
  builtins.set('endcolumn', { type: 'builtin', call: () => { pop(); return null; }});

  builtins.set('group', { type: 'builtin', call: (args: unknown[]) => {
    pushNode('group', { title: asString(args[0], '') }, { container: true });
    return null;
  }});
  builtins.set('endgroup', { type: 'builtin', call: () => { pop(); return null; }});

  builtins.set('tabs', { type: 'builtin', call: () => { pushNode('tabs', {}, { container: true }); return null; }});
  builtins.set('endtabs', { type: 'builtin', call: () => { pop(); return null; }});
  builtins.set('tab', { type: 'builtin', call: (args: unknown[]) => {
    pushNode('tab', { title: asString(args[0], 'Tab') }, { container: true });
    return null;
  }});
  builtins.set('endtab', { type: 'builtin', call: () => { pop(); return null; }});

  // ───────────────────────── Display widgets ─────────────────────────
  builtins.set('heading', { type: 'builtin', call: (args: unknown[]) => {
    pushNode('heading', { text: asString(args[0], ''), level: asNumber(args[1], 1) });
    return null;
  }});

  builtins.set('label', { type: 'builtin', call: (args: unknown[]) => {
    pushNode('label', { text: asString(args[0], '') });
    return null;
  }});

  builtins.set('paragraph', { type: 'builtin', call: (args: unknown[]) => {
    pushNode('paragraph', { text: asString(args[0], '') });
    return null;
  }});

  builtins.set('image', { type: 'builtin', call: (args: unknown[]) => {
    pushNode('image', { src: asString(args[0]), width: asNumber(args[1], 0), height: asNumber(args[2], 0), alt: asString(args[3], '') });
    return null;
  }});

  builtins.set('divider', { type: 'builtin', call: () => { pushNode('divider', {}); return null; }});
  builtins.set('spacer', { type: 'builtin', call: (args: unknown[]) => { pushNode('spacer', { size: asNumber(args[0], 8) }); return null; }});

  builtins.set('progress', { type: 'builtin', call: (args: unknown[]) => {
    pushNode('progress', { value: asNumber(args[0], 0), max: asNumber(args[1], 100) });
    return null;
  }});

  // ───────────────────────── Interactive widgets ─────────────────────────
  builtins.set('button', { type: 'builtin', call: (args: unknown[], line: number) => {
    const label = asString(args[0], 'Button');
    const handler = asHandler(args[1]);
    const node = pushNode('button', { label, variant: asString(args[2], 'default') });
    if (handler !== null) node.handlers.click = handler;
    emit(state);
    return null;
  }});

  builtins.set('input', { type: 'builtin', call: (args: unknown[]) => {
    const bind = asString(args[0], '');
    const placeholder = asString(args[1], '');
    if (bind && !state.values.has(bind)) state.values.set(bind, '');
    pushNode('input', { bind, placeholder });
    return null;
  }});

  builtins.set('textarea', { type: 'builtin', call: (args: unknown[]) => {
    const bind = asString(args[0], '');
    const placeholder = asString(args[1], '');
    const rows = asNumber(args[2], 4);
    if (bind && !state.values.has(bind)) state.values.set(bind, '');
    pushNode('textarea', { bind, placeholder, rows });
    return null;
  }});

  builtins.set('checkbox', { type: 'builtin', call: (args: unknown[]) => {
    const bind = asString(args[0], '');
    const label = asString(args[1], '');
    if (bind && !state.values.has(bind)) state.values.set(bind, false);
    pushNode('checkbox', { bind, label });
    return null;
  }});

  builtins.set('slider', { type: 'builtin', call: (args: unknown[]) => {
    const bind = asString(args[0], '');
    const min = asNumber(args[1], 0);
    const max = asNumber(args[2], 100);
    const step = asNumber(args[3], 1);
    if (bind && !state.values.has(bind)) state.values.set(bind, min);
    pushNode('slider', { bind, min, max, step });
    return null;
  }});

  builtins.set('select', { type: 'builtin', call: (args: unknown[]) => {
    const bind = asString(args[0], '');
    const opts = Array.isArray(args[1]) ? (args[1] as unknown[]).map(o => asString(o)) : [];
    if (bind && !state.values.has(bind)) state.values.set(bind, opts[0] ?? '');
    pushNode('select', { bind, options: opts });
    return null;
  }});

  // ───────────────────────── Tables ─────────────────────────
  builtins.set('table', { type: 'builtin', call: (args: unknown[]) => {
    const headers = Array.isArray(args[0]) ? (args[0] as unknown[]).map(h => asString(h)) : [];
    const rowsArg = Array.isArray(args[1]) ? args[1] as unknown[] : [];
    const rows = rowsArg.map(r => Array.isArray(r) ? (r as unknown[]).map(c => asString(c)) : []);
    pushNode('table', { headers, rows });
    return null;
  }});

  // ───────────────────────── Menu ─────────────────────────
  builtins.set('menu', { type: 'builtin', call: (args: unknown[]) => {
    pushNode('menu', { label: asString(args[0], 'Menu') }, { container: true });
    return null;
  }});
  builtins.set('endmenu', { type: 'builtin', call: () => { pop(); return null; }});
  builtins.set('menuitem', { type: 'builtin', call: (args: unknown[]) => {
    const label = asString(args[0], 'Item');
    const handler = asHandler(args[1]);
    const node = pushNode('menuitem', { label });
    if (handler !== null) node.handlers.click = handler;
    emit(state);
    return null;
  }});

  // ───────────────────────── Reactive value helpers ─────────────────────────
  builtins.set('uiget', { type: 'builtin', call: (args: unknown[]) => {
    const k = asString(args[0]);
    return state.values.has(k) ? state.values.get(k) : null;
  }});
  builtins.set('uiset', { type: 'builtin', call: (args: unknown[]) => {
    const k = asString(args[0]);
    state.values.set(k, args[1]);
    emit(state);
    return null;
  }});

  // Show window (re-emit in case)
  builtins.set('show', { type: 'builtin', call: () => { emit(state); return null; }});

  // Programmatic dialog
  builtins.set('alert', { type: 'builtin', call: (args: unknown[]) => {
    const msg = asString(args[0], '');
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-alert
      window.alert(msg);
    }
    return null;
  }});

  return builtins;
}

// External setter so the React panel can update reactive values when an input changes.
export function setUiValue(state: UiState, key: string, value: unknown): UiState {
  state.values.set(key, value);
  return state;
}
