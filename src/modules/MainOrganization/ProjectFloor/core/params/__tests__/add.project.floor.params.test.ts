import { describe, it, expect } from 'vitest';
import AddProjectFloorParams from '../add.project.floor.params';
import { Status } from '../../constants/status.enum';

describe('AddProjectFloorParams', () => {
  it('should instantiate correctly and convert to map', () => {
    const params = new AddProjectFloorParams({
      project_id: 10,
      project_preview_id: 15,
      status: Status.READY_FOR_PRICING,
      floor_number: '4',
      site_description: 'Finished concrete work',
      technical_general_notes: 'Needs pricing',
      inspection_recommendations: 'Proceed to pricing',
    });

    expect(params.project_id).toBe(10);

    expect(params.toMap()).toEqual({
      project_id: 10,
      project_preview_id: 15,
      status: Status.READY_FOR_PRICING,
      floor_number: '4',
      site_description: 'Finished concrete work',
      technical_general_notes: 'Needs pricing',
      inspection_recommendations: 'Proceed to pricing',
    });
  });
});
