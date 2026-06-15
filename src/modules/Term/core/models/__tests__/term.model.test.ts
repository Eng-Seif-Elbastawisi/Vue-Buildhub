import { describe, expect, it } from 'vitest';
import TermModel from '../term.model';

describe('TermModel', () => {
  it('maps the related department from API data', () => {
    const model = TermModel.fromJson({
      id: 5,
      title: 'First Term',
      department: { id: 2, title: 'Science' },
    });

    expect(model.id).toBe(5);
    expect(model.department.id).toBe(2);
    expect(model.department.title).toBe('Science');
  });
});
