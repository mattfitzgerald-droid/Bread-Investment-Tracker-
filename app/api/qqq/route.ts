import { NextResponse } from "next/server";
import { trackerConfig } from "../../config";

const ONE_DAY = 24 * 60 * 60;

function toUnixSeconds(date: string) {
  return Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 1000);
}

async function getCurrentQuote(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Could not fetch current quote");
  const json = await res.json();
  const quote = json?.quoteResponse?.result?.[0];
  if (!quote?.regularMarketPrice) throw new Error("Current price unavailable");
  return {
    price: Number(quote.regularMarketPrice),
    changePercent: Number(quote.regularMarketChangePercent ?? 0),
    marketTime: quote.regularMarketTime ? new Date(quote.regularMarketTime * 1000).toISOString() : new Date().toISOString(),
    currency: quote.currency || "USD"
  };
}

async function getHistoricalClose(symbol: string, date: string) {
  const period1 = toUnixSeconds(date);
  const period2 = period1 + ONE_DAY * 7;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=1d&events=history`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Could not fetch historical price");
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  const timestamps = result?.timestamp || [];
  const closes = result?.indicators?.quote?.[0]?.close || [];
  const firstValidIndex = closes.findIndex((value: number | null) => typeof value === "number" && value > 0);
  if (firstValidIndex === -1) throw new Error("Historical price unavailable");
  return {
    price: Number(closes[firstValidIndex]),
    actualTradeDate: new Date(timestamps[firstValidIndex] * 1000).toISOString().slice(0, 10)
  };
}

export async function GET() {
  try {
    const [current, historical] = await Promise.all([
      getCurrentQuote(trackerConfig.ticker),
      getHistoricalClose(trackerConfig.ticker, trackerConfig.purchaseDate)
    ]);

    const shares = trackerConfig.settlementAmountUsd / historical.price;
    const currentValue = shares * current.price;
    const totalReturn = currentValue - trackerConfig.settlementAmountUsd;
    const totalReturnPercent = (totalReturn / trackerConfig.settlementAmountUsd) * 100;

    return NextResponse.json({
      ticker: trackerConfig.ticker,
      settlementAmountUsd: trackerConfig.settlementAmountUsd,
      purchaseDate: trackerConfig.purchaseDate,
      actualTradeDate: historical.actualTradeDate,
      purchasePrice: historical.price,
      currentPrice: current.price,
      currentValue,
      shares,
      totalReturn,
      totalReturnPercent,
      dayChangePercent: current.changePercent,
      currency: current.currency,
      marketTime: current.marketTime
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
