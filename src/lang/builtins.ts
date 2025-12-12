import { SdevError } from './errors';

export type OutputCallback = (message: string) => void;

export interface SdevFunction {
  type: 'builtin' | 'user' | 'lambda';
  call: (args: unknown[], line: number) => unknown;
}

export function createBuiltins(output: OutputCallback): Map<string, SdevFunction> {
  const builtins = new Map<string, SdevFunction>();

  // speak - output to console
  builtins.set('speak', {
    type: 'builtin',
    call: (args: unknown[]) => {
      const message = args.map(stringify).join(' ');
      output(message);
      return null;
    },
  });

  // whisper - output without newline concept (same as speak in this context)
  builtins.set('whisper', {
    type: 'builtin',
    call: (args: unknown[]) => {
      const message = args.map(stringify).join('');
      output(message);
      return null;
    },
  });

  // shout - output in uppercase
  builtins.set('shout', {
    type: 'builtin',
    call: (args: unknown[]) => {
      const message = args.map(stringify).join(' ').toUpperCase();
      output(message);
      return null;
    },
  });

  // measure - get length
  builtins.set('measure', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) {
        throw new SdevError('measure() takes exactly 1 argument', line);
      }
      const arg = args[0];
      if (typeof arg === 'string') return arg.length;
      if (Array.isArray(arg)) return arg.length;
      if (arg && typeof arg === 'object') return Object.keys(arg).length;
      throw new SdevError('measure() argument must be string, list, or dict', line);
    },
  });

  // morph - type conversion
  builtins.set('morph', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('morph() takes 2 arguments (value, type)', line);
      const val = args[0];
      const targetType = args[1];
      if (typeof targetType !== 'string') throw new SdevError('Second argument must be type name', line);
      
      switch (targetType) {
        case 'number':
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const num = parseFloat(val);
            if (isNaN(num)) throw new SdevError(`Cannot morph '${val}' to number`, line);
            return num;
          }
          throw new SdevError('Cannot morph to number', line);
        case 'text':
          return stringify(val);
        case 'truth':
          return isTruthy(val);
        default:
          throw new SdevError(`Unknown type: ${targetType}`, line);
      }
    },
  });

  // conjure a sequence
  builtins.set('sequence', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length < 1 || args.length > 3) {
        throw new SdevError('sequence() takes 1 to 3 arguments', line);
      }
      let start = 0, end = 0, step = 1;
      if (args.length === 1) {
        end = toNumber(args[0], line);
      } else if (args.length === 2) {
        start = toNumber(args[0], line);
        end = toNumber(args[1], line);
      } else {
        start = toNumber(args[0], line);
        end = toNumber(args[1], line);
        step = toNumber(args[2], line);
      }
      if (step === 0) throw new SdevError('sequence() step cannot be 0', line);
      const result: number[] = [];
      if (step > 0) {
        for (let i = start; i < end; i += step) result.push(i);
      } else {
        for (let i = start; i > end; i += step) result.push(i);
      }
      return result;
    },
  });

  // each - map over array with lambda
  builtins.set('each', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('each() takes 2 arguments (list, transform)', line);
      const arr = args[0];
      const fn = args[1] as SdevFunction;
      if (!Array.isArray(arr)) throw new SdevError('First argument must be a list', line);
      if (!fn || typeof fn !== 'object' || !('call' in fn)) {
        throw new SdevError('Second argument must be a function', line);
      }
      return arr.map((item, idx) => fn.call([item, idx], line));
    },
  });

  // sift - filter array
  builtins.set('sift', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('sift() takes 2 arguments (list, predicate)', line);
      const arr = args[0];
      const fn = args[1] as SdevFunction;
      if (!Array.isArray(arr)) throw new SdevError('First argument must be a list', line);
      if (!fn || typeof fn !== 'object' || !('call' in fn)) {
        throw new SdevError('Second argument must be a function', line);
      }
      return arr.filter((item) => isTruthy(fn.call([item], line)));
    },
  });

  // fold - reduce array
  builtins.set('fold', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 3) throw new SdevError('fold() takes 3 arguments (list, initial, reducer)', line);
      const arr = args[0];
      let acc = args[1];
      const fn = args[2] as SdevFunction;
      if (!Array.isArray(arr)) throw new SdevError('First argument must be a list', line);
      if (!fn || typeof fn !== 'object' || !('call' in fn)) {
        throw new SdevError('Third argument must be a function', line);
      }
      for (const item of arr) {
        acc = fn.call([acc, item], line);
      }
      return acc;
    },
  });

  // gather - push to list
  builtins.set('gather', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('gather() takes 2 arguments', line);
      const arr = args[0];
      if (!Array.isArray(arr)) throw new SdevError('First argument must be a list', line);
      arr.push(args[1]);
      return arr;
    },
  });

  // pluck - pop from list
  builtins.set('pluck', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('pluck() takes 1 argument', line);
      const arr = args[0];
      if (!Array.isArray(arr)) throw new SdevError('Argument must be a list', line);
      if (arr.length === 0) throw new SdevError('Cannot pluck from empty list', line);
      return arr.pop();
    },
  });

  // slice - get portion
  builtins.set('portion', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length < 2 || args.length > 3) {
        throw new SdevError('portion() takes 2 or 3 arguments', line);
      }
      const arr = args[0];
      if (!Array.isArray(arr) && typeof arr !== 'string') {
        throw new SdevError('First argument must be a list or string', line);
      }
      const start = toNumber(args[1], line);
      const end = args.length === 3 ? toNumber(args[2], line) : undefined;
      return arr.slice(start, end);
    },
  });

  // weave - join list to string
  builtins.set('weave', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('weave() takes 2 arguments', line);
      const arr = args[0];
      if (!Array.isArray(arr)) throw new SdevError('First argument must be a list', line);
      const sep = args[1];
      if (typeof sep !== 'string') throw new SdevError('Second argument must be a string', line);
      return arr.map(stringify).join(sep);
    },
  });

  // shatter - split string to list
  builtins.set('shatter', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('shatter() takes 2 arguments', line);
      const str = args[0];
      if (typeof str !== 'string') throw new SdevError('First argument must be a string', line);
      const sep = args[1];
      if (typeof sep !== 'string') throw new SdevError('Second argument must be a string', line);
      return str.split(sep);
    },
  });

  // essence - get type
  builtins.set('essence', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('essence() takes 1 argument', line);
      const val = args[0];
      if (val === null) return 'void';
      if (typeof val === 'number') return 'number';
      if (typeof val === 'string') return 'text';
      if (typeof val === 'boolean') return 'truth';
      if (Array.isArray(val)) return 'list';
      if (typeof val === 'object') {
        if ((val as { type?: string }).type === 'builtin' || 
            (val as { type?: string }).type === 'user' ||
            (val as { type?: string }).type === 'lambda') {
          return 'conjuration';
        }
        return 'tome';
      }
      return 'mystery';
    },
  });

  // Math operations with unique names
  builtins.set('magnitude', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('magnitude() takes 1 argument', line);
      return Math.abs(toNumber(args[0], line));
    },
  });

  builtins.set('least', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length === 0) throw new SdevError('least() takes at least 1 argument', line);
      if (args.length === 1 && Array.isArray(args[0])) {
        return Math.min(...args[0].map((x) => toNumber(x, line)));
      }
      return Math.min(...args.map((x) => toNumber(x, line)));
    },
  });

  builtins.set('greatest', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length === 0) throw new SdevError('greatest() takes at least 1 argument', line);
      if (args.length === 1 && Array.isArray(args[0])) {
        return Math.max(...args[0].map((x) => toNumber(x, line)));
      }
      return Math.max(...args.map((x) => toNumber(x, line)));
    },
  });

  builtins.set('root', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('root() takes 1 argument', line);
      return Math.sqrt(toNumber(args[0], line));
    },
  });

  builtins.set('ground', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('ground() takes 1 argument', line);
      return Math.floor(toNumber(args[0], line));
    },
  });

  builtins.set('elevate', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('elevate() takes 1 argument', line);
      return Math.ceil(toNumber(args[0], line));
    },
  });

  builtins.set('nearby', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('nearby() takes 1 argument', line);
      return Math.round(toNumber(args[0], line));
    },
  });

  builtins.set('chaos', {
    type: 'builtin',
    call: () => Math.random(),
  });

  // Dict operations
  builtins.set('inscriptions', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('inscriptions() takes 1 argument', line);
      const obj = args[0];
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
        throw new SdevError('Argument must be a tome (dict)', line);
      }
      return Object.keys(obj as Record<string, unknown>);
    },
  });

  builtins.set('contents', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('contents() takes 1 argument', line);
      const obj = args[0];
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
        throw new SdevError('Argument must be a tome (dict)', line);
      }
      return Object.values(obj as Record<string, unknown>);
    },
  });

  // String operations
  builtins.set('upper', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('upper() takes 1 argument', line);
      if (typeof args[0] !== 'string') throw new SdevError('Argument must be text', line);
      return args[0].toUpperCase();
    },
  });

  builtins.set('lower', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('lower() takes 1 argument', line);
      if (typeof args[0] !== 'string') throw new SdevError('Argument must be text', line);
      return args[0].toLowerCase();
    },
  });

  builtins.set('trim', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('trim() takes 1 argument', line);
      if (typeof args[0] !== 'string') throw new SdevError('Argument must be text', line);
      return args[0].trim();
    },
  });

  builtins.set('reverse', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('reverse() takes 1 argument', line);
      const val = args[0];
      if (typeof val === 'string') return val.split('').reverse().join('');
      if (Array.isArray(val)) return [...val].reverse();
      throw new SdevError('Argument must be text or list', line);
    },
  });

  builtins.set('contains', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('contains() takes 2 arguments', line);
      const haystack = args[0];
      const needle = args[1];
      if (typeof haystack === 'string' && typeof needle === 'string') {
        return haystack.includes(needle);
      }
      if (Array.isArray(haystack)) {
        return haystack.some(item => item === needle);
      }
      throw new SdevError('First argument must be text or list', line);
    },
  });

  // Advanced math
  builtins.set('sin', { type: 'builtin', call: (args: unknown[]) => Math.sin(args[0] as number) });
  builtins.set('cos', { type: 'builtin', call: (args: unknown[]) => Math.cos(args[0] as number) });
  builtins.set('tan', { type: 'builtin', call: (args: unknown[]) => Math.tan(args[0] as number) });
  builtins.set('log', { type: 'builtin', call: (args: unknown[]) => Math.log(args[0] as number) });
  builtins.set('exp', { type: 'builtin', call: (args: unknown[]) => Math.exp(args[0] as number) });
  builtins.set('PI', { type: 'builtin', call: () => Math.PI });
  builtins.set('TAU', { type: 'builtin', call: () => Math.PI * 2 });
  
  // Random utilities
  builtins.set('randint', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('randint() takes 2 arguments', line);
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
      return arr[Math.floor(Math.random() * arr.length)] ?? null;
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

  // JSON
  builtins.set('etch', { type: 'builtin', call: (args: unknown[]) => JSON.stringify(args[0]) });
  builtins.set('unetch', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      try { return JSON.parse(args[0] as string); }
      catch { throw new SdevError('Invalid JSON', line); }
    },
  });

  return builtins;
}

export function stringify(value: unknown): string {
  if (value === null) return 'void';
  if (typeof value === 'boolean') return value ? 'yep' : 'nope';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    return '[' + value.map(stringify).join(', ') + ']';
  }
  if (typeof value === 'object') {
    if ((value as { type?: string }).type === 'builtin' || 
        (value as { type?: string }).type === 'user' ||
        (value as { type?: string }).type === 'lambda') {
      return '<conjuration>';
    }
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${k}: ${stringify(v)}`)
      .join(', ');
    return ':: ' + entries + ' ;;';
  }
  return String(value);
}

export function isTruthy(value: unknown): boolean {
  if (value === null) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function toNumber(value: unknown, line: number): number {
  if (typeof value === 'number') return value;
  throw new SdevError(`Expected number, got ${typeof value}`, line);
}
