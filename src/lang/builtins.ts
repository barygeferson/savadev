import { SdevError } from './errors';

export type OutputCallback = (message: string) => void;

export interface SdevFunction {
  type: 'builtin' | 'user';
  call: (args: unknown[], line: number) => unknown;
}

export function createBuiltins(output: OutputCallback): Map<string, SdevFunction> {
  const builtins = new Map<string, SdevFunction>();

  // Print function
  builtins.set('print', {
    type: 'builtin',
    call: (args: unknown[]) => {
      const message = args.map(stringify).join(' ');
      output(message);
      return null;
    },
  });

  // Length function
  builtins.set('len', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) {
        throw new SdevError('len() takes exactly 1 argument', line);
      }
      const arg = args[0];
      if (typeof arg === 'string') return arg.length;
      if (Array.isArray(arg)) return arg.length;
      if (arg && typeof arg === 'object') return Object.keys(arg).length;
      throw new SdevError('len() argument must be string, list, or dict', line);
    },
  });

  // Type conversion
  builtins.set('int', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('int() takes exactly 1 argument', line);
      const val = args[0];
      if (typeof val === 'number') return Math.floor(val);
      if (typeof val === 'string') {
        const num = parseInt(val, 10);
        if (isNaN(num)) throw new SdevError(`Cannot convert '${val}' to int`, line);
        return num;
      }
      throw new SdevError('int() argument must be number or string', line);
    },
  });

  builtins.set('float', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('float() takes exactly 1 argument', line);
      const val = args[0];
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const num = parseFloat(val);
        if (isNaN(num)) throw new SdevError(`Cannot convert '${val}' to float`, line);
        return num;
      }
      throw new SdevError('float() argument must be number or string', line);
    },
  });

  builtins.set('str', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('str() takes exactly 1 argument', line);
      return stringify(args[0]);
    },
  });

  builtins.set('bool', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('bool() takes exactly 1 argument', line);
      return isTruthy(args[0]);
    },
  });

  // Range function
  builtins.set('range', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length < 1 || args.length > 3) {
        throw new SdevError('range() takes 1 to 3 arguments', line);
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
      if (step === 0) throw new SdevError('range() step cannot be 0', line);
      const result: number[] = [];
      if (step > 0) {
        for (let i = start; i < end; i += step) result.push(i);
      } else {
        for (let i = start; i > end; i += step) result.push(i);
      }
      return result;
    },
  });

  // Math functions
  builtins.set('abs', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('abs() takes exactly 1 argument', line);
      return Math.abs(toNumber(args[0], line));
    },
  });

  builtins.set('min', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length === 0) throw new SdevError('min() takes at least 1 argument', line);
      if (args.length === 1 && Array.isArray(args[0])) {
        return Math.min(...args[0].map((x) => toNumber(x, line)));
      }
      return Math.min(...args.map((x) => toNumber(x, line)));
    },
  });

  builtins.set('max', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length === 0) throw new SdevError('max() takes at least 1 argument', line);
      if (args.length === 1 && Array.isArray(args[0])) {
        return Math.max(...args[0].map((x) => toNumber(x, line)));
      }
      return Math.max(...args.map((x) => toNumber(x, line)));
    },
  });

  builtins.set('sqrt', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('sqrt() takes exactly 1 argument', line);
      return Math.sqrt(toNumber(args[0], line));
    },
  });

  builtins.set('pow', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('pow() takes exactly 2 arguments', line);
      return Math.pow(toNumber(args[0], line), toNumber(args[1], line));
    },
  });

  builtins.set('floor', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('floor() takes exactly 1 argument', line);
      return Math.floor(toNumber(args[0], line));
    },
  });

  builtins.set('ceil', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('ceil() takes exactly 1 argument', line);
      return Math.ceil(toNumber(args[0], line));
    },
  });

  builtins.set('round', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('round() takes exactly 1 argument', line);
      return Math.round(toNumber(args[0], line));
    },
  });

  // List operations
  builtins.set('push', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('push() takes exactly 2 arguments', line);
      const arr = args[0];
      if (!Array.isArray(arr)) throw new SdevError('First argument must be a list', line);
      arr.push(args[1]);
      return arr;
    },
  });

  builtins.set('pop', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('pop() takes exactly 1 argument', line);
      const arr = args[0];
      if (!Array.isArray(arr)) throw new SdevError('Argument must be a list', line);
      if (arr.length === 0) throw new SdevError('Cannot pop from empty list', line);
      return arr.pop();
    },
  });

  builtins.set('slice', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length < 2 || args.length > 3) {
        throw new SdevError('slice() takes 2 or 3 arguments', line);
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

  builtins.set('join', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('join() takes exactly 2 arguments', line);
      const arr = args[0];
      if (!Array.isArray(arr)) throw new SdevError('First argument must be a list', line);
      const sep = args[1];
      if (typeof sep !== 'string') throw new SdevError('Second argument must be a string', line);
      return arr.map(stringify).join(sep);
    },
  });

  builtins.set('split', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('split() takes exactly 2 arguments', line);
      const str = args[0];
      if (typeof str !== 'string') throw new SdevError('First argument must be a string', line);
      const sep = args[1];
      if (typeof sep !== 'string') throw new SdevError('Second argument must be a string', line);
      return str.split(sep);
    },
  });

  // Type checking
  builtins.set('type', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('type() takes exactly 1 argument', line);
      const val = args[0];
      if (val === null) return 'null';
      if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float';
      if (typeof val === 'string') return 'string';
      if (typeof val === 'boolean') return 'bool';
      if (Array.isArray(val)) return 'list';
      if (typeof val === 'object') {
        if ((val as { type?: string }).type === 'builtin' || (val as { type?: string }).type === 'user') {
          return 'function';
        }
        return 'dict';
      }
      return 'unknown';
    },
  });

  // Input (simulated - just returns empty in browser)
  builtins.set('input', {
    type: 'builtin',
    call: (args: unknown[]) => {
      if (args.length > 0) {
        output(stringify(args[0]));
      }
      return '';
    },
  });

  // Keys and values for dicts
  builtins.set('keys', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('keys() takes exactly 1 argument', line);
      const obj = args[0];
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
        throw new SdevError('Argument must be a dict', line);
      }
      return Object.keys(obj as Record<string, unknown>);
    },
  });

  builtins.set('values', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('values() takes exactly 1 argument', line);
      const obj = args[0];
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
        throw new SdevError('Argument must be a dict', line);
      }
      return Object.values(obj as Record<string, unknown>);
    },
  });

  return builtins;
}

export function stringify(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    return '[' + value.map(stringify).join(', ') + ']';
  }
  if (typeof value === 'object') {
    if ((value as { type?: string }).type === 'builtin' || (value as { type?: string }).type === 'user') {
      return '<function>';
    }
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${stringify(k)}: ${stringify(v)}`)
      .join(', ');
    return '{' + entries + '}';
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
