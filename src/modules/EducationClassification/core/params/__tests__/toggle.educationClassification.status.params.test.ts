import { describe, it, expect } from 'vitest';
import ToggleStatusEducationClassificationParams from '../toggle.educationClassification.status.params';

describe('ToggleStatusEducationClassificationParams', () => {
  it('should create an instance with correct data', () => {
    const params = new ToggleStatusEducationClassificationParams({ id: 15 });
    expect(params.id).toBe(15);
  });

  it('should map to an object correctly', () => {
    const params = new ToggleStatusEducationClassificationParams({ id: 30 });
    const map = params.toMap();
    expect(map).toEqual({ id: 30 });
  });

  it('should validate correctly with valid data', () => {
    const params = new ToggleStatusEducationClassificationParams({ id: 100 });
    const result = params.validate();
    expect(result.isValid).toBe(true);
  });
});
