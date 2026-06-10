<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { useFormsStore } from '@/stores/formsStore';
  import type EducationClassificationModel from '../../core/models/education.classification.model';
  // import AddEducationClassificationParams from '../../core/params/add.educationClassification.params';
  import FolderCrudIcon from '@/shared/icons/FolderCrudIcon.vue';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import SingularPluralForm from '../../subComponent/SingularPluralForm.vue';
  import ConfigurationParams from '../../core/params/EducationConfiguration/Configuration.params';
  import AddEducationConfigurationParams from '../../core/params/EducationConfiguration/add.educationConfiguration.params';
  import TranslationParams from '../../core/params/translation.params';
  import AddEducationSubjectParams from '../../core/params/EducationSubjects/add.educationSubject.params';
  import EducationConfigurationController from '../controllers/educationConfiguration/education.configuration.controller';
  import EducationSubjectController from '../controllers/educationSubject/education.subject.controller';
  import type EducationConfigurationModel from '../../core/models/EducationConfiguration/education.configuration.model';
  import type EducationSubjectConfigurationModel from '../../core/models/EducationConfiguration/education.subject.configuration.model';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import IndexEducationConfigurationParams from '../../core/params/EducationConfiguration/index.educationConfiguration.params co';
  // import { mapLocales } from '@/base/Presentation/Utils/MapLocales';

  const emit = defineEmits([
    'updateData',
    'save-education-classification',
    'save-education-subjects',
  ]);
  const { country, formKey } = defineProps<{
    country?: EducationClassificationModel;
    formKey?: string;
    loading?: boolean;
  }>();
  const ConfigurationnumberOfBranchs = ref<number>(0);
  const SubjectnumberOfBranchs = ref<number>(0);

  const FormStore = useFormsStore();

  const title = ref<string>('');

  watch(
    () => country,
    (newCountry) => {
      if (newCountry) {
        title.value = newCountry.title;
      }
    },
    { immediate: true },
  );

  const updateData = () => {
    if (formKey) {
      FormStore.setFormData(formKey, {
        title: title.value,
      });
    }
    emit('updateData');
  };

  const resetForm = () => {
    title.value = '';
  };

  onMounted(() => {
    if (formKey) {
      const saved = FormStore.getFormData(formKey);

      if (saved) {
        title.value = saved.title;
        updateData();
      } else {
        resetForm();
      }
    } else {
      resetForm();
    }
  });

  const subject_title_Singular = ref<Record<string, string>>({});
  const subject_title_Plural = ref<Record<string, string>>({});

  const ConfigurationNumberOfBranchs = ref<number>(0);
  const subjectNumberOfBranchs = ref<number>(0);

  type Branch = { singular: Record<string, string>; plural: Record<string, string> };
  const configurationInitialBranches = ref<Branch[]>([]);
  const subjectInitialBranches = ref<Branch[]>([]);

  const ApplyConfigurationBranchs = () => {
    emit('save-education-classification');
    ConfigurationNumberOfBranchs.value = ConfigurationnumberOfBranchs.value;
  };
  const ApplySubjectBranchs = () => {
    emit('save-education-subjects');
    subjectNumberOfBranchs.value = SubjectnumberOfBranchs.value;
  };

  const Configurationloading = ref<boolean>(false);
  const GetConfigurationBranchs = async (branches: Branch[]) => {
    Configurationloading.value = true;
    const configurationBranches: ConfigurationParams[] = [];
    branches.forEach((branch, index) => {
      configurationBranches.push(
        new ConfigurationParams({
          levelNumber: index + 1,
          translation: new TranslationParams({
            SingularTitle: branch.singular,
            PluralTitle: branch.plural,
          }),
        }),
      );
    });
    const params = new AddEducationConfigurationParams({
      educationClassificatioId: Number(route.params.id),
      numberOfBranches: ConfigurationNumberOfBranchs.value,
      branches: configurationBranches,
    });
    const controller = EducationConfigurationController.getInstance();
    await controller.create(params);
    Configurationloading.value = false;
  };

  const subjectConfigurationloading = ref<boolean>(false);
  const GetSubjectBranchs = async (branches: Branch[]) => {
    subjectConfigurationloading.value = true;
    const configurationBranches: ConfigurationParams[] = [];
    branches.forEach((branch, index) => {
      configurationBranches.push(
        new ConfigurationParams({
          levelNumber: index + 1,
          translation: new TranslationParams({
            SingularTitle: branch.singular,
            PluralTitle: branch.plural,
          }),
        }),
      );
    });
    const params = new AddEducationSubjectParams({
      educationClassificatioId: Number(route.params.id),
      numberOfBranches: SubjectnumberOfBranchs.value,
      branches: configurationBranches,
      translation: new TranslationParams({
        SingularTitle: subject_title_Singular.value,
        PluralTitle: subject_title_Plural.value,
      }),
    });
    const controller = EducationSubjectController.getInstance();
    await controller.create(params);
    subjectConfigurationloading.value = false;
  };

  const fillConfigurationForm = (data: EducationConfigurationModel | undefined) => {
    if (!data) return;
    ConfigurationnumberOfBranchs.value = data.numberOfBranches;
    configurationInitialBranches.value = data.branches.map((branch) => ({
      singular: branch.singularTitle,
      plural: branch.pluralTitle,
    }));
    // Auto-apply only when existing data has branches — no click needed
    if (data.numberOfBranches > 0) {
      ConfigurationNumberOfBranchs.value = data.numberOfBranches;
    }
  };

  const fillSubjectForm = (data: EducationSubjectConfigurationModel | undefined) => {
    if (!data) return;
    SubjectnumberOfBranchs.value = data.numberOfBranches;
    subject_title_Singular.value = data.SingluarTitle;
    subject_title_Plural.value = data.pluralTitle;
    subjectInitialBranches.value = data.branches.map((branch) => ({
      singular: branch.singularTitle,
      plural: branch.pluralTitle,
    }));
    // Auto-apply only when existing data has branches — no click needed
    if (data.numberOfBranches > 0) {
      subjectNumberOfBranchs.value = data.numberOfBranches;
    }
  };

  const controller = EducationConfigurationController.getInstance();
  const subjectController = EducationSubjectController.getInstance();
  const route = useRoute();
  onMounted(async () => {
    const [configResult, subjectResult] = await Promise.all([
      // { education_classification_id: route.params.id }
      controller.fetchList(
        new IndexEducationConfigurationParams({
          educationClassificatioId: Number(route.params.id),
        }),
      ),
      subjectController.fetchList(
        new IndexEducationConfigurationParams({
          educationClassificatioId: Number(route.params.id),
        }),
      ),
    ]);

    if (configResult instanceof DataSuccess && configResult.data?.[0]) {
      fillConfigurationForm(configResult.data[0]);
    }

    if (subjectResult instanceof DataSuccess && subjectResult.data?.[0]) {
      fillSubjectForm(subjectResult.data[0]);
    }
  });
