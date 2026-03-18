'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('horizon_auth');
    if (token === 'authenticated_v1') {
      setAuthed(true);
    }
    setChecking(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded password check
    if (password === 'Horizon2025!') {
      localStorage.setItem('horizon_auth', 'authenticated_v1');
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (checking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 p-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center">
            <Image src="/horizon-tracker/logo.png" alt="Horizon İnşaat" width={80} height={80} className="mb-4 rounded-2xl" />
            <h1 className="text-2xl font-bold text-white">Horizon Tracker</h1>
            <p className="mt-1 text-sm text-zinc-400">Giriş yapmak için şifrenizi girin</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false); }}
                placeholder="Şifre"
                autoFocus
                className={`w-full rounded-xl border bg-zinc-800 px-4 py-3 text-center text-lg text-white placeholder-zinc-500 transition focus:outline-none focus:ring-2 ${
                  error ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:ring-blue-500'
                }`}
              />
              {error && <p className="mt-2 text-center text-sm text-red-400">Yanlış şifre</p>}
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
