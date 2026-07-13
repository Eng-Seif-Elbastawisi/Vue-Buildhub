import { describe, it, expect } from 'vitest';
import EditProjectFloorParams from '../edit.project.floor.params';
import { FloorNumber } from '../../constants/floor.number.enum';

describe('EditProjectFloorParams', () => {
  it('should instantiate correctly and convert to map', () => {
    const spaces = [
      {
        space_id: 1,
        length: 12,
        width: 8,
        height: 3,
        notes: 'Main entry',
      },
    ];

    const params = new EditProjectFloorParams({
      id: 123,
      project_id: 10,
      project_preview_id: 15,
      floor_number: FloorNumber.FOURTH_FLOOR,
      site_description: 'Finished concrete work',
      technical_general_notes: 'Needs pricing',
      inspection_recommendations: 'Proceed to pricing',
      spaces,
    });

    expect(params.id).toBe(123);

    expect(params.toMap()).toEqual({
      id: 123,
      project_id: 10,
      project_preview_id: 15,
      floor_number: FloorNumber.FOURTH_FLOOR,
      site_description: 'Finished concrete work',
      technical_general_notes: 'Needs pricing',
      inspection_recommendations: 'Proceed to pricing',
      spaces,
    });
  });
});
