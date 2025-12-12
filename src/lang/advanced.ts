import { SdevError } from './errors';
import { SdevFunction, stringify } from './builtins';

export function createAdvancedBuiltins(
  output: (msg: string) => void
): Map<string, SdevFunction> {
  const builtins = new Map<string, SdevFunction>();

  // ============= JSON Operations =============
  builtins.set('etch', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('etch() takes 1 argument', line);
      return JSON.stringify(args[0]);
    },
  });

  builtins.set('unetch', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('unetch() takes 1 argument', line);
      try {
        return JSON.parse(args[0] as string);
      } catch {
        throw new SdevError('Invalid JSON', line);
      }
    },
  });

  // ============= File I/O (Browser simulation) =============
  const virtualFS = new Map<string, string>();

  builtins.set('inscribe', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('inscribe() takes 2 arguments (path, content)', line);
      const path = args[0] as string;
      const content = stringify(args[1]);
      virtualFS.set(path, content);
      output(`📝 Written to ${path}`);
      return true;
    },
  });

  builtins.set('decipher', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('decipher() takes 1 argument (path)', line);
      const path = args[0] as string;
      const content = virtualFS.get(path);
      if (content === undefined) {
        throw new SdevError(`File not found: ${path}`, line);
      }
      return content;
    },
  });

  builtins.set('erase', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('erase() takes 1 argument (path)', line);
      const path = args[0] as string;
      const existed = virtualFS.delete(path);
      return existed;
    },
  });

  builtins.set('scroll', {
    type: 'builtin',
    call: () => {
      return Array.from(virtualFS.keys());
    },
  });

  // ============= HTTP/Networking (async simulation) =============
  builtins.set('invoke', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length < 1) throw new SdevError('invoke() takes at least 1 argument (url)', line);
      const url = args[0] as string;
      const options = (args[1] as Record<string, unknown>) ?? {};
      
      // Return a promise-like object that can be awaited in sdev
      return {
        type: 'promise',
        url,
        options,
        resolve: async () => {
          try {
            const response = await fetch(url, {
              method: (options.method as string) ?? 'GET',
              headers: options.headers as Record<string, string>,
              body: options.body ? JSON.stringify(options.body) : undefined,
            });
            const text = await response.text();
            try {
              return JSON.parse(text);
            } catch {
              return text;
            }
          } catch (e) {
            throw new SdevError(`Network error: ${e}`, line);
          }
        },
      };
    },
  });

  // ============= Time Operations =============
  builtins.set('now', {
    type: 'builtin',
    call: () => Date.now(),
  });

  builtins.set('timestamp', {
    type: 'builtin',
    call: () => new Date().toISOString(),
  });

  builtins.set('pause', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('pause() takes 1 argument (ms)', line);
      const ms = args[0] as number;
      return { type: 'delay', ms };
    },
  });

  // ============= Advanced Math =============
  builtins.set('sin', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('sin() takes 1 argument', line);
      return Math.sin(args[0] as number);
    },
  });

  builtins.set('cos', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('cos() takes 1 argument', line);
      return Math.cos(args[0] as number);
    },
  });

  builtins.set('tan', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('tan() takes 1 argument', line);
      return Math.tan(args[0] as number);
    },
  });

  builtins.set('asin', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('asin() takes 1 argument', line);
      return Math.asin(args[0] as number);
    },
  });

  builtins.set('acos', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('acos() takes 1 argument', line);
      return Math.acos(args[0] as number);
    },
  });

  builtins.set('atan', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('atan() takes 1 argument', line);
      return Math.atan(args[0] as number);
    },
  });

  builtins.set('atan2', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('atan2() takes 2 arguments (y, x)', line);
      return Math.atan2(args[0] as number, args[1] as number);
    },
  });

  builtins.set('log', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('log() takes 1 argument', line);
      return Math.log(args[0] as number);
    },
  });

  builtins.set('log10', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('log10() takes 1 argument', line);
      return Math.log10(args[0] as number);
    },
  });

  builtins.set('exp', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('exp() takes 1 argument', line);
      return Math.exp(args[0] as number);
    },
  });

  // Constants
  builtins.set('PI', {
    type: 'builtin',
    call: () => Math.PI,
  });

  builtins.set('E', {
    type: 'builtin',
    call: () => Math.E,
  });

  builtins.set('TAU', {
    type: 'builtin',
    call: () => Math.PI * 2,
  });

  // ============= Sorting & Searching =============
  builtins.set('sort', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length < 1) throw new SdevError('sort() takes at least 1 argument', line);
      const arr = args[0];
      if (!Array.isArray(arr)) throw new SdevError('First argument must be a list', line);
      const sorted = [...arr];
      if (args.length === 2 && typeof args[1] === 'object' && args[1] !== null) {
        const fn = args[1] as SdevFunction;
        sorted.sort((a, b) => {
          const result = fn.call([a, b], line);
          return result as number;
        });
      } else {
        sorted.sort((a, b) => {
          if (typeof a === 'number' && typeof b === 'number') return a - b;
          return String(a).localeCompare(String(b));
        });
      }
      return sorted;
    },
  });

  builtins.set('find', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('find() takes 2 arguments (list, predicate)', line);
      const arr = args[0];
      const fn = args[1] as SdevFunction;
      if (!Array.isArray(arr)) throw new SdevError('First argument must be a list', line);
      for (const item of arr) {
        if (fn.call([item], line)) return item;
      }
      return null;
    },
  });

  builtins.set('position', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('position() takes 2 arguments', line);
      const arr = args[0];
      const needle = args[1];
      if (!Array.isArray(arr)) throw new SdevError('First argument must be a list', line);
      return arr.indexOf(needle);
    },
  });

  // ============= Set Operations =============
  builtins.set('unique', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('unique() takes 1 argument', line);
      const arr = args[0];
      if (!Array.isArray(arr)) throw new SdevError('Argument must be a list', line);
      return [...new Set(arr.map(x => JSON.stringify(x)))].map(x => JSON.parse(x));
    },
  });

  builtins.set('union', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('union() takes 2 arguments', line);
      const a = args[0];
      const b = args[1];
      if (!Array.isArray(a) || !Array.isArray(b)) throw new SdevError('Arguments must be lists', line);
      const set = new Set([...a.map(x => JSON.stringify(x)), ...b.map(x => JSON.stringify(x))]);
      return [...set].map(x => JSON.parse(x));
    },
  });

  builtins.set('intersect', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('intersect() takes 2 arguments', line);
      const a = args[0] as unknown[];
      const b = args[1] as unknown[];
      if (!Array.isArray(a) || !Array.isArray(b)) throw new SdevError('Arguments must be lists', line);
      const setB = new Set(b.map(x => JSON.stringify(x)));
      return a.filter(x => setB.has(JSON.stringify(x)));
    },
  });

  // ============= Random =============
  builtins.set('randint', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('randint() takes 2 arguments (min, max)', line);
      const min = Math.ceil(args[0] as number);
      const max = Math.floor(args[1] as number);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
  });

  builtins.set('pick', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('pick() takes 1 argument', line);
      const arr = args[0];
      if (!Array.isArray(arr)) throw new SdevError('Argument must be a list', line);
      if (arr.length === 0) return null;
      return arr[Math.floor(Math.random() * arr.length)];
    },
  });

  builtins.set('shuffle', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('shuffle() takes 1 argument', line);
      const arr = args[0];
      if (!Array.isArray(arr)) throw new SdevError('Argument must be a list', line);
      const shuffled = [...arr];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    },
  });

  // ============= Assertions (for testing) =============
  builtins.set('assert', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length < 1) throw new SdevError('assert() takes at least 1 argument', line);
      const condition = args[0];
      const message = args[1] as string ?? 'Assertion failed';
      if (!condition) {
        throw new SdevError(message, line);
      }
      return true;
    },
  });

  builtins.set('asserteq', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('asserteq() takes 2 arguments', line);
      const a = JSON.stringify(args[0]);
      const b = JSON.stringify(args[1]);
      if (a !== b) {
        throw new SdevError(`Assertion failed: ${a} differs ${b}`, line);
      }
      return true;
    },
  });

  return builtins;
}
