import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import ClientShowModel from '@/modules/MainOrganization/client/core/models/client.show.model';
import ClientApiService from '@/modules/MainOrganization/client/data/api/client.api-service';

import ExecutionQuoteClientDialog from '../ExecutionQuoteClientDialog.vue';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock('@/router', () => ({
  default: { push: mocks.push },
}));

const DialogStub = {
  name: 'Dialog',
  props: ['visible'],
  emits: ['update:visible'],
  template:
    '<section v-if="visible"><slot name="header" /><slot /><slot name="footer" /></section>',
};

const SelectStub = {
  name: 'UpdatedCustomInputSelect',
  props: ['id', 'staticOptions'],
  emits: ['update:modelValue'],
  template:
    '<button :id="id" type="button" @click="$emit(\'update:modelValue\', staticOptions[1])" />',
};

describe('ExecutionQuoteClientDialog', () => {
  it('creates a client inline and returns it without navigating away', async () => {
    const createdClient = new ClientShowModel({ id: 44, name: 'New client' });
    vi.spyOn(ClientApiService.getInstance(), 'create').mockResolvedValueOnce({
      statusCode: 200,
      data: {
        status: true,
        data: {
          id: 44,
          name: 'New client',
          phone: '01000000000',
          email: 'client@example.com',
          address: 'Cairo',
          type: 2,
        },
      },
    });

    const wrapper = mount(ExecutionQuoteClientDialog, {
      props: { modelValue: true },
      global: {
        stubs: {
          Dialog: DialogStub,
          DocumentIcon: true,
          FieldHelpIcon: true,
          UpdatedCustomInputSelect: SelectStub,
        },
      },
    });

    await wrapper.get('#name').setValue('New client');
    await wrapper.get('#material-price').setValue('01000000000');
    await wrapper.get('#email').setValue('client@example.com');
    await wrapper.get('#address').setValue('Cairo');
    await wrapper.get('#type').trigger('click');
    await wrapper.get('.execution-quote-client-dialog__actions .btn-primary').trigger('click');
    await flushPromises();

    expect(wrapper.emitted('created')).toEqual([
      [
        expect.objectContaining({
          id: createdClient.id,
          name: createdClient.name,
        }),
      ],
    ]);
    expect(wrapper.emitted('update:modelValue')).toContainEqual([false]);
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
