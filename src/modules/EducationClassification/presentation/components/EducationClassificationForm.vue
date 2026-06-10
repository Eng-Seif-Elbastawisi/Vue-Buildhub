<script setup lang="ts">
  import { ref } from 'vue';
  // import { onBeforeRouteLeave } from 'vue-router';
  // import { useFormsStore } from '@/stores/formsStore';
  // import type EducationClassificationModel from '../../core/models/education.classification.model';
  import AddEducationClassificationParams from '../../core/params/add.educationClassification.params';
  import FolderCrudIcon from '@/shared/icons/FolderCrudIcon.vue';
  import TranslationParams from '@/modules/about/core/params/translation.params';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import FilterDialog from '@/shared/HelpersComponents/FilterDialog/FilterDialog.vue';
  import DatePicker from 'primevue/datepicker';
  import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
  import LoadingIcon from '@/assets/images/loading.webp';

  const emit = defineEmits(['updateData', 'save-education-classification']);

  const { loading } = defineProps<{
    // country?: EducationClassificationModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const title = ref<Record<string, string>>({});
  const date = ref<Date | null>(null);

  // watch(
  //   () => country,
  //   (newCountry) => {
  //     if (newCountry) {
  //       console.log(newCountry, 'new');
  //       // title.value = newCountry.title as any;
  //     }
  //   },
  //   { immediate: true },
  // );

  const updateData = () => {
    const params = new AddEducationClassificationParams({
      translation: new TranslationParams({
        title: title.value,
      }),
    });

    emit('updateData', params);
  };

  const getTitle = (data: any) => {
    title.value = data;
    updateData();
  };
  // fillter
  const FilterDialogShow = ref<boolean>(false);
  const ApplayFilter = () => {
    FilterDialogShow.value = false;
  };
  const CloseFiletrDialog = () => {
    FilterDialogShow.value = false;
  };

  const SendRequest = () => {
    // console.log(title.value, 'Object.keys(title.value).length');
    if (loading) {
      return;
    } else if (Object.keys(title.value).length === 0) {
      dialogManager.toastWarning('title is required');
    } else {
      emit('save-education-classification');
      title.value = {} as Record<string, string>;
      updateData();
    }
  };
</script>

<template>
  <div class="education-classification-form-card">
    <!-- ── Card Header ───────────────────────────────────── -->
    <header class="education-classification-form-header">
      <div class="header-text">
        <FolderCrudIcon />
        <h3>
          {{ $t(' Add education classification') }}
        </h3>
      </div>
      <FilterDialog v-model="FilterDialogShow">
        <template #content>
          <div class="date-remove">
            <h6>{{ $t('date of remove') }}</h6>
            <DatePicker v-model="date" class="date-model" :placeholder="$t('Date Remove')" />
          </div>
          <div class="filter-action">
            <button class="btn btn-cancel" @click="CloseFiletrDialog">{{ $t('Reset') }}</button>
            <button class="btn btn-primary" @click="ApplayFilter">{{ $t('apply') }}</button>
          </div>
        </template>
      </FilterDialog>
    </header>

    <!-- ── Fields ────────────────────────────────────────── -->
    <div class="education-classification-form-fields">
      <div class="field-group" :class="{ disabled: loading }">
        <MultiLangInput
          :field-key="`title`"
          :label="$t(`education classification`)"
          :languages="['en', 'ar']"
          :model-value="title"
          :type="`title`"
          @update:model-value="getTitle"
        />
      </div>
      <button class="save-btn" :class="{ disabled: loading }" @click="SendRequest">
        <img
          v-if="loading"
          :src="LoadingIcon"
          class="loader-skills"
          alt="loading"
          width="30"
          height="30"
        /> 
        <span v-else> {{ $t('save') }} <IconAccept /> </span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .field-group {
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.5;
    }
  }
  .save-btn {
    margin-top: 40px;
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.5;
    }
  }
</style>
