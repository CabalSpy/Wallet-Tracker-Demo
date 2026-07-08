/**
 * Static configuration.
 *
 * The REST base URL is a PUBLIC endpoint and is intentionally fixed here. Do NOT
 * put an API key here — it is entered at runtime in the UI and only kept in memory.
 */
export const API_BASE = 'https://api.cabalspy.xyz/v1';

/** Frontend chain label -> API blockchain, matching the production tracker. */
export const CHAIN_MAP: Record<string, string> = { SOL: 'solana', BNB: 'bnb', BASE: 'base', ETH: 'eth' };

export const DEFAULT_CHAIN = 'SOL';
export const DEFAULT_PERIOD = '1d';

/** Explorer base per chain, for the account link in the Performance panel. */
export const EXPLORER_ACCOUNT: Record<string, string> = {
  solana: 'https://solscan.io/account/',
  bnb: 'https://bscscan.com/address/',
  base: 'https://basescan.org/address/',
  eth: 'https://etherscan.io/address/',
};
