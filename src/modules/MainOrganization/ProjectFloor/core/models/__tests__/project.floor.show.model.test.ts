import { describe, it, expect } from 'vitest';
import ProjectFloorShowModel from '../project.floor.show.model';

describe('ProjectFloorShowModel', () => {
  it('should instantiate correctly', () => {
    expect(ProjectFloorShowModel.example).toBeDefined();
    expect(ProjectFloorShowModel.example.id).toBe(1);
  });

  it('should map select item correctly', () => {
    const mapped = ProjectFloorShowModel.mapSelectItem({ id: 2, name: 'Test' });
    expect(mapped).toEqual({ id: 2, title: 'Test' });
  });

  it('should parse json correctly', () => {
    const json = {
      id: 10,
      engineer: { id: 15, name: 'Site Engineer' },
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
    };
    const model = ProjectFloorShowModel.fromJson(json);
    expect(model.id).toBe(10);
    expect(model.engineer).toEqual({ id: 15, title: 'Site Engineer' });
    expect(model.engineer_id).toBe(15);
    expect(model.preview_date).toBe('2026-06-25');
    expect(model.preview_time).toBe('10:30:00');
    expect(model.site_link).toBe('https://maps.google.com/?q=30.0444,31.2357');
    expect(model.address).toBe('Nasr City, Cairo, Egypt');
  });
});
