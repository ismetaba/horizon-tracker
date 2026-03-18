'use client';

import { useEffect, useState, useCallback } from 'react';
import { getOdemeler, addOdeme, deleteOdeme, getKur, formatTL, formatUSD, formatDate, getMonthKey, getUniqueMonths, KISILER, type Odeme } from '@/lib/store';
import Modal from '@/components/Modal';
import MonthTabs from '@/components/MonthTabs';

export default function OdemelerPage() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<Odeme[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filterKisi, setFilterKisi] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [form, setForm] = useState({ tarih: '', kisi: KISILER[0], tlTutar: '' });

  const reload = useCallback(() => setData(getOdemeler()), []);
  useEffect(() => { setMounted(true); reload(); }, [reload]);

  if (!mounted) return <div className="flex h-full items-center justify-center p-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>;

  const months = getUniqueMonths(data);
  const monthTotals: Record<string, number> = {};
  data.forEach(o => { const mk = getMonthKey(o.tarih); monthTotals[mk] = (monthTotals[mk] || 0) + o.tlTutar; });

  const monthFiltered = selectedMonth ? data.filter(o => o.tarih.startsWith(selectedMonth)) : data;
  const filtered = filterKisi ? monthFiltered.filter(o => o.kisi === filterKisi) : monthFiltered;

  const toplamBizimTL = filtered.reduce((s, o) => s + o.tlTutar, 0);
  const toplamBizimUSD = filtered.reduce((s, o) => s + o.tlTutar / getKur(o.tarih), 0);
  // Müteahhit her zaman aynı tutarı ödemiş kabul
  const toplamMuteahhitTL = toplamBizimTL;
  const toplamGenel = toplamBizimTL + toplamMuteahhitTL;

  // Group by person - TÜM kişileri göster (0 olsa bile)
  const kisiGrup = KISILER.map(kisi => {
    const kisiFiltered = filtered.filter(o => o.kisi === kisi);
    const tl = kisiFiltered.reduce((s, o) => s + o.tlTutar, 0);
    const usd = kisiFiltered.reduce((s, o) => s + o.tlTutar / getKur(o.tarih), 0);
    return { kisi, odemeler: kisiFiltered, tl, usd, sayi: kisiFiltered.length };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tarih || !form.tlTutar) return;
    addOdeme({ tarih: form.tarih, kisi: form.kisi, tlTutar: parseFloat(form.tlTutar) });
    setForm({ tarih: '', kisi: KISILER[0], tlTutar: '' });
    setShowModal(false);
    reload();
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu ödemeyi silmek istediğinize emin misiniz?')) {
      deleteOdeme(id);
      reload();
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ödemeler</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} kayıt</p>
        </div>
        <div className="flex gap-3">
          <select value={filterKisi} onChange={e => setFilterKisi(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
            <option value="">Tüm Kişiler</option>
            {KISILER.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <button onClick={() => setShowModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
            + Yeni Ödeme
          </button>
        </div>
      </div>

      {/* Month Tabs */}
      <div className="mb-6">
        <MonthTabs months={months} selected={selectedMonth} onSelect={setSelectedMonth} totals={monthTotals} accentColor="blue" />
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900/50 dark:bg-blue-950/30">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Bizim Taraf</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-blue-700 dark:text-blue-300">₺{formatTL(toplamBizimTL)}</p>
          <p className="mt-0.5 text-sm tabular-nums text-blue-500/70">${formatUSD(toplamBizimUSD)}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Müteahhit Tarafı</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">₺{formatTL(toplamMuteahhitTL)}</p>
          <p className="mt-0.5 text-sm text-emerald-500/70">1:1 eşleşme (ödendi)</p>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-5 dark:border-violet-900/50 dark:bg-violet-950/30">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Toplam (Bizim + Müteahhit)</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-violet-700 dark:text-violet-300">₺{formatTL(toplamGenel)}</p>
          <p className="mt-0.5 text-sm text-violet-500/70">{filtered.length} x 2 ödeme</p>
        </div>
      </div>

      {/* Person Cards - TÜM kişiler her zaman gösterilir */}
      <div className="space-y-4">
        {kisiGrup.map(k => (
          <div key={k.kisi} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {k.kisi.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-bold">{k.kisi}</p>
                  <p className="text-xs text-zinc-400">{k.sayi} ödeme</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-500">Kişi Başı Toplam</p>
                <p className="text-xl font-bold tabular-nums">₺{formatTL(k.tl)}</p>
              </div>
            </div>

            {/* Comparison bars */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-blue-600 dark:text-blue-400">Bizim Taraf</span>
                  <span className="font-bold tabular-nums">₺{formatTL(k.tl)}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: k.tl > 0 ? '100%' : '0%' }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Müteahhit Tarafı</span>
                  <span className="font-bold tabular-nums">₺{formatTL(k.tl)}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: k.tl > 0 ? '100%' : '0%' }} />
                </div>
              </div>
            </div>

            {/* Payment detail rows */}
            {k.odemeler.length > 0 ? (
              <div className="mt-4 space-y-2">
                {k.odemeler.sort((a, b) => a.tarih.localeCompare(b.tarih)).map(o => (
                  <div key={o.id} className="flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800/50">
                    <span className="w-24 shrink-0 text-zinc-500">{formatDate(o.tarih)}</span>
                    <div className="flex flex-1 items-center gap-4">
                      <span className="font-semibold tabular-nums text-blue-600 dark:text-blue-400">₺{formatTL(o.tlTutar)}</span>
                      <span className="text-xs text-zinc-400">+</span>
                      <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">₺{formatTL(o.tlTutar)}</span>
                      <span className="text-xs text-zinc-400">=</span>
                      <span className="font-bold tabular-nums">₺{formatTL(o.tlTutar * 2)}</span>
                    </div>
                    <button onClick={() => handleDelete(o.id)} className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-lg bg-zinc-50 px-3 py-4 text-center text-sm text-zinc-400 dark:bg-zinc-800/50">
                Bu dönemde ödeme yok
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Yeni Ödeme Ekle">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Tarih</label>
            <input type="date" required value={form.tarih} onChange={e => setForm({ ...form, tarih: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Kişi</label>
            <select value={form.kisi} onChange={e => setForm({ ...form, kisi: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800">
              {KISILER.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">TL Tutar</label>
            <input type="number" step="0.01" required value={form.tlTutar} onChange={e => setForm({ ...form, tlTutar: e.target.value })}
              placeholder="300000" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          </div>
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
            Ekle
          </button>
        </form>
      </Modal>
    </div>
  );
}
