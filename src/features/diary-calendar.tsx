'use client';

import { Temporal } from '@js-temporal/polyfill';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Dialog } from '@/components/dialog';
import { calendarDate, isCalendarDay } from '@/lib/dates';

type Props = { date: string; today: string; onSelect: (date: string) => void };
const earliest = '1900-01-01';
const keySteps: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

function CalendarDaysPicker({ date, today, onSelect }: Props) {
  const t = useTranslations('nutrition');
  const locale = useLocale();
  const format = useFormatter();
  const [focused, setFocused] = useState(date);
  const [typed, setTyped] = useState(date);
  const prefix = useId();
  const pendingFocus = useRef(false);
  const focus = Temporal.PlainDate.from(focused);
  const first = focus.with({ day: 1 });
  const weekStart = locale === 'en' ? 7 : 1;
  const offset = (first.dayOfWeek - weekStart + 7) % 7;
  const formatDate = (day: string) => format.dateTime(calendarDate(day), { dateStyle: 'full', timeZone: 'UTC' });
  const dateId = (day: string) => prefix + day;

  useEffect(() => {
    if (pendingFocus.current) {
      document.getElementById(prefix + focused)?.focus();
      pendingFocus.current = false;
    }
  }, [focused, prefix]);

  function move(target: Temporal.PlainDate, keyboard = false) {
    const next = target.toString();
    const clamped = next < earliest ? earliest : next > today ? today : next;
    if (clamped === focused) return;
    pendingFocus.current = keyboard;
    setFocused(clamped);
  }

  function dateKeys(event: KeyboardEvent<HTMLButtonElement>) {
    const position = (focus.dayOfWeek - weekStart + 7) % 7;
    const step = keySteps[event.key];
    const months = event.shiftKey ? 12 : 1;
    let target;
    if (step) target = focus.add({ days: step });
    else if (event.key === 'Home') target = focus.subtract({ days: position });
    else if (event.key === 'End') target = focus.add({ days: 6 - position });
    else if (event.key === 'PageUp') target = focus.subtract({ months });
    else if (event.key === 'PageDown') target = focus.add({ months });
    if (!target) return;
    event.preventDefault();
    move(target, true);
  }

  return <div className="diary-calendar">
    <div className="diary-calendar-month">
      <button className="icon-button" type="button" aria-label={t('previousMonth')}
        disabled={first.toString() <= earliest} onClick={() => move(focus.subtract({ months: 1 }))}><ChevronLeft size={19} aria-hidden /></button>
      <strong aria-live="polite">{format.dateTime(calendarDate(first.toString()), { month: 'long', year: 'numeric', timeZone: 'UTC' })}</strong>
      <button className="icon-button" type="button" aria-label={t('nextMonth')}
        disabled={first.add({ months: 1 }).toString() > today} onClick={() => move(focus.add({ months: 1 }))}><ChevronRight size={19} aria-hidden /></button>
    </div>
    <div className="diary-calendar-grid" role="group" aria-label={t('diaryDate')}>
      {Array.from({ length: 7 }, (_, index) => <small key={index} aria-hidden>
        {format.dateTime(new Date(Date.UTC(2020, 0, (weekStart === 7 ? 5 : 6) + index)), { weekday: 'short', timeZone: 'UTC' })}
      </small>)}
      {Array.from({ length: offset }, (_, index) => <span key={index} aria-hidden />)}
      {Array.from({ length: first.daysInMonth }, (_, index) => {
        const day = first.with({ day: index + 1 }).toString();
        return <button key={day} id={dateId(day)} type="button" aria-label={formatDate(day)} aria-pressed={date === day}
          aria-current={today === day ? 'date' : undefined} disabled={day > today} tabIndex={focused === day ? 0 : -1}
          onFocus={() => setFocused(day)} onKeyDown={dateKeys} onClick={(event) => {
            onSelect(day);
            event.currentTarget.closest('dialog')?.close();
          }}>{format.number(index + 1)}</button>;
      })}
    </div>
    <form className="diary-date-direct form-stack" onSubmit={(event) => {
      event.preventDefault();
      if (isCalendarDay(typed) && typed >= earliest && typed <= today) {
        onSelect(typed);
        event.currentTarget.closest('dialog')?.close();
      }
    }}>
      <label>{t('jumpDate')}
        <input type="date" min={earliest} max={today} value={typed} required onChange={(event) => setTyped(event.target.value)} />
      </label>
      <button type="submit" className="button secondary">{t('pickDate')}</button>
    </form>
  </div>;
}

export function DiaryCalendar({ date, today, onSelect }: Props) {
  const t = useTranslations('nutrition');
  const format = useFormatter();
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" className="button secondary diary-date-trigger" aria-haspopup="dialog" onClick={() => setOpen(true)}>
      <CalendarDays size={18} aria-hidden />
      <span>{format.dateTime(calendarDate(date), { dateStyle: 'medium', timeZone: 'UTC' })}</span>
      <span className="sr-only">{t('diaryDate')}</span>
    </button>
    {open && <Dialog title={t('diaryDate')} onClose={() => setOpen(false)}>
      <CalendarDaysPicker date={date} today={today} onSelect={onSelect} />
    </Dialog>}
  </>;
}
