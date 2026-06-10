
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AboutForm from '../AboutForm.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {}, params: {}, fullPath: '/about/edit' }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  createRouter: vi.fn(() => ({
    install: vi.fn(),
    push: vi.fn(),
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

vi.mock('@/shared/MultiLangInput.vue', () => ({
  default: {
    name: 'MultiLangInput',
    template: '<div />',
    props: ['fieldKey', 'label', 'languages', 'modelValue', 'type'],
    emits: ['update:modelValue'],
  },
}));

vi.mock('@/shared/FormInputs/HandleFilesUpload.vue', () => ({
  default: { name: 'HandleFilesUpload', template: '<div />' },
}));

vi.mock('@/shared/icons/UploadImage/UplaodImageInput.vue', () => ({
  default: { name: 'UplaodImageInput', template: '<div />' },
}));

vi.mock('@/shared/icons/SocialIcons/LinksIcon.vue', () => ({
  default: { name: 'LinksIcon', template: '<span />' },
}));

const mockAbout = {
  id: 1,
  translations: { title: { en: 'About', ar: 'عن' }, description: { en: 'Desc', ar: 'وصف' } },
  images: '',
  socailMedia: [],
};

describe('AboutForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    const wrapper = mount(AboutForm, {
      props: { formKey: 'test-key', about: mockAbout as any },
      global: {
        mocks: { $t: (k: string) => k },
        stubs: { Teleport: true, Transition: true },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
