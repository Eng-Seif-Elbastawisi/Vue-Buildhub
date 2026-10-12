import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import Select from 'primevue/select';
import AddProjectSpacesDialog from '../AddProjectSpacesDialog.vue';
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
it('validates rows, sends multiple numeric spaces and retains the builder after failed saving', async () => {
  post
    .mockResolvedValueOnce(response({ status: true, data: { id: 140, project: { id: 43 } } }))
    .mockResolvedValueOnce(response({ status: true, data: [{ id: 23, floor_number: 0 }] }));
  await SiteTeamController.getInstance().loadOwner();
  post.mockResolvedValue(response({ status: true, data: [{ id: 13, title: 'Living room' }] }));
  const wrapper = mountDialog(AddProjectSpacesDialog);
  await flushPromises();
  await wrapper.get('form').trigger('submit');
  expect(wrapper.text()).toContain('Select an existing project floor.');
  expect(wrapper.text()).toContain('Enter a finite positive dimension.');
  const floorSelect = wrapper.findAllComponents(Select)[0];
  if (!floorSelect) throw new Error('Floor selector missing');
  floorSelect.vm.$emit('update:modelValue', new TitleInterface({ id: 23, title: 'Ground floor' }));
  const add = wrapper.findAll('button').find((button) => button.text().includes('Add another'));
  if (!add) throw new Error('Add another space action missing');
  await add.trigger('click');
  await flushPromises();
  const selects = wrapper.findAllComponents(Select);
  for (const select of selects.slice(1))
    select.vm.$emit('update:modelValue', new TitleInterface({ id: 13, title: 'Living room' }));
  for (const input of wrapper.findAll('input[type="number"]')) await input.setValue('3.2');
  post.mockResolvedValueOnce(response({ status: false, message: 'Save failed' }));
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  const request = post.mock.calls.find((call) => call[0].url.includes('add_project_floor_spaces'));
  expect(request?.[0].data).toEqual({
    project_floor_id: 23,
    spaces: [1, 2].map(() => ({ space_id: 13, length: 3.2, width: 3.2, height: 3.2, notes: '' })),
  });
  expect(wrapper.findAll('fieldset')).toHaveLength(2);
  expect(wrapper.emitted('update:visible')).toBeUndefined();
  expect((wrapper.find('input[type="number"]').element as HTMLInputElement).value).toBe('3.2');
  wrapper.unmount();
});
