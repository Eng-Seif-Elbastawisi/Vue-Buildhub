export function enumToOptions<T extends object>(
  enumObj: T,
): { label: string; value: T[keyof T] }[] {
  return Object.keys(enumObj)
    .filter((key) => isNaN(Number(key))) // Exclude numeric keys
    .map((key) => ({
      label: key, // Use the key as the label
      value: enumObj[key as keyof T], // Use the value as the option value
    }));
}
