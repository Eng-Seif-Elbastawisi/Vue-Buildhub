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

  it('maps plural sub-stage relations for edit forms', () => {
    const labor = LaborShowModel.fromJson({
      sub_stages: [
        { id: 30, title: 'Painting' },
        { id: 31, title: 'Tiling' },
      ],
    });

    expect(labor.subStages).toMatchObject([
      { id: 30, title: 'Painting' },
      { id: 31, title: 'Tiling' },
    ]);
  });

  it('does not convert the legacy singular sub-stage relation into a list', () => {
    const labor = LaborShowModel.fromJson({
      sub_stage: { id: 30, title: 'Legacy sub-stage' },
    });

    expect(labor.subStages).toEqual([]);
    expect(labor.subStage).toBeUndefined();
  });
});
