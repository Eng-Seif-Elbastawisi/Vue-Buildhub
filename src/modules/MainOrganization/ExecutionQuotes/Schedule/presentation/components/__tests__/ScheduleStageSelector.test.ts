import { flushPromises, mount } from '@vue/test-utils';
import { expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import ExecutionQuoteRepository from '../../../../data/repositories/execution.quote.repository';
import ExecutionQuoteShowModel from '../../../../core/models/execution.quote.show.model';
import ScheduleStageSelector from '../ScheduleStageSelector.vue';
import ProjectTimelineStageParams from '../../../core/params/project.timeline.stage.params';
import ScheduleController from '../../controllers/schedule.controller';
it('retains selected IDs when they are absent from the current Stage page', async () => {
  const controller = ScheduleController.getInstance();
  controller.release();
  controller.activate(101);
  const lookup = vi.spyOn(ExecutionQuoteRepository.getInstance(), 'show').mockResolvedValue(
    new DataSuccess({
      data: ExecutionQuoteShowModel.fromJson({
        id: 101,
        quote_stages: [{ id: 20, stage: { id: 99, title: 'Other Stage' }, sub_stages: [] }],
      }),
    }),
  );
  const wrapper = mount(ScheduleStageSelector, {
    props: { modelValue: [new ProjectTimelineStageParams(10, [11])] },
    global: {
      mocks: { $t: (key: string, args?: { id: number }) => (args ? `${key}:${args.id}` : key) },
    },
  });
  await flushPromises();
  expect(wrapper.text()).toContain('schedule.stage_id:10');
  expect(wrapper.text()).toContain('schedule.substage_id:11');
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  await wrapper.get('button.btn-danger').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[]]);
  wrapper.unmount();
  lookup.mockRestore();
  controller.release();
});

it('selects the child association ID rather than the nested SubStage master ID', async () => {
  const controller = ScheduleController.getInstance();
  controller.release();
  controller.activate(101);
  controller.ownerState.value = new DataSuccess({
    data: ExecutionQuoteShowModel.fromJson({
      id: 101,
      quote_stages: [
        {
          id: 103,
          stage: { id: 500, title: 'Electrical' },
          sub_stages: [{ id: 987, sub_stage: { id: 12, title: 'First Fix' } }],
        },
      ],
    }),
  });
  const wrapper = mount(ScheduleStageSelector, {
    props: { modelValue: [new ProjectTimelineStageParams(103, [])] },
    global: { mocks: { $t: (key: string) => key } },
  });
  try {
    await flushPromises();
    const childrenButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'schedule.children');
    if (!childrenButton) throw new Error('Missing children button');
    await childrenButton.trigger('click');
    await flushPromises();
    const child = wrapper.findAll('label').find((label) => label.text() === 'First Fix');
    if (!child) throw new Error('Missing child selection');
    await child.get('input').setValue(true);
    const emitted = wrapper.emitted<[ProjectTimelineStageParams[]]>('update:modelValue');
    expect(emitted?.[0]?.[0]?.[0]?.toMap()).toEqual({ quote_stage_id: 103, children: [987] });
  } finally {
    wrapper.unmount();
    controller.release();
  }
});
