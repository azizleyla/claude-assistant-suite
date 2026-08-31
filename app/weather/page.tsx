'use client';

import { useState, type KeyboardEvent } from 'react';
import AppSwitcher from '../components/AppSwitcher';

// Cavab mətnindəki açar sözlərə görə hava ikonu seç
function pickIcon(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('qar')) return '❄️';
  if (t.includes('tufan')) return '⛈️';
  if (t.includes('yağış') || t.includes('leysan') || t.includes('çiskin')) return '🌧️';
  if (t.includes('duman')) return '🌫️';
  if (t.includes('bulud')) return '☁️';
  if (t.includes('açıq') || t.includes('günəş') || t.includes('aydın')) return '☀️';
  return '🌡️';
}

type Result = { city: string; reply: string };

export default function WeatherPage() {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  async function getWeather() {
    const q = city.trim();
    if (!q) return;

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `${q} şəhərində hazırda hava necədir?` }],
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError('Xəta: ' + data.error);
        setLoading(false);
        return;
      }

      setResult({ city: q, reply: data.reply });
    } catch (err) {
      setError('Xəta baş verdi: ' + (err instanceof Error ? err.message : String(err)));
    }

    setLoading(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      getWeather();
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-10 px-4">
      <div className="mx-auto w-full max-w-2xl">
        {/* App switcher */}
        <AppSwitcher />

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-xl text-white shadow-lg shadow-amber-500/30">
            ⛅
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Hava Köməkçisi
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Şəhər adı yaz, hazırkı havanı gör
            </p>
          </div>
        </div>

        {/* Search card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Məsələn: Bakı, London, İstanbul..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <button
              onClick={getWeather}
              disabled={loading || !city.trim()}
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Yüklənir...' : 'Göstər'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
              <span>⚠️</span>
              <span className="flex-1">{error}</span>
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-600"
                aria-label="Bağla"
              >
                ✕
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="mt-5 flex items-center justify-center gap-3 rounded-xl bg-slate-50 py-10 dark:bg-slate-800/50">
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-amber-400 [animation-delay:-0.3s]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-amber-400 [animation-delay:-0.15s]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-amber-400" />
            </div>
          )}

          {/* Result card */}
          {result && !loading && (
            <div className="mt-5 flex flex-col items-center gap-3 rounded-xl bg-gradient-to-b from-amber-50 to-white px-4 py-8 text-center dark:from-amber-950/30 dark:to-slate-900">
              <span className="text-6xl">{pickIcon(result.reply)}</span>
              <h2 className="text-xl font-bold capitalize text-slate-900 dark:text-slate-50">
                {result.city}
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {result.reply}
              </p>
            </div>
          )}

          {/* Empty state */}
          {!result && !loading && !error && (
            <div className="mt-5 flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-50 py-10 text-center dark:bg-slate-800/50">
              <span className="text-3xl">⛅</span>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Bir şəhər adı yaz və “Göstər” düyməsini bas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
