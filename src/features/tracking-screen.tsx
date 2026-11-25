import { notFound, redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { PageHeading } from '@/components/page-heading';
import { isLocale, localePath, type Locale } from '@/i18n/config';
import { demoMode, requireAccount } from '@/lib/account';
import { loadExercise, loadGym, loadTreadmill, loadWeight } from '@/lib/tracking-data';
import { LiveExercise } from './live-exercise';
import { LiveGym } from './live-gym';
import { LiveTreadmill } from './live-treadmill';
import { LiveWeight } from './live-weight';

type Overview = 'progress' | 'gym';
type Detail = { kind: 'treadmill' } | { kind: 'exercise'; id: string };

export async function TrackingBoundary({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const t = await getTranslations({ locale, namespace: 'tracking' });
  return <Suspense fallback={<p className="empty-state" role="status">{t('loading')}</p>}>{children}</Suspense>;
}

async function Unavailable({ locale, path, section }: { locale: Locale; path: string; section: Overview | 'treadmill' }) {
  const t = await getTranslations({ locale });
  return (
    <>
      <PageHeading title={section === 'treadmill' ? t('gym.treadmill') : t(`nav.${section}`)} visuallyHidden />
      <p className="section-copy" role="status">{t('tracking.loadError')}</p>
      <div className="tracking-card-actions">
        <a className="button secondary" href={localePath(locale, path)}>{t('tracking.retry')}</a>
      </div>
    </>
  );
}

export async function TrackingOverview({ locale, screen }: { locale: Locale; screen: Overview }) {
  const now = new Date().toISOString();
  if (screen === 'gym') {
    const data = await loadGym(locale);
    if (!data) return <Unavailable locale={locale} path="/gym" section="gym" />;
    return <LiveGym locale={locale} {...data} />;
  }

  const data = await loadWeight(locale);
  if (!data) return <Unavailable locale={locale} path="/evolucion" section={screen} />;
  return <LiveWeight locale={locale} {...data} now={now} />;
}

async function DetailContent({ locale, detail }: { locale: Locale; detail: Detail }) {
  if (detail.kind === 'treadmill') {
    const data = await loadTreadmill(locale);
    if (!data) return <Unavailable locale={locale} path="/gym/cinta" section="treadmill" />;
    return <LiveTreadmill locale={locale} {...data} />;
  }

  const data = await loadExercise(locale, detail.id);
  if (!data) return <Unavailable locale={locale} path={`/gym/ejercicios/${encodeURIComponent(detail.id)}`} section="gym" />;
  return <LiveExercise locale={locale} {...data} />;
}

export async function TrackingDetail({ locale, detail }: { locale: string; detail: Detail }) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  if (demoMode()) redirect(localePath(locale, '/gym'));
  await requireAccount(locale);
  return (
    <TrackingBoundary locale={locale}>
      <DetailContent locale={locale} detail={detail} />
    </TrackingBoundary>
  );
}
