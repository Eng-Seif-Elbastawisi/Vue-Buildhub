import {
  mockNetwork,
  response,
} from '@/modules/MainOrganization/ExecutionQuotes/SiteTeam/__tests__/network';
import AddProjectFloorSpaceParams from '../../../core/params/add.project.floor.space.params';
import AddProjectFloorSpacesParams from '../../../core/params/add.project.floor.spaces.params';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { describe, expect, it } from 'vitest';
import ProjectFloorRepository from '../project.floor.repository';

describe('ProjectFloorRepository', () => {
  it('returns a singleton instance', () => {
    expect(ProjectFloorRepository.getInstance()).toBe(ProjectFloorRepository.getInstance());
  });
});

it.each([{}, { status: false }, { status: 'true' }])(
  'does not fabricate successful space persistence for %j',
  async (body) => {
    const post = mockNetwork();
    post.mockResolvedValue(response(body));
    const result = await ProjectFloorRepository.getInstance().addSpaces(
      new AddProjectFloorSpacesParams(23, [new AddProjectFloorSpaceParams(13, 6, 4, 3.2, '')]),
    );
    expect(result).not.toBeInstanceOf(DataSuccess);
  },
);
