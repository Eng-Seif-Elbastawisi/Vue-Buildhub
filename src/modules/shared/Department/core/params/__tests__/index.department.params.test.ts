import { describe, expect, it } from 'vitest';
import { DepartmentTypeEnum } from '../../constants/Type.enum';
import IndexDepartmentParams from '../index.department.params';

describe('IndexDepartmentParams', () => {
  it('serializes pagination and search values', () => {
    expect(new IndexDepartmentParams('science', 2, 20).toMap()).toMatchObject({
      word: 'science',
      page: 2,
      per_page: 20,
    });
  });

  it('serializes department type from object params', () => {
    expect(
      new IndexDepartmentParams({
        word: 'science',
        page: 2,
        perPage: 20,
        type: DepartmentTypeEnum.DESIGN,
      }).toMap(),
    ).toMatchObject({
      word: 'science',
      page: 2,
      per_page: 20,
      type: DepartmentTypeEnum.DESIGN,
    });
  });

  it('serializes stage filter from object params', () => {
    expect(
      new IndexDepartmentParams({
        perPage: 100,
        withPage: 0,
        stageId: 12,
      }).toMap(),
    ).toMatchObject({
      per_page: 100,
      with_pagination: 0,
      stage_id: 12,
    });
  });
});
