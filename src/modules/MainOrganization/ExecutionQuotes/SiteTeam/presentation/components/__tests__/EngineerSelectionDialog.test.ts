import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import MultiSelect from 'primevue/multiselect';
import EngineerSelectionDialog from '../EngineerSelectionDialog.vue';
import SiteTeamController from '../../controllers/site-team.controller';
import TitleInterface from '@/base/Data/Models/titleInterface';
import { mockNetwork, response } from '../../../__tests__/network';
import { mountDialog } from './harness';
let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
  SiteTeamController.getInstance().activate(140);
});
afterEach(() => vi.unstubAllGlobals());
it('restores multiple assignments, supports additions and deduplicates the submission', async () => {
  post.mockResolvedValueOnce(
    response({
      status: true,
      data: {
        employee: [
          { id: 7, name: 'A' },
          { id: 12, name: 'B' },
        ],
      },
    }),
  );
  await SiteTeamController.getInstance().loadEngineers();
  post.mockResolvedValue(response({ status: true, data: [{ id: 18, name: 'C' }] }));
  const wrapper = mountDialog(EngineerSelectionDialog);
  await flushPromises();
  expect(wrapper.get('.site-team-selected').text()).toContain('A');
  expect(wrapper.get('.site-team-selected').text()).toContain('B');
  // PrimeVue is the third-party interaction boundary; production selection mapping remains real.
  wrapper
    .findComponent(MultiSelect)
    .vm.$emit('update:modelValue', [
      new TitleInterface({ id: 7, title: 'A' }),
      new TitleInterface({ id: 12, title: 'B' }),
      new TitleInterface({ id: 18, title: 'C' }),
      new TitleInterface({ id: 18, title: 'C' }),
    ]);
  await flushPromises();
  post.mockResolvedValueOnce(response({ status: false, message: 'Save failed' }));
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  const assignment = post.mock.calls.find((call) => call[0].url.includes('assign_quote_engineers'));
  expect(assignment?.[0].data).toEqual({ quote_id: 140, engineer_ids: [7, 12, 18] });
  expect(wrapper.get('.site-team-selected').text()).toContain('C');
  expect(wrapper.emitted('update:visible')).toBeUndefined();
  wrapper.unmount();
});
it('allows deselection but prevents unverified removal of saved assignments', async () => {
  post.mockResolvedValueOnce(response({ status: true, employee: [{ id: 7, name: 'A' }] }));
  await SiteTeamController.getInstance().loadEngineers();
  post.mockResolvedValue(response({ status: true, data: [] }));
  const wrapper = mountDialog(EngineerSelectionDialog);
  await flushPromises();
  await wrapper.get('.site-team-selected button').trigger('click');
  expect(wrapper.text()).toContain('Removing saved assignments is unavailable');
  expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined();
  wrapper.unmount();
});
