'use client';

import { Languages, Ruler } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { languageNames, locales } from '@/i18n/config';
import type { Preferences } from '@/lib/supabase/database';

export function PreferenceFields({ values, onChange }: {
  values: Preferences;
  onChange: (values: Preferences) => void;
}) {
  const t = useTranslations('settings');
  return (
    <div className="setting-list">
      <label>
        <span><Languages size={20} aria-hidden />{t('language')}</span>
        <select name="locale" value={values.locale}
          onChange={(event) => onChange({ ...values, locale: event.target.value as Preferences['locale'] })}>
          {locales.map((key) => <option value={key} key={key} lang={key}>{languageNames[key]}</option>)}
        </select>
      </label>
      <label>
        <span><Ruler size={20} aria-hidden />{t('weight')}</span>
        <select name="weight_unit" value={values.weight_unit}
          onChange={(event) => onChange({ ...values, weight_unit: event.target.value === 'lb' ? 'lb' : 'kg' })}>
          <option value="kg">{t('kg')}</option><option value="lb">{t('lb')}</option>
        </select>
      </label>
      <label>
        <span><Ruler size={20} aria-hidden />{t('height')}</span>
        <select name="height_unit" value={values.height_unit}
          onChange={(event) => onChange({ ...values, height_unit: event.target.value === 'feet' ? 'feet' : 'cm' })}>
          <option value="cm">{t('cm')}</option><option value="feet">{t('feet')}</option>
        </select>
      </label>
      <label>
        <span><Ruler size={20} aria-hidden />{t('distance')}</span>
        <select name="distance_unit" value={values.distance_unit}
          onChange={(event) => onChange({ ...values, distance_unit: event.target.value === 'mi' ? 'mi' : 'km' })}>
          <option value="km">{t('km')}</option><option value="mi">{t('mi')}</option>
        </select>
      </label>
    </div>
  );
}
