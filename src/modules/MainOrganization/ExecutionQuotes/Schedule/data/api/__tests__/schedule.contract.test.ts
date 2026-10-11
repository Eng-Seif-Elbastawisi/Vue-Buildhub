import { expect, it } from 'vitest';
import { scheduleContractGaps } from '../schedule.contract';
it('retains only unanswered response/business evidence after real routes and enum confirmation', () => {
  const gaps = Object.values(scheduleContractGaps).flat();
  expect(gaps).not.toContain('endpoint_prefix');
  expect(gaps).not.toContain('duration_enum');
  expect(gaps).not.toContain('atomic_one_based_move');
  expect(scheduleContractGaps.sort).toContain('mutation_success_errors');
});
