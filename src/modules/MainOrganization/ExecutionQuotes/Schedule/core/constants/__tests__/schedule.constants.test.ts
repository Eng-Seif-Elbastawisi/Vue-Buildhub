import { expect, it } from 'vitest';
import { dayOptionDisabled } from '../schedule.constants';
it('disables only unselected weekdays at the two-day limit', () => {
  expect(dayOptionDisabled([5, 6], 5)).toBe(false);
  expect(dayOptionDisabled([5, 6], 6)).toBe(false);
  expect(dayOptionDisabled([5, 6], 0)).toBe(true);
  expect(dayOptionDisabled([6], 0)).toBe(false);
});
