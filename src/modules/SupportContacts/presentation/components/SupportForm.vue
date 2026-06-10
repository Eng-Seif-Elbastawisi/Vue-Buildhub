<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import AddSupportContactsParams from '../../core/params/add.support.params';
  import ContactsParams from '../../core/params/contacts.paras';
  import TranslationParams from '@/modules/about/core/params/translation.params';
  import type SupportContactsModel from '../../core/models/support.contatcts.model';
  import DeleteIcon from '@/shared/icons/Support/DeleteIcon.vue';
  import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
  import DeleteSectionIcon from '@/shared/icons/Support/DeleteSectionIcon.vue';
  import SupportContactsController from '../controllers/support.controller';
  import DeleteSupportContactParams from '../../core/params/delete.support.contacts.params';

  const { t } = useI18n();

  type SectionInputs = { phone: string; whatsApp: string; email: string; telegram: string };

  const VALIDATION_PATTERNS: Record<keyof SectionInputs, RegExp> = {
    phone: /^[+]?[0-9\s\-().]{7,20}$/,
    whatsApp: /^[+]?[0-9\s\-().]{7,20}$/,
    telegram: /^(?:[+]?[0-9\s\-().]{7,20}|https?:\/\/t\.me\/[\w]+)$/i,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  };

  const VALIDATION_WARNING_KEYS: Record<keyof SectionInputs, string> = {
    phone: 'invalid_phone_number_format',
    whatsApp: 'invalid_whatsapp_number_format',
    telegram: 'invalid_telegram_format',
    email: 'invalid_email_address_format',
  };

  type SectionState = {
    id: number;
    title: Record<string, string>;
    phonenumbers: string[];
    whatsAppNumebrs: string[];
    emails: string[];
    telegramNumbers: string[];
    inputs: SectionInputs;
  };

  const props = defineProps<{
    formKey?: string;
    initialSections?: SupportContactsModel[];
    loading?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'updateData', value: AddSupportContactsParams): void;
  }>();

  const createSection = (): SectionState => ({
    id: 0,
    title: {},
    phonenumbers: [],
    whatsAppNumebrs: [],
    emails: [],
    telegramNumbers: [],
    inputs: { phone: '', whatsApp: '', email: '', telegram: '' },
  });

  const sections = ref<SectionState[]>([createSection()]);

  const emitData = () => {
    const params = new AddSupportContactsParams({
      translations: new TranslationParams({
        title: sections.value.map((el) => el.title)[0],
      }),
      contacts: sections.value.flatMap((s) => [
        ...s.phonenumbers.map((num) => new ContactsParams({ key: 'phonenumbers', value: num })),
        ...s.whatsAppNumebrs.map(
          (num) => new ContactsParams({ key: 'whatsapp_numbers', value: num }),
        ),
        ...s.telegramNumbers.map(
          (num) => new ContactsParams({ key: 'telegram_numbers', value: num }),
        ),
        ...s.emails.map((email) => new ContactsParams({ key: 'emails', value: email })),
      ]),
    });
    emit('updateData', params);
  };

  const addSection = () => {
    sections.value.push(createSection());
    emitData();
  };

  const controller = SupportContactsController.getInstance();
  const removeSection = async (index: number) => {
    if (sections.value.length === 1) return;
    await controller.delete(new DeleteSupportContactParams(index));
    sections.value.splice(index, 1);
    emitData();
  };

  const addChip = (arr: string[], inputKey: keyof SectionInputs, section: SectionState) => {
    const val = section.inputs[inputKey].trim();
    if (!val) return;

    const pattern = VALIDATION_PATTERNS[inputKey];
    if (!pattern.test(val)) {
      dialogManager.toastWarning(t(VALIDATION_WARNING_KEYS[inputKey]), {
        title: t('invalid_input_warning_title'),
      });
      return;
    }

    arr.push(val);
    section.inputs[inputKey] = '';
    emitData();
  };

  const removeChip = (arr: string[], index: number) => {
    arr.splice(index, 1);
    emitData();
  };

  const sectionLabel = (index: number) => `Section ${String(index + 1).padStart(2, '0')}`;

  onMounted(() => {
    if (props.initialSections?.length) {
      sections.value = props.initialSections.map((s: any) => ({
        id: s.id!,
        title: s.titles ?? {},
        phonenumbers: [
          ...(s.supportContacts
            .filter((el: any) => el.key == 'phonenumbers')
            .map((item: any) => item.value) ?? []),
        ],
        whatsAppNumebrs: [
          ...(s.supportContacts
            .filter((el: any) => el.key == 'whatsapp_numbers')
            .map((item: any) => item.value) ?? []),
        ],
        emails: [
          ...(s.supportContacts
            .filter((el: any) => el.key == 'emails')
            .map((item: any) => item.value) ?? []),
        ],
        telegramNumbers: [
          ...(s.supportContacts
            .filter((el: any) => el.key == 'telegram_numbers')
            .map((item: any) => item.value) ?? []),
        ],

        inputs: { phone: '', whatsApp: '', email: '', telegram: '' },
      }));
    }
    emitData();
  });
