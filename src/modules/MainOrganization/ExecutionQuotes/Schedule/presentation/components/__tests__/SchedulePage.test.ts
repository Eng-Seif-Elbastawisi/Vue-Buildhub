import { expect, it } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import {
  DataFailed,
  DataLoading,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import ScheduleController from '../../controllers/schedule.controller';
import ScheduleIndex from '../ScheduleIndex.vue';
import ScheduleGroupAdd from '../ScheduleGroupAdd.vue';
import ScheduleGroupEdit from '../ScheduleGroupEdit.vue';
import ScheduleConfigurationDialog from '../ScheduleConfigurationDialog.vue';
import ScheduleGroupShow from '../ScheduleGroupShow.vue';
import { mountScheduleRoute } from './routeHarness';

it.each([
  { page: ScheduleIndex, path: '/schedule/101', resource: 'listState' as const },
  { page: ScheduleGroupEdit, path: '/schedule/101/201', resource: 'itemState' as const },
  { page: ScheduleGroupShow, path: '/schedule/101/201', resource: 'itemState' as const },
])(
  'replaces $resource content with loading and errors, then retries on $path',
  async ({ page, path, resource }) => {
    const { wrapper } = await mountScheduleRoute(page, path);
    const controller = ScheduleController.getInstance();
    controller[resource].value = new DataLoading();
    await flushPromises();
    expect(wrapper.text()).toContain('loading');
    expect(wrapper.find('form').exists()).toBe(false);
    expect(wrapper.find('.schedule__detail').exists()).toBe(false);
    expect(wrapper.find('.schedule__timeline').exists()).toBe(false);

    controller[resource].value = new DataFailed({
      error: new ErrorModel('schedule.invalid_response', ErrorType.dataDirty),
    });
    await flushPromises();
    expect(wrapper.get('[role="alert"]').text()).toContain('schedule.invalid_response');
    await wrapper.get('[role="alert"] button').trigger('click');
    await flushPromises();
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    if (resource === 'listState' || page === ScheduleGroupShow)
      expect(wrapper.text()).toContain('Main Execution Timeline');
    else
      expect(wrapper.get<HTMLInputElement>('#schedule-title').element.value).toBe(
        'Main Execution Timeline',
      );
    wrapper.unmount();
  },
);

it('hides the add form when quote access fails and restores it after retry', async () => {
  const { wrapper } = await mountScheduleRoute(ScheduleGroupAdd, '/schedule/101');
  ScheduleController.getInstance().ownerState.value = new DataFailed({
    error: new ErrorModel('schedule.owner_error', ErrorType.forbidden),
  });
  await flushPromises();
  expect(wrapper.text()).toContain('schedule.unauthorized');
  expect(wrapper.find('form').exists()).toBe(false);
  const retryButton = wrapper
    .findAll('button')
    .find((button) => button.text() === 'schedule.retry');
  expect(retryButton).toBeDefined();
  await retryButton?.trigger('click');
  await flushPromises();
  expect(wrapper.find('form').exists()).toBe(true);
  wrapper.unmount();
});
it('rejects owner and group IDs separately without fetching an invalid owner', async () => {
  const { wrapper, quoteRequest } = await mountScheduleRoute(ScheduleGroupShow, '/schedule/101/0');
  expect(wrapper.text()).toContain('schedule.invalid_ids');
  expect(quoteRequest).not.toHaveBeenCalled();
  wrapper.unmount();
  quoteRequest.mockRestore();
});

it('displays saved configuration and preselects its values when settings opens', async () => {
  const { wrapper } = await mountScheduleRoute(ScheduleIndex, '/schedule/101');
  expect(wrapper.get('.schedule__summary').text()).toContain('2026-10-29');
  expect(wrapper.findComponent(ScheduleConfigurationDialog).exists()).toBe(false);
  const configurationButton = wrapper
    .findAll('button')
    .find((button) => button.text() === 'schedule.configuration');
  await configurationButton?.trigger('click');
  const configurationDialog = wrapper.getComponent(ScheduleConfigurationDialog);
  expect(configurationDialog.text()).toContain('2026-10-29');
  expect(configurationDialog.text()).toContain('schedule.weekday_4');
  await configurationDialog.get('button').trigger('click');
  expect(wrapper.findComponent(ScheduleConfigurationDialog).exists()).toBe(false);
  const settingsButton = wrapper
    .findAll('button')
    .find((button) => button.text() === 'schedule.settings');
  expect(settingsButton).toBeDefined();
  await settingsButton?.trigger('click');
  expect(wrapper.get<HTMLInputElement>('input[type="date"]').element.value).toBe('2026-10-29');
  expect(wrapper.get<HTMLInputElement>('input[value="4"]').element.checked).toBe(true);
  expect(wrapper.get<HTMLInputElement>('input[value="5"]').element.checked).toBe(false);
  wrapper.unmount();
});
