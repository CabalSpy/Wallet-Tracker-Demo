import './styles.css';
import { ApiClient, normalizeTracking, normalizeCalendar } from './lib/api';
import { CHAIN_MAP } from './config';
import type { TrackingResponse, HoldingsBlock, CalendarResponse } from './types/api';
import { renderHeader } from './ui/header';
import { renderTables, type TabId } from './ui/tables';
import { CalendarView } from './ui/calendar';
import { renderChart } from './ui/chart';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const apikeyEl = $<HTMLInputElement>('apikey');
const walletEl = $<HTMLInputElement>('wallet');
const chainEl = $<HTMLSelectElement>('chain');
const periodEl = $<HTMLSelectElement>('period');
const app = $('app');
const dot = $('dot');
const statustext = $('statustext');

let current: {
  wallet: string; blockchain: string; currency: string;
  tracking: TrackingResponse; holdings: HoldingsBlock | null;
  calendar: CalendarResponse | null; tab: TabId; period: string; api: ApiClient;
} | null = null;

function setStatus(kind: 'idle' | 'loading' | 'ok' | 'err', text: string) {
  dot.className = 'dot' + (kind === 'ok' ? ' on' : kind === 'loading' ? ' wait' : kind === 'err' ? ' err' : '');
  statustext.textContent = text;
}

async function load() {
  const apiKey = apikeyEl.value.trim();
  const wallet = walletEl.value.trim();
  const blockchain = CHAIN_MAP[chainEl.value] || 'solana';
  const period = periodEl.value;
  if (!apiKey) return setStatus('err', 'enter an API key');
  if (!wallet) return setStatus('err', 'enter a wallet address');

  setStatus('loading', 'loading…');
  app.innerHTML = skeleton();
  const api = new ApiClient(apiKey);

  try {
    const tracking = normalizeTracking(
      await api.get<TrackingResponse>('/wallet/tracking', { blockchain, address: wallet, period }),
    );
    const currency = tracking.profile.currency || 'SOL';
    const calendar = await api
      .get<CalendarResponse>('/wallet/pnl_calendar', { blockchain, address: wallet })
      .then(normalizeCalendar)
      .catch(() => null);

    current = { wallet, blockchain, currency, tracking, holdings: null, calendar, tab: 'traded', period, api };
    render();
    setStatus('ok', 'loaded');
    loadHoldings(api, blockchain, wallet);
  } catch (e) {
    setStatus('err', 'failed');
    app.innerHTML = `<div class="error-box">Could not load wallet: ${(e as Error).message}</div>`;
  }
}

async function loadHoldings(api: ApiClient, blockchain: string, wallet: string, tries = 0) {
  try {
    const data = await api.get<{ active_holdings?: HoldingsBlock }>('/wallet/holdings', { blockchain, address: wallet });
    const h = data?.active_holdings || null;
    if (h?.loading === true && tries < 6) { setTimeout(() => loadHoldings(api, blockchain, wallet, tries + 1), 1500); return; }
    if (current) { current.holdings = h ? { ...h, tokens: h.tokens || [] } : emptyHoldings(); render(); }
  } catch {
    if (tries < 6) { setTimeout(() => loadHoldings(api, blockchain, wallet, tries + 1), 1500); return; }
    if (current) { current.holdings = emptyHoldings(); render(); }
  }
}
function emptyHoldings(): HoldingsBlock { return { tokens: [], count: 0, last_updated: null, stale: false, loading: false }; }

function render() {
  if (!current) return;
  const { wallet, tracking, holdings, tab, currency } = current;
  try {
    app.innerHTML = renderHeader(wallet, tracking, current.period) + renderTables(tab, tracking, holdings, currency);
    const host = document.getElementById('chart-host');
    if (host) renderChart(host, tracking.period_realized_pnl_chart || []);
  } catch (re) {
    setStatus('err', 'render error');
    app.innerHTML = `<div class="error-box">Loaded, but rendering failed: ${(re as Error).message}</div>`;
  }
}

function openCalendar() {
  if (!current) return;
  $('calendar-title').textContent = `PnL Calendar — ${current.tracking.profile.name || current.wallet.slice(0, 6)}`;
  const body = $('calendar-body');
  if (current.calendar && current.calendar.months.length) {
    new CalendarView(current.calendar, body).render();
  } else {
    body.innerHTML = '<div class="muted">No calendar data for this wallet.</div>';
  }
  $('calendar-modal').hidden = false;
}
function closeCalendar() { $('calendar-modal').hidden = true; }

app.addEventListener('click', (e) => {
  const el = e.target as HTMLElement;
  const tabEl = el.closest('.tab') as HTMLElement | null;
  if (tabEl?.dataset.tab && current) { current.tab = tabEl.dataset.tab as TabId; render(); return; }
  if (el.closest('#open-calendar')) { openCalendar(); return; }
  const pill = el.closest('.period-pill') as HTMLElement | null;
  if (pill?.dataset.period && current && pill.dataset.period !== current.period) { switchPeriod(pill.dataset.period); return; }
  const copy = el.closest('[data-copy]') as HTMLElement | null;
  if (copy?.dataset.copy) { navigator.clipboard?.writeText(copy.dataset.copy); const o = copy.textContent; copy.textContent = 'Copied!'; setTimeout(() => (copy.textContent = o), 1000); }
});

async function switchPeriod(period: string) {
  if (!current) return;
  const { api, blockchain, wallet } = current;
  current.period = period;
  // Reload tracking for the new period; keep holdings/calendar as they are period-independent.
  setStatus('loading', 'loading…');
  try {
    const tracking = normalizeTracking(await api.get('/wallet/tracking', { blockchain, address: wallet, period }));
    current.tracking = tracking;
    render();
    setStatus('ok', 'loaded');
  } catch (e) {
    setStatus('err', 'failed');
  }
}

function skeleton(): string {
  const box = '<div class="sk-box"></div>';
  return `<div class="board sk"><div class="col col-left">${box}${box}${box}</div><div class="col col-mid"><div class="sk-chart"></div></div><div class="col col-right">${box}${box}${box}</div></div><div class="sk-tabs"></div>`;
}

$('calendar-close').addEventListener('click', closeCalendar);
$('calendar-modal').addEventListener('click', (e) => { if (e.target === $('calendar-modal')) closeCalendar(); });
$('go').addEventListener('click', load);
$('clear').addEventListener('click', () => { walletEl.value = ''; current = null; app.innerHTML = `<div class="placeholder">Enter a wallet address and load.</div>`; setStatus('idle', 'idle'); });
walletEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') load(); });
apikeyEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') load(); });
