'use client';

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

function load<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// --- Default Data ---
const defaultKurlar: Kur[] = [
  { id: 'k1', tarih: '2025-07-24', usdTl: 40.55 },
  { id: 'k2', tarih: '2025-07-26', usdTl: 40.56 },
  { id: 'k3', tarih: '2025-08-18', usdTl: 40.88 },
  { id: 'k4', tarih: '2025-08-22', usdTl: 41.03 },
  { id: 'k5', tarih: '2025-09-05', usdTl: 41.25 },
  { id: 'k6', tarih: '2025-09-22', usdTl: 41.38 },
  { id: 'k7', tarih: '2025-10-06', usdTl: 41.83 },
  { id: 'k8', tarih: '2025-10-28', usdTl: 41.96 },
  { id: 'k9', tarih: '2025-11-15', usdTl: 42.21 },
  { id: 'k10', tarih: '2025-12-15', usdTl: 42.82 },
  { id: 'k11', tarih: '2026-01-15', usdTl: 43.18 },
  { id: 'k12', tarih: '2026-02-15', usdTl: 43.51 },
  { id: 'k13', tarih: '2026-03-15', usdTl: 43.92 },
];

function generateDefaultOdemeler(): Odeme[] {
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
  const counts: Record<string, number> = {
    Oguz: 9, Ismet: 9, Fatih: 9, Huseyin: 8, Mehmet: 8, Asim: 9, Furkan: 8,
  };
  const result: Odeme[] = [];
  for (const kisi of KISILER) {
    for (let i = 0; i < counts[kisi]; i++) {
      result.push({ id: genId(), tarih: schedule[i].tarih, kisi, tlTutar: schedule[i].tl });
    }
  }
  return result;
}

const defaultHarcamalar: Harcama[] = [
  { id: 'h1', tarih: '2025-07-24', aciklama: 'Horizon ödemeler', kategori: 'Diger', tlTutar: 17330 },
  { id: 'h2', tarih: '2025-07-24', aciklama: 'Ödeme', kategori: 'Diger', tlTutar: 5323.50 },
  { id: 'h3', tarih: '2025-07-24', aciklama: 'Ödeme', kategori: 'Diger', tlTutar: 6000 },
  { id: 'h4', tarih: '2025-07-24', aciklama: 'Ödeme', kategori: 'Diger', tlTutar: 6000 },
  { id: 'h5', tarih: '2025-07-24', aciklama: '1/4 Arsa', kategori: 'Arsa', tlTutar: 1247000 },
  { id: 'h6', tarih: '2025-07-24', aciklama: '1/4 Arsa', kategori: 'Arsa', tlTutar: 100000 },
  { id: 'h7', tarih: '2025-07-24', aciklama: 'Ödeme', kategori: 'Diger', tlTutar: 450000 },
  { id: 'h8', tarih: '2025-07-24', aciklama: 'Ödeme', kategori: 'Diger', tlTutar: 5000 },
  { id: 'h9', tarih: '2025-07-24', aciklama: 'Noter masrafı', kategori: 'Noter', tlTutar: 19823.97 },
  { id: 'h10', tarih: '2025-07-24', aciklama: 'Noter masrafı', kategori: 'Noter', tlTutar: 75877.18 },
  { id: 'h11', tarih: '2025-07-24', aciklama: 'Noter masrafı', kategori: 'Noter', tlTutar: 109726.09 },
  { id: 'h12', tarih: '2025-07-24', aciklama: 'Ödeme', kategori: 'Diger', tlTutar: 100000 },
  { id: 'h13', tarih: '2025-07-26', aciklama: 'Emlakçı ödemesi', kategori: 'Emlakci', tlTutar: 1014000 },
  { id: 'h14', tarih: '2025-08-18', aciklama: 'İhsan Korkmaz 35 m² ihdası', kategori: 'Insaat', tlTutar: 300000 },
  { id: 'h15', tarih: '2025-08-18', aciklama: 'Emlakçı', kategori: 'Emlakci', tlTutar: 2000000 },
  { id: 'h16', tarih: '2025-08-18', aciklama: 'İmar harcı', kategori: 'Imar', tlTutar: 17200 },
  { id: 'h17', tarih: '2025-08-22', aciklama: 'Mimara Ödeme', kategori: 'Mimar', tlTutar: 2400000 },
  { id: 'h18', tarih: '2025-08-22', aciklama: 'Emlakçı', kategori: 'Emlakci', tlTutar: 2000000 },
  { id: 'h19', tarih: '2025-09-05', aciklama: 'Mimara Ödeme', kategori: 'Mimar', tlTutar: 15000 },
  { id: 'h20', tarih: '2025-09-05', aciklama: 'İfraz', kategori: 'Ifraz', tlTutar: 54000 },
  { id: 'h21', tarih: '2025-09-05', aciklama: 'Ödeme', kategori: 'Diger', tlTutar: 15000 },
  { id: 'h22', tarih: '2025-09-22', aciklama: 'Mimara Ödeme', kategori: 'Mimar', tlTutar: 2300000 },
  { id: 'h23', tarih: '2025-10-28', aciklama: 'Mimara Ödeme', kategori: 'Mimar', tlTutar: 2400000 },
  { id: 'h24', tarih: '2025-10-28', aciklama: 'İfraz', kategori: 'Ifraz', tlTutar: 14879 },
  { id: 'h25', tarih: '2025-10-28', aciklama: 'İfraz', kategori: 'Ifraz', tlTutar: 16965 },
  { id: 'h26', tarih: '2025-10-28', aciklama: 'Ödeme', kategori: 'Diger', tlTutar: 2084 },
  { id: 'h27', tarih: '2025-12-15', aciklama: 'Ödeme', kategori: 'Diger', tlTutar: 5323.50 },
  { id: 'h28', tarih: '2025-12-15', aciklama: '9062 Tapu K. Harcı', kategori: 'Tapu Harci', tlTutar: 26404.25 },
  { id: 'h29', tarih: '2025-12-15', aciklama: 'Ödeme', kategori: 'Diger', tlTutar: 5323.50 },
  { id: 'h30', tarih: '2025-12-15', aciklama: 'Ödeme', kategori: 'Tapu Harci', tlTutar: 11723.87 },
  { id: 'h31', tarih: '2025-12-15', aciklama: 'Mimara Ödeme', kategori: 'Mimar', tlTutar: 25276 },
  { id: 'h32', tarih: '2025-12-15', aciklama: '104 no lu arsaların vergi ödemesi', kategori: 'Arsa', tlTutar: 340339 },
  { id: 'h33', tarih: '2026-02-15', aciklama: 'Ödeme', kategori: 'Diger', tlTutar: 12318 },
  { id: 'h34', tarih: '2026-02-15', aciklama: 'Ödeme', kategori: 'Diger', tlTutar: 12318 },
  { id: 'h35', tarih: '2026-02-15', aciklama: 'Ödeme', kategori: 'Diger', tlTutar: 14874 },
  { id: 'h36', tarih: '2026-02-15', aciklama: 'Harç', kategori: 'Tapu Harci', tlTutar: 86897 },
  { id: 'h37', tarih: '2026-02-15', aciklama: 'Ödeme', kategori: 'Diger', tlTutar: 9260 },
  { id: 'h38', tarih: '2026-02-15', aciklama: 'Ödeme', kategori: 'Diger', tlTutar: 10230 },
  { id: 'h39', tarih: '2026-02-15', aciklama: 'Ödeme', kategori: 'Diger', tlTutar: 9260 },
  { id: 'h40', tarih: '2026-02-15', aciklama: 'Ruhsat', kategori: 'Ruhsat', tlTutar: 100000 },
  { id: 'h41', tarih: '2026-02-15', aciklama: 'Ödeme', kategori: 'Diger', tlTutar: 255157 },
];

