import { describe, expect, it } from 'vitest';
import { InsideStatusDecision } from '../inside.status.decision.enum';

describe('InsideStatusDecision', () => {
  it('maps review decisions to the backend status values', () => {
    expect(InsideStatusDecision.ACCEPT).toBe(5);
    expect(InsideStatusDecision.REJECT).toBe(6);
  });
});
