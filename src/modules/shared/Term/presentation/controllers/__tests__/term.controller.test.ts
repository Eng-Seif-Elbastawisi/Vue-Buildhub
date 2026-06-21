import { describe, expect, it } from 'vitest';
import TermController from '../term.controller';

describe('TermController', () => {
  it('returns the singleton instance', () => {
    expect(TermController.getInstance()).toBe(TermController.getInstance());
  });
});
