import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import MultiLangInput from '../MultiLangInput.vue';
import multiLangInputSource from '../MultiLangInput.vue?raw';

const longPlaceholder =
  'A long multilingual placeholder that must remain clear of the language badge';
const longContent = {
  en: 'A long English value that must remain clear of the language badge',
  ar: 'قيمة عربية طويلة يجب ألا تتداخل مع شارة اللغة داخل الحقل',
};

const fieldLayout = {
  ltr: {
    paddingLeft: '16px',
    paddingRight: '50px',
    textAlign: 'left',
    badgeLeft: 'auto',
    badgeRight: '12px',
  },
  rtl: {
    paddingLeft: '50px',
    paddingRight: '16px',
    textAlign: 'right',
    badgeLeft: '12px',
    badgeRight: 'auto',
  },
} as const;

const directionCases = [
  { applicationDirection: 'ltr', fieldLanguage: 'en', fieldDirection: 'ltr' },
  { applicationDirection: 'ltr', fieldLanguage: 'ar', fieldDirection: 'rtl' },
  { applicationDirection: 'rtl', fieldLanguage: 'en', fieldDirection: 'ltr' },
  { applicationDirection: 'rtl', fieldLanguage: 'ar', fieldDirection: 'rtl' },
] as const;

const controlCases = directionCases.flatMap(
  (directionCase) =>
    [
      { ...directionCase, fieldType: 'title', fieldSelector: 'input' },
      { ...directionCase, fieldType: 'description', fieldSelector: 'textarea' },
    ] as const,
);

const installFieldStyles = () => {
  const scopedStyleMatch = multiLangInputSource.match(/<style scoped>([\s\S]*?)<\/style>/);
  if (!scopedStyleMatch) throw new Error('MultiLangInput scoped styles were not found');

  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .main-content .field-group :where(input, textarea, .field-input) {
      padding: 10px 13px !important;
    }
    .multi-lang-input .active-indicator {
      inset-inline-end: 12px;
    }
    ${scopedStyleMatch[1]}
  `;
  document.head.append(styleElement);
  return styleElement;
};

const createFieldGroup = () => {
  const mainContent = document.createElement('div');
  const fieldGroup = document.createElement('div');
  mainContent.className = 'main-content';
  fieldGroup.className = 'field-group';
  mainContent.append(fieldGroup);
  document.body.append(mainContent);
  return fieldGroup;
};

let fieldStyles: HTMLStyleElement;

beforeAll(() => {
  fieldStyles = installFieldStyles();
});

afterAll(() => {
  fieldStyles.remove();
});

afterEach(() => {
  document.documentElement.removeAttribute('dir');
  document.body.innerHTML = '';
});

describe('MultiLangInput language direction', () => {
  it.each(controlCases)(
    '$fieldSelector uses $fieldLanguage direction when the application is $applicationDirection',
    async ({ applicationDirection, fieldLanguage, fieldDirection, fieldType, fieldSelector }) => {
      document.documentElement.dir = applicationDirection;

      const wrapper = mount(MultiLangInput, {
        attachTo: createFieldGroup(),
        props: {
          fieldKey: fieldType,
          languages: ['en', 'ar'],
          placeholder: longPlaceholder,
          type: fieldType,
        },
      });

      expect(wrapper.findAll('.lang-btn').map((button) => button.text())).toEqual(['EN', 'AR']);

      if (fieldLanguage === 'ar') {
        await wrapper.get('.lang-btn:last-child').trigger('click');
      }

      const field = wrapper.get<HTMLInputElement | HTMLTextAreaElement>(fieldSelector);
      const badge = wrapper.get<HTMLElement>('.active-indicator');
      const expectedLayout = fieldLayout[fieldDirection];
      const fieldStyle = getComputedStyle(field.element);
      const badgeStyle = getComputedStyle(badge.element);

      expect(wrapper.get('.input-wrap').classes()).toContain(`input-wrap--${fieldDirection}`);
      expect(field.attributes('dir')).toBe(fieldDirection);
      expect(fieldStyle.textAlign).toBe(expectedLayout.textAlign);
      expect(fieldStyle.paddingLeft).toBe(expectedLayout.paddingLeft);
      expect(fieldStyle.paddingRight).toBe(expectedLayout.paddingRight);
      expect(badgeStyle.left).toBe(expectedLayout.badgeLeft);
      expect(badgeStyle.right).toBe(expectedLayout.badgeRight);
      expect(field.attributes('placeholder')).toBe(longPlaceholder);
      expect(field.element.value).toBe('');
      expect(badge.text()).toBe(fieldLanguage.toUpperCase());

      field.element.focus();
      expect(document.activeElement).toBe(field.element);

      await field.setValue(longContent[fieldLanguage]);

      expect(field.element.value).toBe(longContent[fieldLanguage]);
      expect(wrapper.findAll('.lang-btn').map((button) => button.text())).toEqual(['EN', 'AR']);

      wrapper.unmount();
    },
  );
});
