import { describe, expect, it } from 'vitest';
import { FloorNumber } from '../../constants/floor.number.enum';
import EditProjectFloorParams from '../edit.project.floor.params';

describe('EditProjectFloorParams', () => {
  it('keeps the standalone edit page multi-floor payload backward compatible', () => {
    const params = new EditProjectFloorParams({
      id: 123,
      project_id: 10,
      project_preview_id: 15,
      site_description: 'Finished concrete work',
      technical_general_notes: 'Needs pricing',
      inspection_recommendations: 'Proceed to pricing',
      floors: [
        {
          project_floor_id: 123,
          floor_number: FloorNumber.FOURTH_FLOOR,
          spaces: [
            {
              space_id: 1,
              length: 12,
              width: 8,
              height: 3,
              notes: 'Main entry',
            },
          ],
        },
      ],
    });

    expect(params.validate().isValid).toBe(true);
    expect(params.toMap()).toEqual({
      project_floor_id: 123,
      project_id: 10,
      project_preview_id: 15,
      site_description: 'Finished concrete work',
      technical_general_notes: 'Needs pricing',
      inspection_recommendations: 'Proceed to pricing',
      floors: [
        {
          project_floor_id: 123,
          floor_number: FloorNumber.FOURTH_FLOOR,
          spaces: [
            {
              space_id: 1,
              length: 12,
              width: 8,
              height: 3,
              notes: 'Main entry',
            },
          ],
        },
      ],
    });
  });

  it('serializes the dialog update to the exact single-floor backend payload', () => {
    const params = new EditProjectFloorParams({
      project_floor_id: 24,
      project_id: 30,
      project_preview_id: 17,
      spaces: [
        {
          space_id: 11,
          length: 9,
          width: 4.5,
          height: 3.2,
          notes: ' Living Room Updated ',
        },
        {
          space_id: 14,
          length: 20,
          width: 5,
          height: 3,
          notes: '',
        },
      ],
    });

    expect(params.validate().isValid).toBe(true);
    expect(params.toMap()).toEqual({
      project_floor_id: 24,
      project_id: 30,
      project_preview_id: 17,
      spaces: [
        {
          space_id: 11,
          length: 9,
          width: 4.5,
          height: 3.2,
          notes: 'Living Room Updated',
        },
        {
          space_id: 14,
          length: 20,
          width: 5,
          height: 3,
          notes: null,
        },
      ],
    });
  });

  it('rejects missing IDs, empty spaces, and non-positive dimensions in dialog mode', () => {
    const params = new EditProjectFloorParams({
      project_floor_id: 0,
      project_id: 0,
      project_preview_id: 0,
      spaces: [
        {
          space_id: 0,
          length: Number.NaN,
          width: 0,
          height: -1,
          notes: null,
        },
      ],
    });

    expect(params.validate().errors.map((error) => error.field)).toEqual([
      'project_floor_id',
      'project_id',
      'project_preview_id',
      'spaces',
    ]);
  });

  it('requires assessment text when editing the full floor form', () => {
    const params = new EditProjectFloorParams({
      id: 123,
      project_id: 10,
      site_description: ' ',
      technical_general_notes: '',
      inspection_recommendations: '',
      floors: [
        {
          project_floor_id: 123,
          floor_number: FloorNumber.GROUND_FLOOR,
          spaces: [{ space_id: 1, length: 12, width: 8, height: 3 }],
        },
      ],
    });

    expect(params.validate().errors.map((error) => error.field)).toEqual([
      'site_description',
      'technical_general_notes',
      'inspection_recommendations',
    ]);
  });
});
