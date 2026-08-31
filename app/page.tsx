import Link from 'next/link';

const apps = [
  {
    href: '/tasks',
    icon: '🛠️',
    title: 'Tapşırıq Köməkçisi',
    desc: 'Danışaraq todo-larını əlavə et, gör və sil. Claude alətləri (tool use) ilə işləyir.',
    accent: 'bg-emerald-600 shadow-emerald-600/30',
    ring: 'hover:border-emerald-400',
  },
  {
    href: '/document',
    icon: '📄',
    title: 'Sənəd Köməkçisi',
    desc: 'PDF yüklə və məzmunu haqqında sual ver. RAG (embedding + axtarış) nümunəsi.',
    accent: 'bg-indigo-600 shadow-indigo-600/30',
    ring: 'hover:border-indigo-400',
  },
  {
    href: '/weather',
    icon: '⛅',
    title: 'Hava Köməkçisi',
    desc: 'Şəhər adı yaz, hazırkı havanı gör. Claude alət çağıraraq real məlumat gətirir.',
    accent: 'bg-amber-500 shadow-amber-500/30',
    ring: 'hover:border-amber-400',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4 py-16">
      <div className="mx-auto w-full max-w-4xl">
        {/* Hero */}
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Next.js + Claude API
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
            Claude Playground
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-500 dark:text-slate-400">
            Üç kiçik tətbiq — hər biri Claude-un fərqli imkanını göstərir. Başlamaq üçün birini seç.
          </p>
        </div>

        {/* App cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <Link
              key={app.href}
              href={app.href}
              className={`group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${app.ring}`}
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl text-white shadow-lg ${app.accent}`}
              >
                {app.icon}
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {app.title}
              </h2>
              <p className="mt-1 flex-1 text-sm text-slate-500 dark:text-slate-400">
                {app.desc}
              </p>
              <span className="mt-4 text-sm font-medium text-slate-700 transition group-hover:translate-x-0.5 dark:text-slate-300">
                Aç →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
