import { mockNetwork } from '@/modules/MainOrganization/ExecutionQuotes/SiteTeam/__tests__/network';
import AddProjectFloorSpaceParams from '../../../core/params/add.project.floor.space.params';
import AddProjectFloorSpacesParams from '../../../core/params/add.project.floor.spaces.params';
import { describe, expect, it } from 'vitest';
import ProjectFloorApiService from '../project.floor.api-service';

describe('ProjectFloorApiService', () => {
  it('returns a singleton instance', () => {
    expect(ProjectFloorApiService.getInstance()).toBe(ProjectFloorApiService.getInstance());
  });
});

it('adds spaces through the existing ProjectFloor service as JSON without mutation retries', async () => {
  const post = mockNetwork();
  const params = new AddProjectFloorSpacesParams(23, [
    new AddProjectFloorSpaceParams(13, 6, 4, 3.2, 'Living Room'),
  ]);
  await ProjectFloorApiService.getInstance().addSpaces(params);
  expect(post.mock.calls[0]?.[0]).toMatchObject({
    url: expect.stringContaining('add_project_floor_spaces'),
    data: params.toMap(),
    isAuth: true,
  });
  expect(post.mock.calls[0]?.[1]?.enableRetry).toBe(false);
});
