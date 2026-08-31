'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const apps = [
  { href: '/', label: 'Tapşırıq Köməkçisi', icon: '🛠️' },
  { href: '/document', label: 'Sənəd Köməkçisi', icon: '📄' },
];

export default function AppSwitcher() {
  const pathname = usePathname();

  return (
    <div className="mb-6">
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800/60">
        {apps.map((app) => {
          const active = pathname === app.href;
          return (
            <Link
              key={app.href}
              href={app.href}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-50'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <span>{app.icon}</span>
              <span>{app.label}</span>
            </Link>
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
        İki ayrı tətbiq — birindən digərinə keçmək üçün yuxarıdan seç
      </p>
    </div>
  );
}
