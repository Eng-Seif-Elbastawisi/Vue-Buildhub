import { describe, it, expect } from 'vitest';
import ShowEducationClassificationParams from '../show.educationClassification.params';

describe('ShowEducationClassificationParams', () => {
  it('should create an instance with correct data', () => {
    const params = new ShowEducationClassificationParams({ id: 10 });
    expect(params.id).toBe(10);
  });

  it('should map to an object correctly', () => {
    const params = new ShowEducationClassificationParams({ id: 20 });
    const map = params.toMap();
    expect(map).toEqual({ id: 20 });
  });

  it('should validate correctly with valid data', () => {
    const params = new ShowEducationClassificationParams({ id: 5 });
    const result = params.validate();
    expect(result.isValid).toBe(true);
  });
});
