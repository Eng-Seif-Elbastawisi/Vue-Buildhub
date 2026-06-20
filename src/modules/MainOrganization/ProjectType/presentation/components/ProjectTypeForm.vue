<script setup lang="ts">
  import { ref, watch } from 'vue';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import type ProjectTypeShowModel from '../../core/models/project-type.show.model';
  import AddProjectTypeParams from '../../core/params/add.project-type.params';
  import { ProjectType } from '../../core/constant/project-type.enum';

  const emit = defineEmits<{ updateData: [params: AddProjectTypeParams] }>();
  const props = defineProps<{ project?: ProjectTypeShowModel; loading?: boolean }>();
  const name = ref('');
  const projectType = ref<TitleInterface<string | number> | null>(null);
  const projectTypeOptions = Object.entries(ProjectType).map(([title, id]) => ({ id, title }));

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
      new AddProjectTypeParams({
        name: name.value,
        projectType: projectType.value?.id as
          | (typeof ProjectType)[keyof typeof ProjectType]
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
  .field-input {
    width: 100%;
    padding: 12px 16px;
    padding-right: 50px;
    border: 1px solid var(--border-weak);
    border-radius: 28px;
    background: var(--white);
    outline: none;
    transition: all 0.25s ease;
    font-family: 'Medium';
    font-weight: 400;
    font-size: var(--sm-size);
    color: var(--bread-crumb-color-span);
    max-height: 200px;
    max-width: 100%;
  }

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
