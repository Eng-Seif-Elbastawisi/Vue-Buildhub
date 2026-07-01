import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import LocationController from '../location.controller';

describe('LocationController', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('returns the same singleton', () => {
    expect(LocationController.getInstance()).toBe(LocationController.getInstance());
  });
});
