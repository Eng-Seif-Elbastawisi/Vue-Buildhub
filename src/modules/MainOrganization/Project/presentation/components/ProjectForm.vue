<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  import TranslationParams from '@/base/Core/Params/translationParams';
  import type TitleInterface from '@/base/Data/Models/titleInterface';

  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import HandleFilesUpload, { type UploadedFile } from '@/shared/FormInputs/HandleFilesUpload.vue';

  import { ServiceType } from '@/modules/MainOrganization/Project/core/constants/serviceType.enum';

  import type ProjectShowModel from '../../core/models/project.show.model';
  import AddProjectParams, {
    type ProjectAttachmentParams,
  } from '../../core/params/add.project.params';

  import IndexClientSourceParams from '@/modules/shared/ClientSource/core/params/index.client.source.params';
  import ClientSourceController from '@/modules/shared/ClientSource/presentation/controllers/client.source.controller';

  import LocationController from '@/modules/shared/location/presentation/controllers/location.controller';
  import IndexLocationParams from '@/modules/shared/location/core/params/index.location.params';
  import { LocationTypeEnum } from '@/modules/shared/location/core/constant/location.type.enum';

  import IndexClientParams from '@/modules/MainOrganization/client/core/params/index.client.params';
  import ClientController from '@/modules/MainOrganization/client/presentation/controllers/client.controller';

  import ProjectTypeController from '@/modules/shared/ProjectType/presentation/controllers/project-type.controller';
  import IndexProjectTypeParams from '@/modules/shared/ProjectType/core/params/index.project-type.params';

  const emit = defineEmits<{
    updateData: [params: AddProjectParams];
  }>();

  const props = defineProps<{
    Project?: ProjectShowModel;
    loading?: boolean;
    isEdit?: boolean;
  }>();

  const { t } = useI18n();

  const clientSourceController = ClientSourceController.getInstance();
  const indexClientSourceParams = new IndexClientSourceParams('', 1, 100, 0);

  const projectTypeController = ProjectTypeController.getInstance();
  const indexProjectTypeParams = new IndexProjectTypeParams('', 1, 100, 0);

  const clientController = ClientController.getInstance();
  const indexClientParams = new IndexClientParams('', 1, 100, 0);

  const locationController = LocationController.getInstance();

  const countryParams = new IndexLocationParams('', 1, 100, 0, null, LocationTypeEnum.COUNTRY);

  const serviceTypeOptions = computed<TitleInterface<number>[]>(() => [
    { id: ServiceType.EXECUTIONONLY, title: t('Project.service_types.executionOnly') },
    { id: ServiceType.DESIGNONLY, title: t('Project.service_types.designOnly') },
    { id: ServiceType.BOTH, title: t('Project.service_types.both') },
  ]);

  const titleTranslations = ref<Record<string, string>>({});
  const descriptionTranslations = ref<Record<string, string>>({});

  const client_exist = ref<boolean>(false);

  const selectedClient = ref<TitleInterface<number> | null>(null);
  const selectedClientSource = ref<TitleInterface<number> | null>(null);
  const selectedProjectType = ref<TitleInterface<number> | null>(null);
  const selectedServiceType = ref<TitleInterface<number> | null>(null);

  const selectedCountry = ref<TitleInterface<number> | null>(null);
  const selectedGovernorate = ref<TitleInterface<number> | null>(null);
  const selectedCity = ref<TitleInterface<number> | null>(null);

  const client_name = ref<string>('');
  const client_phone = ref<string>('');
  const date = ref<string>('');
  const notes = ref<string>('');

  // دي الملفات الجديدة فقط اللي هتتبعت للـ backend
  const attachments = ref<ProjectAttachmentParams[]>([]);

  // دي الملفات القديمة للـ preview فقط ومش هتتبعت في update
  const existingAttachmentFiles = ref<string[]>([]);

  const attachmentFiles = computed(() => existingAttachmentFiles.value);

  const governorateParams = computed(() => {
    return new IndexLocationParams(
      '',
      1,
      100,
      0,
      null,
      LocationTypeEnum.GOVERNORATE,
      selectedCountry.value?.id ? Number(selectedCountry.value.id) : null,
    );
  });

  const cityParams = computed(() => {
    return new IndexLocationParams(
      '',
      1,
      100,
      0,
      null,
      LocationTypeEnum.CITY,
      selectedGovernorate.value?.id ? Number(selectedGovernorate.value.id) : null,
    );
  });

  const getTitle = (item: any): string => {
    if (!item) return '';

    if (item.name) {
      return item.name;
    }

    if (!item.title) return '';

    if (typeof item.title === 'string') {
      return item.title;
    }

    if (Array.isArray(item.title)) {
      return (
        item.title.find((titleItem: any) => titleItem.locale === 'en')?.title ||
        item.title[0]?.title ||
        ''
      );
    }

    return '';
  };

  const updateData = () => {
    emit(
      'updateData',
      new AddProjectParams({
        translations: new TranslationParams({
          title: titleTranslations.value,
          description: descriptionTranslations.value,
        }),

        client_exist: props.isEdit ? undefined : client_exist.value,

        client_id:
          client_exist.value || props.isEdit
            ? selectedClient.value?.id
              ? Number(selectedClient.value.id)
              : undefined
            : undefined,

        client_name: !props.isEdit && !client_exist.value ? client_name.value : undefined,

        client_phone: !props.isEdit && !client_exist.value ? client_phone.value : undefined,

        client_source:
          !props.isEdit && !client_exist.value
            ? selectedClientSource.value?.id
              ? Number(selectedClientSource.value.id)
              : undefined
            : undefined,

        project_type_id: selectedProjectType.value?.id
          ? Number(selectedProjectType.value.id)
          : undefined,

        location_id: selectedCity.value?.id ? Number(selectedCity.value.id) : undefined,

        service_type: selectedServiceType.value?.id as ServiceType | undefined,

        // لو مفيش ملفات جديدة، مش هنبعت attachments
        attachments: attachments.value.length ? attachments.value : undefined,
      }),
    );
  };

  const updateTitleTranslations = (value: Record<string, string>) => {
    titleTranslations.value = value;
    updateData();
  };

  const updateDescriptionTranslations = (value: Record<string, string>) => {
    descriptionTranslations.value = value;
    updateData();
  };

  const updateClientExist = () => {
    if (client_exist.value) {
      client_name.value = '';
      client_phone.value = '';
      selectedClientSource.value = null;
    } else {
      selectedClient.value = null;
    }

    updateData();
  };

  const updateClient = (value: TitleInterface<number> | null) => {
    selectedClient.value = value;
    updateData();
  };

  const updateClientSource = (value: TitleInterface<number> | null) => {
    selectedClientSource.value = value;
    updateData();
  };

  const updateProjectType = (value: TitleInterface<number> | null) => {
    selectedProjectType.value = value;
    updateData();
  };

  const updateServiceType = (value: TitleInterface<number> | null) => {
    selectedServiceType.value = value;
    updateData();
  };

  const updateCountry = (value: TitleInterface<number> | null) => {
    selectedCountry.value = value;
    selectedGovernorate.value = null;
    selectedCity.value = null;
    updateData();
  };

  const updateGovernorate = (value: TitleInterface<number> | null) => {
    selectedGovernorate.value = value;
    selectedCity.value = null;
    updateData();
  };

  const updateCity = (value: TitleInterface<number> | null) => {
    selectedCity.value = value;
    updateData();
  };

  const updateAttachments = (files: UploadedFile[]) => {
    // هنا بناخد الملفات الجديدة فقط
    // الملفات القديمة بتكون URL ومش base64، فمش هتتبعت
    attachments.value = files
      .filter((file) => file.base64 && file.base64.startsWith('data:'))
      .map((file) => ({
        file: file.base64,
      }));

    updateData();
  };

  watch(
    () => props.Project,
    (Project) => {
      if (!Project) return;

      const projectData = Project as any;

      titleTranslations.value = {
        ...(projectData.translations?.title ?? {}),
      };

      descriptionTranslations.value = {
        ...(projectData.translations?.description ?? {}),
      };

      client_exist.value = projectData.client_exist ?? Boolean(projectData.client);

      client_name.value = projectData.client_name ?? '';
      client_phone.value = projectData.client_phone ?? '';
      date.value = projectData.date ?? '';
      notes.value = projectData.notes ?? '';

      // القديم للعرض فقط
      existingAttachmentFiles.value = Array.isArray(projectData.attachments)
        ? projectData.attachments.map((attachment: any) => attachment.file).filter(Boolean)
        : [];

      // الجديد اللي هيتبعت يبدأ فاضي
      attachments.value = [];

      selectedClient.value = projectData.client
        ? {
            id: projectData.client.id,
            title: getTitle(projectData.client),
          }
        : null;

      selectedClientSource.value = projectData.client_source
        ? {
            id: projectData.client_source.id,
            title: getTitle(projectData.client_source),
          }
        : null;

      selectedProjectType.value = projectData.project_type
        ? {
            id: projectData.project_type.id,
            title: getTitle(projectData.project_type),
          }
        : null;

      selectedServiceType.value = projectData.service_type
        ? (serviceTypeOptions.value.find((item) => item.id === projectData.service_type) ?? null)
        : null;

      selectedCity.value = projectData.location
        ? {
            id: projectData.location.id,
            title: getTitle(projectData.location),
          }
        : null;

      selectedGovernorate.value = projectData.location?.parent
        ? {
            id: projectData.location.parent.id,
            title: getTitle(projectData.location.parent),
          }
        : null;

      selectedCountry.value = projectData.location?.parent?.parent
        ? {
            id: projectData.location.parent.parent.id,
            title: getTitle(projectData.location.parent.parent),
          }
        : null;

      updateData();
    },
    { immediate: true },
  );
