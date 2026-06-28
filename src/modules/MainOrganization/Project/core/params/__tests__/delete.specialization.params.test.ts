import { describe, expect, it } from 'vitest';
import DeleteSpecializationParams from '../delete.specialization.params';

describe('DeleteSpecializationParams', () => {
  it('maps project id', () => {
    expect(new DeleteSpecializationParams({ specializationId: 2 }).toMap()).toEqual({
      specialization_id: 2,
    });
  });
});
