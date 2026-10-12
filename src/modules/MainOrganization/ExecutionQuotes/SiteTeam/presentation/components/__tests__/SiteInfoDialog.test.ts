import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import SiteInfoDialog from '../SiteInfoDialog.vue';
import SiteTeamController from '../../controllers/site-team.controller';
import { mockNetwork, response } from '../../../__tests__/network';
import { mountDialog } from './harness';
let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
  SiteTeamController.getInstance().activate(140);
});
afterEach(() => vi.unstubAllGlobals());
it('restores existing values and preserves edits on a failed save', async () => {
  post.mockResolvedValueOnce(
    response({ status: true, data: { delivery_date: '2026-12-01', site_condition: 'Ready' } }),
  );
  await SiteTeamController.getInstance().loadSite();
  const wrapper = mountDialog(SiteInfoDialog);
  expect((wrapper.get('#site-delivery').element as HTMLInputElement).value).toBe('2026-12-01');
  await wrapper.get('#site-condition').setValue('Entered condition');
  post.mockResolvedValueOnce(response({ status: false, message: 'Save failed' }));
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect((wrapper.get('#site-condition').element as HTMLTextAreaElement).value).toBe(
    'Entered condition',
  );
  expect(wrapper.emitted('update:visible')).toBeUndefined();
  expect(wrapper.text()).toContain('Save failed');
  wrapper.unmount();
});
