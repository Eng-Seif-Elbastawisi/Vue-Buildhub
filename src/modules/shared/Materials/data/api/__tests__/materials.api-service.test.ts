import { describe, expect, it } from 'vitest';
import MaterialApiService from '../materials.api-service';

describe('MaterialApiService', () => {
  it('returns the same singleton instance', () => {
    expect(MaterialApiService.getInstance()).toBe(MaterialApiService.getInstance());
  });
});
