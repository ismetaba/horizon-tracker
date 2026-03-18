'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/odemeler', label: 'Ödemeler', icon: '💰' },
  { href: '/harcamalar', label: 'Harcamalar', icon: '🧾' },
  { href: '/kurlar', label: 'Kurlar', icon: '💱' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-zinc-200 bg-white py-2 md:hidden dark:border-zinc-800 dark:bg-zinc-950">
        {nav.map(n => (
          <Link
            key={n.href}
            href={n.href}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition ${
              pathname === n.href
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            <span className="text-lg">{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </nav>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-zinc-200 bg-zinc-50 md:flex md:flex-col dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex h-20 items-center gap-3 border-b border-zinc-200 px-4 dark:border-zinc-800">
          <Image src="/horizon-tracker/logo.png" alt="Horizon İnşaat" width={48} height={48} className="rounded-lg" />
          <div>
            <h1 className="text-sm font-bold leading-tight tracking-tight">Horizon İnşaat</h1>
            <p className="text-[10px] text-zinc-400">Ödeme & Harcama Takip</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {nav.map(n => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                pathname === n.href
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <span className="text-lg">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-zinc-200 px-6 py-4 text-xs text-zinc-400 dark:border-zinc-800">
          Horizon İnşaat
        </div>
      </aside>
    </>
  );
}
