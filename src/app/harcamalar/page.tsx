'use client';

import { useEffect, useState, useCallback } from 'react';
import { getHarcamalar, addHarcama, deleteHarcama, getKur, formatTL, formatUSD, formatDate, KATEGORILER, type Harcama } from '@/lib/store';
import Modal from '@/components/Modal';

export default function HarcamalarPage() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<Harcama[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filterKat, setFilterKat] = useState('');
  const [form, setForm] = useState({ tarih: '', aciklama: '', kategori: KATEGORILER[0], tlTutar: '' });

  const reload = useCallback(() => setData(getHarcamalar()), []);
  useEffect(() => { setMounted(true); reload(); }, [reload]);

  if (!mounted) return <div className="flex h-full items-center justify-center p-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>;

  const filtered = filterKat ? data.filter(h => h.kategori === filterKat) : data;
  const toplamTL = filtered.reduce((s, h) => s + h.tlTutar, 0);
  const toplamUSD = filtered.reduce((s, h) => s + h.tlTutar / getKur(h.tarih), 0);

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
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Harcamalar</h1>
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

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <p className="text-xs text-zinc-500">Toplam TL</p>
          <p className="text-xl font-bold">₺{formatTL(toplamTL)}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-xs text-zinc-500">Toplam USD</p>
          <p className="text-xl font-bold">${formatUSD(toplamUSD)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Kayıt Sayısı</p>
          <p className="text-xl font-bold">{filtered.length}</p>
        </div>
      </div>

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
              <th className="px-4 py-3 text-center font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filtered.sort((a, b) => a.tarih.localeCompare(b.tarih)).map(h => {
              const kur = getKur(h.tarih);
              return (
                <tr key={h.id} className="border-b border-zinc-100 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3">{formatDate(h.tarih)}</td>
                  <td className="max-w-48 truncate px-4 py-3 font-medium">{h.aciklama}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium dark:bg-zinc-800">{h.kategori}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-amber-600 dark:text-amber-400">₺{formatTL(h.tlTutar)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-500">{kur.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">${formatUSD(h.tlTutar / kur)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleDelete(h.id)} className="rounded px-2 py-1 text-xs text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950">
                      Sil
                    </button>
                  </td>
                </tr>
              );
            })}
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
