import { describe, expect, it } from 'vitest';
import LaborShowModel from '../labor.show.model';

describe('LaborShowModel', () => {
  it('maps the API status for edit forms', () => {
    const labor = LaborShowModel.fromJson({
      id: 7,
      title: [{ locale: 'en', title: 'Installation' }],
      status: 1,
    });

    expect(labor.status).toBe(true);
  });
});
