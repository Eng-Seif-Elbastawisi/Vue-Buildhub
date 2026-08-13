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
      site_description: 'Finished concrete work',
      technical_general_notes: 'Needs pricing',
      inspection_recommendations: 'Proceed to pricing',
      floors: [{ floor_number: FloorNumber.FOURTH_FLOOR, spaces }],
    });

    expect(params.project_id).toBe(10);

    expect(params.toMap()).toEqual({
      project_id: 10,
      project_preview_id: 15,
      site_description: 'Finished concrete work',
      technical_general_notes: 'Needs pricing',
      inspection_recommendations: 'Proceed to pricing',
      floors: [{ floor_number: FloorNumber.FOURTH_FLOOR, spaces }],
    });
  });

  it('validates every required add field and accepts numeric floor enum values', () => {
    const validParams = new AddProjectFloorParams({
      project_id: 10,
      project_preview_id: 15,
      site_description: 'Site description',
      technical_general_notes: 'Technical notes',
      inspection_recommendations: 'Inspection recommendations',
      floors: [
        {
          floor_number: FloorNumber.GROUND_FLOOR,
          spaces: [{ space_id: 1, length: 12, width: 8, height: 3 }],
        },
      ],
    });

    expect(validParams.validate()).toEqual({ isValid: true, errors: [] });

    const invalidParams = new AddProjectFloorParams({
      project_id: 0,
      project_preview_id: 0,
      site_description: '',
      technical_general_notes: '',
      inspection_recommendations: '',
    });

    expect(invalidParams.validate().errors.map((error) => error.field)).toEqual([
      'project_id',
      'project_preview_id',
      'floors',
    ]);
    expect(invalidParams.toMap()).not.toHaveProperty('floors');
  });

  it('omits nested undefined values while preserving backend null values', () => {
    const params = new AddProjectFloorParams({
      project_id: 10,
      project_preview_id: 15,
      site_description: 'Site description',
      technical_general_notes: 'Technical notes',
      inspection_recommendations: 'Recommendations',
      floors: [
        {
          floor_number: FloorNumber.FIRST_FLOOR,
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
        },
      ],
    });

    expect(params.toMap().floors).toEqual([
      {
        floor_number: FloorNumber.FIRST_FLOOR,
        spaces: [
          {
            space_id: 8,
            length: 12,
            width: 8,
            height: 3,
            attachments: [{ file: 'floor.pdf', link: null }],
          },
        ],
      },
    ]);
  });

  it('accepts a floor without a preview and omits project_preview_id from the payload', () => {
    const params = new AddProjectFloorParams({
      project_id: 10,
      site_description: 'Site description',
      technical_general_notes: 'Technical notes',
      inspection_recommendations: 'Recommendations',
      floors: [
        {
          floor_number: FloorNumber.FIRST_FLOOR,
          spaces: [{ space_id: 8, length: 12, width: 8, height: 3 }],
        },
      ],
    });

    expect(params.validate()).toEqual({ isValid: true, errors: [] });
    expect(params.toMap()).not.toHaveProperty('project_preview_id');
  });

  it('never includes zero as a project preview id in the payload', () => {
    const params = new AddProjectFloorParams({
      project_id: 10,
      project_preview_id: 0,
      site_description: 'Site description',
      technical_general_notes: 'Technical notes',
      inspection_recommendations: 'Recommendations',
      floors: [
        {
          floor_number: FloorNumber.FIRST_FLOOR,
          spaces: [{ space_id: 8, length: 12, width: 8, height: 3 }],
        },
      ],
    });

    expect(params.validate().errors.map((error) => error.field)).toContain('project_preview_id');
    expect(params.toMap()).not.toHaveProperty('project_preview_id');
  });

  it('rejects a floor with a missing room dimension', () => {
    const params = new AddProjectFloorParams({
      project_id: 10,
      floors: [
        {
          floor_number: FloorNumber.FIRST_FLOOR,
          spaces: [{ space_id: 8, length: 12, width: 0, height: 3 }],
        },
      ],
    });

    expect(params.validate().errors.map((error) => error.field)).toContain('floors');
  });
});
