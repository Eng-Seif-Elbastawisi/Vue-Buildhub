import { describe, expect, it } from 'vitest';
import SpaceController from '../space.controller';

describe('SpaceController', () => {
  it('returns the same singleton', () => {
    expect(SpaceController.getInstance()).toBe(SpaceController.getInstance());
  });
});