// --- CRUD Operations ---
export function getKurlar(): Kur[] {
  return load<Kur>('horizon_kurlar', defaultKurlar);
}
export function saveKurlar(data: Kur[]) {
  save('horizon_kurlar', data);
}
export function addKur(kur: Omit<Kur, 'id'>): Kur {
  const item = { ...kur, id: genId() };
  const all = getKurlar();
  all.push(item);
  all.sort((a, b) => a.tarih.localeCompare(b.tarih));
  saveKurlar(all);
  return item;
}
export function deleteKur(id: string) {
  saveKurlar(getKurlar().filter(k => k.id !== id));
}

export function getOdemeler(): Odeme[] {
  return load<Odeme>('horizon_odemeler', generateDefaultOdemeler());
}
export function saveOdemeler(data: Odeme[]) {
  save('horizon_odemeler', data);
}
export function addOdeme(odeme: Omit<Odeme, 'id'>): Odeme {
  const item = { ...odeme, id: genId() };
  const all = getOdemeler();
  all.push(item);
  saveOdemeler(all);
  return item;
}
export function deleteOdeme(id: string) {
  saveOdemeler(getOdemeler().filter(o => o.id !== id));
}

export function getHarcamalar(): Harcama[] {
  return load<Harcama>('horizon_harcamalar', defaultHarcamalar);
}
export function saveHarcamalar(data: Harcama[]) {
  save('horizon_harcamalar', data);
}
export function addHarcama(harcama: Omit<Harcama, 'id'>): Harcama {
  const item = { ...harcama, id: genId() };
  const all = getHarcamalar();
  all.push(item);
  saveHarcamalar(all);
  return item;
}
export function deleteHarcama(id: string) {
  saveHarcamalar(getHarcamalar().filter(h => h.id !== id));
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

// --- Müteahhit State ---
export function getMuteahhitDurumu(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('horizon_muteahhit_durumu');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setMuteahhitOdendi(odemeId: string, odendi: boolean) {
  if (typeof window === 'undefined') return;
  const durumu = getMuteahhitDurumu();
  if (odendi) durumu[odemeId] = true;
  else delete durumu[odemeId];
  localStorage.setItem('horizon_muteahhit_durumu', JSON.stringify(durumu));
}

export function getKur(tarih: string): number {
  const kurlar = getKurlar().sort((a, b) => a.tarih.localeCompare(b.tarih));
  let closest = kurlar[0]?.usdTl || 1;
  for (const k of kurlar) {
    if (k.tarih <= tarih) closest = k.usdTl;
    else break;
  }
  return closest;
}

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
