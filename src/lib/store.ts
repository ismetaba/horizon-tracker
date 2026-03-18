import { supabase } from './supabase';

export interface Kur {
  id: string;
  tarih: string;
  usdTl: number;
}

export interface Odeme {
  id: string;
  tarih: string;
  kisi: string;
  tlTutar: number;
}

export interface Harcama {
  id: string;
  tarih: string;
  aciklama: string;
  kategori: string;
  tlTutar: number;
}

export const KISILER = ['Oguz', 'Ismet', 'Fatih', 'Huseyin', 'Mehmet', 'Asim', 'Furkan'];
export const KATEGORILER = ['Arsa', 'Emlakci', 'Insaat', 'Imar', 'Mimar', 'Ifraz', 'Noter', 'Tapu Harci', 'Ruhsat', 'Diger'];

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

// --- Supabase row <-> app model mappers ---
function rowToKur(r: { id: string; tarih: string; usd_tl: number }): Kur {
  return { id: r.id, tarih: r.tarih, usdTl: Number(r.usd_tl) };
}
function rowToOdeme(r: { id: string; tarih: string; kisi: string; tl_tutar: number }): Odeme {
  return { id: r.id, tarih: r.tarih, kisi: r.kisi, tlTutar: Number(r.tl_tutar) };
}
function rowToHarcama(r: { id: string; tarih: string; aciklama: string; kategori: string; tl_tutar: number }): Harcama {
  return { id: r.id, tarih: r.tarih, aciklama: r.aciklama, kategori: r.kategori, tlTutar: Number(r.tl_tutar) };
}

// --- Kurlar CRUD ---
export async function getKurlar(): Promise<Kur[]> {
  const { data } = await supabase.from('kurlar').select('*').order('tarih');
  return (data || []).map(rowToKur);
}

export async function addKur(kur: Omit<Kur, 'id'>): Promise<Kur> {
  const item = { id: genId(), tarih: kur.tarih, usd_tl: kur.usdTl };
  await supabase.from('kurlar').insert(item);
  return { id: item.id, tarih: item.tarih, usdTl: item.usd_tl };
}

export async function deleteKur(id: string) {
  await supabase.from('kurlar').delete().eq('id', id);
}

// --- Odemeler CRUD ---
export async function getOdemeler(): Promise<Odeme[]> {
  const { data } = await supabase.from('odemeler').select('*').order('tarih');
  return (data || []).map(rowToOdeme);
}

export async function addOdeme(odeme: Omit<Odeme, 'id'>): Promise<Odeme> {
  const item = { id: genId(), tarih: odeme.tarih, kisi: odeme.kisi, tl_tutar: odeme.tlTutar };
  await supabase.from('odemeler').insert(item);
  return { id: item.id, tarih: item.tarih, kisi: item.kisi, tlTutar: item.tl_tutar };
}

export async function deleteOdeme(id: string) {
  await supabase.from('odemeler').delete().eq('id', id);
}

// --- Harcamalar CRUD ---
export async function getHarcamalar(): Promise<Harcama[]> {
  const { data } = await supabase.from('harcamalar').select('*').order('tarih');
  return (data || []).map(rowToHarcama);
}

export async function addHarcama(harcama: Omit<Harcama, 'id'>): Promise<Harcama> {
  const item = { id: genId(), tarih: harcama.tarih, aciklama: harcama.aciklama, kategori: harcama.kategori, tl_tutar: harcama.tlTutar };
  await supabase.from('harcamalar').insert(item);
  return { id: item.id, tarih: item.tarih, aciklama: item.aciklama, kategori: item.kategori, tlTutar: item.tl_tutar };
}

export async function deleteHarcama(id: string) {
  await supabase.from('harcamalar').delete().eq('id', id);
}

// --- Month Utilities ---
export const AY_ISIMLERI = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

export function getMonthKey(tarih: string): string {
  return tarih.slice(0, 7);
}

export function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-');
  return `${AY_ISIMLERI[parseInt(m, 10) - 1]} ${y}`;
}

export function getUniqueMonths(records: { tarih: string }[]): string[] {
  const set = new Set(records.map(r => getMonthKey(r.tarih)));
  return Array.from(set).sort();
}

// --- Kur lookup (from pre-fetched array) ---
export function findKur(kurlar: Kur[], tarih: string): number {
  const sorted = [...kurlar].sort((a, b) => a.tarih.localeCompare(b.tarih));
  let closest = sorted[0]?.usdTl || 1;
  for (const k of sorted) {
    if (k.tarih <= tarih) closest = k.usdTl;
    else break;
  }
  return closest;
}

