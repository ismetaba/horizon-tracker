'use client';

import { useEffect, useState, useCallback } from 'react';
import { getOdemeler, addOdeme, deleteOdeme, getKur, formatTL, formatUSD, formatDate, KISILER, type Odeme } from '@/lib/store';
import Modal from '@/components/Modal';

export default function OdemelerPage() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<Odeme[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filterKisi, setFilterKisi] = useState('');
  const [form, setForm] = useState({ tarih: '', kisi: KISILER[0], tlTutar: '' });

  const reload = useCallback(() => setData(getOdemeler()), []);

  useEffect(() => { setMounted(true); reload(); }, [reload]);

  if (!mounted) return <div className="flex h-full items-center justify-center p-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>;

  const filtered = filterKisi ? data.filter(o => o.kisi === filterKisi) : data;
  const toplamTL = filtered.reduce((s, o) => s + o.tlTutar, 0);
  const toplamUSD = filtered.reduce((s, o) => s + o.tlTutar / getKur(o.tarih), 0);

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
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Ödemeler</h1>
        <div className="flex gap-3">
          <select
            value={filterKisi}
            onChange={e => setFilterKisi(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">Tüm Kişiler</option>
            {KISILER.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            + Yeni Ödeme
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
          <p className="text-xs text-zinc-500">Toplam TL</p>
          <p className="text-xl font-bold">₺{formatTL(toplamTL)}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
          <p className="text-xs text-zinc-500">Toplam USD</p>
          <p className="text-xl font-bold">${formatUSD(toplamUSD)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Kayıt Sayısı</p>
          <p className="text-xl font-bold">{filtered.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <th className="px-4 py-3 text-left font-medium">Tarih</th>
              <th className="px-4 py-3 text-left font-medium">Kişi</th>
              <th className="px-4 py-3 text-right font-medium">TL Tutar</th>
              <th className="px-4 py-3 text-right font-medium">USD/TL</th>
              <th className="px-4 py-3 text-right font-medium">USD Tutar</th>
              <th className="px-4 py-3 text-center font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filtered.sort((a, b) => a.tarih.localeCompare(b.tarih) || a.kisi.localeCompare(b.kisi)).map(o => {
              const kur = getKur(o.tarih);
              return (
                <tr key={o.id} className="border-b border-zinc-100 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3">{formatDate(o.tarih)}</td>
                  <td className="px-4 py-3 font-medium">{o.kisi}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-blue-600 dark:text-blue-400">₺{formatTL(o.tlTutar)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-500">{kur.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">${formatUSD(o.tlTutar / kur)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleDelete(o.id)} className="rounded px-2 py-1 text-xs text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950">
                      Sil
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
