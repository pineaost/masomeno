'use client';

import { CircleUserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { PageHeading } from '@/components/page-heading';
import { localeCookie } from '@/i18n/config';
import { readLocale } from '@/lib/auth-paths';
import { rememberPreference, useUnit } from '@/lib/preferences';
import { settingsPath } from '@/lib/settings-paths';
import { PreferenceFields } from './preference-fields';

export function Settings({ backHref }: { backHref: string }) {
  const t = useTranslations('settings');
  const app = useTranslations('app');
  const nav = useTranslations('nav');
  const locale = readLocale(useLocale());
  const router = useRouter();
  const [weight, setWeight] = useUnit('weight');
  const [height, setHeight] = useUnit('height');
  const [distance, setDistance] = useUnit('distance');

  return (
    <>
      <PageHeading title={nav('settings')} visuallyHidden />
      <section className="panel section-panel settings-panel">
        <div className="panel-heading"><h2>{t('preferences')}</h2></div>
        <PreferenceFields values={{ locale, weight_unit: weight, height_unit: height, distance_unit: distance }}
          onChange={(values) => {
            if (values.weight_unit !== weight) setWeight(values.weight_unit);
            if (values.height_unit !== height) setHeight(values.height_unit);
            if (values.distance_unit !== distance) setDistance(values.distance_unit);
            if (values.locale !== locale) {
              rememberPreference(localeCookie, values.locale);
              router.replace(settingsPath(values.locale, backHref), { scroll: false });
            }
          }} />
      </section>
      <section className="panel section-panel settings-panel">
        <div className="panel-heading">
          <h2 className="inline-flex items-center gap-3"><CircleUserRound size={21} aria-hidden />{t('account')}</h2>
          <span className="demo-pill">{app('demo')}</span>
        </div>
        <p className="section-copy">{app('demoDetail')}</p>
      </section>
    </>
  );
}
