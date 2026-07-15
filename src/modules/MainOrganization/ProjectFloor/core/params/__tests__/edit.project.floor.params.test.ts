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

  it('uses the same required fields and validation behavior as add params', () => {
    const params = new EditProjectFloorParams({
      id: 0,
      project_id: 0,
      project_preview_id: 0,
      floor_number: 99 as FloorNumber,
      site_description: '',
      technical_general_notes: '',
      inspection_recommendations: '',
    });

    expect(params.validate().errors.map((error) => error.field)).toEqual([
      'id',
      'project_id',
      'project_preview_id',
      'floor_number',
      'site_description',
      'technical_general_notes',
      'inspection_recommendations',
      'spaces',
    ]);
    expect(params.toMap()).not.toHaveProperty('spaces');
  });
});
