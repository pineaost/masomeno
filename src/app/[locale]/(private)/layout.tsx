import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { DemoProvider } from '@/features/demo-provider';
import { isLocale } from '@/i18n/config';
import { demoMode, readAccountName } from '@/lib/account';

export default async function PrivateLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const demo = demoMode();
  const displayName = demo ? null : await readAccountName(locale);
  return (
    <AppShell demo={demo} displayName={displayName}>
      {demo ? <DemoProvider>{children}</DemoProvider> : children}
    </AppShell>
  );
}
