import { describe, expect, it } from 'vitest';
import ProjectFloorModel from '../project.floor.model';

describe('ProjectFloorModel', () => {
  it('parses project floor json', () => {
    const model = ProjectFloorModel.fromJson({
      id: 4,
      project: {
        id: 10,
        title: 'Tower A',
      },
      project_preview: {
        id: 15,
        preview_date: '2026-07-01',
        preview_time: '10:30:00',
        address: 'Nasr City',
        site_link: 'https://maps.example.com',
        engineer: {
          id: 2,
          name: 'Ahmed',
        },
        project: {
          site_description: 'Concrete structure',
          technical_general_notes: 'Needs review',
          inspection_recommendations: 'Proceed with pricing',
        },
      },
      floor_number: 2,
      spaces: [
        {
          id: 3,
          space_id: 7,
          title: 'Lobby',
          length: 12,
          width: 8,
          height: 3,
          notes: 'Main entry',
          attachments: [
            {
              id: 9,
              file: 'floor-plan.pdf',
              file_size: '120kb',
            },
          ],
        },
      ],
    });

    expect(model.id).toBe(4);
    expect(model.project_id).toBe(10);
    expect(model.project?.title).toBe('Tower A');
    expect(model.project_preview_id).toBe(15);
    expect(model.project_preview?.engineer?.title).toBe('Ahmed');
    expect(model.floor_number).toBe(2);
    expect(model.site_description).toBe('Concrete structure');
    expect(model.spaces[0]).toMatchObject({
      id: 3,
      space_id: 7,
      length: '12',
      width: '8',
      height: '3',
      notes: 'Main entry',
      space: {
        id: 7,
        title: 'Lobby',
      },
    });
    expect(model.spaces[0].attachments[0]).toMatchObject({
      id: 9,
      file: 'floor-plan.pdf',
      file_size: '120kb',
    });
  });
});
