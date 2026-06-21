import { describe, expect, it } from 'vitest';
import { EducationType } from '../educationtype.enum';

describe('EducationType', () => {
  it('exposes stable education type ids', () => {
    expect(EducationType).toEqual({ General: 1, Technical: 2 });
  });
});
