'use client';

import { Dumbbell, House, Settings, TrendingUp, Utensils } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { defaultLocale, isLocale, localePath, type Locale } from '@/i18n/config';
import { brandIcons, brandName } from '@/lib/brand';
import { deviceTimeZone } from '@/lib/time-zones';
import { initializeTimeZone } from '@/app/[locale]/(private)/configuracion/actions';
import { SignOut } from './sign-out';

const navigation = [
  { label: 'home', path: '', icon: House },
  { label: 'progress', path: '/evolucion', icon: TrendingUp },
  { label: 'meals', path: '/comidas', icon: Utensils },
  { label: 'gym', path: '/gym', icon: Dumbbell },
] as const;

function DetectTimeZone({ locale }: { locale: Locale }) {
  useEffect(() => {
    const zone = deviceTimeZone();
    if (zone) void initializeTimeZone(locale, zone).catch(() => { /* The saved setting remains available. */ });
  }, [locale]);
  return null;
}

export function AppShell({ children, demo }: { children: React.ReactNode; demo: boolean }) {
  const pathname = usePathname();
  const requestedLocale = useLocale();
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const app = useTranslations('app');
  const nav = useTranslations('nav');
  const settings = localePath(locale, '/configuracion');
  const active = pathname === settings ? 'page' : undefined;

  return (
    <div className="shell">
      {!demo && <DetectTimeZone locale={locale} />}
      <a className="skip-link" href="#contenido">{app('skip')}</a>
      <aside className="shell-sidebar">
        <Link href={localePath(locale)} prefetch={demo ? undefined : false} className="wordmark">
          <Image src={brandIcons.small.src} width={38} height={38} alt="" />
          <span>{brandName}<span className="wordmark-dot" aria-hidden>.</span></span>
        </Link>
        {demo && <span className="mobile-demo demo-pill">{app('demo')}</span>}
        <Link href={settings} prefetch={false} className="icon-button mobile-account-trigger"
          aria-label={nav('settings')} aria-current={active}>
          <Settings size={22} strokeWidth={1.8} aria-hidden />
        </Link>
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
          <nav className="account-nav" aria-label={nav('options')}>
            <Link href={settings} prefetch={false} aria-current={active}>
              <Settings size={20} strokeWidth={1.8} aria-hidden />{nav('settings')}
            </Link>
            {!demo && <><hr /><SignOut locale={locale} /></>}
          </nav>
        </div>
      </aside>
      <main id="contenido" className="workspace" tabIndex={-1}>{children}</main>
    </div>
  );
}