</script>

<template>
  <div class="education-classification-configuration-form-container">
    <div class="education-classification-form-card">
      <!-- ── Card Header ───────────────────────────────────── -->
      <header class="form-header">
        <div class="header-text">
          <FolderCrudIcon />
          <h3>
            {{ $t('configuration Basic education') }}
          </h3>
        </div>
      </header>

      <!-- ── Fields ────────────────────────────────────────── -->
      <div class="education-classification-form-fields">
        <!-- Email Field -->
        <div class="field-group" :class="{ disabled: Configurationloading }">
          <label class="field-label" for="title"> {{ $t('number_of_branchs') }} </label>
          <div class="input-wrap">
            <input
              id="title"
              v-model="ConfigurationnumberOfBranchs"
              type="number"
              :placeholder="$t('Enter number of branchs')"
              class="field-input"
              @input="updateData"
            />
          </div>
        </div>
        <button class="save-btn" @click="ApplyConfigurationBranchs">
          {{ $t('apply') }}
        </button>
      </div>

      <SingularPluralForm
        :number-of-branches="ConfigurationNumberOfBranchs"
        :label="$t('name_of_branch')"
        :initial-branches="configurationInitialBranches"
        :loading="Configurationloading"
        @update="GetConfigurationBranchs"
      />
    </div>
    <div class="education-classification-form-card">
      <!-- ── Card Header ───────────────────────────────────── -->
      <header class="form-header">
        <div class="header-text">
          <FolderCrudIcon />
          <h3>
            {{ $t('configuration subjects') }}
          </h3>
        </div>
      </header>

      <!-- ── Fields ────────────────────────────────────────── -->
      <div class="education-classification-form-fields">
        <!-- Email Field -->
        <div class="field-group" :class="{ disabled: subjectConfigurationloading }">
          <div class="input-wrap">
            <MultiLangInput
              :field-key="`title_Singular`"
              :label="$t(`subjects_name_(Singular)`)"
              :languages="['en', 'ar']"
              :model-value="subject_title_Singular"
              :type="`title`"
              @update:model-value="subject_title_Singular = $event"
            />
          </div>
        </div>
        <div class="field-group" :class="{ disabled: subjectConfigurationloading }">
          <div class="input-wrap">
            <MultiLangInput
              :field-key="`title_Plural`"
              :label="$t(`subjects_name_(Plural)`)"
              :languages="['en', 'ar']"
              :type="`title`"
              :model-value="subject_title_Plural"
              @update:model-value="subject_title_Plural = $event"
            />
          </div>
        </div>

        <div class="field-group" :class="{ disabled: subjectConfigurationloading }">
          <label class="field-label" for="subject_number"> {{ $t('num_of_levels') }} </label>
          <div class="input-wrap">
            <input
              id="subject_number"
              v-model="SubjectnumberOfBranchs"
              type="number"
              :placeholder="$t('num_of_levels')"
              class="field-input"
              @input="updateData"
            />
          </div>
        </div>

        <button class="save-btn" @click="ApplySubjectBranchs">
          {{ $t('apply') }}
        </button>
      </div>

      <SingularPluralForm
        :number-of-branches="subjectNumberOfBranchs"
        :label="$t('name_of_subjects')"
        :initial-branches="subjectInitialBranches"
        :loading="subjectConfigurationloading"
        @update="GetSubjectBranchs"
      />
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
