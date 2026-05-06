import { useEffect, useRef } from 'react';

interface Props {
  code: string;
  scrollTop: number;
  totalLines: number;
  visibleLines: number;
  onScroll: (line: number) => void;
}

const SDEV_KW = /\b(forge|be|conjure|ponder|otherwise|cycle|iterate|through|within|essence|extend|new|self|super|yield|attempt|rescue|summon|async|await|spawn|equals|isnt|differs|also|either)\b/g;

export function IdeMinimap({ code, scrollTop, totalLines, visibleLines, onScroll }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const W = 100, H = c.clientHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const lines = code.split('\n');
    const lineH = Math.max(1.5, Math.min(3, H / Math.max(1, lines.length)));
    const charW = 1;

    lines.forEach((line, i) => {
      const y = i * lineH;
      if (y > H) return;
      // base text shadow
      const trimmed = line.replace(/\t/g, '  ');
      const indent = trimmed.length - trimmed.trimStart().length;
      ctx.fillStyle = 'hsla(220, 15%, 70%, 0.18)';
      ctx.fillRect(indent * charW, y, Math.min(W - indent * charW, trimmed.trim().length * charW), Math.max(1, lineH - 0.3));

      // keyword highlight
      let m;
      const local = SDEV_KW;
      local.lastIndex = 0;
      while ((m = local.exec(line))) {
        const x = m.index * charW;
        if (x > W) break;
        ctx.fillStyle = 'hsla(195, 90%, 60%, 0.7)';
        ctx.fillRect(x, y, Math.min(W - x, m[0].length * charW), Math.max(1, lineH - 0.3));
      }
      // comment
      const ci = line.indexOf('//');
      if (ci >= 0) {
        const x = ci * charW;
        ctx.fillStyle = 'hsla(120, 8%, 50%, 0.45)';
        ctx.fillRect(x, y, Math.min(W - x, (line.length - ci) * charW), Math.max(1, lineH - 0.3));
      }
    });

    // Viewport indicator
    const totalH = Math.max(1, lines.length) * lineH;
    const viewY = (scrollTop / Math.max(1, totalLines)) * totalH;
    const viewH = (visibleLines / Math.max(1, totalLines)) * totalH;
    ctx.fillStyle = 'hsla(195, 90%, 60%, 0.12)';
    ctx.fillRect(0, viewY, W, Math.max(20, viewH));
    ctx.strokeStyle = 'hsla(195, 90%, 60%, 0.5)';
    ctx.strokeRect(0.5, viewY + 0.5, W - 1, Math.max(20, viewH) - 1);
  }, [code, scrollTop, totalLines, visibleLines]);

  const handle = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientY - rect.top) / rect.height;
    onScroll(Math.floor(ratio * totalLines));
  };

  return (
    <canvas
      ref={ref}
      onMouseDown={handle}
      onMouseMove={(e) => { if (e.buttons === 1) handle(e); }}
      className="w-[100px] h-full cursor-pointer bg-background/30 border-l border-border/30 flex-shrink-0"
    />
  );
}
