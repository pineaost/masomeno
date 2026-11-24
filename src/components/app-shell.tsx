'use client';

import { Dumbbell, House, Settings, TrendingUp, Utensils } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { localePath } from '@/i18n/config';
import { brandIcons } from '@/lib/brand';

const navigation = [
  { label: 'home', path: '', icon: House },
  { label: 'meals', path: '/comidas', icon: Utensils },
  { label: 'progress', path: '/evolucion', icon: TrendingUp },
  { label: 'gym', path: '/gym', icon: Dumbbell },
  { label: 'settings', path: '/configuracion', icon: Settings },
] as const;

export function AppShell({ children, demo }: { children: React.ReactNode; demo: boolean }) {
  const pathname = usePathname();
  const locale = useLocale();
  const app = useTranslations('app');
  const nav = useTranslations('nav');

  return (
    <div className="shell">
      <a className="skip-link" href="#contenido">{app('skip')}</a>
      <aside className="shell-sidebar">
        <Link href={localePath(locale)} prefetch={demo ? undefined : false} className="wordmark">
          <Image src={brandIcons.small.src} width={38} height={38} alt="" />
          <span>masomeno<span className="wordmark-dot">.</span></span>
        </Link>
        {demo && <span className="mobile-demo demo-pill">{app('demo')}</span>}
        <nav className="main-nav" aria-label={app('navigation')}>
          {navigation.map(({ label, path, icon: Icon }) => {
            const href = localePath(locale, path);
            return (
              <Link key={label} href={href} prefetch={demo ? undefined : false}
                aria-current={pathname === href || (path && pathname.startsWith(`${href}/`)) ? 'page' : undefined}>
                <Icon size={20} strokeWidth={1.8} aria-hidden />
                <span>{nav(label)}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          {demo && <div className="demo-card">
            <span className="demo-mark" aria-hidden>≈</span>
            <div><strong>{app('demo')}</strong><small>{app('demoNote')}</small></div>
          </div>}
          <p>{app('tagline')}</p>
        </div>
      </aside>
      <main id="contenido" className="workspace" tabIndex={-1}>{children}</main>
    </div>
  );
}
