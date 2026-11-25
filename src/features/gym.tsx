'use client';

import { ChevronDown, Dumbbell, Footprints } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { PageHeading } from '@/components/page-heading';
import { calendarDate } from '@/lib/dates';
import { useUnit } from '@/lib/preferences';
import { displayDistance, displayWeight } from '@/lib/units';
import { sampleLifts, sampleRuns } from './demo-data';

const liftDates = ['2026-11-10', '2026-11-17', '2026-11-23'];

export function Gym() {
  const t = useTranslations('gym');
  const training = useTranslations('training');
  const nav = useTranslations('nav');
  const weightLabels = useTranslations('weight');
  const format = useFormatter();
  const [weight] = useUnit('weight');
  const [distance] = useUnit('distance');
  const totalMinutes = sampleRuns.reduce((total, run) => total + run.minutes, 0);
  const totalKm = sampleRuns.reduce((total, run) => total + run.km, 0);
  const displayedDistance = displayDistance(totalKm, distance);
  const speed = 60 * displayedDistance / totalMinutes;
  const paceSeconds = Math.round(60 * totalMinutes / displayedDistance);
  const pace = `${Math.floor(paceSeconds / 60)}:${String(paceSeconds % 60).padStart(2, '0')}`;
  const number = (value: number) => format.number(value, { maximumFractionDigits: 1 });
  const load = (kg: number) => `${number(displayWeight(kg, weight))} ${weight}`;
  const date = (day: string) => format.dateTime(calendarDate(day), { day: 'numeric', month: 'short' });

  return (
    <>
      <PageHeading title={nav('gym')} visuallyHidden />
      <div className="gym-overview">
        <section className="panel gym-card treadmill">
          <div className="gym-heading">
            <span className="category-icon lunch"><Footprints size={20} aria-hidden /></span>
            <div><h2>{t('treadmill')}</h2><small>{t('sessions', { count: sampleRuns.length })}</small></div>
          </div>
          <dl className="gym-stats">
            <div><dt>{t('speed')}</dt><dd>{number(speed)} {distance}/h</dd></div>
            <div><dt>{t('pace')}</dt><dd>{pace} min/{distance}</dd></div>
          </dl>
          <details className="gym-detail">
            <summary>{t('treadmillHistory')}<ChevronDown className="chevron" size={19} aria-hidden /></summary>
            <div className="table-region gym-detail-body">
              <table>
                <thead><tr><th scope="col">{weightLabels('date')}</th><th scope="col">{t('distance')}</th><th scope="col">{t('duration')}</th></tr></thead>
                <tbody>
                  {sampleRuns.toReversed().map((run) => (
                    <tr key={run.day}><th scope="row"><time dateTime={run.day}>{date(run.day)}</time></th>
                      <td>{number(displayDistance(run.km, distance))} {distance}</td><td>{run.minutes} min</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>
        <section className="panel section-panel gym-exercises" aria-labelledby="lifts-heading">
          <div className="panel-heading"><h2 id="lifts-heading"><Dumbbell size={20} aria-hidden />{training('exercises')}</h2></div>
          <div className="gym-grid">
            {sampleLifts.map(({ name, loads }) => (
              <article className="panel gym-card" key={name}>
                <div className="gym-heading">
                  <span className="category-icon"><Dumbbell size={19} aria-hidden /></span>
                  <h3>{t(name)}</h3>
                </div>
                <dl className="gym-stats">
                  <div><dt>{t('last')}</dt><dd>{load(loads[loads.length - 1])}</dd></div>
                  <div><dt>{t('best')}</dt><dd>{load(Math.max(...loads))}</dd></div>
                </dl>
                <details className="gym-detail">
                  <summary>{t('history')}<ChevronDown className="chevron" size={19} aria-hidden /></summary>
                  <ul className="gym-detail-body">
                    {loads.map((kg, index) => (
                      <li key={liftDates[index]}>
                        <time dateTime={liftDates[index]}>{date(liftDates[index])}</time>
                        <strong>{load(kg)}</strong>
                      </li>
                    )).reverse()}
                  </ul>
                </details>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