</script>

<template>
  <div class="about-page" :class="{ disabled: props.loading }">
    <div class="header-container">
      <div class="about-header">
        <h2 class="title">{{ $t('support_contacts') }}</h2>
        <p class="description">{{ $t('support_contacts_description') }}</p>
      </div>
      <button class="btn btn-primary add-section-btn" type="button" @click="addSection">
        + {{ $t('add_new_support_section') }}
      </button>
    </div>

    <div class="sections-list">
      <div v-for="(section, sIdx) in sections" :key="sIdx" class="support-section-card">
        <div class="support-section-header">
          <span class="support-section-label">{{ sectionLabel(sIdx) }}</span>
          <button
            v-if="sections.length > 1"
            type="button"
            class="delete-section-btn"
            @click="removeSection(section.id)"
          >
            <DeleteSectionIcon />
          </button>
        </div>

        <div class="support-section-divider" />

        <div class="support-field-group">
          <MultiLangInput
            :field-key="`title-${sIdx}`"
            :label="$t('title_of_support_contact_details')"
            :languages="['en', 'ar']"
            :model-value="section.title"
            :type="`title`"
            @update:model-value="
              section.title = $event;
              emitData();
            "
          />
        </div>

        <!-- Phone Numbers -->
        <div class="contact-group">
          <label class="contact-label">{{ $t('Phone Number') }}</label>
          <div class="chip-input-row">
            <input
              v-model="section.inputs.phone"
              type="text"
              :placeholder="$t('Enter Your Phone Number')"
              class="contact-input"
              @keyup.enter="addChip(section.phonenumbers, 'phone', section)"
            />
            <button
              type="button"
              class="sm-add-btn"
              @click="addChip(section.phonenumbers, 'phone', section)"
            >
              +
            </button>
          </div>
          <div v-if="section.phonenumbers.length" class="chips-row">
            <span v-for="(num, i) in section.phonenumbers" :key="i" class="chip">
              {{ num }}
              <DeleteIcon @click="removeChip(section.phonenumbers, i)" />
            </span>
          </div>
        </div>

        <!-- WhatsApp Numbers -->
        <div class="contact-group">
          <label class="contact-label">{{ $t('whatsapp_number') }}</label>
          <div class="chip-input-row">
            <input
              v-model="section.inputs.whatsApp"
              type="text"
              :placeholder="$t('enter_your_whatsapp_number')"
              class="contact-input"
              @keyup.enter="addChip(section.whatsAppNumebrs, 'whatsApp', section)"
            />
            <button
              type="button"
              class="sm-add-btn"
              @click="addChip(section.whatsAppNumebrs, 'whatsApp', section)"
            >
              +
            </button>
          </div>
          <div v-if="section.whatsAppNumebrs.length" class="chips-row">
            <span v-for="(num, i) in section.whatsAppNumebrs" :key="i" class="chip">
              {{ num }}
              <DeleteIcon @click="removeChip(section.whatsAppNumebrs, i)" />
            </span>
          </div>
        </div>

        <!-- Email Addresses -->
        <div class="contact-group">
          <label class="contact-label">{{ $t('email_address') }}</label>
          <div class="chip-input-row">
            <input
              v-model="section.inputs.email"
              type="email"
              :placeholder="$t('enter_your_email_address')"
              class="contact-input"
              @keyup.enter="addChip(section.emails, 'email', section)"
            />
            <button
              type="button"
              class="sm-add-btn"
              @click="addChip(section.emails, 'email', section)"
            >
              +
            </button>
          </div>
          <div v-if="section.emails.length" class="chips-row">
            <span v-for="(em, i) in section.emails" :key="i" class="chip">
              {{ em }}
              <DeleteIcon @click="removeChip(section.emails, i)" />
            </span>
          </div>
        </div>

        <!-- Telegram -->
        <div class="contact-group">
          <label class="contact-label">{{ $t('telegram') }}</label>
          <div class="chip-input-row">
            <input
              v-model="section.inputs.telegram"
              type="text"
              :placeholder="$t('enter_your_telegram_link_or_number')"
              class="contact-input"
              @keyup.enter="addChip(section.telegramNumbers, 'telegram', section)"
            />
            <button
              type="button"
              class="sm-add-btn"
              @click="addChip(section.telegramNumbers, 'telegram', section)"
            >
              +
            </button>
          </div>
          <div v-if="section.telegramNumbers.length" class="chips-row">
            <span v-for="(tg, i) in section.telegramNumbers" :key="i" class="chip">
              {{ tg }}
              <DeleteIcon @click="removeChip(section.telegramNumbers, i)" />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .about-page {
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }
</style>
