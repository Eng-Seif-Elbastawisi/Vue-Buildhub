export function responseObject(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new Error('schedule.invalid_response');
  return value as Record<string, unknown>;
}
