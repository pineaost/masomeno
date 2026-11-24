'use client';

import Link from 'next/link';
import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';
import { PageHeading } from '@/components/page-heading';
import { AddRecordButton, EditRecordButton, RecordChart } from '@/components/tracking-ui';
import { localePath, type Locale } from '@/i18n/config';
import { calendarDate } from '@/lib/dates';
import type { TreadmillSession } from '@/lib/supabase/database';
import { clockDuration, runMetrics } from '@/lib/tracking';
import type { DistanceUnit } from '@/lib/units';
import { TreadmillForm } from './training-forms';

export function LiveTreadmill({ locale, records, today, unit }: {
  locale: Locale; records: TreadmillSession[]; today: string; unit: DistanceUnit;
}) {
  const t = useTranslations('training');
  const gym = useTranslations('gym');
  const nav = useTranslations('nav');
  const format = useFormatter();
  const [modal, setModal] = useState<TreadmillSession | 'new' | null>(null);
  const number = (value: number) => format.number(value, { maximumFractionDigits: 2 });
  const date = (day: string) => format.dateTime(calendarDate(day), { timeZone: 'UTC', dateStyle: 'medium' });
  const rows = records.map((record) => ({ record, metrics: runMetrics(record, unit) }));

  return (
    <>
      <Link href={localePath(locale, '/gym')} prefetch={false} className="text-link">{nav('gym')}</Link>
      <PageHeading title={gym('treadmill')}>
        <AddRecordButton onClick={() => setModal('new')}>{t('newRun')}</AddRecordButton>
      </PageHeading>
      <section className="panel section-panel">
        <div className="panel-heading"><h2>{t('runChart')}</h2></div>
        <RecordChart data={rows.map(({ record, metrics }) => ({ day: record.performed_on, value: metrics.speed }))}
          label={t('runChart')} date={date} number={(value) => `${number(value)} ${unit}/h`} empty={t('shortChart')} />
      </section>
      <section className="panel section-panel">
        <div className="panel-heading"><h2>{t('runHistory')}</h2></div>
        {rows.length ? (
          <ul className="history run-history">
            {rows.toReversed().map(({ record, metrics }) => (
              <li key={record.id}>
                <div className="run-row-header">
                  <time dateTime={record.performed_on}>{date(record.performed_on)}</time>
                  <EditRecordButton label={date(record.performed_on)} onClick={() => setModal(record)} />
                </div>
                <dl>
                  <div><dt>{gym('distance')}</dt><dd>{number(metrics.distance)} {unit}</dd></div>
                  <div><dt>{gym('duration')}</dt><dd>{clockDuration(record.duration_seconds)} min</dd></div>
                  <div><dt>{gym('speed')}</dt><dd>{number(metrics.speed)} {unit}/h</dd></div>
                  <div><dt>{gym('pace')}</dt><dd>{clockDuration(metrics.paceSeconds)} min/{unit}</dd></div>
                </dl>
              </li>
            ))}
          </ul>
        ) : <p className="empty-state">{t('noRuns')}</p>}
      </section>
      {modal && <TreadmillForm locale={locale} unit={unit} today={today}
        entry={modal === 'new' ? undefined : modal} close={() => setModal(null)} />}
    </>
  );
}
