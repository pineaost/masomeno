'use client';

import { ChevronDown, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useMemo, useState } from 'react';
import { Dialog } from '@/components/dialog';
import regions from '@/i18n/time-zone-regions.json';
import { deviceTimeZone, readTimeZone } from '@/lib/time-zones';

const preferred = ['America/Argentina/Buenos_Aires', 'America/New_York', 'Europe/Rome'];
const regionCodes: Record<string, string> = regions;

const cities: Record<string, Record<string, string>> = {
  'America/New_York': { es: 'Nueva York' },
  'Europe/Rome': { es: 'Roma', it: 'Roma' },
  'Europe/London': { es: 'Londres', it: 'Londra' },
};

function searchKey(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

export function TimeZoneSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const t = useTranslations('settings');
  const locale = useLocale();
  const labelId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [clock, setClock] = useState<Date | null>(null);
  const [detected, setDetected] = useState<string | null>(null);
  useEffect(() => {
    function tick() { setClock(new Date()); }
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 15_000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  // The server and browser can ship different IANA data. Render the live clocks in the browser.
  const ready = clock !== null;
  const options = useMemo(() => {
    if (!ready) return [];
    const countries = new Intl.DisplayNames(locale, { type: 'region' });
    const zones = new Set([...preferred, ...Object.keys(regions), 'UTC', value, ...(detected ? [detected] : [])]);
    return [...zones].filter((zone) => readTimeZone(zone)).map((zone) => {
      const city = cities[zone]?.[locale] ?? zone.split('/').at(-1)!.replaceAll('_', ' ');
      const countryNames = regionCodes[zone]?.split(',').map((region) => countries.of(region)) ?? [];
      const name = countryNames[0] ? `${city}, ${countryNames[0]}` : city;
      return { zone, name, search: searchKey(`${city} ${countryNames.join(' ')} ${zone.replaceAll('_', ' ')}`), format: new Intl.DateTimeFormat(locale, {
        timeZone: zone, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
      }) };
    });
  }, [ready, locale, value, detected]);
  const searched = searchKey(query.trim()).split(/\s+/);
  const matching = options.filter(({ search }) => searched.every((term) => search.includes(term)));
  const selected = options.find(({ zone }) => zone === value);
  const current = selected?.name ?? value.split('/').at(-1)?.replaceAll('_', ' ') ?? value;

  function pick(zone: string, dialog: HTMLDialogElement | null) {
    onChange(zone);
    dialog?.close();
  }

  return <div className="time-zone-fields">
    <input type="hidden" name="time_zone" value={value} />
    <span id={labelId} className="time-zone-label">{t('timeZone')}</span>
    <button type="button" className="time-zone-trigger" aria-labelledby={`${labelId} ${labelId}-value`}
      aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
      <span id={`${labelId}-value`}>{current}{clock && selected && <small>{selected.format.format(clock)}</small>}</span>
      <ChevronDown size={18} aria-hidden />
    </button>
    {open && <Dialog title={t('timeZone')} onClose={() => { setOpen(false); setQuery(''); }}>
      <div className="time-zone-picker">
        <label className="search-field">
          <Search size={18} aria-hidden />
          <input type="search" aria-label={t('timeZoneSearch')} placeholder={t('timeZoneSearch')} value={query}
            onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
              const dialog = event.currentTarget.closest('dialog');
              if (event.key === 'Enter') {
                event.preventDefault();
                if (matching.length === 1) pick(matching[0].zone, dialog);
              }
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                dialog?.querySelector<HTMLButtonElement>('.time-zone-results button')?.focus();
              }
            }} />
        </label>
        {clock && (matching.length ? <ul className="time-zone-results food-results"
          onKeyDown={(event) => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            const button = (event.target as HTMLElement).closest('button');
            const row = button?.parentElement;
            const next = event.key === 'ArrowDown' ? row?.nextElementSibling : row?.previousElementSibling;
            if (next) {
              event.preventDefault();
              next.querySelector('button')?.focus();
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              event.currentTarget.parentElement?.querySelector('input')?.focus();
            }
          }}>
          {matching.map(({ zone, name, format }) => <li key={zone}>
            <button type="button" aria-pressed={zone === value} onClick={(event) => pick(zone, event.currentTarget.closest('dialog'))}>
              <strong>{name}</strong><small>{format.format(clock)}</small>
            </button>
          </li>)}
        </ul> : <p role="status" className="empty-state">{t('timeZoneNoMatch')}</p>)}
      </div>
    </Dialog>}
    <button type="button" className="button secondary" onClick={() => {
      const zone = deviceTimeZone();
      if (!zone) return;
      setDetected(zone);
      setQuery('');
      onChange(zone);
    }}>{t('useDeviceTimeZone')}</button>
  </div>;
}
