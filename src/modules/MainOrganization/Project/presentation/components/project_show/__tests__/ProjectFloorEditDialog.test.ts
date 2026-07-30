import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ApiResponse } from '@/base/Data/ApiService/baseApiService';
import EditProjectFloorParams from '@/modules/MainOrganization/ProjectFloor/core/params/edit.project.floor.params';
import ProjectFloorApiService from '@/modules/MainOrganization/ProjectFloor/data/api/project.floor.api-service';

import ProjectFloorEditDialog from '../ProjectFloorEditDialog.vue';
import type { ProjectFloor } from '../projectShow.types';

const DialogStub = {
  props: ['visible', 'closable', 'dismissableMask'],
  emits: ['update:visible'],
  template: `
    <section v-if="visible" class="dialog-stub">
      <slot name="header" />
      <slot />
      <slot name="footer" />
    </section>
  `,
};

const floor: ProjectFloor = {
  id: 24,
  project_id: 30,
  project_preview_id: 17,
  floor_number: 1,
  spaces: [
    {
      id: 101,
      space_id: 11,
      space: { id: 11, title: 'Living Room' },
      length: '8.00',
      width: '4.50',
      height: '3.20',
      notes: 'Original notes',
    },
  ],
};

const mountDialog = () => {
  return mount(ProjectFloorEditDialog, {
    props: {
      modelValue: true,
      floor,
      projectId: 30,
      projectPreviewId: 17,
    },
    global: {
      stubs: { Dialog: DialogStub },
    },
  });
};

describe('ProjectFloorEditDialog', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('populates the selected floor space and dimensions without mutating the floor prop', async () => {
    const wrapper = mountDialog();

    expect(wrapper.text()).toContain('Living Room');
    expect(wrapper.get<HTMLInputElement>('#floor-space-0-length').element.value).toBe('8');
    expect(wrapper.get<HTMLInputElement>('#floor-space-0-width').element.value).toBe('4.5');
    expect(wrapper.get<HTMLInputElement>('#floor-space-0-height').element.value).toBe('3.2');
    expect(wrapper.get<HTMLTextAreaElement>('textarea').element.value).toBe('Original notes');

    await wrapper.get('#floor-space-0-length').setValue('9');

    expect(floor.spaces?.[0]?.length).toBe('8.00');
  });

  it('shows a field error and does not submit an empty dimension', async () => {
    const update = vi.spyOn(ProjectFloorApiService.getInstance(), 'update');
    const wrapper = mountDialog();

    await wrapper.get('#floor-space-0-width').setValue('');
    await wrapper.get('.project-floor-edit-dialog__actions .btn-primary').trigger('click');

    expect(wrapper.text()).toContain('Width must be greater than zero.');
    expect(wrapper.get('#floor-space-0-width').attributes('aria-invalid')).toBe('true');
    expect(update).not.toHaveBeenCalled();
  });

  it('submits the exact single-floor Params payload and closes after success', async () => {
    const update = vi.spyOn(ProjectFloorApiService.getInstance(), 'update').mockResolvedValue({
      statusCode: 200,
      data: { status: true, data: { id: 24, project_id: 30, project_preview_id: 17 } },
    });
    const wrapper = mountDialog();

    await wrapper.get('#floor-space-0-length').setValue('9');
    await wrapper.get<HTMLTextAreaElement>('textarea').setValue(' Living Room Updated ');
    await wrapper.get('.project-floor-edit-dialog__actions .btn-primary').trigger('click');
    await flushPromises();

    const params = update.mock.calls[0]?.[0];

    expect(params).toBeInstanceOf(EditProjectFloorParams);
    expect(params?.toMap()).toEqual({
      project_floor_id: 24,
      project_id: 30,
      project_preview_id: 17,
      spaces: [
        {
          space_id: 11,
          length: 9,
          width: 4.5,
          height: 3.2,
          notes: 'Living Room Updated',
        },
      ],
    });
    expect(wrapper.emitted('updated')?.[0]?.[0]).toEqual(
      expect.objectContaining({
        id: 24,
        spaces: [
          expect.objectContaining({
            space_id: 11,
            length: 9,
            notes: 'Living Room Updated',
          }),
        ],
      }),
    );
    expect(wrapper.emitted('update:modelValue')).toContainEqual([false]);
  });

  it('prevents closing or submitting again while the update request is pending', async () => {
    let resolveUpdate: ((response: ApiResponse) => void) | undefined;
    const update = vi.spyOn(ProjectFloorApiService.getInstance(), 'update').mockImplementation(
      () =>
        new Promise<ApiResponse>((resolve) => {
          resolveUpdate = resolve;
        }),
    );
    const wrapper = mountDialog();
    const updateButton = wrapper.get('.project-floor-edit-dialog__actions .btn-primary');

    await updateButton.trigger('click');
    await updateButton.trigger('click');

    expect(update).toHaveBeenCalledTimes(1);
    expect(
      wrapper
        .findAll<HTMLButtonElement>('.project-floor-edit-dialog__actions button')
        .every((button) => button.element.disabled),
    ).toBe(true);
    expect(wrapper.findComponent(DialogStub).props('closable')).toBe(false);

    resolveUpdate?.({
      statusCode: 200,
      data: { status: true, data: { id: 24, project_id: 30, project_preview_id: 17 } },
    });
    await flushPromises();
  });
});
