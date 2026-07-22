import { describe, expect, it } from 'vitest';
import IndexPackageParams from '../index.package.params';

describe('IndexPackageParams', () => {
  it('uses standard list pagination fields', () => {
    expect(new IndexPackageParams('yearly', 2, 20, 1).toMap()).toEqual(
      expect.objectContaining({ word: 'yearly', page: 2, per_page: 20, with_pagination: 1 }),
    );
  });
});
