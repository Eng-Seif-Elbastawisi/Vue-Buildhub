function getEnumName<T extends object>(enumObj: T, value: T[keyof T]): string {
  const entry = Object.entries(enumObj).find(([_, v]) => v === value);
  return entry ? entry[0] : "Unknown";
}

export { getEnumName };
