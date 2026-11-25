'use client';

import { Dumbbell, House, LogOut, Settings, TrendingUp, Utensils } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { defaultLocale, isLocale, localePath, type Locale } from '@/i18n/config';
import { brandIcons, brandName } from '@/lib/brand';
import { settingsPath } from '@/lib/settings-paths';
import { signOut } from '@/app/[locale]/(private)/configuracion/actions';

const navigation = [
  { label: 'home', path: '', icon: House },
  { label: 'progress', path: '/evolucion', icon: TrendingUp },
  { label: 'meals', path: '/comidas', icon: Utensils },
  { label: 'gym', path: '/gym', icon: Dumbbell },
] as const;

function SignOutButton() {
  const { pending } = useFormStatus();
  const t = useTranslations('settings');
  return <button type="submit" disabled={pending} aria-busy={pending}>
    <LogOut size={20} strokeWidth={1.8} aria-hidden />{t(pending ? 'signingOut' : 'signOut')}
  </button>;
}

function AccountLinks({ demo, locale, pathname, onNavigate }: {
  demo: boolean; locale: Locale; pathname: string; onNavigate?: () => void;
}) {
  const t = useTranslations('nav');
  const router = useRouter();
  const settings = settingsPath(locale);
  const active = pathname === settings;
  const href = active ? settings : settingsPath(locale, pathname);
  return <>
    <Link href={href} prefetch={demo ? undefined : false} aria-current={active ? 'page' : undefined}
      onNavigate={(event) => {
        onNavigate?.();
        const target = active ? href : settingsPath(locale, pathname + location.search);
        if (target !== href) {
          event.preventDefault();
          router.push(target);
        }
      }}>
      <Settings size={20} strokeWidth={1.8} aria-hidden />{t('settings')}
    </Link>
    {!demo && <>
      <hr />
      <form action={signOut.bind(null, locale)}><SignOutButton /></form>
    </>}
  </>;
}

export function AppShell({ children, demo }: { children: React.ReactNode; demo: boolean }) {
  const pathname = usePathname();
  const requestedLocale = useLocale();
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const app = useTranslations('app');
  const nav = useTranslations('nav');
  const mobileOptions = useRef<HTMLDivElement>(null);

  return (
    <div className="shell">
      <a className="skip-link" href="#contenido">{app('skip')}</a>
      <aside className="shell-sidebar">
        <Link href={localePath(locale)} prefetch={demo ? undefined : false} className="wordmark">
          <Image src={brandIcons.small.src} width={38} height={38} alt="" />
          <span>{brandName}<span className="wordmark-dot" aria-hidden>.</span></span>
        </Link>
        {demo && <span className="mobile-demo demo-pill">{app('demo')}</span>}
        <button type="button" className="icon-button mobile-account-trigger" popoverTarget="mobile-account"
          aria-label={nav('options')}>
          <Settings size={22} strokeWidth={1.8} aria-hidden />
        </button>
        <div id="mobile-account" ref={mobileOptions} popover="auto" className="account-nav mobile-account">
          <AccountLinks demo={demo} locale={locale} pathname={pathname}
            onNavigate={() => mobileOptions.current?.hidePopover()} />
        </div>
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
            <AccountLinks demo={demo} locale={locale} pathname={pathname} />
          </nav>
        </div>
      </aside>
      <main id="contenido" className="workspace" tabIndex={-1}>{children}</main>
    </div>
  );
}
