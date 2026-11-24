'use client';

import { Activity, Scale } from 'lucide-react';
import Link from 'next/link';
import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';
import { LineChart } from '@/components/line-chart';
import { PageHeading } from '@/components/page-heading';
import { AddRecordButton, EditRecordButton, RecordChart, RecordDialog } from '@/components/tracking-ui';
import { localePath, type Locale } from '@/i18n/config';
import { localFormDateTime, monthsBefore } from '@/lib/dates';
import type { WeightMeasurement } from '@/lib/supabase/database';
import { weightPoints, weightSummary } from '@/lib/tracking';
import { displayWeight, type WeightUnit } from '@/lib/units';
import { deleteWeighIn, saveWeighIn, saveWeightGoal } from './tracking-actions';

const periods = [
  { key: 'month', months: 1 }, { key: 'threeMonths', months: 3 },
  { key: 'sixMonths', months: 6 }, { key: 'all', months: 0 },
] as const;

type Props = {
  locale: Locale;
  records: WeightMeasurement[];
  goal: number | null;
  timeZone: string;
  unit: WeightUnit;
  now: string;
  compact: boolean;
};

export function LiveWeight({ locale, records, goal, timeZone, unit, now, compact }: Props) {
  const t = useTranslations('weight');
  const tracking = useTranslations('tracking');
  const home = useTranslations('home');
  const nav = useTranslations('nav');
  const format = useFormatter();
  const [months, setMonths] = useState(1);
  const [modal, setModal] = useState<WeightMeasurement | 'new' | 'goal' | null>(null);
  const summary = weightSummary(records);
  const currentDateTime = localFormDateTime(now, timeZone);
  const today = currentDateTime.slice(0, 10);
  const cutoff = months ? monthsBefore(today, months) : null;
  const localDay = (value: string) => localFormDateTime(value, timeZone).slice(0, 10);
  const chart = weightPoints(records).filter((point) => cutoff === null || localDay(point.day) >= cutoff);
  const visible = records.filter((record) => cutoff === null || localDay(record.measured_at) >= cutoff);
  const date = (value: string) => format.dateTime(new Date(value), { timeZone, day: 'numeric', month: 'short', year: 'numeric' });
  const dateTime = (value: string) => format.dateTime(new Date(value), { timeZone, dateStyle: 'medium', timeStyle: 'short' });
  const number = (kg: number, signed = false) => format.number(displayWeight(kg, unit), {
    maximumFractionDigits: 2, signDisplay: signed ? 'exceptZero' : 'auto',
  });
  const stats = [
    { key: 'initial', kg: summary?.first }, { key: 'current', kg: summary?.current },
    { key: 'target', kg: goal }, { key: 'change', kg: summary?.change },
  ] as const;
  const entry = typeof modal === 'object' ? modal : null;
  const close = () => setModal(null);

  return (
    <>
      <PageHeading title={compact ? home('title') : nav('progress')} description={compact ? home('intro') : t('intro')}>
        {!compact && <AddRecordButton onClick={() => setModal('new')}>{home('logWeight')}</AddRecordButton>}
      </PageHeading>
      {compact ? (
        <section className="panel weight-panel tracking-snapshot">
          <div className="panel-heading">
            <h2>{t('current')}</h2><span className="panel-icon"><Activity size={18} aria-hidden /></span>
          </div>
          {summary ? (
            <>
              <div className="weight-number"><strong>{number(summary.current)}</strong><span>{unit}</span></div>
              <span className="change-pill">{t('sinceStart', { change: `${number(summary.change, true)} ${unit}` })}</span>
              {chart.length > 1 && <div className="weight-figure"><LineChart data={chart} label={tracking('weightChart')} compact /></div>}
            </>
          ) : <p className="empty-state">{tracking('noWeights')}</p>}
          <div className="tracking-card-actions">
            <AddRecordButton onClick={() => setModal('new')}>{home('logWeight')}</AddRecordButton>
            <Link href={localePath(locale, '/evolucion')} prefetch={false} className="text-link">{home('seeProgress')}</Link>
          </div>
        </section>
      ) : (
        <>
          <dl className="stat-grid">
            {stats.map(({ key, kg }) => (
              <div className="panel stat" key={key}>
                <dt>{t(key)}</dt>
                <dd>{kg == null ? '—' : <>{number(kg, key === 'change')} <small>{unit}</small></>}</dd>
                {key === 'target' && (
                  <button className="text-link" type="button" onClick={() => setModal('goal')}>
                    {tracking(goal === null ? 'setGoal' : 'editGoal')}
                  </button>
                )}
              </div>
            ))}
          </dl>
          <section className="panel section-panel">
            <div className="panel-heading">
              <h2>{t('trend')}</h2>
              <div className="periods" role="group" aria-label={t('period')}>
                {periods.map((period) => (
                  <button key={period.key} type="button" aria-pressed={months === period.months}
                    onClick={() => setMonths(period.months)}>{t(period.key)}</button>
                ))}
              </div>
            </div>
            <RecordChart data={chart} label={tracking('weightChart')} date={date} number={(kg) => `${number(kg)} ${unit}`} empty={t('emptyTrend')} />
          </section>
          <section className="panel section-panel">
            <div className="panel-heading"><h2>{t('history')}</h2></div>
            {visible.length ? (
              <ul className="history">
                {visible.toReversed().map((record) => (
                  <li key={record.id}>
                    <span className="category-icon"><Scale size={18} aria-hidden /></span>
                    <div className="record-row-copy">
                      <time dateTime={record.measured_at}>{dateTime(record.measured_at)}</time>
                      {record.condition && <small>{record.condition}</small>}
                    </div>
                    <strong>{number(record.weight_kg)} {unit}</strong>
                    <EditRecordButton label={dateTime(record.measured_at)} onClick={() => setModal(record)} />
                  </li>
                ))}
              </ul>
            ) : <p className="empty-state">{records.length ? t('emptyHistory') : tracking('noWeights')}</p>}
          </section>
        </>
      )}
      {modal === 'goal' && (
        <RecordDialog title={t('target')} close={close} save={saveWeightGoal.bind(null, locale, unit)}>
          <label>
            {t('weightInput', { unit })}
            <input name="weight" type="number" inputMode="decimal" min="0.001" step="any"
              defaultValue={goal === null ? '' : Number(displayWeight(goal, unit).toFixed(5))} />
          </label>
          <p className="section-copy">{tracking('optionalGoal')}</p>
        </RecordDialog>
      )}
      {(modal === 'new' || entry) && (
        <RecordDialog title={entry ? tracking('editWeight') : home('logWeight')} close={close}
          save={saveWeighIn.bind(null, locale, entry?.id ?? null, unit, timeZone)}
          remove={entry ? deleteWeighIn.bind(null, locale, entry.id) : undefined}>
          <label>
            {t('weightInput', { unit })}
            <input name="weight" type="number" inputMode="decimal" min="0.001" step="any" required
              defaultValue={entry ? Number(displayWeight(entry.weight_kg, unit).toFixed(5)) : ''} />
          </label>
          <label>
            {tracking('dateTime')}
            <input name="measured_at" type="datetime-local" defaultValue={entry
              ? localFormDateTime(entry.measured_at, timeZone) : currentDateTime} required />
            <small className="section-copy">{timeZone}</small>
          </label>
          <label>
            {tracking('condition')}
            <input name="condition" maxLength={100} defaultValue={entry?.condition ?? ''} />
          </label>
        </RecordDialog>
      )}
    </>
  );
}
