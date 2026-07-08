import type { TrackingResponse, HoldingsBlock, ActiveToken, Trade } from '../types/api';
import { fmtUsd, fmtNat, fmtTokens, pct, escapeHtml, timeAgo } from '../lib/format';

export type TabId = 'traded' | 'holdings' | 'trades';

export function renderTables(tab: TabId, t: TrackingResponse, holdings: HoldingsBlock | null, currency: string): string {
  const traded = t.period_history_tokens.length ? t.period_history_tokens : t.period_active_tokens.tokens;
  const tabs = `
    <div class="tabs">
      <div class="tab ${tab === 'traded' ? 'active' : ''}" data-tab="traded">Traded This Period (${traded.length})</div>
      <div class="tab ${tab === 'holdings' ? 'active' : ''}" data-tab="holdings">Holdings${holdings ? ` (${holdings.count})` : ' …'}</div>
      <div class="tab ${tab === 'trades' ? 'active' : ''}" data-tab="trades">Recent Trades (${t.period_trades.length})</div>
    </div>`;

  let body = '';
  if (tab === 'traded') body = tokenTable(traded, currency);
  else if (tab === 'holdings') body = holdingsTable(holdings);
  else body = tradesTable(t.period_trades, currency);

  return tabs + `<div class="wrap">${body}</div>`;
}

function tokenTable(list: ActiveToken[], currency: string): string {
  const cols = ['Token', 'Bought', 'Sold', 'Tokens In / Out', 'R. PnL'];
  if (!list.length) return `<table>${head(cols)}<tbody><tr><td colspan="5" class="empty">No tokens traded in this period.</td></tr></tbody></table>`;
  const rows = list.map((tok) => {
    const pnlCls = (tok.realized_pnl_usd || 0) >= 0 ? 'green' : 'red';
    return `<tr>
      <td class="l"><div class="token-cell"><div class="token-ico">${escapeHtml((tok.token_name || tok.symbol || '?').slice(0, 2))}</div><div class="token-name">${escapeHtml(tok.token_name || tok.symbol || 'Unknown')}</div></div></td>
      <td><div class="cell-main green">${fmtUsd(tok.buy_value_usd)}</div><div class="cell-sub">${fmtNat(tok.buy_value)} ${escapeHtml(currency)}</div></td>
      <td><div class="cell-main red">${fmtUsd(tok.sell_value_usd)}</div><div class="cell-sub">${fmtNat(tok.sell_value)} ${escapeHtml(currency)}</div></td>
      <td><div class="cell-main">${fmtTokens(tok.buy_tokens)}</div><div class="cell-sub">${fmtTokens(tok.sell_tokens)} sold</div></td>
      <td><div class="cell-main ${pnlCls}">${(tok.realized_pnl_usd||0) >= 0 ? '+' : ''}${fmtUsd(tok.realized_pnl_usd).replace('$','$')}</div><div class="cell-sub ${pnlCls}">${pct(tok.realized_pnl_percentage, true)}</div></td>
    </tr>`;
  }).join('');
  return `<table>${head(cols)}<tbody>${rows}</tbody></table>`;
}

function holdingsTable(holdings: HoldingsBlock | null): string {
  const cols = ['Token', 'Symbol', 'Amount', 'Contract'];
  if (!holdings) return `<table>${head(cols)}<tbody><tr><td colspan="4" class="empty">Loading holdings…</td></tr></tbody></table>`;
  if (holdings.loading) return `<table>${head(cols)}<tbody><tr><td colspan="4" class="empty">Balances warming up…</td></tr></tbody></table>`;
  if (!holdings.tokens.length) return `<table>${head(cols)}<tbody><tr><td colspan="4" class="empty">No holdings found.</td></tr></tbody></table>`;
  const rows = holdings.tokens.map((tk) => `<tr>
    <td class="l"><div class="token-cell"><div class="token-ico">${escapeHtml((tk.symbol || tk.token_name || '?').slice(0, 2))}</div><div class="token-name">${escapeHtml(tk.token_name || tk.symbol || 'Unknown')}</div></div></td>
    <td class="l">${escapeHtml(tk.symbol)}</td>
    <td>${escapeHtml((tk.amount_formatted && tk.amount_formatted !== '') ? tk.amount_formatted : (tk.amount || '0'))}</td>
    <td class="muted">${escapeHtml(tk.token_address ? tk.token_address.slice(0, 4) + '…' + tk.token_address.slice(-4) : '–')}</td>
  </tr>`).join('');
  return `<table>${head(cols)}<tbody>${rows}</tbody></table>`;
}

function tradesTable(trades: Trade[], currency: string): string {
  const cols = ['Token', 'Type', 'Value', 'When'];
  if (!trades.length) return `<table>${head(cols)}<tbody><tr><td colspan="4" class="empty">No trades in this period.</td></tr></tbody></table>`;
  const rows = trades.map((tx) => {
    const isBuy = (tx.transaction_type || '').toLowerCase() === 'buy';
    const valUsd = isBuy ? tx.buy_value_usd : tx.sell_value_usd;
    const valNat = isBuy ? tx.buy_value : tx.sell_value;
    return `<tr>
      <td class="l">${escapeHtml(tx.token_name || '–')}</td>
      <td class="l"><span class="${isBuy ? 'green' : 'red'}">${isBuy ? 'Buy' : 'Sell'}</span></td>
      <td><div class="cell-main">${fmtUsd(valUsd)}</div><div class="cell-sub">${valNat != null ? fmtNat(valNat) + ' ' + escapeHtml(currency) : ''}</div></td>
      <td class="muted">${timeAgo(tx.created_at)}</td>
    </tr>`;
  }).join('');
  return `<table>${head(cols)}<tbody>${rows}</tbody></table>`;
}

function head(cols: string[]): string {
  return `<thead><tr>${cols.map((c, i) => `<th class="${i === 0 ? 'l' : ''}">${c}</th>`).join('')}</tr></thead>`;
}
