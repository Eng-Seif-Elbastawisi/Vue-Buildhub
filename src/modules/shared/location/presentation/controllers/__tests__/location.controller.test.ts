import { describe, expect, it } from 'vitest';
import LocationController from '../location.controller';

describe('LocationController', () => {
  it('returns the same singleton', () => {
    expect(LocationController.getInstance()).toBe(LocationController.getInstance());
  });
});
