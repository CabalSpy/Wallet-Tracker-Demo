import type { TrackingResponse } from '../types/api';
import { EXPLORER_ACCOUNT } from '../config';
import {
  fmtUsd, fmtUsdCompact, fmtUsdCompactSigned, fmtNat, fmtNatSigned,
  fmtHold, escapeHtml, shortenAddress,
} from '../lib/format';

/**
 * Axiom-style three-column top panel:
 *   LEFT   — profile (avatar, name, socials, address, chain) + all profile metrics
 *            (active hours, avg hold, largest buy, best/worst trade, avg position, holdings)
 *   MIDDLE — the realized-PnL area chart (rendered separately, mounted by main.ts)
 *   RIGHT  — performance: Total PnL / Volume / Transactions / Total Buy / Total Sell
 *            + the win-rate distribution rows and the green/red bar.
 */
export function renderHeader(wallet: string, t: TrackingResponse, period: string): string {
  return `
  <div class="board">
    <div class="col col-left">${leftProfile(wallet, t)}</div>
    <div class="col col-mid">${midChart(period)}</div>
    <div class="col col-right">${rightPerformance(wallet, t)}</div>
  </div>`;
}

/* ── LEFT: profile + metrics ── */
function leftProfile(wallet: string, t: TrackingResponse): string {
  const p = t.profile;
  const st = t.period_stats;
  const cur = p.currency || 'SOL';
  const activeHours = typeof p.active_hours === 'string' ? p.active_hours : Array.isArray(p.active_hours) ? p.active_hours.join(', ') : '';

  const socials: string[] = [];
  if (p.twitter) socials.push(`<a href="${escapeHtml(p.twitter)}" target="_blank" rel="noreferrer" title="Twitter">𝕏</a>`);
  if (p.telegram) socials.push(`<a href="${escapeHtml(p.telegram)}" target="_blank" rel="noreferrer" title="Telegram">✈</a>`);

  const metric = (label: string, value: string, cls = '') =>
    `<div class="pm-row"><span class="pm-label">${label}</span><span class="pm-val ${cls}">${value}</span></div>`;

  return `
    <div class="profile-top">
      <img class="avatar" src="${escapeHtml(p.image_url || '')}" alt="" onerror="this.src='https://www.cabalspy.xyz/images/logovector.png'"/>
      <div class="profile-id">
        <div class="pname">${escapeHtml(p.name || shortenAddress(wallet))} <span class="psoc">${socials.join('')}</span></div>
        <div class="paddr" data-copy="${escapeHtml(wallet)}" title="Copy">${escapeHtml(shortenAddress(wallet))} ⧉</div>
        <div class="pchain"><span>${escapeHtml((p.blockchain || '').toUpperCase())}</span> · ${escapeHtml(cur)}${p.type ? ' · ' + escapeHtml(p.type.toUpperCase()) : ''}</div>
      </div>
    </div>
    ${p.copytrade_link ? `<button class="copytrade-btn" onclick="window.open('${escapeHtml(p.copytrade_link)}','_blank')">⧉ Copy Trade</button>` : ''}
    <div class="pm-list">
      ${metric('Active Hours', activeHours ? escapeHtml(activeHours) : '—')}
      ${metric('Avg Hold', fmtHold(st.avg_hold_time_minutes))}
      ${metric('Largest Buy', `${fmtNat(st.largest_buy)} ${escapeHtml(cur)}`)}
      ${metric('Best Trade', `${fmtNatSigned(st.best_trade_pnl)} ${escapeHtml(cur)}`, (st.best_trade_pnl||0) >= 0 ? 'pos' : 'neg')}
      ${metric('Worst Trade', `${fmtNatSigned(st.worst_trade_pnl)} ${escapeHtml(cur)}`, (st.worst_trade_pnl||0) >= 0 ? 'pos' : 'neg')}
      ${metric('Avg Position', `${fmtNat(t.period_active_tokens.avg_position_size)} ${escapeHtml(cur)}`)}
      ${metric('Active Tokens', String(t.period_active_tokens.active_tokens_count))}
      ${metric('Still Holding', String(t.period_active_tokens.still_holding_count))}
    </div>`;
}

