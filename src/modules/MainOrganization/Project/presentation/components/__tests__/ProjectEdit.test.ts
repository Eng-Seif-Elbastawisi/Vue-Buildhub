import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddProjectParams from '../../../core/params/add.project.params';
import ProjectEdit from '../ProjectEdit.vue';

const mocks = vi.hoisted(() => ({
  fetchOne: vi.fn(),
  update: vi.fn(),
  toastWarning: vi.fn(),
  errorMessage: { value: null as string | null },
  itemData: { value: null },
}));

vi.mock('../../controllers/project.controller', () => ({
  default: {
    getInstance: () => ({
      fetchOne: mocks.fetchOne,
      update: mocks.update,
      errorMessage: mocks.errorMessage,
      itemData: mocks.itemData,
    }),
  },
}));

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: {
    toastWarning: mocks.toastWarning,
  },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: {
      project_id: '24',
    },
    fullPath: '/organization/project/edit/24',
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    resolve: vi.fn(),
  }),
  createRouter: vi.fn(() => ({
    install: vi.fn(),
    push: vi.fn(),
    resolve: vi.fn(),
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

vi.mock('vue-i18n', () => ({
  createI18n: () => ({
    global: {
      t: (key: string) => key,
    },
  }),
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe('ProjectEdit.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fetchOne.mockResolvedValue({});
    mocks.update.mockResolvedValue({});
    mocks.errorMessage.value = null;
    mocks.itemData.value = null;
  });

  it('should be defined', () => {
    expect(ProjectEdit).toBeDefined();
  });

  it('does not update a project when emitted params have an empty title', async () => {
    const invalidParams = new AddProjectParams({
      translations: new TranslationParams({ title: { en: '', ar: '   ' } }),
    });

    const wrapper = mount(ProjectEdit, {
      global: {
        stubs: {
          RadioButton: true,
          ProjectForm: {
            emits: ['updateData'],
            template:
              '<button data-test="emit-invalid" type="button" @click="$emit(\'updateData\', invalidParams)">emit</button>',
            setup: () => ({ invalidParams }),
          },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    await wrapper.find('[data-test="emit-invalid"]').trigger('click');
    await wrapper.find('.btn-primary').trigger('click');
    await flushPromises();

    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.toastWarning).toHaveBeenCalledWith('validation.title_required');
  });

  it('does not update a project when required select values are missing', async () => {
    const invalidParams = new AddProjectParams({
      translations: new TranslationParams({
        title: { en: 'Project title' },
        description: { en: 'Project description' },
      }),
    });

    const wrapper = mount(ProjectEdit, {
      global: {
        stubs: {
          RadioButton: true,
          ProjectForm: {
            emits: ['updateData'],
            template:
              '<button data-test="emit-invalid" type="button" @click="$emit(\'updateData\', invalidParams)">emit</button>',
            setup: () => ({ invalidParams }),
          },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    await wrapper.find('[data-test="emit-invalid"]').trigger('click');
    await wrapper.find('.btn-primary').trigger('click');
    await flushPromises();

    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.toastWarning).toHaveBeenCalled();
  });
});
