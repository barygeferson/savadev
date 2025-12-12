import { SdevError } from './errors';
import { SdevFunction, stringify } from './builtins';

type Matrix = number[][];

export function createMatrixBuiltins(): Map<string, SdevFunction> {
  const builtins = new Map<string, SdevFunction>();

  // Create a matrix
  builtins.set('matrix', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length < 2) throw new SdevError('matrix() takes at least 2 arguments (rows, cols, fill?)', line);
      const rows = args[0] as number;
      const cols = args[1] as number;
      const fill = (args[2] as number) ?? 0;
      const result: number[][] = [];
      for (let i = 0; i < rows; i++) {
        result.push(new Array(cols).fill(fill));
      }
      return result;
    },
  });

  // Identity matrix
  builtins.set('identity', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('identity() takes 1 argument (size)', line);
      const n = args[0] as number;
      const result: number[][] = [];
      for (let i = 0; i < n; i++) {
        const row = new Array(n).fill(0);
        row[i] = 1;
        result.push(row);
      }
      return result;
    },
  });

  // Transpose matrix
  builtins.set('transpose', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('transpose() takes 1 argument', line);
      const m = args[0];
      if (!Array.isArray(m)) throw new SdevError('Argument must be a 2D list', line);
      if (m.length === 0) return [];
      const rows = m.length;
      const cols = (m[0] as unknown[]).length;
      const result: number[][] = [];
      for (let j = 0; j < cols; j++) {
        const row: number[] = [];
        for (let i = 0; i < rows; i++) {
          row.push((m[i] as number[])[j]);
        }
        result.push(row);
      }
      return result;
    },
  });

  // Dot product
  builtins.set('dot', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('dot() takes 2 arguments', line);
      const a = args[0] as number[];
      const b = args[1] as number[];
      if (!Array.isArray(a) || !Array.isArray(b)) {
        throw new SdevError('Arguments must be lists', line);
      }
      if (a.length !== b.length) throw new SdevError('Vectors must have same length', line);
      let sum = 0;
      for (let i = 0; i < a.length; i++) {
        sum += (a[i] as number) * (b[i] as number);
      }
      return sum;
    },
  });

  // Matrix multiplication
  builtins.set('matmul', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('matmul() takes 2 arguments', line);
      const a = args[0] as Matrix;
      const b = args[1] as Matrix;
      if (!Array.isArray(a) || !Array.isArray(b)) {
        throw new SdevError('Arguments must be 2D lists', line);
      }
      const rowsA = a.length;
      const colsA = (a[0] as number[]).length;
      const rowsB = b.length;
      const colsB = (b[0] as number[]).length;
      if (colsA !== rowsB) throw new SdevError('Matrix dimensions incompatible for multiplication', line);
      
      const result: number[][] = [];
      for (let i = 0; i < rowsA; i++) {
        const row: number[] = [];
        for (let j = 0; j < colsB; j++) {
          let sum = 0;
          for (let k = 0; k < colsA; k++) {
            sum += (a[i] as number[])[k] * (b[k] as number[])[j];
          }
          row.push(sum);
        }
        result.push(row);
      }
      return result;
    },
  });

  // Element-wise operations
  builtins.set('matadd', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('matadd() takes 2 arguments', line);
      return matrixOp(args[0] as Matrix, args[1] as Matrix, (a, b) => a + b, line);
    },
  });

  builtins.set('matsub', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('matsub() takes 2 arguments', line);
      return matrixOp(args[0] as Matrix, args[1] as Matrix, (a, b) => a - b, line);
    },
  });

  builtins.set('matscale', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('matscale() takes 2 arguments (matrix, scalar)', line);
      const m = args[0] as Matrix;
      const s = args[1] as number;
      return m.map(row => (row as number[]).map(v => v * s));
    },
  });

  // Shape
  builtins.set('shape', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('shape() takes 1 argument', line);
      const m = args[0];
      if (!Array.isArray(m)) return [0];
      if (m.length === 0) return [0];
      if (!Array.isArray(m[0])) return [m.length];
      return [m.length, (m[0] as unknown[]).length];
    },
  });

  // Flatten
  builtins.set('flatten', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('flatten() takes 1 argument', line);
      const m = args[0];
      if (!Array.isArray(m)) return [m];
      const flat = (arr: unknown[]): unknown[] => {
        const result: unknown[] = [];
        for (const item of arr) {
          if (Array.isArray(item)) {
            result.push(...flat(item));
          } else {
            result.push(item);
          }
        }
        return result;
      };
      return flat(m);
    },
  });

  // Reshape
  builtins.set('reshape', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 3) throw new SdevError('reshape() takes 3 arguments (list, rows, cols)', line);
      const arr = args[0] as unknown[];
      const rows = args[1] as number;
      const cols = args[2] as number;
      if (!Array.isArray(arr)) throw new SdevError('First argument must be a list', line);
      const flat = arr.flat(Infinity) as number[];
      if (flat.length !== rows * cols) {
        throw new SdevError('Cannot reshape: size mismatch', line);
      }
      const result: number[][] = [];
      for (let i = 0; i < rows; i++) {
        result.push(flat.slice(i * cols, (i + 1) * cols));
      }
      return result;
    },
  });

  // Sum/mean
  builtins.set('matsum', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('matsum() takes 1 argument', line);
      const m = args[0];
      if (!Array.isArray(m)) return m;
      const flat = (m as unknown[]).flat(Infinity) as number[];
      return flat.reduce((a, b) => a + b, 0);
    },
  });

  builtins.set('matmean', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('matmean() takes 1 argument', line);
      const m = args[0];
      if (!Array.isArray(m)) return m;
      const flat = (m as unknown[]).flat(Infinity) as number[];
      if (flat.length === 0) return 0;
      return flat.reduce((a, b) => a + b, 0) / flat.length;
    },
  });

  return builtins;
}

function matrixOp(a: Matrix, b: Matrix, op: (x: number, y: number) => number, line: number): Matrix {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    throw new SdevError('Arguments must be 2D lists', line);
  }
  if (a.length !== b.length || (a[0] as number[]).length !== (b[0] as number[]).length) {
    throw new SdevError('Matrices must have same dimensions', line);
  }
  return a.map((row, i) => 
    (row as number[]).map((v, j) => op(v, (b[i] as number[])[j]))
  );
}
