'use client';

import { useEffect, useState } from 'react';
import { getOdemeler, getHarcamalar, getKurlar, getKur, formatTL, formatUSD, KISILER, KATEGORILER } from '@/lib/store';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="flex h-full items-center justify-center p-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>;

  const odemeler = getOdemeler();
  const harcamalar = getHarcamalar();
  const kurlar = getKurlar();
  const sonKur = kurlar.length ? kurlar[kurlar.length - 1].usdTl : 1;

  const toplamOdemeTL = odemeler.reduce((s, o) => s + o.tlTutar, 0);
  const toplamOdemeUSD = odemeler.reduce((s, o) => s + o.tlTutar / getKur(o.tarih), 0);
  const toplamHarcamaTL = harcamalar.reduce((s, h) => s + h.tlTutar, 0);
  const toplamHarcamaUSD = harcamalar.reduce((s, h) => s + h.tlTutar / getKur(h.tarih), 0);
  const genelToplamTL = toplamOdemeTL + toplamHarcamaTL;
  const genelToplamUSD = toplamOdemeUSD + toplamHarcamaUSD;

  const kisiOzet = KISILER.map(k => {
    const kisiOdemeleri = odemeler.filter(o => o.kisi === k);
    const tl = kisiOdemeleri.reduce((s, o) => s + o.tlTutar, 0);
    const usd = kisiOdemeleri.reduce((s, o) => s + o.tlTutar / getKur(o.tarih), 0);
    return { kisi: k, tl, usd, sayi: kisiOdemeleri.length };
  });

  const kategoriOzet = KATEGORILER.map(k => {
    const items = harcamalar.filter(h => h.kategori === k);
    const tl = items.reduce((s, h) => s + h.tlTutar, 0);
    return { kategori: k, tl, sayi: items.length };
  }).filter(k => k.sayi > 0).sort((a, b) => b.tl - a.tl);

  // Color map for categories
  const katColors: Record<string, string> = {
    Mimar: 'bg-blue-500', Emlakci: 'bg-emerald-500', Arsa: 'bg-violet-500',
    Diger: 'bg-zinc-400', Noter: 'bg-amber-500', Ifraz: 'bg-rose-500',
    'Tapu Harci': 'bg-orange-500', Insaat: 'bg-cyan-500', Imar: 'bg-pink-500',
    Ruhsat: 'bg-teal-500',
  };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Horizon İnşaat - Ödeme & Harcama Özeti</p>
      </div>

      {/* Hero: Genel Toplam */}
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 text-white shadow-xl dark:from-zinc-800 dark:to-zinc-700">
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-400">Genel Toplam Harcama</p>
        <p className="mt-2 text-5xl font-black tabular-nums tracking-tight">₺{formatTL(genelToplamTL)}</p>
        <p className="mt-1 text-xl font-medium tabular-nums text-zinc-300">${formatUSD(genelToplamUSD)}</p>
        <div className="mt-5 flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-zinc-400">Güncel Kur</span>
            <span className="ml-2 font-bold text-emerald-400">{sonKur.toFixed(2)} USD/TL</span>
          </div>
          <div>
            <span className="text-zinc-400">Ödeme Kayıtları</span>
            <span className="ml-2 font-bold">{odemeler.length}</span>
          </div>
          <div>
            <span className="text-zinc-400">Harcama Kayıtları</span>
            <span className="ml-2 font-bold">{harcamalar.length}</span>
          </div>
        </div>
      </div>

      {/* Two big cards: Odemeler + Harcamalar */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Odemeler Card */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 dark:border-blue-900/50 dark:bg-blue-950/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-blue-900 dark:text-blue-200">Ödemeler</h2>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">{odemeler.length} kayıt</span>
          </div>
          <p className="mt-3 text-4xl font-extrabold tabular-nums text-blue-700 dark:text-blue-300">₺{formatTL(toplamOdemeTL)}</p>
          <p className="mt-0.5 text-lg tabular-nums text-blue-500/70">${formatUSD(toplamOdemeUSD)}</p>
        </div>

        {/* Harcamalar Card */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200">Harcamalar</h2>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">{harcamalar.length} kayıt</span>
          </div>
          <p className="mt-3 text-4xl font-extrabold tabular-nums text-amber-700 dark:text-amber-300">₺{formatTL(toplamHarcamaTL)}</p>
          <p className="mt-0.5 text-lg tabular-nums text-amber-500/70">${formatUSD(toplamHarcamaUSD)}</p>
        </div>
      </div>

      {/* Two tables side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Kisi Bazli Odemeler */}
        <div>
          <h2 className="mb-4 text-xl font-bold">Kişi Bazlı Ödemeler</h2>
          <div className="space-y-3">
            {kisiOzet.map(k => {
              const pct = toplamOdemeTL > 0 ? (k.tl / toplamOdemeTL) * 100 : 0;
              return (
                <div key={k.kisi} className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {k.kisi.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{k.kisi}</p>
                        <p className="text-xs text-zinc-400">{k.sayi} ödeme</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold tabular-nums">₺{formatTL(k.tl)}</p>
                      <p className="text-xs tabular-nums text-zinc-400">${formatUSD(k.usd)}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kategori Bazli Harcamalar */}
        <div>
          <h2 className="mb-4 text-xl font-bold">Kategori Bazlı Harcamalar</h2>
          <div className="space-y-3">
            {kategoriOzet.map(k => {
              const pct = toplamHarcamaTL > 0 ? (k.tl / toplamHarcamaTL) * 100 : 0;
              const barColor = katColors[k.kategori] || 'bg-zinc-400';
              return (
                <div key={k.kategori} className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${barColor}`} />
                      <div>
                        <p className="font-semibold">{k.kategori}</p>
                        <p className="text-xs text-zinc-400">{k.sayi} işlem</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold tabular-nums">₺{formatTL(k.tl)}</p>
                      <p className="text-xs tabular-nums text-zinc-400">{pct.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
