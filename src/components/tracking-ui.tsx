'use client';

import { Pencil, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState, useTransition, type FormEvent } from 'react';
import { useLocalizedValidation } from '@/i18n/form-validation';
import type { MutationResult, TrackingAction } from '@/lib/tracking';
import { Dialog } from './dialog';
import { chartBounds, trendSegments, type ChartPoint } from '@/lib/chart-scale';
import { LineChart } from './line-chart';

export function AddRecordButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button className="button primary" type="button" onClick={onClick}><Plus size={19} aria-hidden />{children}</button>;
}

export function EditRecordButton({ onClick, label }: { onClick: () => void; label: string }) {
  const t = useTranslations('tracking');
  return (
    <button className="icon-button" type="button" aria-label={t('editRecord', { label })} onClick={onClick}>
      <Pencil size={18} aria-hidden />
    </button>
  );
}

export function RecordDialog({ title, close, save, saveLabel, remove, removePrompt, duplicateMessage, startWithRemoval = false, canSave = true, footer, children, fitViewport }: {
  title: string;
  close: () => void;
  save: TrackingAction;
  saveLabel?: string;
  remove?: () => Promise<MutationResult>;
  removePrompt?: string;
  duplicateMessage?: string;
  startWithRemoval?: boolean;
  canSave?: boolean;
  footer?: React.ReactNode;
  fitViewport?: boolean;
  children: React.ReactNode;
}) {
  const t = useTranslations('tracking');
  const app = useTranslations('app');
  const validation = useLocalizedValidation();
  const [confirm, setConfirm] = useState(startWithRemoval);
  const [error, setError] = useState<Exclude<MutationResult, 'saved'> | null>(null);
  const [pending, startTransition] = useTransition();

  const inFlight = useRef(false);
  function run(action: () => Promise<MutationResult>, dialog: HTMLDialogElement | null) {
    if (inFlight.current) return;
    inFlight.current = true;
    startTransition(async () => {
      let result: MutationResult;
      try {
        result = await action();
      } catch {
        result = 'unavailable';
      }
      if (result === 'saved') dialog?.close();
      else { inFlight.current = false; setError(result); }
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave || pending) return;
    const fields = new FormData(event.currentTarget);
    run(() => save(fields), event.currentTarget.closest('dialog'));
  }

  return (
    <Dialog title={title} onClose={close} fitViewport={fitViewport} compact={!!(fitViewport && confirm && remove)}>
      <form onSubmit={submit} className="form-stack" hidden={confirm} {...validation}>
        <fieldset disabled={pending} className="form-stack">{children}</fieldset>
        {!confirm && error && <p role="alert">{error === 'duplicate' && duplicateMessage ? duplicateMessage : t(error)}</p>}
        <div className={footer ? 'record-submit-with-summary' : undefined}>
          {footer}
          <div className="form-actions">
            {remove && <button type="button" className="button secondary destructive" disabled={pending}
              onClick={() => { setError(null); setConfirm(true); }}>{app('remove')}</button>}
            <button type="submit" className="button primary" disabled={pending || !canSave}>{pending ? t('saving') : saveLabel ?? app('save')}</button>
          </div>
        </div>
      </form>
      {confirm && remove && (
        <div className="form-stack">
          <p>{removePrompt ?? t('removeConfirm')}</p>
          {error && <p role="alert">{t(error)}</p>}
          <div className="form-actions">
            <button type="button" className="button secondary" disabled={pending}
              onClick={() => {
                if (startWithRemoval) close();
                else { setError(null); setConfirm(false); }
              }}>{app('cancel')}</button>
            <button type="button" className="button primary destructive" disabled={pending}
              onClick={(event) => run(remove, event.currentTarget.closest('dialog'))}>
              {pending ? t('saving') : app('remove')}
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

export function RecordChart({ data, label, date, number, empty, padding }: {
  data: ChartPoint[];
  label: string;
  date: (day: string) => string;
  number: (value: number) => string;
  empty: string;
  padding?: number;
}) {
  const t = useTranslations('tracking');
  if (data.length < 2) return <p className="empty-state">{empty}</p>;

  const { min, max } = chartBounds(data, padding);
  const hasTrend = trendSegments(data).length > 0;
  return (
    <figure>
      <div className="progress-plot record-plot">
        <div className="chart-axis" aria-hidden>
          {min === max
            ? <><span /><span>{number(min)}</span><span /></>
            : <><span>{number(max)}</span><span>{number((max + min) / 2)}</span><span>{number(min)}</span></>}
        </div>
        <LineChart data={data} label={label} padding={padding} />
        <span className="record-date">{date(data[0].day)}</span>
        <span className="record-date record-date-end">{date(data[data.length - 1].day)}</span>
      </div>
      {hasTrend && (
        <figcaption className="chart-legend">
          <span>{t('measurements')}</span><span>{t('smoothed')}</span>
        </figcaption>
      )}
    </figure>
  );
}
