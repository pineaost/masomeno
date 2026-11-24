'use client';

import { Plus, Scale } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';
import { LineChart } from '@/components/line-chart';
import { PageHeading } from '@/components/page-heading';
import { calendarDate, monthsBefore } from '@/lib/dates';
import { useUnit } from '@/lib/preferences';
import { displayWeight } from '@/lib/units';
import { demoDay, goalKg } from './demo-data';
import { useDemo } from './demo-provider';
import { WeightDialog } from './log-dialogs';

const periods = [{ key: 'month', months: 1 }, { key: 'threeMonths', months: 3 }, { key: 'sixMonths', months: 6 }, { key: 'all', months: 0 }] as const;

export function Progress() {
  const t = useTranslations('weight');
  const nav = useTranslations('nav');
  const home = useTranslations('home');
  const format = useFormatter();
  const { weights } = useDemo();
  const [unit] = useUnit('weight');
  const [months, setMonths] = useState(1);
  const [open, setOpen] = useState(false);
  const initial = weights[0].kg;
  const current = weights[weights.length - 1].kg;
  const limit = months ? monthsBefore(demoDay, months) : null;
  const data = weights.filter((entry) => !limit || entry.day >= limit);
  const values = data.map(({ kg }) => kg);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const stats = [
    { key: 'initial', kg: initial },
    { key: 'current', kg: current },
    { key: 'target', kg: goalKg },
    { key: 'change', kg: current - initial },
  ] as const;
  const dateText = (day: string) => format.dateTime(calendarDate(day), { day: 'numeric', month: 'short' });
  const weightText = (kg: number, signed = false) => format.number(displayWeight(kg, unit), {
    maximumFractionDigits: 1, signDisplay: signed ? 'exceptZero' : 'auto',
  });

  return (
    <>
      <PageHeading title={nav('progress')} visuallyHidden>
        <button className="button primary" type="button" onClick={() => setOpen(true)}>
          <Plus size={19} aria-hidden />{home('logWeight')}
        </button>
      </PageHeading>
      <dl className="stat-grid">
        {stats.map(({ key, kg }) => (
          <div className="panel stat" key={key}>
            <dt>{t(key)}</dt><dd>{weightText(kg, key === 'change')} <small>{unit}</small></dd>
          </div>
        ))}
      </dl>
      <section className="panel section-panel progress-panel">
        <div className="panel-heading">
          <h2>{t('trend')}</h2>
          <div className="periods" role="group" aria-label={t('period')}>
            {periods.map((period) => (
              <button key={period.key} type="button" aria-pressed={months === period.months}
                onClick={() => setMonths(period.months)}>{t(period.key)}</button>
            ))}
          </div>
        </div>
        {data.length >= 2 ? (
          <figure>
            <div className="progress-plot">
              <div className="chart-axis" aria-hidden>
                {[max, (max + min) / 2, min].map((kg, index) => <span key={index}>{weightText(kg)}</span>)}
              </div>
              <LineChart data={data.map(({ day, kg }) => ({ day, value: kg }))} label={t('chartLabel')} />
            </div>
            <figcaption className="progress-caption">
              <span>{dateText(data[0].day)}</span><span>{dateText(data[data.length - 1].day)}</span>
            </figcaption>
          </figure>
        ) : <p className="empty-state">{t('emptyTrend')}</p>}
      </section>
      <section className="panel section-panel">
        <div className="panel-heading"><h2>{t('history')}</h2></div>
        {data.length ? (
          <ul className="history">
            {data.toReversed().map((entry) => (
              <li key={entry.id}>
                <span className="category-icon"><Scale size={18} aria-hidden /></span>
                <time dateTime={entry.day}>{dateText(entry.day)}</time>
                <strong>{weightText(entry.kg)} {unit}</strong>
              </li>
            ))}
          </ul>
        ) : <p className="empty-state">{t('emptyHistory')}</p>}
      </section>
      {open && <WeightDialog onClose={() => setOpen(false)} />}
    </>
  );
}
