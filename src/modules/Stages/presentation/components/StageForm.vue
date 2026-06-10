<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import { onBeforeRouteLeave, useRoute } from 'vue-router';
  import { useFormsStore } from '@/stores/formsStore';
  import type StageModel from '../../core/models/stage.model';

  import TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import { EducationType } from '../../core/constants/educationtype.enum';
  import AddStageParams from '../../core/params/add.stges.params';

  const emit = defineEmits(['updateData']);

  const { stage, formKey, loading } = defineProps<{
    stage?: StageModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const FormStore = useFormsStore();
  onBeforeRouteLeave((to, from) => {
    const savedData = FormStore.getFormData(formKey!);
    if (savedData && to.path !== from.path) {
      FormStore.showReturnWarning(formKey!);
    }
  });

  // Form state
  const title = ref<string>('');
  const educationType = ref<TitleInterface<EducationType>>(
    new TitleInterface({
      id: EducationType.General,
      title: 'General',
    }),
  );

  watch(
    () => stage,
    (newStage) => {
      if (newStage) {
        title.value = newStage.title;
        educationType.value = newStage.EducationType;
      }
    },
    { immediate: true },
  );

  const route = useRoute();

  const updateData = () => {
    FormStore.setFormData(formKey!, {
      title: title.value,
      EducationType: educationType.value,
    });
    const params = new AddStageParams({
      title: title.value,
      educationType: educationType.value.id as EducationType,
    });
    emit('updateData', params);
  };

  const resetForm = () => {
    title.value = '';
    educationType.value = new TitleInterface({
      id: EducationType.General,
      title: 'General',
    });
  };

  onMounted(() => {
    const saved = FormStore.getFormData(formKey!);
    if (saved) {
      title.value = saved.title;
      educationType.value = saved.EducationType;
      updateData();
    } else {
      resetForm();
    }
  });

  const EducationTypes = ref<TitleInterface<EducationType>[]>([
    new TitleInterface({
      id: EducationType.General,
      title: 'General',
    }),
    new TitleInterface({
      id: EducationType.Technical,
      title: 'Technical',
    }),
  ]);
</script>

<template>
  <div class="email-form-card">
    <!-- ── Card Header ───────────────────────────────────── -->
    <header class="form-header">
      <div class="header-text">
        <h3>{{ route.params.id ? 'Edit Country' : 'Add New Country' }}</h3>
        <p class="header-subtitle">
          {{
            route.params.id
              ? 'Update the country details below'
              : 'Fill in the country name, code and flag'
          }}
        </p>
      </div>
      <span v-if="route.params.id" class="edit-badge">Editing</span>
    </header>

    <!-- ── Divider ───────────────────────────────────────── -->
    <div class="form-divider" />

    <!-- ── Fields ────────────────────────────────────────── -->
    <div class="form-fields">
      <!-- Email Field -->
      <div class="field-group" :class="{ disabled: loading }">
        <label class="field-label" for="title"> Stage Title </label>
        <div class="input-wrap">
          <input
            id="title"
            v-model="title"
            type="text"
            placeholder="Stage Title"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group" :class="{ disabled: loading }">
        <!-- <label class="field-label" for="code"> Education Type </label> -->
        <div class="input-wrap">
          <UpdatedCustomInputSelect
            id="educationType"
            :label="`Education Type`"
            :static-options="EducationTypes"
            :model-value="educationType"
            placeholder="Education Type"
            @update:model-value="updateData"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .field-group {
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }
</style>
