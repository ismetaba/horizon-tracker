'use client';

import { useEffect, useState, useCallback } from 'react';
import { getOdemeler, addOdeme, deleteOdeme, getKur, formatTL, formatUSD, formatDate, getMonthKey, getUniqueMonths, getMuteahhitDurumu, setMuteahhitOdendi, KISILER, type Odeme } from '@/lib/store';
import Modal from '@/components/Modal';
import MonthTabs from '@/components/MonthTabs';

type ViewMode = 'bizim' | 'muteahhit' | 'karsilastirma';

export default function OdemelerPage() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<Odeme[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filterKisi, setFilterKisi] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('karsilastirma');
  const [muteahhitState, setMuteahhitState] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({ tarih: '', kisi: KISILER[0], tlTutar: '' });

  const reload = useCallback(() => {
    setData(getOdemeler());
    setMuteahhitState(getMuteahhitDurumu());
  }, []);
  useEffect(() => { setMounted(true); reload(); }, [reload]);

  if (!mounted) return <div className="flex h-full items-center justify-center p-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>;

  const months = getUniqueMonths(data);
  const monthTotals: Record<string, number> = {};
  data.forEach(o => { const mk = getMonthKey(o.tarih); monthTotals[mk] = (monthTotals[mk] || 0) + o.tlTutar; });

  const monthFiltered = selectedMonth ? data.filter(o => o.tarih.startsWith(selectedMonth)) : data;
  const filtered = filterKisi ? monthFiltered.filter(o => o.kisi === filterKisi) : monthFiltered;
  const sorted = [...filtered].sort((a, b) => a.tarih.localeCompare(b.tarih) || a.kisi.localeCompare(b.kisi));

  const toplamTL = filtered.reduce((s, o) => s + o.tlTutar, 0);
  const toplamUSD = filtered.reduce((s, o) => s + o.tlTutar / getKur(o.tarih), 0);
  const muteahhitOdenen = filtered.filter(o => muteahhitState[o.id]).reduce((s, o) => s + o.tlTutar, 0);
  const muteahhitKalan = toplamTL - muteahhitOdenen;
  const muteahhitOdenenSayi = filtered.filter(o => muteahhitState[o.id]).length;

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

  const toggleMuteahhit = (id: string) => {
    const next = !muteahhitState[id];
    setMuteahhitOdendi(id, next);
    setMuteahhitState(prev => {
      const copy = { ...prev };
      if (next) copy[id] = true;
      else delete copy[id];
      return copy;
    });
  };

  // Group by person for comparison view
  const kisiGrup = KISILER.map(kisi => {
    const kisiFiltered = filtered.filter(o => o.kisi === kisi);
    const tl = kisiFiltered.reduce((s, o) => s + o.tlTutar, 0);
    const usd = kisiFiltered.reduce((s, o) => s + o.tlTutar / getKur(o.tarih), 0);
    const odenen = kisiFiltered.filter(o => muteahhitState[o.id]).reduce((s, o) => s + o.tlTutar, 0);
    return { kisi, odemeler: kisiFiltered, tl, usd, odenen, sayi: kisiFiltered.length };
  }).filter(k => k.sayi > 0);

  const viewModes: { key: ViewMode; label: string }[] = [
    { key: 'karsilastirma', label: 'Karşılaştırma' },
    { key: 'bizim', label: 'Bizim Taraf' },
    { key: 'muteahhit', label: 'Müteahhit Tarafı' },
  ];

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
      <div className="mb-5">
        <MonthTabs months={months} selected={selectedMonth} onSelect={setSelectedMonth} totals={monthTotals} accentColor="blue" />
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6 flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
        {viewModes.map(vm => (
          <button
            key={vm.key}
            onClick={() => setViewMode(vm.key)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              viewMode === vm.key
                ? 'bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {vm.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900/50 dark:bg-blue-950/30">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Bizim Taraf</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-blue-700 dark:text-blue-300">₺{formatTL(toplamTL)}</p>
          <p className="mt-0.5 text-sm tabular-nums text-blue-500/70">${formatUSD(toplamUSD)}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Müteahhit Ödenen</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">₺{formatTL(muteahhitOdenen)}</p>
          <p className="mt-0.5 text-sm text-emerald-500/70">{muteahhitOdenenSayi} / {filtered.length} ödeme</p>
        </div>
        <div className={`rounded-2xl border p-5 ${muteahhitKalan > 0 ? 'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/30' : 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/30'}`}>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Müteahhit Kalan</p>
          <p className={`mt-1 text-3xl font-extrabold tabular-nums ${muteahhitKalan > 0 ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
            ₺{formatTL(muteahhitKalan)}
          </p>
          <p className="mt-0.5 text-sm text-zinc-400">{filtered.length - muteahhitOdenenSayi} ödeme bekliyor</p>
        </div>
      </div>

      {/* KARŞILAŞTIRMA VIEW */}
      {viewMode === 'karsilastirma' && (
        <div className="space-y-4">
          {kisiGrup.map(k => {
            const pct = k.tl > 0 ? (k.odenen / k.tl) * 100 : 0;
            return (
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
                    <p className="text-sm text-zinc-500">Toplam</p>
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
                      <div className="h-full rounded-full bg-blue-500" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className={`font-medium ${pct >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        Müteahhit Tarafı
                      </span>
                      <span className="font-bold tabular-nums">₺{formatTL(k.odenen)}</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                </div>

                {/* Payment detail rows */}
                <div className="mt-4 space-y-2">
                  {k.odemeler.sort((a, b) => a.tarih.localeCompare(b.tarih)).map(o => (
                    <div key={o.id} className="flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800/50">
                      <span className="w-24 shrink-0 text-zinc-500">{formatDate(o.tarih)}</span>
                      <span className="flex-1 font-semibold tabular-nums text-blue-600 dark:text-blue-400">₺{formatTL(o.tlTutar)}</span>
                      <button
                        onClick={() => toggleMuteahhit(o.id)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                          muteahhitState[o.id]
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                            : 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300'
                        }`}
                      >
                        {muteahhitState[o.id] ? (
                          <><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Ödendi</>
                        ) : (
                          <><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Bekliyor</>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {kisiGrup.length === 0 && (
            <div className="rounded-2xl border border-zinc-200 p-12 text-center text-zinc-400 dark:border-zinc-800">Bu dönemde kayıt bulunamadı</div>
          )}
        </div>
      )}

      {/* BİZİM TARAF VIEW */}
      {viewMode === 'bizim' && (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-3 text-left font-medium">Tarih</th>
                <th className="px-4 py-3 text-left font-medium">Kişi</th>
                <th className="px-4 py-3 text-right font-medium">TL Tutar</th>
                <th className="px-4 py-3 text-right font-medium">USD/TL</th>
                <th className="px-4 py-3 text-right font-medium">USD Tutar</th>
                <th className="px-4 py-3 text-center font-medium">Sil</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(o => {
                const kur = getKur(o.tarih);
                return (
                  <tr key={o.id} className="border-b border-zinc-100 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50">
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(o.tarih)}</td>
                    <td className="px-4 py-3 font-medium">{o.kisi}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-blue-600 dark:text-blue-400">₺{formatTL(o.tlTutar)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-500">{kur.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">${formatUSD(o.tlTutar / kur)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(o.id)} className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-zinc-400">Bu dönemde kayıt bulunamadı</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MÜTEAHHİT TARAFI VIEW */}
      {viewMode === 'muteahhit' && (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-3 text-left font-medium">Tarih</th>
                <th className="px-4 py-3 text-left font-medium">Kişi</th>
                <th className="px-4 py-3 text-right font-medium">Beklenen TL</th>
                <th className="px-4 py-3 text-center font-medium">Durum</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(o => (
                <tr key={o.id} className={`border-b border-zinc-100 transition ${muteahhitState[o.id] ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''} hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50`}>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(o.tarih)}</td>
                  <td className="px-4 py-3 font-medium">{o.kisi}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">₺{formatTL(o.tlTutar)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleMuteahhit(o.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                        muteahhitState[o.id]
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                          : 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300'
                      }`}
                    >
                      {muteahhitState[o.id] ? (
                        <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Ödendi</>
                      ) : (
                        <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Bekliyor</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-zinc-400">Bu dönemde kayıt bulunamadı</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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
