import { SdevError } from './errors';
import { SdevFunction, stringify } from './builtins';

export interface GraphicsCommand {
  type: string;
  [key: string]: unknown;
}

export type GraphicsCallback = (cmd: GraphicsCommand) => void;

export interface TurtleState {
  x: number;
  y: number;
  angle: number;
  penDown: boolean;
  color: string;
  width: number;
}

export function createGraphicsBuiltins(
  emit: GraphicsCallback,
  getTurtle: () => TurtleState,
  setTurtle: (state: Partial<TurtleState>) => void
): Map<string, SdevFunction> {
  const builtins = new Map<string, SdevFunction>();

  // Canvas setup
  builtins.set('canvas', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('canvas() takes 2 arguments (width, height)', line);
      const w = args[0] as number;
      const h = args[1] as number;
      emit({ type: 'canvas', width: w, height: h });
      return null;
    },
  });

  builtins.set('clear', {
    type: 'builtin',
    call: (args: unknown[]) => {
      const color = args[0] as string ?? '#1a1a2e';
      emit({ type: 'clear', color });
      return null;
    },
  });

  // 2D Drawing
  builtins.set('fill', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('fill() takes 1 argument (color)', line);
      emit({ type: 'fill', color: stringify(args[0]) });
      return null;
    },
  });

  builtins.set('stroke', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length < 1 || args.length > 2) throw new SdevError('stroke() takes 1-2 arguments (color, width?)', line);
      emit({ type: 'stroke', color: stringify(args[0]), width: args[1] as number ?? 1 });
      return null;
    },
  });

  builtins.set('rect', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 4) throw new SdevError('rect() takes 4 arguments (x, y, w, h)', line);
      emit({ type: 'rect', x: args[0], y: args[1], w: args[2], h: args[3] });
      return null;
    },
  });

  builtins.set('circle', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 3) throw new SdevError('circle() takes 3 arguments (x, y, radius)', line);
      emit({ type: 'circle', x: args[0], y: args[1], r: args[2] });
      return null;
    },
  });

  builtins.set('line', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 4) throw new SdevError('line() takes 4 arguments (x1, y1, x2, y2)', line);
      emit({ type: 'line', x1: args[0], y1: args[1], x2: args[2], y2: args[3] });
      return null;
    },
  });

  builtins.set('text', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length < 3 || args.length > 4) throw new SdevError('text() takes 3-4 arguments (str, x, y, size?)', line);
      emit({ type: 'text', text: stringify(args[0]), x: args[1], y: args[2], size: args[3] ?? 16 });
      return null;
    },
  });

  builtins.set('polygon', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length < 1) throw new SdevError('polygon() takes points [[x,y], ...]', line);
      const points = args[0];
      if (!Array.isArray(points)) throw new SdevError('polygon() argument must be a list of points', line);
      emit({ type: 'polygon', points });
      return null;
    },
  });

  // Turtle Graphics
  builtins.set('turtle', {
    type: 'builtin',
    call: () => {
      setTurtle({ x: 200, y: 200, angle: -90, penDown: true, color: '#00ff88', width: 2 });
      emit({ type: 'turtle_reset' });
      return null;
    },
  });

  builtins.set('forward', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('forward() takes 1 argument (distance)', line);
      const t = getTurtle();
      const dist = args[0] as number;
      const rad = (t.angle * Math.PI) / 180;
      const newX = t.x + Math.cos(rad) * dist;
      const newY = t.y + Math.sin(rad) * dist;
      if (t.penDown) {
        emit({ type: 'turtle_line', x1: t.x, y1: t.y, x2: newX, y2: newY, color: t.color, width: t.width });
      }
      setTurtle({ x: newX, y: newY });
      emit({ type: 'turtle_move', x: newX, y: newY, angle: t.angle });
      return null;
    },
  });

  builtins.set('backward', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('backward() takes 1 argument (distance)', line);
      const dist = -(args[0] as number);
      const t = getTurtle();
      const rad = (t.angle * Math.PI) / 180;
      const newX = t.x + Math.cos(rad) * dist;
      const newY = t.y + Math.sin(rad) * dist;
      if (t.penDown) {
        emit({ type: 'turtle_line', x1: t.x, y1: t.y, x2: newX, y2: newY, color: t.color, width: t.width });
      }
      setTurtle({ x: newX, y: newY });
      emit({ type: 'turtle_move', x: newX, y: newY, angle: t.angle });
      return null;
    },
  });

  builtins.set('left', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('left() takes 1 argument (degrees)', line);
      const t = getTurtle();
      const newAngle = t.angle - (args[0] as number);
      setTurtle({ angle: newAngle });
      emit({ type: 'turtle_move', x: t.x, y: t.y, angle: newAngle });
      return null;
    },
  });

  builtins.set('right', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('right() takes 1 argument (degrees)', line);
      const t = getTurtle();
      const newAngle = t.angle + (args[0] as number);
      setTurtle({ angle: newAngle });
      emit({ type: 'turtle_move', x: t.x, y: t.y, angle: newAngle });
      return null;
    },
  });

  builtins.set('penup', {
    type: 'builtin',
    call: () => {
      setTurtle({ penDown: false });
      return null;
    },
  });

  builtins.set('pendown', {
    type: 'builtin',
    call: () => {
      setTurtle({ penDown: true });
      return null;
    },
  });

  builtins.set('pencolor', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('pencolor() takes 1 argument (color)', line);
      setTurtle({ color: stringify(args[0]) });
      return null;
    },
  });

  builtins.set('penwidth', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 1) throw new SdevError('penwidth() takes 1 argument (width)', line);
      setTurtle({ width: args[0] as number });
      return null;
    },
  });

  builtins.set('goto', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 2) throw new SdevError('goto() takes 2 arguments (x, y)', line);
      const t = getTurtle();
      const newX = args[0] as number;
      const newY = args[1] as number;
      if (t.penDown) {
        emit({ type: 'turtle_line', x1: t.x, y1: t.y, x2: newX, y2: newY, color: t.color, width: t.width });
      }
      setTurtle({ x: newX, y: newY });
      emit({ type: 'turtle_move', x: newX, y: newY, angle: t.angle });
      return null;
    },
  });

  // Animation helpers
  builtins.set('hue', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length < 1 || args.length > 3) throw new SdevError('hue() takes 1-3 arguments (h, s?, l?)', line);
      const h = args[0] as number;
      const s = (args[1] as number) ?? 100;
      const l = (args[2] as number) ?? 50;
      return `hsl(${h}, ${s}%, ${l}%)`;
    },
  });

  builtins.set('rgb', {
    type: 'builtin',
    call: (args: unknown[], line: number) => {
      if (args.length !== 3) throw new SdevError('rgb() takes 3 arguments (r, g, b)', line);
      return `rgb(${args[0]}, ${args[1]}, ${args[2]})`;
    },
  });

  return builtins;
}