/* ── MIDDLE: chart shell (SVG injected by main.ts after mount) ── */
function midChart(period: string): string {
  const periods = ['6h','1d','7d','30d'];
  const tabs = periods.map((p) => `<button class="period-pill ${p === period ? 'active' : ''}" data-period="${p}">${p}</button>`).join('');
  return `
    <div class="mid-head">
      <span>PNL</span>
      <div class="mid-head-right">
        <div class="period-pills">${tabs}</div>
        <button class="cal-icon" id="open-calendar" title="PnL Calendar">🗓</button>
      </div>
    </div>
    <div class="chart-host" id="chart-host"></div>`;
}

/* ── RIGHT: performance ── */
function rightPerformance(wallet: string, t: TrackingResponse): string {
  const st = t.period_stats;
  const chain = (t.profile.blockchain || 'solana').toLowerCase();
  const explorer = (EXPLORER_ACCOUNT[chain] || EXPLORER_ACCOUNT.solana) + encodeURIComponent(wallet);
  const d = t.period_win_rate_distribution;
  const cur = t.profile.currency || 'SOL';
  const pnlCls = (st.realized_pnl_usd || 0) >= 0 ? 'pos' : 'neg';
  const totalTxn = (st.buy_txn || 0) + (st.sell_txn || 0);

  const rows = [
    { lbl: '>500%', v: d.above_500 || 0, c: '#2fe4a0' },
    { lbl: '200% ~ 500%', v: d.above_100_to_500 || 0, c: '#2fe4a0' },
    { lbl: '0% ~ 200%', v: d.above_zero_to_100 || 0, c: '#2fe4a0' },
    { lbl: '0% ~ -50%', v: d.below_zero || 0, c: '#f6608a' },
  ];
  const winTotal = (d.above_500||0)+(d.above_100_to_500||0)+(d.above_zero_to_100||0);
  const lossTotal = d.below_zero || 0;
  const grand = winTotal + lossTotal || 1;

  return `
    <div class="perf-head"><span>Performance</span><a class="perf-explorer" href="${explorer}" target="_blank" rel="noreferrer" title="View on explorer">↗</a></div>
    <div class="perf-kv"><span class="k">Total Pnl</span><span class="v ${pnlCls}">${fmtUsdCompactSigned(st.realized_pnl_usd)}</span></div>
    <div class="perf-kv"><span class="k">Volume</span><span class="v">${fmtUsdCompact(st.volume_usd)}</span></div>
    <div class="perf-kv"><span class="k">Transactions</span><span class="v">${totalTxn.toLocaleString()} <span class="txn-buy">${(st.buy_txn||0).toLocaleString()}</span> / <span class="txn-sell">${(st.sell_txn||0).toLocaleString()}</span></span></div>
    <div class="perf-kv"><span class="k">Total Buy</span><span class="v">${fmtUsd(st.total_buy_usd)} <span class="sub">${fmtNat(st.total_buy)} ${escapeHtml(cur)}</span></span></div>
    <div class="perf-kv"><span class="k">Total Sell</span><span class="v">${fmtUsd(st.total_sell_usd)} <span class="sub">${fmtNat(st.total_sell)} ${escapeHtml(cur)}</span></span></div>

    <div class="perf-dist">
      ${rows.map((r) => `<div class="dist-row"><span class="lbl"><span class="dot-sm" style="background:${r.c}"></span>${r.lbl}</span><span class="num">${r.v.toLocaleString()}</span></div>`).join('')}
      <div class="dist-bar">
        <span style="width:${(winTotal/grand*100).toFixed(1)}%;background:#2fe4a0"></span>
        <span style="width:${(lossTotal/grand*100).toFixed(1)}%;background:#f6608a"></span>
      </div>
    </div>`;
}
