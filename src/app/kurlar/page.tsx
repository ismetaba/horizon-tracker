'use client';

import { useEffect, useState, useCallback } from 'react';
import { getKurlar, addKur, deleteKur, formatDate, type Kur } from '@/lib/store';
import Modal from '@/components/Modal';

export default function KurlarPage() {
  const [data, setData] = useState<Kur[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ tarih: '', usdTl: '' });

  const reload = useCallback(async () => {
    setData(await getKurlar());
    setLoading(false);
  }, []);
  useEffect(() => { reload(); }, [reload]);

  if (loading) return <div className="flex h-full items-center justify-center p-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tarih || !form.usdTl) return;
    await addKur({ tarih: form.tarih, usdTl: parseFloat(form.usdTl) });
    setForm({ tarih: '', usdTl: '' });
    setShowModal(false);
    reload();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu kuru silmek istediğinize emin misiniz?')) {
      await deleteKur(id);
      reload();
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">USD/TL Kurları</h1>
        <button onClick={() => setShowModal(true)} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700">+ Yeni Kur</button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <th className="px-4 py-3 text-left font-medium">Tarih</th>
              <th className="px-4 py-3 text-right font-medium">USD/TL</th>
              <th className="px-4 py-3 text-center font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {data.map((k, i) => {
              const prev = i > 0 ? data[i - 1].usdTl : k.usdTl;
              const change = k.usdTl - prev;
              return (
                <tr key={k.id} className="border-b border-zinc-100 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3">{formatDate(k.tarih)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-lg font-semibold tabular-nums">{k.usdTl.toFixed(2)}</span>
                    {i > 0 && <span className={`ml-2 text-xs ${change > 0 ? 'text-red-500' : change < 0 ? 'text-green-500' : 'text-zinc-400'}`}>{change > 0 ? '+' : ''}{change.toFixed(2)}</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleDelete(k.id)} className="rounded px-2 py-1 text-xs text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950">Sil</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Yeni Kur Ekle">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div><label className="mb-1 block text-sm font-medium">Tarih</label><input type="date" required value={form.tarih} onChange={e => setForm({ ...form, tarih: e.target.value })} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" /></div>
          <div><label className="mb-1 block text-sm font-medium">USD/TL Kuru</label><input type="number" step="0.01" required value={form.usdTl} onChange={e => setForm({ ...form, usdTl: e.target.value })} placeholder="43.50" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" /></div>
          <button type="submit" className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700">Ekle</button>
        </form>
      </Modal>
    </div>
  );
}
