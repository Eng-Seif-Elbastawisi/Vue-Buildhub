import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import SupplyApiService from '../supply.api-service';

describe('SupplyApiService', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('returns the same singleton instance', () => {
    expect(SupplyApiService.getInstance()).toBe(SupplyApiService.getInstance());
  });
});
