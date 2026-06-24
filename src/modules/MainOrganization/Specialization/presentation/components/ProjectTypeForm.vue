<script setup lang="ts">
import { ref, watch } from 'vue';

import TranslationParams from '@/base/Core/Params/translationParams';
import type TitleInterface from '@/base/Data/Models/titleInterface';

import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import MultiLangInput from '@/shared/MultiLangInput.vue';

import { ProjectType } from '../../core/constant/project-type.enum';
import type ProjectTypeShowModel from '../../core/models/project-type.show.model';
import AddProjectTypeParams from '../../core/params/add.project-type.params';

const emit = defineEmits<{
  updateData: [params: AddProjectTypeParams];
}>();

const props = defineProps<{
  project?: ProjectTypeShowModel;
  loading?: boolean;
}>();

const projectTypeOptions = Object.entries(ProjectType).map(([title, id]) => ({
  id,
  title,
}));

const translations = ref<Record<string, string>>({});
const projectType = ref<TitleInterface<string | number> | null>(null);

const updateData = () => {
  emit(
    'updateData',
    new AddProjectTypeParams({
      translations: new TranslationParams({
        title: translations.value,
      }),

      projectType: projectType.value?.id as
        | (typeof ProjectType)[keyof typeof ProjectType]
        | undefined,
    }),
  );
};

const updateTranslations = (value: Record<string, string>) => {
  translations.value = value;
  updateData();
};

watch(
  () => props.project,
  (project) => {
    if (!project) return;

    translations.value = {
      ...(project.translations?.title ?? {}),
    };

    projectType.value =
      projectTypeOptions.find(
        (option) => option.id === project.projectType,
      ) ?? null;

    updateData();
  },
  { immediate: true },
);
</script>

<template>
  <div class="project-form-card">
    <header>
      <h3>{{ $t('project.form_title') }}</h3>
      <p>{{ $t('project.form_description') }}</p>
    </header>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group">
        <MultiLangInput
          field-key="title"
          :label="$t('title')"
          :languages="['ar', 'en']"
          :model-value="translations"
          type="title"
          @update:model-value="updateTranslations"
        />
      </div>

      <!-- <div class="field-group">
        <UpdatedCustomInputSelect
          id="project-type"
          v-model="projectType"
          :label="$t('project.type')"
          :placeholder="$t('project.type_placeholder')"
          :static-options="projectTypeOptions"
          required
          @update:model-value="updateData"
        />
      </div> -->
    </div>
  </div>
</template>

<style scoped lang="scss">
.project-form-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

header p {
  color: var(--gray-5);
}

.form-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  align-items: end;

  &.disabled {
    pointer-events: none;
    opacity: 0.7;
  }
}

@media (max-width: 768px) {
  .form-fields {
    grid-template-columns: 1fr;
  }
}
</style>