'use client';

import { CircleUserRound, Languages, Ruler } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { PageHeading } from '@/components/page-heading';
import { isLocale, localeCookie, localePath, locales } from '@/i18n/config';
import { rememberPreference, useUnit } from '@/lib/preferences';

const languageNames = { es: 'Español', en: 'English', it: 'Italiano' } as const;

export function Settings() {
  const t = useTranslations('settings');
  const app = useTranslations('app');
  const nav = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const [weight, setWeight] = useUnit('weight');
  const [height, setHeight] = useUnit('height');
  const [distance, setDistance] = useUnit('distance');

  function chooseLanguage(value: string) {
    if (!isLocale(value)) return;
    rememberPreference(localeCookie, value);
    router.replace(localePath(value, '/configuracion'));
  }

  return (
    <>
      <PageHeading title={nav('settings')} description={t('intro')} />
      <section className="panel section-panel settings-panel">
        <div className="panel-heading"><h2>{t('preferences')}</h2></div>
        <div className="setting-list">
          <label>
            <span><Languages size={20} aria-hidden />{t('language')}</span>
            <select value={locale} onChange={(event) => chooseLanguage(event.target.value)}>
              {locales.map((key) => <option value={key} key={key} lang={key}>{languageNames[key]}</option>)}
            </select>
          </label>
          <label>
            <span><Ruler size={20} aria-hidden />{t('weight')}</span>
            <select value={weight} onChange={(event) => setWeight(event.target.value === 'lb' ? 'lb' : 'kg')}>
              <option value="kg">{t('kg')}</option><option value="lb">{t('lb')}</option>
            </select>
          </label>
          <label>
            <span><Ruler size={20} aria-hidden />{t('height')}</span>
            <select value={height} onChange={(event) => setHeight(event.target.value === 'feet' ? 'feet' : 'cm')}>
              <option value="cm">{t('cm')}</option><option value="feet">{t('feet')}</option>
            </select>
          </label>
          <label>
            <span><Ruler size={20} aria-hidden />{t('distance')}</span>
            <select value={distance} onChange={(event) => setDistance(event.target.value === 'mi' ? 'mi' : 'km')}>
              <option value="km">{t('km')}</option><option value="mi">{t('mi')}</option>
            </select>
          </label>
        </div>
      </section>
      <section className="panel section-panel settings-panel">
        <div className="panel-heading">
          <h2 className="inline-flex items-center gap-3"><CircleUserRound size={21} aria-hidden />{t('account')}</h2>
          <span className="demo-pill">{app('demo')}</span>
        </div>
        <p className="section-copy">{t('accountHint')}</p>
        <p className="section-copy">{app('demoDetail')}</p>
      </section>
    </>
  );
}
