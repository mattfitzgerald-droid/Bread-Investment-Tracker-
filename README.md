# Bread Investment Tracker

A simple, funny, Tron-ish website that shows what a $49.11 bread settlement would be worth if invested in QQQ.

## What is included

- Next.js app
- Live QQQ price endpoint
- Historical QQQ purchase-date lookup
- Neon bread-themed homepage
- Auto-refresh every 60 seconds
- Vercel-ready setup

## Edit the main settings

Open:

`app/config.ts`

Change:

```ts
settlementAmountUsd: 49.11,
purchaseDate: "2024-12-31",
```

The app uses the first valid QQQ trading close after the purchase date if the chosen date is a weekend or market holiday.

## Run locally

```bash
npm install
npm run dev
```

Then open:

```bash
http://localhost:3000
```

## Deploy to Vercel

1. Create a free Vercel account.
2. Create a GitHub repo and upload this folder.
3. In Vercel, click New Project.
4. Import the GitHub repo.
5. Click Deploy.
6. Add a custom domain later if you want.

## Data note

This uses Yahoo Finance's public, unofficial endpoints from a server-side API route. That is fine for a fun MVP, but for a more durable public site you may eventually want a paid/stable market data API.

## Disclaimer

This is a parody/novelty tracker, not investment advice.
