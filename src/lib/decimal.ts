export function parseDecimal(value: string | null, fractionDigits = 5): number | null {
  const text = value?.trim() ?? '';
  const match = /^(\d{1,12})(?:[.,](\d+))?$|^[.,](\d+)$/.exec(text);
  if (!match) return null;
  const fraction = match[2] ?? match[3] ?? '';
  if (fraction.length > fractionDigits) return null;
  const number = Number(`${match[1] ?? '0'}.${fraction}`);
  return Number.isFinite(number) ? number : null;
}
