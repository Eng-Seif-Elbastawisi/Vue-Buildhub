import { describe, it, expect } from 'vitest';
import ProjectShowModel from '../../core/models/project.show.model';

describe('ProjectShowModel', () => {
  it('should instantiate correctly', () => {
    expect(ProjectShowModel.example).toBeDefined();
    expect(ProjectShowModel.example.id).toBe(1);
  });

  it('should map select item correctly', () => {
    const mapped = ProjectShowModel.mapSelectItem({ id: 2, name: 'Test' });
    expect(mapped).toEqual({ id: 2, title: 'Test', parent: null });
  });

  it('should parse json correctly', () => {
    const json = { id: 10, title: 'Test Project' };
    const model = ProjectShowModel.fromJson(json);
    expect(model.id).toBe(10);
    expect(model.title).toBe('Test Project');
  });
});
