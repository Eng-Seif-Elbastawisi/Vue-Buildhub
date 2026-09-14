import { describe, expect, it } from 'vitest';
import ShowSpecializationParams from '../show.specialization.params';

describe('ShowSpecializationParams', () => {
  it('maps project id', () => {
    expect(new ShowSpecializationParams({ specializationId: 2 }).toMap()).toEqual({
      specialization_id: 2,
    });
  });
});
