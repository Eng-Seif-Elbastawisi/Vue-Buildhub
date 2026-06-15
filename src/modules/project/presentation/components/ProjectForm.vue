<script setup lang="ts">
  import { ref, watch } from 'vue';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import type ProjectShowModel from '../../core/models/project.show.model';
  import AddProjectParams from '../../core/params/add.project.params';
  import { ProjectTypeEnum } from '../../core/constant/project.type.enum';

  const emit = defineEmits<{ updateData: [params: AddProjectParams] }>();
  const props = defineProps<{ project?: ProjectShowModel; loading?: boolean }>();
  const name = ref('');
  const projectType = ref<TitleInterface<string | number> | null>(null);
  const projectTypeOptions = Object.entries(ProjectTypeEnum).map(([title, id]) => ({ id, title }));

  watch(
    () => props.project,
    (project) => {
      if (!project) return;
      name.value = project.title;
      projectType.value =
        projectTypeOptions.find((option) => option.id === project.projectType) ?? null;
    },
    { immediate: true },
  );

  const updateData = () =>
    emit(
      'updateData',
      new AddProjectParams({
        name: name.value,
        projectType: projectType.value?.id as
          | (typeof ProjectTypeEnum)[keyof typeof ProjectTypeEnum]
          | undefined,
      }),
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
        <label class="field-label" for="project-name">{{ $t('project.name') }}</label>
        <div class="input-wrap">
          <input
            id="project-name"
            v-model="name"
            class="field-input"
            type="text"
            :placeholder="$t('project.name_placeholder')"
            @input="updateData"
          />
        </div>
      </div>
      <div class="field-group">
        <UpdatedCustomInputSelect
          id="project-type"
          v-model="projectType"
          :label="$t('project.type')"
          :placeholder="$t('project.type_placeholder')"
          :static-options="projectTypeOptions"
          required
          @update:model-value="updateData"
        />
      </div>
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
  }
  .form-fields.disabled {
    pointer-events: none;
    opacity: 0.7;
  }
  @media (max-width: 768px) {
    .form-fields {
      grid-template-columns: 1fr;
    }
  }
</style>
