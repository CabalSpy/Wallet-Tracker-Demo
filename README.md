# CabalSpy API — Next.js Demo

Production-ready example of the **CabalSpy API** — multi-chain KOL & Smart Money leaderboard with wallet tracker modal.

## Features

- 🏆 Leaderboard with **#1 full-width + #2/#3 side-by-side** podium
- 🔍 **Centered wallet popup** — click any trader to open detailed stats
- 🌐 **SOL · BNB · Base** with real chain icons
- 👥 **KOL & Smart Money** categories
- ⏱ **6h · 1d · 7d · 30d** periods
- 📊 Activity feed + Token overview per wallet
- 🔐 API key stays server-side (never exposed to browser)

## Install

```bash
# 1. Clone / extract
cd cabalspy-demo

# 2. Dependencies
npm install

# 3. API key
cp .env.local.example .env.local
# Edit .env.local:
#   CABALSPY_API_KEY=your_key_here
#   CABALSPY_API_BASE=https://api.cabalspy.xyz

# 4. Dev
npm run dev
# → http://localhost:3001

# 5. Production
npm run build
npm start
```

## With PM2 (recommended for servers)

```bash
npm run build
npm install -g pm2
pm2 start npm --name "cabalspy-demo" -- start
pm2 save && pm2 startup
```

## Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Debugging PNL / empty data

If values show as 0, your API returns different field names.
Run this to inspect the raw response:

```bash
curl "https://api.cabalspy.xyz/api/stats/leaderboard?period=1d&api_key=YOUR_KEY" \
  | python3 -m json.tool | head -60
```

The `lib/api.ts` `normaliseLeaderboard()` function already tries dozens of
field name variants. If yours is different, add it to the `pickNum()` call.

## Endpoints used

| Chain | Category | Endpoint |
|---|---|---|
| SOL | KOL | `/api/stats/leaderboard` |
| SOL | Smart | `/api/stats/Smart_leaderboard` |
| BNB | KOL | `/api/stats/leaderboard_bnb` |
| BNB | Smart | `/api/stats/SmartBnb_leaderboard` |
| BASE | KOL | `/api/stats/leaderboard_base` |
| BASE | Smart | `/api/stats/SmartBase_leaderboard` |
| All | — | `/api/wallet/tracker` |

Full docs: [cabalspy.gitbook.io/cabalspy-docs](https://cabalspy.gitbook.io/cabalspy-docs)

## License

MIT — free to use, fork and deploy.