// --- Formatting ---
export function formatTL(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatUSD(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(d: string): string {
  const [y, m, day] = d.split('-');
  return `${day}.${m}.${y}`;
}

// --- Seed default data ---
export async function seedIfEmpty() {
  const { data: existingKurlar } = await supabase.from('kurlar').select('id').limit(1);
  if (existingKurlar && existingKurlar.length > 0) return; // Already seeded

  const kurlar = [
    { id: 'k1', tarih: '2025-07-24', usd_tl: 40.55 },
    { id: 'k2', tarih: '2025-07-26', usd_tl: 40.56 },
    { id: 'k3', tarih: '2025-08-18', usd_tl: 40.88 },
    { id: 'k4', tarih: '2025-08-22', usd_tl: 41.03 },
    { id: 'k5', tarih: '2025-09-05', usd_tl: 41.25 },
    { id: 'k6', tarih: '2025-09-22', usd_tl: 41.38 },
    { id: 'k7', tarih: '2025-10-06', usd_tl: 41.83 },
    { id: 'k8', tarih: '2025-10-28', usd_tl: 41.96 },
    { id: 'k9', tarih: '2025-11-15', usd_tl: 42.21 },
    { id: 'k10', tarih: '2025-12-15', usd_tl: 42.82 },
    { id: 'k11', tarih: '2026-01-15', usd_tl: 43.18 },
    { id: 'k12', tarih: '2026-02-15', usd_tl: 43.51 },
    { id: 'k13', tarih: '2026-03-15', usd_tl: 44.22 },
  ];
  await supabase.from('kurlar').insert(kurlar);

  const schedule = [
    { tarih: '2025-07-24', tl: 400000 },
    { tarih: '2025-08-18', tl: 300000 },
    { tarih: '2025-09-05', tl: 300000 },
    { tarih: '2025-10-06', tl: 300000 },
    { tarih: '2025-11-15', tl: 60000 },
    { tarih: '2025-12-15', tl: 60000 },
    { tarih: '2026-01-15', tl: 60000 },
    { tarih: '2026-02-15', tl: 60000 },
    { tarih: '2026-03-15', tl: 60000 },
  ];
  const counts: Record<string, number> = { Oguz: 9, Ismet: 9, Fatih: 9, Huseyin: 8, Mehmet: 8, Asim: 9, Furkan: 8 };
  const odemeler: { id: string; tarih: string; kisi: string; tl_tutar: number }[] = [];
  let oi = 1;
  for (const kisi of KISILER) {
    for (let i = 0; i < counts[kisi]; i++) {
      odemeler.push({ id: `o${oi++}`, tarih: schedule[i].tarih, kisi, tl_tutar: schedule[i].tl });
    }
  }
  await supabase.from('odemeler').insert(odemeler);

  const harcamalar = [
    { id: 'h1', tarih: '2025-07-24', aciklama: 'Horizon ödemeler', kategori: 'Diger', tl_tutar: 17330 },
    { id: 'h2', tarih: '2025-07-24', aciklama: 'Ödeme', kategori: 'Diger', tl_tutar: 5323.50 },
    { id: 'h3', tarih: '2025-07-24', aciklama: 'Ödeme', kategori: 'Diger', tl_tutar: 6000 },
    { id: 'h4', tarih: '2025-07-24', aciklama: 'Ödeme', kategori: 'Diger', tl_tutar: 6000 },
    { id: 'h5', tarih: '2025-07-24', aciklama: '1/4 Arsa', kategori: 'Arsa', tl_tutar: 1247000 },
    { id: 'h6', tarih: '2025-07-24', aciklama: '1/4 Arsa', kategori: 'Arsa', tl_tutar: 100000 },
    { id: 'h7', tarih: '2025-07-24', aciklama: 'Ödeme', kategori: 'Diger', tl_tutar: 450000 },
    { id: 'h8', tarih: '2025-07-24', aciklama: 'Ödeme', kategori: 'Diger', tl_tutar: 5000 },
    { id: 'h9', tarih: '2025-07-24', aciklama: 'Noter masrafı', kategori: 'Noter', tl_tutar: 19823.97 },
    { id: 'h10', tarih: '2025-07-24', aciklama: 'Noter masrafı', kategori: 'Noter', tl_tutar: 75877.18 },
    { id: 'h11', tarih: '2025-07-24', aciklama: 'Noter masrafı', kategori: 'Noter', tl_tutar: 109726.09 },
    { id: 'h12', tarih: '2025-07-24', aciklama: 'Ödeme', kategori: 'Diger', tl_tutar: 100000 },
    { id: 'h13', tarih: '2025-07-26', aciklama: 'Emlakçı ödemesi', kategori: 'Emlakci', tl_tutar: 1014000 },
    { id: 'h14', tarih: '2025-08-18', aciklama: 'İhsan Korkmaz 35 m² ihdası', kategori: 'Insaat', tl_tutar: 300000 },
    { id: 'h15', tarih: '2025-08-18', aciklama: 'Emlakçı', kategori: 'Emlakci', tl_tutar: 2000000 },
    { id: 'h16', tarih: '2025-08-18', aciklama: 'İmar harcı', kategori: 'Imar', tl_tutar: 17200 },
    { id: 'h17', tarih: '2025-08-22', aciklama: 'Mimara Ödeme', kategori: 'Mimar', tl_tutar: 2400000 },
    { id: 'h18', tarih: '2025-08-22', aciklama: 'Emlakçı', kategori: 'Emlakci', tl_tutar: 2000000 },
    { id: 'h19', tarih: '2025-09-05', aciklama: 'Mimara Ödeme', kategori: 'Mimar', tl_tutar: 15000 },
    { id: 'h20', tarih: '2025-09-05', aciklama: 'İfraz', kategori: 'Ifraz', tl_tutar: 54000 },
    { id: 'h20b', tarih: '2025-09-05', aciklama: 'İfraz', kategori: 'Ifraz', tl_tutar: 54000 },
    { id: 'h21', tarih: '2025-09-05', aciklama: 'Ödeme', kategori: 'Diger', tl_tutar: 15000 },
    { id: 'h22', tarih: '2025-09-22', aciklama: 'Mimara Ödeme', kategori: 'Mimar', tl_tutar: 2300000 },
    { id: 'h22b', tarih: '2025-10-28', aciklama: 'Mimara Ödeme', kategori: 'Mimar', tl_tutar: 2300000 },
    { id: 'h23', tarih: '2025-10-28', aciklama: 'Mimara Ödeme', kategori: 'Mimar', tl_tutar: 2400000 },
    { id: 'h24', tarih: '2025-10-28', aciklama: 'İfraz', kategori: 'Ifraz', tl_tutar: 14879 },
    { id: 'h25', tarih: '2025-10-28', aciklama: 'İfraz', kategori: 'Ifraz', tl_tutar: 16965 },
    { id: 'h26', tarih: '2025-10-28', aciklama: 'Ödeme', kategori: 'Diger', tl_tutar: 2084 },
    { id: 'h27', tarih: '2025-12-15', aciklama: 'Ödeme', kategori: 'Diger', tl_tutar: 5323.50 },
    { id: 'h28', tarih: '2025-12-15', aciklama: '9062 Tapu K. Harcı', kategori: 'Tapu Harci', tl_tutar: 26404.25 },
    { id: 'h29', tarih: '2025-12-15', aciklama: 'Ödeme', kategori: 'Diger', tl_tutar: 5323.50 },
    { id: 'h30', tarih: '2025-12-15', aciklama: 'Ödeme', kategori: 'Tapu Harci', tl_tutar: 11723.87 },
    { id: 'h31', tarih: '2025-12-15', aciklama: 'Mimara Ödeme', kategori: 'Mimar', tl_tutar: 25276 },
    { id: 'h33', tarih: '2026-02-15', aciklama: 'Ödeme', kategori: 'Diger', tl_tutar: 12318 },
    { id: 'h34', tarih: '2026-02-15', aciklama: 'Ödeme', kategori: 'Diger', tl_tutar: 12318 },
    { id: 'h35', tarih: '2026-02-15', aciklama: 'Ödeme', kategori: 'Diger', tl_tutar: 14874 },
    { id: 'h36', tarih: '2026-02-15', aciklama: 'Harç', kategori: 'Tapu Harci', tl_tutar: 86897 },
    { id: 'h37', tarih: '2026-02-15', aciklama: 'Ödeme', kategori: 'Diger', tl_tutar: 9260 },
    { id: 'h38', tarih: '2026-02-15', aciklama: 'Ödeme', kategori: 'Diger', tl_tutar: 10230 },
    { id: 'h39', tarih: '2026-03-15', aciklama: 'Ödeme', kategori: 'Diger', tl_tutar: 9260 },
    { id: 'h40', tarih: '2026-03-15', aciklama: 'Ruhsat', kategori: 'Ruhsat', tl_tutar: 100000 },
    { id: 'h42', tarih: '2026-03-15', aciklama: 'Ortaklık', kategori: 'Diger', tl_tutar: 300000 },
    { id: 'h43', tarih: '2026-03-15', aciklama: 'Ödeme', kategori: 'Diger', tl_tutar: 450000 },
  ];
  await supabase.from('harcamalar').insert(harcamalar);
}
