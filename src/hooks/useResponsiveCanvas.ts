import { useEffect, useRef, useCallback } from 'react';

export function useResponsiveCanvas(
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
  deps: any[]
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height) || 300;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);
    draw(ctx, width, height);
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas?.parentElement) return;

    resize();

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas.parentElement);

    return () => ro.disconnect();
  }, deps);

  return canvasRef;
}