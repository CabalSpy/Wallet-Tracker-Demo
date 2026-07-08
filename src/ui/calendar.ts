import type { CalendarResponse, CalendarDay, CalendarMonth } from '../types/api';
import { fmtUsdCompactSigned, fmtUsdCompact } from '../lib/format';

/** Parse "DD-MM-YY" into a Date. */
function parseDay(s: string): Date | null {
  const m = /^(\d{2})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  return new Date(2000 + Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}

/**
 * Stateful calendar with month navigation. months come oldest-first from the API;
 * we start on the newest and let the user page left/right with the arrows.
 */
export class CalendarView {
  private idx: number;
  constructor(private cal: CalendarResponse, private mount: HTMLElement) {
    this.idx = Math.max(0, cal.months.length - 1); // newest month
  }

  render(): void {
    const months = this.cal.months;
    if (!months.length) { this.mount.innerHTML = `<div class="muted">No calendar data for this wallet.</div>`; return; }
    const m = months[this.idx];
    const hasPrev = this.idx > 0;
    const hasNext = this.idx < months.length - 1;
    this.mount.innerHTML = monthBlock(m.dates, m.month, hasPrev, hasNext);

    const prev = this.mount.querySelector('#cal-prev') as HTMLButtonElement | null;
    const next = this.mount.querySelector('#cal-next') as HTMLButtonElement | null;
    prev?.addEventListener('click', () => { if (this.idx > 0) { this.idx--; this.render(); } });
    next?.addEventListener('click', () => { if (this.idx < months.length - 1) { this.idx++; this.render(); } });
  }
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function monthBlock(days: CalendarDay[], summary: CalendarMonth, hasPrev: boolean, hasNext: boolean): string {
  const title = `${MONTHS[(summary.month || 1) - 1]} ${summary.year || ''}`;

  const byDay = new Map<number, CalendarDay>();
  for (const d of days) { const dt = parseDay(d.date); if (dt) byDay.set(dt.getDate(), d); }

  const firstWeekday = new Date(summary.year, (summary.month || 1) - 1, 1).getDay();
  const daysInMonth = new Date(summary.year, summary.month || 1, 0).getDate();

  const dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => `<div class="cal-dow">${d}</div>`).join('');
  // Always render 42 cells (6 weeks) so the grid height never changes between months.
  const TOTAL_CELLS = 42;
  let cells = '';
  for (let c = 0; c < TOTAL_CELLS; c++) {
    const dayNum = c - firstWeekday + 1;
    if (dayNum < 1 || dayNum > daysInMonth) { cells += `<div class="cal-day empty-day"></div>`; continue; }
    const d = byDay.get(dayNum);
    if (!d || d.txn_total === 0) { cells += `<div class="cal-day"><span class="d-num">${dayNum}</span></div>`; continue; }
    const win = d.realized_pnl_usd >= 0;
    cells += `<div class="cal-day ${win ? 'win' : 'loss'}" title="${d.txn_total} txns · ${d.tokens_traded} tokens"><span class="d-num">${dayNum}</span><span class="d-pnl ${win ? 'green' : 'red'}">${fmtUsdCompactSigned(d.realized_pnl_usd)}</span></div>`;
  }

  const arrowL = `<button class="cal-nav" id="cal-prev" ${hasPrev ? '' : 'disabled'} title="Previous month">‹</button>`;
  const arrowR = `<button class="cal-nav" id="cal-next" ${hasNext ? '' : 'disabled'} title="Next month">›</button>`;

  return `
    <div class="cal-header">
      ${arrowL}
      <div class="cal-month-title">${title}</div>
      ${arrowR}
    </div>
    <div class="cal-scroll">
      <div class="cal-grid">${dow}${cells}</div>
    </div>
    <div class="cal-summary">
      <div class="kv2"><span class="k">Month PnL</span><span class="v ${summary.realized_pnl_usd >= 0 ? 'green' : 'red'}">${fmtUsdCompactSigned(summary.realized_pnl_usd)}</span></div>
      <div class="kv2"><span class="k">Volume</span><span class="v">${fmtUsdCompact(summary.volume)}</span></div>
      <div class="kv2"><span class="k">Txns</span><span class="v">${summary.txn_total}</span></div>
      <div class="kv2"><span class="k">Tokens</span><span class="v">${summary.tokens_traded}</span></div>
      <div class="kv2"><span class="k">Best streak</span><span class="v green">${summary.positive_streak}d</span></div>
      <div class="kv2"><span class="k">Worst streak</span><span class="v red">${summary.negative_streak}d</span></div>
    </div>`;
}
