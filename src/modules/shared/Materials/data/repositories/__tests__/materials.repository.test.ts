import { describe, expect, it } from 'vitest';
import MaterialRepository from '../materials.repository';

describe('MaterialRepository', () => {
  it('returns the same singleton instance', () => {
    expect(MaterialRepository.getInstance()).toBe(MaterialRepository.getInstance());
  });
});
