'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
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
  const matching = options.filter((option) => option.zone === value || searched.every((term) => option.search.includes(term)));

  return <div className="time-zone-fields">
    <label>{t('timeZoneSearch')}
      <input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault(); }} />
    </label>
    <label>{t('timeZone')}
      <select name="time_zone" value={value} onChange={(event) => onChange(event.target.value)} required>
        {clock ? matching.map(({ zone, name, format }) => <option key={zone} value={zone}>{name} — {format.format(clock)}</option>)
          : <option value={value}>{t('timeZone')}</option>}
      </select>
    </label>
    {query.trim() && !matching.some((option) => searched.every((term) => option.search.includes(term))) && <small role="status">{t('timeZoneNoMatch')}</small>}
    <button type="button" className="button secondary" onClick={() => {
      const zone = deviceTimeZone();
      if (!zone) return;
      setDetected(zone);
      setQuery('');
      onChange(zone);
    }}>{t('useDeviceTimeZone')}</button>
  </div>;
}
