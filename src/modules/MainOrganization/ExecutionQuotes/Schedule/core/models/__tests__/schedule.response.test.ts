import { expect, it } from 'vitest';
import { responseObject } from '../schedule.response';
it.each([null, undefined, [], 'text', 1])(
  'rejects non-object payload %j at the mapping boundary',
  (value) => {
    expect(() => responseObject(value)).toThrow('schedule.invalid_response');
  },
);
