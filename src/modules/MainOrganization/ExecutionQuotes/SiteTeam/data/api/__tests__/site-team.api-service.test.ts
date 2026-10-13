import { beforeEach, expect, it } from 'vitest';
import SiteTeamApiService from '../site-team.api-service';
import QuoteSiteTeamParams from '../../../core/params/quote.site-team.params';
import AssignQuoteEngineersParams from '../../../core/params/assign.quote.engineers.params';
import UpdateProjectSiteInfoParams from '../../../core/params/update.project.site-info.params';
import { mockNetwork } from '../../../__tests__/network';
let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
});
const api = SiteTeamApiService.getInstance();
it.each([
  [
    'fetch_quote_engineers',
    () => api.fetchEngineers(new QuoteSiteTeamParams(140)),
    { quote_id: 140 },
  ],
  [
    'assign_quote_engineers',
    () => api.assignEngineers(new AssignQuoteEngineersParams(140, [7, 12])),
    { quote_id: 140, engineer_ids: [7, 12] },
  ],
  [
    'fetch_project_configuration_site_info',
    () => api.fetchSiteInfo(new QuoteSiteTeamParams(140)),
    { quote_id: 140 },
  ],
  [
    'update_project_configuration_site_info',
    () => api.updateSiteInfo(new UpdateProjectSiteInfoParams(140, '2026-12-01', 'Ready')),
    { quote_id: 140, delivery_date: '2026-12-01', site_condition: 'Ready' },
  ],
] as const)('sends authenticated JSON to %s without retries', async (endpoint, request, body) => {
  await request();
  expect(post.mock.calls[0]?.[0]).toMatchObject({
    url: expect.stringContaining(endpoint),
    data: body,
    isAuth: true,
  });
  expect(post.mock.calls[0]?.[1]?.enableRetry).toBe(false);
});
it('rejects invalid assignment before transport', async () => {
  await expect(async () =>
    api.assignEngineers(new AssignQuoteEngineersParams(140, [])),
  ).rejects.toThrow();
  expect(post).not.toHaveBeenCalled();
});
