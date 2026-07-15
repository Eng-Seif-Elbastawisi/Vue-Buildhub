import { describe, it, expect } from 'vitest';
import AddProjectFloorParams from '../add.project.floor.params';
import { FloorNumber } from '../../constants/floor.number.enum';

describe('AddProjectFloorParams', () => {
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

    const params = new AddProjectFloorParams({
      project_id: 10,
      project_preview_id: 15,
      floor_number: FloorNumber.FOURTH_FLOOR,
      site_description: 'Finished concrete work',
      technical_general_notes: 'Needs pricing',
      inspection_recommendations: 'Proceed to pricing',
      spaces,
    });

    expect(params.project_id).toBe(10);

    expect(params.toMap()).toEqual({
      project_id: 10,
      project_preview_id: 15,
      floor_number: FloorNumber.FOURTH_FLOOR,
      site_description: 'Finished concrete work',
      technical_general_notes: 'Needs pricing',
      inspection_recommendations: 'Proceed to pricing',
      spaces,
    });
  });

  it('validates every required add field and accepts numeric floor enum values', () => {
    const validParams = new AddProjectFloorParams({
      project_id: 10,
      project_preview_id: 15,
      floor_number: FloorNumber.GROUND_FLOOR,
      site_description: 'Site description',
      technical_general_notes: 'Technical notes',
      inspection_recommendations: 'Inspection recommendations',
      spaces: [{ space_id: 1, length: 12, width: 8, height: 3 }],
    });

    expect(validParams.validate()).toEqual({ isValid: true, errors: [] });

    const invalidParams = new AddProjectFloorParams({
      project_id: 0,
      project_preview_id: 0,
      floor_number: 99 as FloorNumber,
      site_description: '',
      technical_general_notes: '',
      inspection_recommendations: '',
    });

    expect(invalidParams.validate().errors.map((error) => error.field)).toEqual([
      'project_id',
      'project_preview_id',
      'floor_number',
      'site_description',
      'technical_general_notes',
      'inspection_recommendations',
      'spaces',
    ]);
    expect(invalidParams.toMap()).not.toHaveProperty('spaces');
  });

  it('omits nested undefined values while preserving backend null values', () => {
    const params = new AddProjectFloorParams({
      project_id: 10,
      project_preview_id: 15,
      floor_number: FloorNumber.FIRST_FLOOR,
      site_description: 'Site description',
      technical_general_notes: 'Technical notes',
      inspection_recommendations: 'Recommendations',
      spaces: [
        {
          space_id: 8,
          length: 12,
          width: 8,
          height: 3,
          notes: undefined,
          attachments: [{ file: 'floor.pdf', alt: undefined, link: null }],
        },
      ],
    });

    expect(params.toMap().spaces).toEqual([
      {
        space_id: 8,
        length: 12,
        width: 8,
        height: 3,
        attachments: [{ file: 'floor.pdf', link: null }],
      },
    ]);
  });
});
