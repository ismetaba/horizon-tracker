'use client';

import { useEffect, useState } from 'react';
import { getOdemeler, getHarcamalar, getKurlar, findKur, formatTL, formatUSD, seedIfEmpty, KISILER, KATEGORILER, type Kur, type Odeme, type Harcama } from '@/lib/store';

export default function Dashboard() {
  const [odemeler, setOdemeler] = useState<Odeme[]>([]);
  const [harcamalar, setHarcamalar] = useState<Harcama[]>([]);
  const [kurlar, setKurlar] = useState<Kur[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await seedIfEmpty();
      const [o, h, k] = await Promise.all([getOdemeler(), getHarcamalar(), getKurlar()]);
      setOdemeler(o);
      setHarcamalar(h);
      setKurlar(k);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center p-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>;

  const sonKur = kurlar.length ? kurlar[kurlar.length - 1].usdTl : 1;
  const bizimOdemeTL = odemeler.reduce((s, o) => s + o.tlTutar, 0);
  const bizimOdemeUSD = odemeler.reduce((s, o) => s + o.tlTutar / findKur(kurlar, o.tarih), 0);
  const muteahhitOdemeTL = bizimOdemeTL;
  const toplamGirenTL = bizimOdemeTL + muteahhitOdemeTL;
  const toplamHarcamaTL = harcamalar.reduce((s, h) => s + h.tlTutar, 0);
  const toplamHarcamaUSD = harcamalar.reduce((s, h) => s + h.tlTutar / findKur(kurlar, h.tarih), 0);
  const kasaTL = toplamGirenTL - toplamHarcamaTL;

  const kisiOzet = KISILER.map(k => {
    const kisiOdemeleri = odemeler.filter(o => o.kisi === k);
    const tl = kisiOdemeleri.reduce((s, o) => s + o.tlTutar, 0);
    const usd = kisiOdemeleri.reduce((s, o) => s + o.tlTutar / findKur(kurlar, o.tarih), 0);
    return { kisi: k, tl, usd, sayi: kisiOdemeleri.length };
  });

  const kategoriOzet = KATEGORILER.map(k => {
    const items = harcamalar.filter(h => h.kategori === k);
    const tl = items.reduce((s, h) => s + h.tlTutar, 0);
    return { kategori: k, tl, sayi: items.length };
  }).filter(k => k.sayi > 0).sort((a, b) => b.tl - a.tl);

  const katColors: Record<string, string> = {
    Mimar: 'bg-blue-500', Emlakci: 'bg-emerald-500', Arsa: 'bg-violet-500',
    Diger: 'bg-zinc-400', Noter: 'bg-amber-500', Ifraz: 'bg-rose-500',
    'Tapu Harci': 'bg-orange-500', Insaat: 'bg-cyan-500', Imar: 'bg-pink-500',
    Ruhsat: 'bg-teal-500',
  };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Horizon İnşaat - Genel Bakış</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-xl">
          <p className="text-sm font-medium uppercase tracking-widest text-blue-200">Bizim Ödemeler</p>
          <p className="mt-2 text-4xl font-black tabular-nums tracking-tight">₺{formatTL(bizimOdemeTL)}</p>
          <p className="mt-1 text-lg tabular-nums text-blue-200">${formatUSD(bizimOdemeUSD)}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-200">
            <span>{odemeler.length} ödeme</span><span className="text-blue-300">|</span><span>{KISILER.length} kişi</span>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 p-6 text-white shadow-xl">
          <p className="text-sm font-medium uppercase tracking-widest text-amber-200">Toplam Harcama</p>
          <p className="mt-2 text-4xl font-black tabular-nums tracking-tight">₺{formatTL(toplamHarcamaTL)}</p>
          <p className="mt-1 text-lg tabular-nums text-amber-200">${formatUSD(toplamHarcamaUSD)}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-amber-200">
            <span>{harcamalar.length} kayıt</span><span className="text-amber-300">|</span><span>{kategoriOzet.length} kategori</span>
          </div>
        </div>
        <div className={`rounded-2xl p-6 text-white shadow-xl ${kasaTL >= 0 ? 'bg-gradient-to-br from-emerald-600 to-emerald-700' : 'bg-gradient-to-br from-red-600 to-red-700'}`}>
          <p className={`text-sm font-medium uppercase tracking-widest ${kasaTL >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>Kasada Kalan</p>
          <p className="mt-2 text-4xl font-black tabular-nums tracking-tight">₺{formatTL(Math.abs(kasaTL))}</p>
          {kasaTL < 0 && <p className="mt-1 text-lg font-medium text-red-200">Eksi bakiye!</p>}
          <div className={`mt-4 text-sm ${kasaTL >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
            <p>Giren: ₺{formatTL(toplamGirenTL)}</p>
            <p className="text-xs opacity-75">(Bizim ₺{formatTL(bizimOdemeTL)} + Müteahhit ₺{formatTL(muteahhitOdemeTL)})</p>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
        Müteahhit tarafı bizim ödemelerimizle 1:1 eşleşme olarak kabul edilmektedir. Toplam giren para = Bizim + Müteahhit = ₺{formatTL(toplamGirenTL)}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Güncel USD/TL</p>
          <p className="mt-1 text-2xl font-bold">{sonKur.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Toplam Giren (TL)</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">₺{formatTL(toplamGirenTL)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Toplam Çıkan (TL)</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">₺{formatTL(toplamHarcamaTL)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Harcama Oranı</p>
          <p className="mt-1 text-2xl font-bold">{toplamGirenTL > 0 ? ((toplamHarcamaTL / toplamGirenTL) * 100).toFixed(1) : 0}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-bold">Kişi Bazlı Ödemeler</h2>
          <div className="space-y-3">
            {kisiOzet.map(k => {
              const pct = bizimOdemeTL > 0 ? (k.tl / bizimOdemeTL) * 100 : 0;
              return (
                <div key={k.kisi} className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">{k.kisi.charAt(0)}</div>
                      <div><p className="font-semibold">{k.kisi}</p><p className="text-xs text-zinc-400">{k.sayi} ödeme</p></div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold tabular-nums">{k.tl > 0 ? `₺${formatTL(k.tl)}` : '₺0,00'}</p>
                      <p className="text-xs tabular-nums text-zinc-400">{k.usd > 0 ? `$${formatUSD(k.usd)}` : '$0,00'}</p>
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
                      <div><p className="font-semibold">{k.kategori}</p><p className="text-xs text-zinc-400">{k.sayi} işlem</p></div>
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