</script>

<template>
  <div class="Project-form-card">
    <header>
      <h3>{{ $t('Project.form_title') }}</h3>
      <p>{{ $t('Project.form_description') }}</p>
    </header>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group">
        <MultiLangInput
          field-key="title"
          :label="$t('title')"
          :languages="['ar', 'en']"
          :model-value="titleTranslations"
          type="title"
          @update:model-value="updateTitleTranslations"
        />
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect
          id="project_type_id"
          :model-value="selectedProjectType"
          :label="$t('project_type_id')"
          :controller="projectTypeController"
          :placeholder="$t('project_type_id_placeholder')"
          :params="indexProjectTypeParams"
          @update:model-value="updateProjectType"
        />
      </div>

      <template v-if="!isEdit">
        <div class="field-group col-span-2">
          <label class="checkbox-field">
            <input v-model="client_exist" type="checkbox" @change="updateClientExist" />
            <span>{{ $t('Project.client_exist') }}</span>
          </label>
        </div>

        <div v-if="client_exist" class="field-group">
          <UpdatedCustomInputSelect
            id="client_id"
            :model-value="selectedClient"
            :label="$t('client_id')"
            :controller="clientController"
            :placeholder="$t('client_id_placeholder')"
            :params="indexClientParams"
            @update:model-value="updateClient"
          />
        </div>

        <template v-else>
          <div class="field-group">
            <label class="field-label" for="client_name">{{ $t('client_name') }}</label>
            <input
              id="client_name"
              v-model="client_name"
              class="field-input"
              :placeholder="$t('client_name_placeholder')"
              @input="updateData"
            />
          </div>

          <div class="field-group">
            <label class="field-label" for="client_phone">{{ $t('client_phone') }}</label>
            <input
              id="client_phone"
              v-model="client_phone"
              class="field-input"
              :placeholder="$t('client_phone_placeholder')"
              @input="updateData"
            />
          </div>

          <div class="field-group">
            <UpdatedCustomInputSelect
              id="client_source"
              :model-value="selectedClientSource"
              :label="$t('client_source')"
              :controller="clientSourceController"
              :placeholder="$t('client_source_placeholder')"
              :params="indexClientSourceParams"
              @update:model-value="updateClientSource"
            />
          </div>
        </template>
      </template>

      <div class="field-group">
        <UpdatedCustomInputSelect
          id="country_id"
          :model-value="selectedCountry"
          :label="$t('location.country')"
          :controller="locationController"
          :placeholder="$t('location.country_placeholder')"
          :params="countryParams"
          @update:model-value="updateCountry"
        />
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect
          id="governorate_id"
          :model-value="selectedGovernorate"
          :label="$t('location.governorate')"
          :controller="locationController"
          :placeholder="$t('location.governorate_placeholder')"
          :params="governorateParams"
          @update:model-value="updateGovernorate"
        />
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect
          id="city_id"
          :model-value="selectedCity"
          :label="$t('location.city')"
          :controller="locationController"
          :placeholder="$t('location.city_placeholder')"
          :params="cityParams"
          @update:model-value="updateCity"
        />
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect
          id="service_type"
          :model-value="selectedServiceType"
          :label="$t('service_type')"
          :static-options="serviceTypeOptions"
          :placeholder="$t('service_type_placeholder')"
          @update:model-value="updateServiceType"
        />
      </div>

      <div class="field-group">
        <label class="field-label" for="date">{{ $t('date') }}</label>
        <input
          id="date"
          v-model="date"
          class="field-input"
          type="date"
          :placeholder="$t('date_placeholder')"
          @input="updateData"
        />
      </div>

      <div class="field-group col-span-2">
        <MultiLangInput
          field-key="description"
          :label="$t('description')"
          :languages="['ar', 'en']"
          :model-value="descriptionTranslations"
          type="description"
          @update:model-value="updateDescriptionTranslations"
        />
      </div>

      <div class="field-group col-span-2">
        <label class="field-label" for="notes">{{ $t('notes') }}</label>
        <textarea
          id="notes"
          v-model="notes"
          class="field-input field-textarea"
          :placeholder="$t('notes_placeholder')"
          @input="updateData"
        />
      </div>

      <div class="field-group col-span-2">
        <HandleFilesUpload
          id="attachments"
          :label="$t('attachments')"
          :file="attachmentFiles"
          :multiple="true"
          @change="updateAttachments"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .Project-form-card {
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

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .field-label {
    font-family: 'Medium';
    font-size: var(--sm-size);
    color: var(--gray-6);
  }

  .field-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--border-weak);
    border-radius: 28px;
    background: var(--white);
    outline: none;
    transition: all 0.25s ease;
    font-family: 'Medium';
    font-weight: 400;
    font-size: var(--sm-size);
    color: var(--bread-crumb-color-span);
  }

  .field-textarea {
    min-height: 110px;
    resize: vertical;
    border-radius: 18px;
  }

  .checkbox-field {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    width: fit-content;
    cursor: pointer;
    font-family: 'Medium';
    font-size: var(--sm-size);
    color: var(--gray-6);
  }

  .checkbox-field input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .col-span-2 {
    grid-column: span 2;
  }

  @media (max-width: 768px) {
    .form-fields {
      grid-template-columns: 1fr;
    }

    .col-span-2 {
      grid-column: span 1;
    }
  }
</style>
