import { beforeEach, expect, it } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import SiteTeamRepository from '../site-team.repository';
import QuoteSiteTeamParams from '../../../core/params/quote.site-team.params';
import AssignQuoteEngineersParams from '../../../core/params/assign.quote.engineers.params';
import { mockNetwork, response } from '../../../__tests__/network';
let post: ReturnType<typeof mockNetwork>;
const repository = SiteTeamRepository.getInstance();
beforeEach(() => {
  post = mockNetwork();
});
it.each([{ employee: [] }, { data: { employee: [{ id: 7, name: 'Engineer' }] } }])(
  'accepts an explicit employee collection in the unresolved envelope variants',
  async (payload) => {
    post.mockResolvedValue(response({ status: true, ...payload }));
    const result = await repository.fetchEngineers(new QuoteSiteTeamParams(140));
    expect(result).toBeInstanceOf(DataSuccess);
    expect(result.data?.employee.length).toBe('employee' in payload ? 0 : 1);
  },
);
it.each([
  {},
  { status: true },
  { status: true, data: [] },
  { status: false, data: { employee: [] } },
])('does not treat missing or malformed engineer data as empty success %j', async (payload) => {
  post.mockResolvedValue(response(payload));
  expect(await repository.fetchEngineers(new QuoteSiteTeamParams(140))).not.toBeInstanceOf(
    DataSuccess,
  );
});
it.each([{}, { status: false }, { status: 'true' }])(
  'does not fabricate assignment success from %j',
  async (payload) => {
    post.mockResolvedValue(response(payload));
    expect(
      await repository.assignEngineers(new AssignQuoteEngineersParams(140, [7])),
    ).not.toBeInstanceOf(DataSuccess);
  },
);
it('reads the supplied site information envelope', async () => {
  post.mockResolvedValue(
    response({
      status: true,
      message: 'Retrieved',
      data: { delivery_date: '2026-12-01', site_condition: null },
    }),
  );
  const result = await repository.fetchSiteInfo(new QuoteSiteTeamParams(140));
  expect(result.data?.deliveryDate).toBe('2026-12-01');
  expect(result.data?.siteCondition).toBeNull();
});
