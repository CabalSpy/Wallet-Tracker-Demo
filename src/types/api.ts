/** Typings mirroring the real /v1/wallet/tracking response (see production tracker.php). */

export interface Profile {
  name: string;
  image_url: string;
  twitter: string;
  telegram: string;
  blockchain: string;
  currency: string;
  type: string;
  active_hours?: string | number[];
  copytrade_link?: string;
}

export interface PeriodStats {
  period: string;
  total_buy: number; total_buy_usd: number;
  total_sell: number; total_sell_usd: number;
  volume: number; volume_usd: number;
  realized_pnl: number; realized_pnl_usd: number; realized_pnl_percentage: number;
  buy_txn: number; sell_txn: number;
  win_rate?: number;
  avg_hold_time_minutes: number;
  win_count: number; loss_count: number;
  largest_buy: number; best_trade_pnl: number; worst_trade_pnl: number;
}

export interface WinRateDist {
  win_rate_percentage?: number;
  above_500: number; above_100_to_500: number; above_zero_to_100: number; below_zero: number;
}

/** period_active_tokens is an OBJECT: counters + a tokens[] list. */
export interface ActiveTokensBlock {
  active_tokens_count: number;
  avg_position_size: number;
  still_holding_count: number;
  tokens: ActiveToken[];
}

export interface ActiveToken {
  token_name: string;
  symbol?: string;
  buy_value: number; buy_value_usd: number;
  sell_value: number; sell_value_usd: number;
  buy_tokens: number; sell_tokens: number;
  remaining_tokens?: number;
  realized_pnl: number; realized_pnl_usd: number; realized_pnl_percentage: number;
  bag_pct?: number; supply_pct?: number;
}

export interface Trade {
  tx_signature?: string;
  token_name?: string;
  transaction_type: string;
  buy_value?: number; buy_value_usd?: number;
  sell_value?: number; sell_value_usd?: number;
  created_at: string;
}

export interface PnlChartPoint { timestamp: string; realized_pnl: number; realized_pnl_usd: number }

/** GET /v1/wallet/tracking */
export interface TrackingResponse {
  wallet?: string;
  profile: Profile;
  period_stats: PeriodStats;
  period_win_rate_distribution: WinRateDist;
  period_active_tokens: ActiveTokensBlock;
  period_history_tokens: ActiveToken[];
  period_realized_pnl_chart: PnlChartPoint[];
  period_trades: Trade[];
  active_holdings?: HoldingsBlock;
}

export interface HoldingsBlock {
  tokens: HoldingToken[];
  count: number; last_updated: string | null; stale: boolean; loading: boolean;
}
export interface HoldingToken {
  token_address: string; token_name: string; symbol: string;
  amount: string; amount_formatted: string; decimals: number; verified_contract: boolean;
}

/** GET /v1/wallet/pnl_calendar */
export interface CalendarDay {
  date: string; realized_pnl: number; realized_pnl_usd: number;
  buy_txn: number; sell_txn: number; txn_total: number; tokens_traded: number;
  volume: number; total_buy: number; total_buy_usd: number; total_sell: number; total_sell_usd: number;
}
export interface CalendarMonth {
  month: number; year: number; positive_streak: number; negative_streak: number;
  realized_pnl: number; realized_pnl_usd: number; volume: number;
  buy_txn: number; sell_txn: number; txn_total: number; tokens_traded: number;
}
export interface CalendarResponse {
  wallet: string; profile: Profile;
  months: { dates: CalendarDay[]; month: CalendarMonth }[];
  dates: CalendarDay[]; month: CalendarMonth | Record<string, never>;
}
