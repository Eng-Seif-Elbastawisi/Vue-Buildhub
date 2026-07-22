import { describe, expect, it } from 'vitest';
import PackageController from '../package.controller';

describe('PackageController', () => {
  it('returns the same singleton', () => {
    expect(PackageController.getInstance()).toBe(PackageController.getInstance());
  });
});
