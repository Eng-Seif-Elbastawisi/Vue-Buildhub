import { expect, it } from 'vitest';
import ProjectSiteInfoModel from '../project.site-info.model';
it('maps backend site fields without filling unconfigured values', () => {
  expect(
    ProjectSiteInfoModel.fromJson({ delivery_date: '2026-12-01', site_condition: 'Ready' }),
  ).toEqual(new ProjectSiteInfoModel('2026-12-01', 'Ready'));
  expect(ProjectSiteInfoModel.fromJson({ delivery_date: null })).toEqual(
    new ProjectSiteInfoModel(null, undefined),
  );
  expect(ProjectSiteInfoModel.fromJson({})).toEqual(new ProjectSiteInfoModel());
});
it.each([null, [], { delivery_date: 123 }, { site_condition: false }])(
  'rejects malformed information %j',
  (data) => expect(() => ProjectSiteInfoModel.fromJson(data)).toThrow(),
);
