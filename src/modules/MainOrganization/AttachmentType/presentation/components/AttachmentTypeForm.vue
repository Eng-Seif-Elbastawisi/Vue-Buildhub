<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import MultiLangInput from '@/shared/MultiLangInput.vue';
import TranslationParams from '@/base/Core/Params/translationParams';
import type AttachmentTypeShowModel from '../../core/models/attachment.type.show.model';
import AddAttachmentTypeParams from '../../core/params/add.attachment.type.params';
import EditAttachmentTypeParams from '../../core/params/edit.attachment.type.params';

const emit = defineEmits<{
  updateData: [params: AddAttachmentTypeParams | EditAttachmentTypeParams];
}>();

const props = defineProps<{
  attachmentType?: AttachmentTypeShowModel;
  loading?: boolean;
  isEdit?: boolean;
}>();

const { t } = useI18n();

const titleTranslations = ref<Record<string, string>>({});

const updateData = () => {
  const translations = new TranslationParams({
    title: titleTranslations.value,
  });

  console.log(translations.title, props.isEdit);

  if (props.isEdit && props.attachmentType?.id) {
    emit(
      'updateData',
      new EditAttachmentTypeParams({
        id: props.attachmentType.id,
        translations
      }),
    );
  } else {
    emit(
      'updateData',
      new AddAttachmentTypeParams({
        translations,
      }),
    );
  }
};

const updateTitleTranslations = (value: Record<string, string>) => {
  titleTranslations.value = value;
  updateData();
};

watch(
  () => props.attachmentType,
  (item) => {
    if (!item) {
      titleTranslations.value = {};
      updateData();
      return;
    }

    titleTranslations.value = {
      ...(item.translations?.title ?? {}),
    };

    updateData();
  },
  { immediate: true },
);
</script>

<template>
  <StandardFormLayout class="attachment-type-form-card">
    <header>
      <h3>
        {{ isEdit ? $t('attachment_type.edit_title') : $t('attachment_type.add_title') }}
      </h3>
      <p>
        {{
          isEdit ? $t('attachment_type.edit_description') : $t('attachment_type.add_description')
        }}
      </p>
    </header>

    <div class="form-fields" :class="{ disabled: loading }">
      <div id="attachment-type-title-field" class="field-group">
        <MultiLangInput
          field-key="title"
          :label="$t('title')"
          :languages="['ar', 'en']"
          :model-value="titleTranslations"
          type="title"
          required
          @update:model-value="updateTitleTranslations"
        />
      </div>
    </div>
  </StandardFormLayout>
</template>

<style scoped lang="scss">
.attachment-type-form-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

header p {
  color: var(--gray-5);
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &.disabled {
    pointer-events: none;
    opacity: 0.7;
  }
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
