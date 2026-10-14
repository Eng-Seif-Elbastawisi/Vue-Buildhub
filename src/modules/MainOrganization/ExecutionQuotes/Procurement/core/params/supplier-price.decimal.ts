// Refuse a conversion that changes the decimal value; never round to a guessed money scale.
function canonical(value: string) {
  const [coefficient = '', exponent] = value.split('e');
  if (exponent !== undefined) {
    const [integer = '', decimals = ''] = coefficient.split('.');
    const digits = integer + decimals;
    const point = integer.length + Number(exponent);
    value =
      point <= 0
        ? `0.${'0'.repeat(-point)}${digits}`
        : point >= digits.length
          ? `${digits}${'0'.repeat(point - digits.length)}`
          : `${digits.slice(0, point)}.${digits.slice(point)}`;
  }
  const [whole = '', fraction = ''] = value.split('.');
  return `${whole.replace(/^0+(?=\d)/, '')}.${fraction.replace(/0+$/, '')}`;
}
export function supplierPriceNumber(value: string): number | null {
  if (!/^\d+(\.\d+)?$/.test(value)) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || canonical(String(number)) !== canonical(value)) return null;
  return number;
}
