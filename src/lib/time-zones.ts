const aliases: Readonly<Record<string, string>> = {
  'America/Buenos_Aires': 'America/Argentina/Buenos_Aires',
  'Etc/UTC': 'UTC',
  'Etc/GMT': 'UTC',
  GMT: 'UTC',
};

export function readTimeZone(value: unknown) {
  if (typeof value !== 'string' || value.length > 80) return null;
  const zone = aliases[value] ?? value;
  if (zone !== 'UTC' && !/^[A-Za-z_]+(?:\/[A-Za-z0-9_+.-]+)+$/.test(zone)) return null;
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone });
    return zone;
  } catch {
    return null;
  }
}

export function deviceTimeZone() {
  return readTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
}
