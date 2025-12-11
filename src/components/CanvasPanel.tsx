import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { GraphicsCommand, TurtleState } from '@/lang/graphics';

interface CanvasPanelProps {
  commands: GraphicsCommand[];
}

export interface CanvasHandle {
  clear: () => void;
  getDataUrl: () => string;
}

export const CanvasPanel = forwardRef<CanvasHandle, CanvasPanelProps>(({ commands }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const turtleRef = useRef<TurtleState>({
    x: 200,
    y: 200,
    angle: -90,
    penDown: true,
    color: '#00ff88',
    width: 2,
  });

  useImperativeHandle(ref, () => ({
    clear: () => {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (ctx && canvas) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    },
    getDataUrl: () => canvasRef.current?.toDataURL() ?? '',
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    ctxRef.current = canvas.getContext('2d');
    const ctx = ctxRef.current;
    if (!ctx) return;

    // Initialize
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx || !canvas) return;

    let currentFill = '#00ff88';
    let currentStroke = '#00ff88';
    let currentWidth = 2;

    for (const cmd of commands) {
      switch (cmd.type) {
        case 'canvas':
          canvas.width = cmd.width as number;
          canvas.height = cmd.height as number;
          ctx.fillStyle = '#1a1a2e';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          break;
          
        case 'clear':
          ctx.fillStyle = cmd.color as string;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          break;
          
        case 'fill':
          currentFill = cmd.color as string;
          break;
          
        case 'stroke':
          currentStroke = cmd.color as string;
          if (cmd.width) currentWidth = cmd.width as number;
          break;
          
        case 'rect':
          ctx.fillStyle = currentFill;
          ctx.fillRect(cmd.x as number, cmd.y as number, cmd.w as number, cmd.h as number);
          ctx.strokeStyle = currentStroke;
          ctx.lineWidth = currentWidth;
          ctx.strokeRect(cmd.x as number, cmd.y as number, cmd.w as number, cmd.h as number);
          break;
          
        case 'circle':
          ctx.beginPath();
          ctx.arc(cmd.x as number, cmd.y as number, cmd.r as number, 0, Math.PI * 2);
          ctx.fillStyle = currentFill;
          ctx.fill();
          ctx.strokeStyle = currentStroke;
          ctx.lineWidth = currentWidth;
          ctx.stroke();
          break;
          
        case 'line':
          ctx.beginPath();
          ctx.moveTo(cmd.x1 as number, cmd.y1 as number);
          ctx.lineTo(cmd.x2 as number, cmd.y2 as number);
          ctx.strokeStyle = currentStroke;
          ctx.lineWidth = currentWidth;
          ctx.stroke();
          break;
          
        case 'text':
          ctx.font = `${cmd.size}px monospace`;
          ctx.fillStyle = currentFill;
          ctx.fillText(cmd.text as string, cmd.x as number, cmd.y as number);
          break;
          
        case 'polygon': {
          const pts = cmd.points as number[][];
          if (pts.length > 0) {
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            for (let i = 1; i < pts.length; i++) {
              ctx.lineTo(pts[i][0], pts[i][1]);
            }
            ctx.closePath();
            ctx.fillStyle = currentFill;
            ctx.fill();
            ctx.strokeStyle = currentStroke;
            ctx.lineWidth = currentWidth;
            ctx.stroke();
          }
          break;
        }
          
        case 'turtle_reset':
          turtleRef.current = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            angle: -90,
            penDown: true,
            color: '#00ff88',
            width: 2,
          };
          break;
          
        case 'turtle_line':
          ctx.beginPath();
          ctx.moveTo(cmd.x1 as number, cmd.y1 as number);
          ctx.lineTo(cmd.x2 as number, cmd.y2 as number);
          ctx.strokeStyle = cmd.color as string;
          ctx.lineWidth = cmd.width as number;
          ctx.lineCap = 'round';
          ctx.stroke();
          break;
          
        case 'turtle_move':
          turtleRef.current.x = cmd.x as number;
          turtleRef.current.y = cmd.y as number;
          turtleRef.current.angle = cmd.angle as number;
          break;
      }
    }
  }, [commands]);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-2 bg-muted/50 border-b border-border flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Canvas</span>
      </div>
      <div className="p-4 flex items-center justify-center bg-[#0d0d15]">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="rounded-md shadow-lg max-w-full"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  );
});

CanvasPanel.displayName = 'CanvasPanel';
