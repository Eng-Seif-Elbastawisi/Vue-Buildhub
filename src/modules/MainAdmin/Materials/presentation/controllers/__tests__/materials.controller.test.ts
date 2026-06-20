import { describe, expect, it } from 'vitest';
import MaterialController from '../materials.controller';

describe('MaterialController', () => {
  it('returns the same singleton instance', () => {
    expect(MaterialController.getInstance()).toBe(MaterialController.getInstance());
  });
});
