import { describe, it, expect } from 'vitest';
import { FloorNumber } from '../../constants/floor.number.enum';
import ProjectFloorShowModel from '../project.floor.show.model';

describe('ProjectFloorShowModel', () => {
  it('should instantiate correctly', () => {
    expect(ProjectFloorShowModel.example).toBeDefined();
    expect(ProjectFloorShowModel.example.id).toBe(1);
  });

  it('should parse json correctly', () => {
    const json = {
      id: 10,
      project: { id: 2, name: 'Site Project' },
      project_preview: {
        id: 7,
        engineer: { id: 15, name: 'Site Engineer' },
        preview_date: '2026-06-25',
        preview_time: '10:30:00',
        site_link: 'https://maps.google.com/?q=30.0444,31.2357',
        address: 'Nasr City, Cairo, Egypt',
      },
      floor_number: -1,
      spaces: [
        {
          id: 4,
          space_id: 9,
          title: 'Reception',
          length: 12,
          width: 8,
          height: 3,
          notes: 'Needs inspection',
          attachments: [{ id: 3, file: 'space.pdf', alt: 'Space file' }],
        },
      ],
    };
    const model = ProjectFloorShowModel.fromJson(json);

    expect(model.id).toBe(10);
    expect(model.project).toEqual({ id: 2, title: 'Site Project' });
    expect(model.project_preview?.engineer).toEqual({ id: 15, title: 'Site Engineer' });
    expect(model.project_preview?.preview_date).toBe('2026-06-25');
    expect(model.project_preview?.preview_time).toBe('10:30:00');
    expect(model.project_preview?.site_link).toBe('https://maps.google.com/?q=30.0444,31.2357');
    expect(model.project_preview?.address).toBe('Nasr City, Cairo, Egypt');
    expect(model.floor_number).toBe(-1);
    expect(model.spaces[0]).toMatchObject({
      id: 4,
      space_id: 9,
      length: '12',
      width: '8',
      height: '3',
      notes: 'Needs inspection',
      attachments: [{ id: 3, file: 'space.pdf', alt: 'Space file' }],
    });
    expect(model.spaces[0].space).toEqual({ id: 9, title: 'Reception' });
  });

  it('preserves scalar ids and maps nested floor and translated space objects', () => {
    const model = ProjectFloorShowModel.fromJson({
      id: 33,
      project_id: 24,
      project_preview_id: 15,
      floor: { id: 200, number: 0, title: 'Ground floor' },
      site_description: 'Current site description',
      technical_general_notes: 'Current technical notes',
      inspection_recommendations: 'Current recommendations',
      spaces: [
        {
          space: {
            id: 8,
            title: [
              { locale: 'ar', title: 'استقبال' },
              { locale: 'en', title: 'Reception' },
            ],
          },
          length: '12.50',
          width: '8.25',
          height: '3.20',
          notes: null,
        },
      ],
    });

    expect(model.project_id).toBe(24);
    expect(model.project_preview_id).toBe(15);
    expect(model.project_preview?.id).toBe(15);
    expect(model.floor_number).toBe(FloorNumber.GROUND_FLOOR);
    expect(model.spaces[0]?.space).toEqual({ id: 8, title: 'Reception' });
    expect(model.spaces[0]?.notes).toBe('');
  });
});
