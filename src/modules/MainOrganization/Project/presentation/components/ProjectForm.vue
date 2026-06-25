<script setup lang="ts">
  import { computed, ref, watch } from 'vue';

  import TranslationParams from '@/base/Core/Params/translationParams';

  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import { ServiceType } from '@/modules/MainOrganization/Project/core/constants/serviceType.enum';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';

  import type ProjectShowModel from '../../core/models/project.show.model';
  import AddProjectParams from '../../core/params/add.project.params';
  import IndexClientSourceParams from '@/modules/shared/ClientSource/core/params/index.client.source.params';
  import ClientSourceController from '@/modules/shared/ClientSource/presentation/controllers/client.source.controller';
  import LocationController from '@/modules/shared/location/presentation/controllers/location.controller';
  import IndexLocationParams from '@/modules/shared/location/core/params/index.location.params';
  import { LocationTypeEnum } from '@/modules/shared/location/core/constant/location.type.enum';
  import IndexClientParams from '@/modules/MainOrganization/client/core/params/index.client.params';
  import ClientController from '@/modules/MainOrganization/client/presentation/controllers/client.controller';
  import ProjectTypeController from '@/modules/shared/ProjectType/presentation/controllers/project-type.controller';
  import IndexProjectTypeParams from '@/modules/shared/ProjectType/core/params/index.project-type.params';
  import { useI18n } from 'vue-i18n';
  import type TitleInterface from '@/base/Data/Models/titleInterface';

  const emit = defineEmits<{
    updateData: [params: AddProjectParams];
  }>();

  const props = defineProps<{
    Project?: ProjectShowModel;
    loading?: boolean;
  }>();
  const { t } = useI18n();

  const clientSourceController = ClientSourceController.getInstance();
  const indexClientSourceParams = new IndexClientSourceParams('', 1, 100, 0);

  const projectTypeController = ProjectTypeController.getInstance();
  const indexProjectTypeParams = new IndexProjectTypeParams('', 1, 100, 0);

  const clientController = ClientController.getInstance();
  const indexClientParams = new IndexClientParams('', 1, 100, 0);

  const locationController = LocationController.getInstance();
  const indexLocationParams = new IndexLocationParams('', 1, 100, 0);
  const serviceTypeOptions = computed<TitleInterface<number>[]>(() => [
    { id: ServiceType.EXECUTIONONLY, title: t('Project.service_types.executionOnly') },
    { id: ServiceType.DESIGNONLY, title: t('Project.service_types.designOnly') },
    { id: ServiceType.BOTH, title: t('Project.service_types.both') },
  ]);

  const translations = ref<Record<string, string>>({});
  const client_exist = ref<boolean>(false);
  const client_id = ref<number>(0);
  const client_name = ref<string>('');
  const client_phone = ref<string>('');
  const client_source = ref<number>(0);
  const project_type_id = ref<number>(0);
  const location_id = ref<number>(0);
  const service_type = ref<ServiceType>(0);
  const date = ref<string>('');
  const notes = ref<string>('');
  const attachments = ref<string>('');
  const selectedServiceType = ref<TitleInterface<number> | null>(null);

  const updateData = () => {
    emit(
      'updateData',
      new AddProjectParams({
        translations: new TranslationParams({
          title: translations.value,
          description: translations.value,
          notes: translations.value,
        }),
        client_exist: client_exist.value,
        client_id: client_id.value,
        client_name: client_name.value,
        client_phone: client_phone.value,
        client_source: client_source.value,
        project_type_id: project_type_id.value,
        location_id: location_id.value,
        service_type: service_type.value,
        date: date.value,
        attachments: attachments.value,
      }),
    );
  };

  const updateTranslations = (value: Record<string, string>) => {
    translations.value = value;
    updateData();
  };

  watch(
    () => props.Project,
    (Project) => {
      if (!Project) return;

      translations.value = {
        ...(Project.translations?.title ?? {}),
      };

      updateData();
    },
    { immediate: true },
  );
  const updateServiceType = (value: TitleInterface<number> | null) => {
    service_type.value = value?.id as ServiceType;
    updateData();
  };
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
          :model-value="translations"
          type="title"
          @update:model-value="updateTranslations"
        />
      </div>
    </div>
    <div class="field-group">
      <UpdatedCustomInputSelect
        id="service_type"
        :model-value="selectedServiceType"
        :label="$t('service_type')"
        :placeholder="$t('service_type_placeholder')"
        :static-options="serviceTypeOptions"
        required
        @update:model-value="updateServiceType"
      />
    </div>
    <div class="field-group">
      <UpdatedCustomInputSelect
        id="service_type"
        v-model="service_type"
        :label="$t('service_type')"
        :static-options="serviceTypeOptions"
        :placeholder="$t('service_type_placeholder')"
        @update:model-value="updateServiceType"
      />
    </div>

    <div class="field-group">
      <UpdatedCustomInputSelect
        id="project_type_id"
        v-model="project_type_id"
        :label="$t('project_type_id')"
        :controller="projectTypeController"
        :placeholder="$t('project_type_id_placeholder')"
        :params="indexProjectTypeParams"
        @update:model-value="updateData"
      />
    </div>

    <div class="field-group">
      <UpdatedCustomInputSelect
        id="location_id"
        v-model="location_id"
        :label="$t('location_id')"
        :controller="locationController"
        :placeholder="$t('location_id_placeholder')"
        :params="indexLocationParams"
        @update:model-value="updateData"
      />
    </div>

    <div class="field-group">
      <UpdatedCustomInputSelect
        id="client_id"
        v-model="client_id"
        :label="$t('client_id')"
        :controller="clientController"
        :placeholder="$t('client_id_placeholder')"
        :params="indexClientParams"
        @update:model-value="updateData"
      />
    </div>

    <div class="field-group">
      <CustomDatePicker
        id="date"
        v-model="date"
        :label="$t('date')"
        :placeholder="$t('date_placeholder')"
        @update:model-value="updateData"
      />
    </div>

    <div class="field-group">
      <MultiLangInput
        field-key="notes"
        :label="$t('notes')"
        :languages="['ar', 'en']"
        :model-value="translations"
        type="notes"
        @update:model-value="updateTranslations"
      />
    </div>

    <div class="field-group">
      <CustomFileInput
        id="attachments"
        v-model="attachments"
        :label="$t('attachments')"
        :placeholder="$t('attachments_placeholder')"
        @update:model-value="updateData"
      />
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

  @media (max-width: 768px) {
    .form-fields {
      grid-template-columns: 1fr;
    }
  }
</style>
