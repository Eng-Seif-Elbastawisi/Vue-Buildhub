import { describe, it, expect } from 'vitest';
import { BreadcrumbModeEnum } from '../BreadcrumbModeEnum';

describe('BreadcrumbModeEnum', () => {
  it('should have Default defined as 1', () => {
    expect(BreadcrumbModeEnum.Default).toBe(1);
  });

  it('should have Feature defined as 2', () => {
    expect(BreadcrumbModeEnum.Feature).toBe(2);
  });
});
