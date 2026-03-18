'use client';

import { useEffect, useState, useCallback } from 'react';
import { getHarcamalar, addHarcama, deleteHarcama, getKur, formatTL, formatUSD, formatDate, getMonthKey, getUniqueMonths, KATEGORILER, type Harcama } from '@/lib/store';
import Modal from '@/components/Modal';
import MonthTabs from '@/components/MonthTabs';

const katColors: Record<string, string> = {
  Mimar: 'bg-blue-500', Emlakci: 'bg-emerald-500', Arsa: 'bg-violet-500',
  Diger: 'bg-zinc-400', Noter: 'bg-amber-500', Ifraz: 'bg-rose-500',
  'Tapu Harci': 'bg-orange-500', Insaat: 'bg-cyan-500', Imar: 'bg-pink-500',
  Ruhsat: 'bg-teal-500',
};

export default function HarcamalarPage() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<Harcama[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filterKat, setFilterKat] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [form, setForm] = useState({ tarih: '', aciklama: '', kategori: KATEGORILER[0], tlTutar: '' });

  const reload = useCallback(() => setData(getHarcamalar()), []);
  useEffect(() => { setMounted(true); reload(); }, [reload]);

  if (!mounted) return <div className="flex h-full items-center justify-center p-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" /></div>;

  const months = getUniqueMonths(data);
  const monthTotals: Record<string, number> = {};
  data.forEach(h => { const mk = getMonthKey(h.tarih); monthTotals[mk] = (monthTotals[mk] || 0) + h.tlTutar; });

  const monthFiltered = selectedMonth ? data.filter(h => h.tarih.startsWith(selectedMonth)) : data;
  const filtered = filterKat ? monthFiltered.filter(h => h.kategori === filterKat) : monthFiltered;
  const toplamTL = filtered.reduce((s, h) => s + h.tlTutar, 0);
  const toplamUSD = filtered.reduce((s, h) => s + h.tlTutar / getKur(h.tarih), 0);

  // Category breakdown for current view
  const katBreakdown = KATEGORILER.map(k => {
    const items = filtered.filter(h => h.kategori === k);
    const tl = items.reduce((s, h) => s + h.tlTutar, 0);
    return { kategori: k, tl, sayi: items.length };
  }).filter(k => k.sayi > 0).sort((a, b) => b.tl - a.tl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tarih || !form.aciklama || !form.tlTutar) return;
    addHarcama({ tarih: form.tarih, aciklama: form.aciklama, kategori: form.kategori, tlTutar: parseFloat(form.tlTutar) });
    setForm({ tarih: '', aciklama: '', kategori: KATEGORILER[0], tlTutar: '' });
    setShowModal(false);
    reload();
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu harcamayı silmek istediğinize emin misiniz?')) {
      deleteHarcama(id);
      reload();
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Harcamalar</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} kayıt</p>
        </div>
        <div className="flex gap-3">
          <select value={filterKat} onChange={e => setFilterKat(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
            <option value="">Tüm Kategoriler</option>
            {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <button onClick={() => setShowModal(true)}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700">
            + Yeni Harcama
          </button>
        </div>
      </div>

      {/* Month Tabs */}
      <div className="mb-6">
        <MonthTabs months={months} selected={selectedMonth} onSelect={setSelectedMonth} totals={monthTotals} accentColor="amber" />
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900/50 dark:bg-amber-950/30">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Toplam TL</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-amber-700 dark:text-amber-300">₺{formatTL(toplamTL)}</p>
          <p className="mt-0.5 text-sm tabular-nums text-amber-500/70">${formatUSD(toplamUSD)}</p>
        </div>

        {/* Category mini breakdown */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">Kategori Dağılımı</p>
          {katBreakdown.length === 0 ? (
            <p className="text-sm text-zinc-400">Kayıt yok</p>
          ) : (
            <>
              <div className="mb-3 flex h-3 overflow-hidden rounded-full">
                {katBreakdown.map(k => {
                  const pct = toplamTL > 0 ? (k.tl / toplamTL) * 100 : 0;
                  return <div key={k.kategori} className={`${katColors[k.kategori] || 'bg-zinc-400'}`} style={{ width: `${pct}%` }} />;
                })}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {katBreakdown.slice(0, 5).map(k => (
                  <div key={k.kategori} className="flex items-center gap-1.5 text-xs">
                    <div className={`h-2 w-2 rounded-full ${katColors[k.kategori] || 'bg-zinc-400'}`} />
                    <span className="text-zinc-500">{k.kategori}</span>
                    <span className="font-semibold tabular-nums">₺{formatTL(k.tl)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <th className="px-4 py-3 text-left font-medium">Tarih</th>
              <th className="px-4 py-3 text-left font-medium">Açıklama</th>
              <th className="px-4 py-3 text-left font-medium">Kategori</th>
              <th className="px-4 py-3 text-right font-medium">TL Tutar</th>
              <th className="px-4 py-3 text-right font-medium">USD/TL</th>
              <th className="px-4 py-3 text-right font-medium">USD Tutar</th>
              <th className="px-4 py-3 text-center font-medium">Sil</th>
            </tr>
          </thead>
          <tbody>
            {filtered.sort((a, b) => a.tarih.localeCompare(b.tarih)).map(h => {
              const kur = getKur(h.tarih);
              return (
                <tr key={h.id} className="border-b border-zinc-100 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(h.tarih)}</td>
                  <td className="max-w-48 truncate px-4 py-3 font-medium">{h.aciklama}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      katColors[h.kategori] ? 'bg-zinc-100 dark:bg-zinc-800' : 'bg-zinc-100 dark:bg-zinc-800'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${katColors[h.kategori] || 'bg-zinc-400'}`} />
                      {h.kategori}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-amber-600 dark:text-amber-400">₺{formatTL(h.tlTutar)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-500">{kur.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">${formatUSD(h.tlTutar / kur)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleDelete(h.id)} className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-zinc-400">Bu dönemde kayıt bulunamadı</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Yeni Harcama Ekle">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Tarih</label>
            <input type="date" required value={form.tarih} onChange={e => setForm({ ...form, tarih: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Açıklama</label>
            <input type="text" required value={form.aciklama} onChange={e => setForm({ ...form, aciklama: e.target.value })}
              placeholder="Mimara Ödeme" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Kategori</label>
            <select value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800">
              {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">TL Tutar</label>
            <input type="number" step="0.01" required value={form.tlTutar} onChange={e => setForm({ ...form, tlTutar: e.target.value })}
              placeholder="100000" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          </div>
          <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700">
            Ekle
          </button>
        </form>
      </Modal>
    </div>
  );
}
