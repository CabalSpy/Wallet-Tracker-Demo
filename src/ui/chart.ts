import type { PnlChartPoint } from '../types/api';
import { fmtUsdCompactSigned } from '../lib/format';

/**
 * Axiom-style filled area chart of cumulative realized PnL, with a hover tooltip
 * that shows the value at the cursor.
 */
export function renderChart(host: HTMLElement, points: PnlChartPoint[]): void {
  const vals = points.map((p) => Number(p.realized_pnl_usd) || 0);
  if (vals.length < 2) {
    host.innerHTML = `<div class="chart-empty">No PnL history for this period</div>`;
    return;
  }

  const w = 640, h = 240, padX = 4, padTop = 16, padBot = 8;
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const step = (w - padX * 2) / (vals.length - 1);
  const x = (i: number) => padX + i * step;
  const y = (v: number) => padTop + (1 - (v - min) / span) * (h - padTop - padBot);

  const line = vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = `${x(0).toFixed(1)},${(h - padBot).toFixed(1)} ${line} ${x(vals.length - 1).toFixed(1)},${(h - padBot).toFixed(1)}`;
  const up = vals[vals.length - 1] >= vals[0];
  const stroke = up ? '#2fe4a0' : '#f6608a';

  host.innerHTML = `
    <div class="chart-wrap">
      <svg class="pnl-chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pnlfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${stroke}" stop-opacity="0.28" />
            <stop offset="100%" stop-color="${stroke}" stop-opacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points="${area}" fill="url(#pnlfill)" />
        <polyline points="${line}" fill="none" stroke="${stroke}" stroke-width="2" vector-effect="non-scaling-stroke" />
        <line class="hover-line" x1="0" y1="${padTop}" x2="0" y2="${h - padBot}" stroke="${stroke}" stroke-width="1" opacity="0" />
        <circle class="hover-dot" r="3.5" fill="${stroke}" opacity="0" />
      </svg>
      <div class="chart-tip" style="opacity:0"></div>
    </div>`;

  const wrap = host.querySelector('.chart-wrap') as HTMLElement;
  const svg = host.querySelector('svg') as SVGSVGElement;
  const vLine = host.querySelector('.hover-line') as SVGLineElement;
  const dot = host.querySelector('.hover-dot') as SVGCircleElement;
  const tip = host.querySelector('.chart-tip') as HTMLElement;

  function onMove(ev: MouseEvent) {
    const rect = svg.getBoundingClientRect();
    const relX = (ev.clientX - rect.left) / rect.width; // 0..1
    let i = Math.round(relX * (vals.length - 1));
    i = Math.max(0, Math.min(vals.length - 1, i));
    const px = x(i), py = y(vals[i]);
    // Position markers in SVG user units
    vLine.setAttribute('x1', String(px)); vLine.setAttribute('x2', String(px)); vLine.setAttribute('opacity', '0.35');
    dot.setAttribute('cx', String(px)); dot.setAttribute('cy', String(py)); dot.setAttribute('opacity', '1');
    // Tooltip in pixel space
    const leftPx = (px / w) * rect.width;
    tip.textContent = fmtUsdCompactSigned(vals[i]);
    tip.style.left = Math.min(rect.width - 60, Math.max(0, leftPx - 30)) + 'px';
    tip.style.opacity = '1';
  }
  function onLeave() { vLine.setAttribute('opacity', '0'); dot.setAttribute('opacity', '0'); tip.style.opacity = '0'; }
  wrap.addEventListener('mousemove', onMove);
  wrap.addEventListener('mouseleave', onLeave);
}
