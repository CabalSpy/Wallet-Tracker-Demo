# CabalSpy — Wallet Tracker

A full wallet profile page built on the CabalSpy REST API, in TypeScript, matching
the production tracker layout. It shows the profile banner (avatar, name, socials,
copy-trade), the period stats (P&L, volume, transactions, buy/sell totals, win rate),
a metrics strip (avg hold, active hours, largest buy, best/worst trade, avg position),
tabbed tables (traded this period, on-chain holdings, recent trades), and a PnL
calendar you can page through month by month.

It uses these endpoints:

- `GET /v1/wallet/tracking` — the whole profile: stats, win-rate buckets, active and
  historical tokens, the realized-PnL series and recent trades.
- `GET /v1/wallet/holdings` — current on-chain balances, loaded lazily with polling.
- `GET /v1/wallet/pnl_calendar` — day-by-day realized PnL, shown in the calendar modal.

## Run it

```bash
npm install
npm run dev
```

Then paste your API key, paste a wallet address, pick the chain and period, and click
**Load wallet**. Get a key at https://apidashboard.cabalspy.xyz.

## Files

- `src/config.ts` — public REST base URL and the chain map. No secrets.
- `src/lib/api.ts` — fetch wrapper (adds `api_key`) plus response normalizers.
- `src/lib/format.ts` — USD/native/token/hold/time formatting, mirroring the site.
- `src/types/api.ts` — typings for the real endpoint responses.
- `src/ui/header.ts` — the profile banner, stat boxes and metrics strip.
- `src/ui/tables.ts` — the tabbed tables (traded, holdings, trades).
- `src/ui/calendar.ts` — the PnL calendar with month navigation arrows.
- `src/main.ts` — loads the endpoints, holds state, wires tabs and the calendar.

## Notes

- Everything shown maps to a real API field. The wallet type, chain and period come
  from the controls at the top.
- Holdings load after the page renders and poll while the balance cache warms up.
- The calendar starts on the most recent month; use the arrows to page back and forth.
