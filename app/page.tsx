"use client";

import { useEffect, useMemo, useState } from "react";
import { Wheat, Zap, TrendingUp, RefreshCw } from "lucide-react";
import { trackerConfig } from "./config";

type TrackerData = {
  ticker: string;
  settlementAmountUsd: number;
  purchaseDate: string;
  actualTradeDate: string;
  purchasePrice: number;
  currentPrice: number;
  currentValue: number;
  shares: number;
  totalReturn: number;
  totalReturnPercent: number;
  dayChangePercent: number;
  currency: string;
  marketTime: string;
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function formatMoney(value: number) {
  return money.format(value);
}

export default function Home() {
  const [data, setData] = useState<TrackerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      setError(null);
      const res = await fetch("/api/qqq", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not refresh the loaf portfolio.");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 60_000);
    return () => clearInterval(timer);
  }, []);

  const isUp = useMemo(() => (data?.totalReturn ?? 0) >= 0, [data]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050711] text-white">
      <div className="grid-overlay" />
      <div className="radial-glow" />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,.25)]">
          <Zap size={16} />
          Live-ish market data refreshes every 60 seconds
        </div>

        <h1 className="text-balance bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-7xl">
          {trackerConfig.appName}
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
          {trackerConfig.tagline}
        </p>

        <div className="loaf-card mt-10 w-full max-w-3xl rounded-[2rem] border border-cyan-300/20 bg-white/5 p-6 shadow-[0_0_80px_rgba(34,211,238,.18)] backdrop-blur-md sm:p-10">
          <div className="mx-auto flex h-44 w-72 items-center justify-center rounded-[4rem_4rem_2rem_2rem] border border-amber-200/50 bg-gradient-to-br from-amber-200 via-orange-300 to-yellow-700 shadow-[0_0_60px_rgba(251,191,36,.35)] sm:h-52 sm:w-96">
            <div className="grid grid-cols-3 gap-5 opacity-80">
              <Wheat className="text-yellow-950" size={42} />
              <Wheat className="text-yellow-950" size={42} />
              <Wheat className="text-yellow-950" size={42} />
            </div>
          </div>

          <div className="mt-8">
            {loading && <p className="text-slate-300">Calculating the loaf alpha...</p>}
            {error && <p className="text-red-200">{error}</p>}
            {data && (
              <>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-200">Current bread portfolio value</p>
                <div className="mt-3 font-mono text-6xl font-black tracking-tight text-cyan-100 drop-shadow-[0_0_25px_rgba(34,211,238,.75)] sm:text-8xl">
                  {formatMoney(data.currentValue)}
                </div>
                <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${isUp ? "bg-emerald-400/15 text-emerald-200" : "bg-red-400/15 text-red-200"}`}>
                  <TrendingUp size={16} />
                  {isUp ? "+" : ""}{formatMoney(data.totalReturn)} / {isUp ? "+" : ""}{data.totalReturnPercent.toFixed(2)}%
                </div>
              </>
            )}
          </div>

          {data && (
            <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
              <Stat label="Original settlement" value={formatMoney(data.settlementAmountUsd)} />
              <Stat label="QQQ shares bought" value={data.shares.toFixed(5)} />
              <Stat label="Live QQQ price" value={formatMoney(data.currentPrice)} />
              <Stat label="Purchase date" value={data.actualTradeDate} />
              <Stat label="QQQ buy price" value={formatMoney(data.purchasePrice)} />
              <Stat label="Market timestamp" value={new Date(data.marketTime).toLocaleString()} />
            </div>
          )}

          <button onClick={loadData} className="mt-8 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/20">
            <RefreshCw size={16} /> Refresh the loaf
          </button>
        </div>

        <p className="mt-8 max-w-2xl text-xs leading-6 text-slate-500">
          Built for fun. Not investment advice. Prices may be delayed or unavailable depending on market data source limitations.
        </p>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 font-mono text-lg text-white">{value}</p>
    </div>
  );
}
