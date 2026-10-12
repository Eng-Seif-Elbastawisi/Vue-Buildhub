import { expect, it } from 'vitest';
import { useUserStore } from '@/stores/user';
import { SiteTeamEndpoints } from '../site-team.api.endpoints';
import { mockNetwork } from '../../../__tests__/network';
it('resolves endpoint prefix for the active workspace', () => {
  mockNetwork();
  expect(new SiteTeamEndpoints().engineers).toContain('organization/fetch_quote_engineers');
  const store = useUserStore();
  store.user = { ...store.user, type: 1 } as NonNullable<typeof store.user>;
  expect(new SiteTeamEndpoints().engineers).toContain('mainportal/fetch_quote_engineers');
});
