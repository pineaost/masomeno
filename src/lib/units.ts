export type WeightUnit = 'kg' | 'lb';
export type DistanceUnit = 'km' | 'mi';
export type HeightUnit = 'cm' | 'feet';

const kgPerPound = 0.45359237;
const kmPerMile = 1.609344;
const cmPerInch = 2.54;

export function displayWeight(kg: number, unit: WeightUnit) {
  return unit === 'lb' ? kg / kgPerPound : kg;
}

export function weightInKg(value: number, unit: WeightUnit) {
  return unit === 'lb' ? value * kgPerPound : value;
}

export function displayDistance(km: number, unit: DistanceUnit) {
  return unit === 'mi' ? km / kmPerMile : km;
}

export function heightInFeetAndInches(cm: number) {
  const inches = Math.round(cm / cmPerInch);
  return { feet: Math.floor(inches / 12), inches: inches % 12 };
}
