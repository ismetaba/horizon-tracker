'use client';

import { useEffect, useState } from 'react';
import { getOdemeler, getHarcamalar, getKurlar, getKur, formatTL, formatUSD, KISILER, KATEGORILER } from '@/lib/store';
import StatCard from '@/components/StatCard';

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

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam Ödemeler (TL)" value={`₺${formatTL(toplamOdemeTL)}`} color="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950" />
        <StatCard label="Toplam Ödemeler (USD)" value={`$${formatUSD(toplamOdemeUSD)}`} color="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950" />
        <StatCard label="Toplam Harcamalar (TL)" value={`₺${formatTL(toplamHarcamaTL)}`} color="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950" />
        <StatCard label="Toplam Harcamalar (USD)" value={`$${formatUSD(toplamHarcamaUSD)}`} color="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Genel Toplam (TL)" value={`₺${formatTL(toplamOdemeTL + toplamHarcamaTL)}`} color="border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950" />
        <StatCard label="Güncel USD/TL" value={sonKur.toFixed(2)} sub={`${kurlar.length} kur kaydı`} color="border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900" />
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Kişi Bazlı Ödemeler</h2>
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-3 text-left font-medium">Kişi</th>
                <th className="px-4 py-3 text-right font-medium">Toplam TL</th>
                <th className="px-4 py-3 text-right font-medium">Toplam USD</th>
                <th className="px-4 py-3 text-right font-medium">Ödeme Sayısı</th>
              </tr>
            </thead>
            <tbody>
              {kisiOzet.map(k => (
                <tr key={k.kisi} className="border-b border-zinc-100 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-medium">{k.kisi}</td>
                  <td className="px-4 py-3 text-right tabular-nums">₺{formatTL(k.tl)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">${formatUSD(k.usd)}</td>
                  <td className="px-4 py-3 text-right">{k.sayi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Kategori Bazlı Harcamalar</h2>
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-3 text-left font-medium">Kategori</th>
                <th className="px-4 py-3 text-right font-medium">Toplam TL</th>
                <th className="px-4 py-3 text-right font-medium">İşlem Sayısı</th>
                <th className="px-4 py-3 text-left font-medium">Oran</th>
              </tr>
            </thead>
            <tbody>
              {kategoriOzet.map(k => {
                const pct = toplamHarcamaTL > 0 ? (k.tl / toplamHarcamaTL) * 100 : 0;
                return (
                  <tr key={k.kategori} className="border-b border-zinc-100 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50">
                    <td className="px-4 py-3 font-medium">{k.kategori}</td>
                    <td className="px-4 py-3 text-right tabular-nums">₺{formatTL(k.tl)}</td>
                    <td className="px-4 py-3 text-right">{k.sayi}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                          <div className="h-full rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-zinc-500">{pct.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
