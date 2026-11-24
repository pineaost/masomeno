'use client';

import { useSyncExternalStore } from 'react';
import type { DistanceUnit, HeightUnit, WeightUnit } from './units';

const changeEvent = 'masomeno:preference';

function subscribe(callback: () => void) {
  window.addEventListener(changeEvent, callback);
  return () => window.removeEventListener(changeEvent, callback);
}

function readCookie(name: string) {
  const prefix = `${name}=`;
  return document.cookie.split('; ').find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

export function rememberPreference(key: string, value: string) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${key}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(changeEvent));
}

type Preference = { weight: WeightUnit; height: HeightUnit; distance: DistanceUnit };
const values: { [Key in keyof Preference]: readonly Preference[Key][] } = {
  weight: ['kg', 'lb'],
  height: ['cm', 'feet'],
  distance: ['km', 'mi'],
};

export function useUnit<Key extends keyof Preference>(key: Key) {
  const allowed: readonly Preference[Key][] = values[key];
  const cookie = `masomeno_${key}`;
  const value = useSyncExternalStore(subscribe, () => (
    allowed.find((item) => item === readCookie(cookie)) ?? allowed[0]
  ), () => allowed[0]);

  return [value, (next: Preference[Key]) => {
    if (allowed.includes(next)) rememberPreference(cookie, next);
  }] as const;
}
