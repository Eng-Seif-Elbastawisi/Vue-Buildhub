<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import DatePicker from 'primevue/datepicker';
  import Editor from 'primevue/editor';

  import TranslationParams from '@/base/Core/Params/translationParams';
  import type TitleInterface from '@/base/Data/Models/titleInterface';

  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import ProjectAttachmentManager, {
    type ProjectAttachmentItem,
  } from './ProjectAttachmentManager.vue';
  import ProjectTermGallery from './ProjectTermGallery.vue';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

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

  import TermController from '@/modules/MainOrganization/Term/presentation/controllers/term.controller';
  import IndexTermParams from '@/modules/MainOrganization/Term/core/params/index.term.params';
  import type TermModel from '@/modules/MainOrganization/Term/core/models/term.model';
  import { formatSelectedProjectTerms } from '../utils/project.term.formatter';

  const emit = defineEmits<{
    updateData: [params: AddProjectParams];
  }>();

  const props = defineProps<{
    Project?: ProjectShowModel;
    loading?: boolean;
    isEdit?: boolean;
  }>();

  const { t } = useI18n();

  /*
|--------------------------------------------------------------------------
| Controllers
|--------------------------------------------------------------------------
*/

  const clientSourceController = ClientSourceController.getInstance();
  const projectTypeController = ProjectTypeController.getInstance();
  const clientController = ClientController.getInstance();
  const termController = TermController.getInstance();
  const locationController = LocationController.getInstance();

  /*
|--------------------------------------------------------------------------
| Params
|--------------------------------------------------------------------------
*/

  const indexClientSourceParams = new IndexClientSourceParams('', 1, 100, 0);
  const indexProjectTypeParams = new IndexProjectTypeParams('', 1, 100, 0);
  const indexClientParams = new IndexClientParams('', 1, 100, 0);
  const indexTermParams = new IndexTermParams('', 1, 100, 0);

  const countryParams = new IndexLocationParams('', 1, 100, 0, null, LocationTypeEnum.COUNTRY);

  /*
|--------------------------------------------------------------------------
| Terms
|--------------------------------------------------------------------------
*/

  const termOptions = computed<TermModel[]>(() => {
    const termState = termController.listState.value as any;

    const data = termState?.data ?? termState?.value?.data ?? termState?.items ?? [];

    return Array.isArray(data) ? data : [];
  });

  /*
|--------------------------------------------------------------------------
| Options
|--------------------------------------------------------------------------
*/

  const clientExistOptions = computed<TitleInterface<number>[]>(() => [
    {
      id: 0,
      title: t('Project.client_new'),
    },
    {
      id: 1,
      title: t('Project.client_existing'),
    },
  ]);

  const serviceTypeOptions = computed<TitleInterface<number>[]>(() => [
    {
      id: ServiceType.EXECUTIONONLY,
      title: t('Project.service_types.executionOnly'),
    },
    {
      id: ServiceType.DESIGNONLY,
      title: t('Project.service_types.designOnly'),
    },
    {
      id: ServiceType.BOTH,
      title: t('Project.service_types.both'),
    },
  ]);

  /*
|--------------------------------------------------------------------------
| Form state
|--------------------------------------------------------------------------
*/

  const titleTranslations = ref<Record<string, string>>({});
  const descriptionTranslations = ref<Record<string, string>>({});

  const client_exist = ref<boolean | null>(null);

  const selectedClientExist = ref<TitleInterface<number> | null>(null);

  const selectedClient = ref<TitleInterface<number> | null>(null);

  const selectedClientSource = ref<TitleInterface<number> | null>(null);

  const selectedProjectType = ref<TitleInterface<number> | null>(null);

  const selectedServiceType = ref<TitleInterface<number> | null>(null);

  const selectedTerm = ref<TitleInterface<number>[]>([]);

  const selectedCountry = ref<TitleInterface<number> | null>(null);

  const selectedGovernorate = ref<TitleInterface<number> | null>(null);

  const selectedCity = ref<TitleInterface<number> | null>(null);

  const client_name = ref<string>('');
  const client_phone = ref<string>('');

  const date = ref<string>('');
  const selectedDate = ref<Date | null>(null);

  const notes = ref<string>('');

  /*
|--------------------------------------------------------------------------
| IMPORTANT:
| This now contains HTML because PrimeVue Editor is a rich text editor.
|--------------------------------------------------------------------------
*/

  const termsText = ref<string>('');

  /*
|--------------------------------------------------------------------------
| Attachments
|--------------------------------------------------------------------------
*/

  const filesItems = ref<ProjectAttachmentItem[]>([]);

  /*
|--------------------------------------------------------------------------
| Validation anchors
|--------------------------------------------------------------------------
*/

  const validationFieldAnchors: Record<string, string> = {
    translations: 'project-title-field',
    project_type_id: 'project-type-field',
    client_exist: 'client-type-field',
    client_id: 'client-field',
    client_name: 'client-name-field',
    client_phone: 'client-phone-field',
    client_source: 'client-source-field',
    location_id: 'city-field',
    service_type: 'service-type-field',
    date: 'date-field',
    terms: 'terms-field',
    attachments: 'attachments-field',
  };

  const scrollToValidationField = (field: string): void => {
    const targetId = validationFieldAnchors[field];

    if (!targetId) return;

    document.getElementById(targetId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  defineExpose({
    scrollToValidationField,
  });

  /*
|--------------------------------------------------------------------------
| Date helpers
|--------------------------------------------------------------------------
*/

  type PrimeDateValue = Date | Date[] | (Date | null)[] | null | undefined;

  const normalizeDateValue = (value: PrimeDateValue): Date | null => {
    if (!value) return null;

    if (Array.isArray(value)) {
      return value.find((dateValue): dateValue is Date => dateValue instanceof Date) ?? null;
    }

    return value;
  };

  const formatDateForApi = (value: Date | null): string => {
    if (!value) return '';

    const year = value.getFullYear();

    const month = String(value.getMonth() + 1).padStart(2, '0');

    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const parseApiDate = (value?: string | null): Date | null => {
    if (!value) return null;

    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());

    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (!year || !month || !day) {
      return null;
    }

    const result = new Date(year, month - 1, day);

    if (
      result.getFullYear() !== year ||
      result.getMonth() !== month - 1 ||
      result.getDate() !== day
    ) {
      return null;
    }

    return result;
  };

  const updateDate = (value: PrimeDateValue) => {
    const dateValue = normalizeDateValue(value);

    selectedDate.value = dateValue;
    date.value = formatDateForApi(dateValue);

    updateData();
  };

  /*
|--------------------------------------------------------------------------
| Location
|--------------------------------------------------------------------------
*/

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

  const isGovernorateDisabled = computed<boolean>(() => {
    return !selectedCountry.value?.id;
  });

  const isCityDisabled = computed<boolean>(() => {
    return !selectedGovernorate.value?.id;
  });

  /*
|--------------------------------------------------------------------------
| Generic helpers
|--------------------------------------------------------------------------
*/

  const getClientExistOption = (value: boolean) => {
    return clientExistOptions.value.find((option) => option.id === (value ? 1 : 0)) ?? null;
  };

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

  /*
|--------------------------------------------------------------------------
| Attachments
|--------------------------------------------------------------------------
*/

  const mapAttachmentItems = (items: ProjectAttachmentItem[]): ProjectAttachmentParams[] =>
    items.map((attachment) => ({
      file: attachment.file,
      attachment_type_id: attachment.typeId,
      alt: attachment.alt,
      link: attachment.link,
      name: attachment.name,
      size: attachment.size,
    }));

  /*
|--------------------------------------------------------------------------
| Main update
|--------------------------------------------------------------------------
*/

  const updateData = () => {
    emit(
      'updateData',
      new AddProjectParams({
        translations: new TranslationParams({
          title: titleTranslations.value,
          description: descriptionTranslations.value,
        }),

        client_exist:
          props.isEdit || selectedClientExist.value === null
            ? undefined
            : Boolean(client_exist.value),

        client_id:
          !props.isEdit && selectedClientExist.value && client_exist.value
            ? selectedClient.value?.id
              ? Number(selectedClient.value.id)
              : undefined
            : undefined,

        client_name:
          !props.isEdit && selectedClientExist.value && client_exist.value === false
            ? client_name.value
            : undefined,

        client_phone:
          !props.isEdit && selectedClientExist.value && client_exist.value === false
            ? client_phone.value
            : undefined,

        client_source:
          !props.isEdit && selectedClientExist.value && client_exist.value === false
            ? selectedClientSource.value?.id
              ? Number(selectedClientSource.value.id)
              : undefined
            : undefined,

        project_type_id: selectedProjectType.value?.id
          ? Number(selectedProjectType.value.id)
          : undefined,

        location_id: selectedCity.value?.id ? Number(selectedCity.value.id) : undefined,

        service_type: selectedServiceType.value?.id as ServiceType | undefined,

        attachments: filesItems.value.length ? mapAttachmentItems(filesItems.value) : undefined,

        notes: notes.value,

        date: date.value,

        /*
         * Rich HTML from PrimeVue Editor
         */
        terms: termsText.value,
      }),
    );
  };

  /*
|--------------------------------------------------------------------------
| Title / description
|--------------------------------------------------------------------------
*/

  const updateTitleTranslations = (value: Record<string, string>) => {
    titleTranslations.value = value;
    updateData();
  };

  const updateDescriptionTranslations = (value: Record<string, string>) => {
    descriptionTranslations.value = value;

    updateData();
  };

  /*
|--------------------------------------------------------------------------
| Client
|--------------------------------------------------------------------------
*/

  const updateClientExist = (value: TitleInterface<number> | null) => {
    selectedClientExist.value = value;

    if (!value) {
      client_exist.value = null;
      selectedClient.value = null;
      selectedClientSource.value = null;
      client_name.value = '';
      client_phone.value = '';

      updateData();

      return;
    }

    client_exist.value = value.id === 1;

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

  /*
|--------------------------------------------------------------------------
| Project type
|--------------------------------------------------------------------------
*/

  const updateProjectType = (value: TitleInterface<number> | null) => {
    selectedProjectType.value = value;

    updateData();
  };

  /*
|--------------------------------------------------------------------------
| Service type
|--------------------------------------------------------------------------
*/

  const updateServiceType = (value: TitleInterface<number> | null) => {
    selectedServiceType.value = value;

    updateData();
  };

  /*
|--------------------------------------------------------------------------
| Location
|--------------------------------------------------------------------------
*/

  const updateCountry = (value: TitleInterface<number> | null) => {
    selectedCountry.value = value;

    selectedGovernorate.value = null;

    selectedCity.value = null;

    updateData();
  };

  const updateGovernorate = (value: TitleInterface<number> | null) => {
    if (!selectedCountry.value?.id) {
      selectedGovernorate.value = null;

      selectedCity.value = null;

      updateData();

      return;
    }

    selectedGovernorate.value = value;

    selectedCity.value = null;

    updateData();
  };

  const updateCity = (value: TitleInterface<number> | null) => {
    if (!selectedGovernorate.value?.id) {
      selectedCity.value = null;

      updateData();

      return;
    }

    selectedCity.value = value;

    updateData();
  };

  /*
|--------------------------------------------------------------------------
| Attachments
|--------------------------------------------------------------------------
*/

  const updateAttachmentItems = (items: ProjectAttachmentItem[]) => {
    filesItems.value = items;

    updateData();
  };

  /*
|--------------------------------------------------------------------------
| Terms
|--------------------------------------------------------------------------
|
| Every selected term becomes:
|
| Term title
| Term description
|
| Then two <br> tags before the next term.
|
|--------------------------------------------------------------------------
*/

  const updateTerms = (value: TitleInterface<number>[] | TitleInterface<number> | null) => {
    if (!value) {
      selectedTerm.value = [];
      termsText.value = '';

      updateData();

      return;
    }

    const selectedValues = Array.isArray(value) ? value : [value];

    selectedTerm.value = selectedValues.map((term) => ({
      id: Number(term.id),
      title: term.title,
    }));

    termsText.value = formatSelectedProjectTerms(selectedValues, termOptions.value);

    updateData();
  };

  /*
|--------------------------------------------------------------------------
| Project watcher
|--------------------------------------------------------------------------
*/

  watch(
    () => props.Project,
    (Project) => {
      if (!Project) {
        selectedClientExist.value = null;

        client_exist.value = null;

        selectedClient.value = null;

        selectedClientSource.value = null;

        client_name.value = '';
        client_phone.value = '';

        date.value = '';
        selectedDate.value = null;

        notes.value = '';

        termsText.value = '';

        selectedTerm.value = [];

        filesItems.value = [];

        updateData();

        return;
      }

      const projectData = Project as any;

      /*
       * Translations
       */
      titleTranslations.value = {
        ...(projectData.translations?.title ?? {}),
      };

      descriptionTranslations.value = {
        ...(projectData.translations?.description ?? {}),
      };

      /*
       * Client
       */
      client_exist.value = projectData.client_exist ?? Boolean(projectData.client);

      selectedClientExist.value = getClientExistOption(Boolean(client_exist.value));

      client_name.value = projectData.client_name ?? '';

      client_phone.value = projectData.client_phone ?? '';

      /*
       * Date
       */
      date.value = projectData.date ?? '';

      selectedDate.value = parseApiDate(projectData.date);

      /*
       * Notes
       */
      notes.value = projectData.notes ?? '';

      /*
       * Terms
       *
       * Keep HTML if API already returns
       * rich text.
       */
      termsText.value = typeof projectData.terms === 'string' ? projectData.terms : '';

      /*
       * Attachments
       */
      if (Array.isArray(projectData.attachments)) {
        filesItems.value = projectData.attachments.map((att: any) => ({
          file: att.file,

          name:
            att.name || (typeof att.file === 'string' ? att.file.split('/').pop() : 'Attachment'),

          typeId: att.attachment_type_id || att.attachment_type?.id,

          typeName: att.attachment_type?.name || att.attachment_type?.title,

          alt: att.alt,
          link: att.link,
        }));
      } else {
        filesItems.value = [];
      }

      /*
       * Client
       */
      selectedClient.value = projectData.client
        ? {
            id: projectData.client.id,
            title: getTitle(projectData.client),
          }
        : null;

      /*
       * Client source
       */
      selectedClientSource.value = projectData.client_source
        ? {
            id: projectData.client_source.id,

            title: getTitle(projectData.client_source),
          }
        : null;

      /*
       * Project type
       */
      selectedProjectType.value = projectData.project_type
        ? {
            id: projectData.project_type.id,

            title: getTitle(projectData.project_type),
          }
        : null;

      /*
       * Service type
       */
      selectedServiceType.value = projectData.service_type
        ? (serviceTypeOptions.value.find((item) => item.id === projectData.service_type) ?? null)
        : null;

      /*
       * City
       */
      selectedCity.value = projectData.location
        ? {
            id: projectData.location.id,

            title: getTitle(projectData.location),
          }
        : null;

      /*
       * Governorate
       */
      selectedGovernorate.value = projectData.location?.parent
        ? {
            id: projectData.location.parent.id,

            title: getTitle(projectData.location.parent),
          }
        : null;

      /*
       * Country
       */
      selectedCountry.value = projectData.location?.parent?.parent
        ? {
            id: projectData.location.parent.parent.id,

            title: getTitle(projectData.location.parent.parent),
          }
        : null;

      updateData();
    },
    {
      immediate: true,
    },
  );
</script>

<template>
  <div class="Project-form-card project-form-page">
    <header class="project-form-heading">
      <span class="project-form-heading__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M7 3h8l4 4v14H7z" />
          <path d="M15 3v5h4M10 12h6M10 16h6" />
        </svg>
      </span>

      <span class="project-form-heading__copy">
        <h3>{{ $t('Project.form_title') }}</h3>
        <p>{{ $t('Project.form_description') }}</p>
      </span>
    </header>

    <div class="form-fields" :class="{ disabled: loading }">
      <!-- ========================================================= -->
      <!-- REQUEST -->
      <!-- ========================================================= -->

      <section class="form-section form-section--request">
        <div class="form-section__grid form-section__grid--two">
          <div class="project-form-title-date-row">
            <!-- TITLE -->

            <div id="project-title-field" class="field-group">
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

            <!-- DATE -->

            <div id="date-field" class="field-group">
              <span class="field-help-label-row field-help-label-row--block">
                <label class="field-label" for="date">
                  <span class="required-indicator" aria-hidden="true"> * </span>

                  {{ $t('date') }}
                </label>

                <FieldHelpIcon :label="$t('date')" field-name="date" field-id="date" />
              </span>

              <DatePicker
                input-id="date"
                :model-value="selectedDate"
                date-format="yy-mm-dd"
                show-icon
                icon-display="input"
                :manual-input="false"
                :placeholder="$t('date_placeholder')"
                input-class="field-input"
                class="date-picker"
                required
                aria-required="true"
                @update:model-value="updateDate"
              />
            </div>
          </div>

          <!-- PROJECT TYPE -->
          <div class="project-form-title-date-row">
            <div id="project-type-field" class="field-group">
              <UpdatedCustomInputSelect
                id="project_type_id"
                :model-value="selectedProjectType"
                :label="$t('project_type_id')"
                :controller="projectTypeController"
                :placeholder="$t('project_type_id_placeholder')"
                :params="indexProjectTypeParams"
                required
                @update:model-value="updateProjectType"
              />
            </div>

            <!-- CLIENT TYPE -->

            <template v-if="!isEdit">
              <div id="client-type-field" class="field-group">
                <UpdatedCustomInputSelect
                  id="client_exist"
                  :model-value="selectedClientExist"
                  :label="$t('client_type')"
                  :static-options="clientExistOptions"
                  :placeholder="$t('Project.client_exist_placeholder')"
                  required
                  @update:model-value="updateClientExist"
                />
              </div>

              <!-- EXISTING CLIENT -->

              <div v-if="selectedClientExist && client_exist" id="client-field" class="field-group">
                <UpdatedCustomInputSelect
                  id="client_id"
                  :model-value="selectedClient"
                  :label="$t('client_id')"
                  :controller="clientController"
                  :placeholder="$t('client_id_placeholder')"
                  :params="indexClientParams"
                  required
                  @update:model-value="updateClient"
                />
              </div>

              <!-- NEW CLIENT -->

              <template v-if="selectedClientExist && client_exist === false">
                <!-- CLIENT NAME -->

                <div id="client-name-field" class="field-group">
                  <span class="field-help-label-row field-help-label-row--block">
                    <label class="field-label" for="client_name">
                      <span class="required-indicator" aria-hidden="true"> * </span>

                      {{ $t('client_name') }}
                    </label>

                    <FieldHelpIcon
                      :label="$t('client_name')"
                      field-name="name"
                      field-id="client_name"
                    />
                  </span>

                  <input
                    id="client_name"
                    v-model="client_name"
                    class="field-input"
                    :placeholder="$t('client_name_placeholder')"
                    required
                    aria-required="true"
                    autocomplete="name"
                    @input="updateData"
                  />
                </div>

                <!-- CLIENT PHONE -->

                <div id="client-phone-field" class="field-group">
                  <span class="field-help-label-row field-help-label-row--block">
                    <label class="field-label" for="client_phone">
                      <span class="required-indicator" aria-hidden="true"> * </span>

                      {{ $t('client_phone') }}
                    </label>

                    <FieldHelpIcon
                      :label="$t('client_phone')"
                      field-name="phone"
                      field-id="client_phone"
                    />
                  </span>

                  <input
                    id="client_phone"
                    v-model="client_phone"
                    class="field-input"
                    type="tel"
                    inputmode="tel"
                    autocomplete="tel"
                    :placeholder="$t('client_phone_placeholder')"
                    required
                    aria-required="true"
                    @input="updateData"
                  />
                </div>

                <!-- CLIENT SOURCE -->

                <div id="client-source-field" class="field-group">
                  <UpdatedCustomInputSelect
                    id="client_source"
                    :model-value="selectedClientSource"
                    :label="$t('client_source')"
                    :controller="clientSourceController"
                    :placeholder="$t('client_source_placeholder')"
                    :params="indexClientSourceParams"
                    required
                    @update:model-value="updateClientSource"
                  />
                </div>
              </template>
            </template>
          </div>
        </div>
      </section>

      <!-- ========================================================= -->
      <!-- LOCATION -->
      <!-- ========================================================= -->

      <section class="form-section form-section--location">
        <header class="form-section__header">
          <span class="form-section__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>

          <span>
            <h4>{{ $t('location') }}</h4>
            <p>
              {{ $t('location.form_description') }}
            </p>
          </span>
        </header>

        <div class="form-section__grid form-section__grid--three">
          <!-- COUNTRY -->

          <div id="country-field" class="field-group">
            <UpdatedCustomInputSelect
              id="country_id"
              :model-value="selectedCountry"
              :label="$t('location.country')"
              :controller="locationController"
              :placeholder="$t('location.country_placeholder')"
              :params="countryParams"
              required
              @update:model-value="updateCountry"
            />
          </div>

          <!-- GOVERNORATE -->

          <div id="governorate-field" class="field-group">
            <UpdatedCustomInputSelect
              id="governorate_id"
              :model-value="selectedGovernorate"
              :label="$t('location.governorate')"
              :controller="locationController"
              :placeholder="
                isGovernorateDisabled
                  ? $t('location.select_country_first')
                  : $t('location.governorate_placeholder')
              "
              :params="governorateParams"
              :disabled="isGovernorateDisabled"
              :readonly="isGovernorateDisabled"
              required
              @click.prevent="isGovernorateDisabled ? undefined : null"
              @update:model-value="updateGovernorate"
            />
          </div>

          <!-- CITY -->

          <div id="city-field" class="field-group">
            <UpdatedCustomInputSelect
              id="city_id"
              :model-value="selectedCity"
              :label="$t('location.city')"
              :controller="locationController"
              :placeholder="
                isCityDisabled
                  ? $t('location.select_governorate_first')
                  : $t('location.city_placeholder')
              "
              :params="cityParams"
              :disabled="isCityDisabled"
              :readonly="isCityDisabled"
              required
              @click.prevent="isCityDisabled ? undefined : null"
              @update:model-value="updateCity"
            />
          </div>
        </div>
      </section>

      <!-- ========================================================= -->
      <!-- TERMS -->
      <!-- ========================================================= -->

      <section class="form-section form-section--terms">
        <header class="form-section__header">
          <span class="form-section__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M7 3h10a2 2 0 0 1 2 2v16l-7-3-7 3V5a2 2 0 0 1 2-2Z" />
              <path d="M9 8h6M9 12h6" />
            </svg>
          </span>

          <span>
            <h4>{{ $t('terms') }}</h4>
            <p>
              {{ $t('terms_placeholder') }}
            </p>
          </span>
        </header>

        <div class="form-section__grid form-section__grid--terms">
          <!-- TERM SELECT -->

          <div id="term-field" class="field-group">
            <UpdatedCustomInputSelect
              id="term_id"
              :model-value="selectedTerm"
              :label="$t('term')"
              :controller="termController"
              :placeholder="$t('term_placeholder')"
              :params="indexTermParams"
              :type="2"
              @update:model-value="updateTerms"
            />

            <ProjectTermGallery
              :model-value="selectedTerm"
              :options="termOptions"
              @update:model-value="updateTerms"
            />
          </div>

          <!-- TERMS EDITOR -->

          <div id="terms-field" class="field-group">
            <span class="field-help-label-row field-help-label-row--block">
              <label class="field-label" for="terms">
                <span class="required-indicator" aria-hidden="true"> * </span>

                {{ $t('terms') }}
              </label>

              <FieldHelpIcon :label="$t('terms')" field-name="terms" field-id="terms" />
            </span>

            <Editor
              v-model="termsText"
              editor-style="min-height: 180px"
              class="terms-editor"
              @update:model-value="updateData"
            />
          </div>
        </div>
      </section>

      <!-- ========================================================= -->
      <!-- SERVICE TYPE -->
      <!-- ========================================================= -->

      <section id="service-type-field" class="form-section form-section--service">
        <header class="form-section__header">
          <span class="form-section__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 3 4 7v10l8 4 8-4V7z" />
              <path d="m4 7 8 4 8-4M12 11v10" />
            </svg>
          </span>

          <span>
            <h4>{{ $t('service_type') }}</h4>
          </span>
        </header>

        <div class="field-group">
          <span class="field-help-label-row field-help-label-row--block">
            <label class="field-label">
              <span class="required-indicator" aria-hidden="true"> * </span>

              {{ $t('service_type') }}
            </label>

            <FieldHelpIcon :label="$t('service_type')" field-name="type" field-id="service_type" />
          </span>

          <div class="service-tabs">
            <button
              v-for="option in serviceTypeOptions"
              :key="option.id"
              type="button"
              class="service-tab"
              :class="{
                active: selectedServiceType?.id === option.id,
              }"
              :aria-pressed="selectedServiceType?.id === option.id"
              @click="updateServiceType(option)"
            >
              <span class="service-tab__icon" aria-hidden="true">
                <svg
                  v-if="option.id === ServiceType.EXECUTIONONLY"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <path d="m14 7 3-3 3 3-3 3M5 19l8-8M4 20l3-1-2-2z" />
                </svg>

                <svg
                  v-else-if="option.id === ServiceType.DESIGNONLY"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <path d="M4 20h16M6 16 16 6l2 2L8 18H6zM13 7l2 2" />
                </svg>

                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <path d="M4 20V9l8-5 8 5v11M9 20v-5h6v5M8 10h8" />
                </svg>
              </span>

              <span class="service-tab__title">
                {{ option.title }}
              </span>

              <span class="service-tab__check" aria-hidden="true"> ✓ </span>
            </button>
          </div>
        </div>
      </section>

      <!-- ========================================================= -->
      <!-- DESCRIPTION -->
      <!-- ========================================================= -->

      <section id="description-field" class="form-section form-section--description">
        <header class="form-section__header">
          <span class="form-section__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" />
            </svg>
          </span>

          <span>
            <h4>{{ $t('description') }}</h4>
          </span>
        </header>

        <div class="field-group">
          <MultiLangInput
            field-key="description"
            :label="$t('description')"
            :languages="['ar', 'en']"
            :model-value="descriptionTranslations"
            type="description"
            @update:model-value="updateDescriptionTranslations"
          />
        </div>
      </section>

      <!-- ========================================================= -->
      <!-- NOTES -->
      <!-- ========================================================= -->

      <section id="notes-field" class="form-section form-section--notes">
        <header class="form-section__header">
          <span class="form-section__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M4 5h16v12H8l-4 4zM8 9h8M8 13h5" />
            </svg>
          </span>

          <span>
            <h4>{{ $t('notes') }}</h4>
            <p>
              {{ $t('notes_placeholder') }}
            </p>
          </span>
        </header>

        <div class="field-group">
          <span class="field-help-label-row field-help-label-row--block">
            <label class="field-label" for="notes">
              {{ $t('notes') }}
            </label>

            <FieldHelpIcon :label="$t('notes')" field-name="notes" field-id="notes" />
          </span>

          <textarea
            id="notes"
            v-model="notes"
            class="field-input field-textarea"
            :placeholder="$t('notes_placeholder')"
            @input="updateData"
          />
        </div>
      </section>

      <!-- ========================================================= -->
      <!-- ATTACHMENTS -->
      <!-- ========================================================= -->

      <section id="attachments-field" class="form-section form-section--attachments">
        <ProjectAttachmentManager v-model="filesItems" @change="updateAttachmentItems" />
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .Project-form-card {
    display: flex;
    flex-direction: column;
    gap: var(--page-section-gap);
  }

  .project-form-heading {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding-inline: 0.25rem;
  }

  .project-form-heading__icon,
  .form-section__icon {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border: 1px solid var(--PrimaryColor-alpha-20);
    border-radius: var(--radius-md);
    background: var(--PrimaryColor-alpha-8);
    color: var(--PrimaryColor);

    svg {
      width: 1.35rem;
      height: 1.35rem;
    }
  }

  .project-form-heading__icon {
    width: 2.75rem;
    height: 2.75rem;
  }

  .project-form-heading__copy {
    display: grid;
    min-width: 0;
    gap: 0.2rem;

    h3,
    p {
      margin: 0;
    }

    h3 {
      color: var(--gray-900);
      font-family: 'Bold';
      font-size: var(--xl-size-base);
      line-height: 1.35;
    }

    p {
      color: var(--gray-500);
      font-size: var(--sm-size);
      line-height: 1.5;
    }
  }

  .form-fields {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1rem;
    align-items: end;

    &.disabled {
      pointer-events: none;
      opacity: 0.7;
    }
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    min-width: 0;
    padding: var(--surface-padding);
    border: 1px solid var(--border-weak);
    border-radius: var(--card-radius);
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
  }

  .form-section__header {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding-block-end: 0.95rem;
    border-block-end: 1px solid var(--gray-200-alpha-50);

    > span:last-child {
      display: grid;
      min-width: 0;
      gap: 0.15rem;
    }

    h4,
    p {
      margin: 0;
    }

    h4 {
      color: var(--gray-900);
      font-family: 'Bold';
      font-size: var(--md-size);
      line-height: 1.4;
    }

    p {
      color: var(--gray-500);
      font-size: var(--xs-size);
      line-height: 1.55;
    }
  }

  .form-section__icon {
    width: 2.35rem;
    height: 2.35rem;
    border-radius: var(--radius-sm);
  }

  .form-section__grid {
    display: grid;
    gap: 1rem;
    align-items: start;
  }

  .form-section__grid--two,
  .form-section__grid--terms {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .form-section__grid--three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .project-form-title-date-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
    gap: 1rem;

    > .field-group {
      min-width: 0;
    }

    #date-field > .field-help-label-row,
    :deep(.multi-lang-input .header-input) {
      display: flex;
      min-height: 2.25rem;
      align-items: center;
      gap: 0.5rem;
      margin-block-end: 0;
    }

    :deep(.multi-lang-input) {
      min-width: 0;
      gap: 0.5rem;
    }

    :deep(.multi-lang-input .header-input) {
      justify-content: space-between;
    }

    :deep(.multi-lang-input .field-label) {
      color: var(--gray-700);
      font-family: 'Medium';
      font-size: var(--sm-size);
    }

    :deep(.multi-lang-input .lang-switcher) {
      flex: 0 0 auto;
      margin-inline-start: auto;
    }

    :deep(.multi-lang-input .field-input--text),
    :deep(.p-datepicker-input) {
      height: 3rem;
      min-height: 3rem;
    }
  }

  .form-section--request::before {
    width: 2.5rem;
    height: 0.2rem;
    border-radius: var(--radius-full);
    background: var(--PrimaryColor);
    content: '';
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
  }

  .field-label {
    font-family: 'Medium';
    font-size: var(--sm-size);
    color: var(--gray-700);
  }

  .required-indicator {
    color: var(--danger);
  }

  .field-input {
    width: 100%;
    min-height: var(--control-height);
    padding: 0.7rem 0.9rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--control-radius);
    background: var(--white);
    outline: none;
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast),
      background-color var(--transition-fast);
    font-family: 'Medium';
    font-weight: 400;
    font-size: var(--sm-size);
    color: var(--gray-800);
  }

  .field-input:focus {
    border-color: var(--PrimaryColor);
    box-shadow: var(--focus-ring);
  }

  .field-textarea {
    min-height: 7rem;
    resize: vertical;
    line-height: 1.65;
  }

  .date-picker {
    width: 100%;
  }

  :deep(.p-datepicker-input) {
    width: 100%;
    min-height: var(--control-height);
    padding: 0.7rem 0.9rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--control-radius);
    background: var(--white);
    outline: none;
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
    font-family: 'Medium';
    font-weight: 400;
    font-size: var(--sm-size);
    color: var(--gray-800);
  }

  :deep(.p-datepicker-input:focus) {
    border-color: var(--PrimaryColor);
    box-shadow: var(--focus-ring);
  }

  :deep(.p-datepicker-input-icon-container) {
    color: var(--gray-500);
  }

  :deep(.input-select),
  :deep(.multi-lang-input .field-input) {
    min-height: var(--control-height);
    border-radius: var(--control-radius);
    background: var(--white);
  }

  :deep(.input-select:not(.p-disabled):hover),
  :deep(.multi-lang-input .field-input:hover) {
    border-color: var(--border-strong);
  }

  :deep(.input-select:not(.p-disabled).p-focus),
  :deep(.multi-lang-input .field-input:focus) {
    border-color: var(--PrimaryColor);
    box-shadow: var(--focus-ring);
  }

  :deep(.multi-lang-input .field-input--textarea) {
    min-height: 7rem;
    height: auto;
    border-radius: var(--control-radius);
    resize: vertical;
  }

  :deep(.multi-lang-input .header-input) {
    margin-block-end: 0.5rem;
  }

  :deep(.multi-lang-input .lang-switcher) {
    border-color: var(--border-weak);
    background: var(--gray-50);
  }

  :deep(.multi-lang-input .lang-btn.active) {
    background: var(--PrimaryColor);
    color: var(--standard-white);
  }

  /*
|--------------------------------------------------------------------------
| PrimeVue Editor
|--------------------------------------------------------------------------
*/

  .terms-editor {
    width: 100%;
  }

  :deep(.terms-editor .p-editor-container) {
    border: 1px solid var(--border-weak);
    border-radius: 18px;
    overflow: hidden;
    background: var(--white);
    transition: border-color 0.25s ease;
  }

  :deep(.terms-editor .p-editor-container:focus-within) {
    border-color: var(--PrimaryColor);
  }

  :deep(.terms-editor .p-editor-toolbar) {
    border: 0;
    border-bottom: 1px solid var(--border-weak);
    background: var(--white);
  }

  :deep(.terms-editor .p-editor-content) {
    border: 0;
    background: var(--white);
  }

  :deep(.terms-editor .ql-editor) {
    min-height: 180px;
    padding: 16px;
    font-family: 'Medium';
    font-size: var(--sm-size);
    color: var(--bread-crumb-color-span);
    line-height: 1.7;
  }

  :deep(.terms-editor .ql-editor p) {
    margin: 0 0 0.75rem;
  }

  :deep(.terms-editor .ql-editor strong) {
    font-family: 'Medium';
    color: var(--gray-7);
  }

  .service-tabs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .service-tab {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.75rem;
    min-height: 4.5rem;
    padding: 0.9rem 1rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--white);
    cursor: pointer;
    font-family: 'Medium';
    font-size: var(--sm-size);
    color: var(--gray-700);
    text-align: start;
    transition:
      color var(--transition-fast),
      border-color var(--transition-fast),
      background-color var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast);

    &:hover {
      border-color: var(--PrimaryColor);
      background: var(--PrimaryColor-alpha-4);
      transform: translateY(-1px);
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    &.active {
      border-color: var(--PrimaryColor);
      background: var(--PrimaryColor-alpha-8);
      color: var(--PrimaryColor);
      box-shadow: 0 0 0 1px var(--PrimaryColor);

      .service-tab__icon {
        background: var(--PrimaryColor);
        color: var(--standard-white);
      }

      .service-tab__check {
        opacity: 1;
        transform: scale(1);
      }
    }
  }

  .service-tab__icon {
    display: grid;
    flex: 0 0 auto;
    width: 2.25rem;
    height: 2.25rem;
    place-items: center;
    border-radius: var(--radius-sm);
    background: var(--gray-100);
    color: var(--gray-600);
    transition:
      color var(--transition-fast),
      background-color var(--transition-fast);

    svg {
      width: 1.2rem;
      height: 1.2rem;
    }
  }

  .service-tab__title {
    min-width: 0;
    line-height: 1.4;
  }

  .service-tab__check {
    display: grid;
    width: 1.25rem;
    height: 1.25rem;
    margin-inline-start: auto;
    place-items: center;
    border-radius: var(--radius-full);
    background: var(--PrimaryColor);
    color: var(--standard-white);
    font-size: var(--xs-size);
    opacity: 0;
    transform: scale(0.7);
    transition:
      opacity var(--transition-fast),
      transform var(--transition-fast);
  }

  .form-section--attachments :deep(.project-attachments-section) {
    gap: 1.15rem;
  }

  .form-section--attachments :deep(.section-title h4) {
    color: var(--gray-900);
    font-family: 'Bold';
    font-size: var(--md-size);
  }

  .form-section--attachments :deep(.attachment-controls-card) {
    align-items: flex-end;
    padding: 1rem;
    border: 1px dashed var(--border-strong);
    border-radius: var(--radius-md);
    background: var(--gray-50);
  }

  .form-section--attachments :deep(.upload-dropzone) {
    min-height: 4.25rem;
    height: auto;
    border-radius: var(--control-radius);
    background: var(--white);
  }

  .form-section--attachments :deep(.attachment-card) {
    border-width: 1px;
    border-color: var(--border-weak);
    border-radius: var(--radius-md);
  }

  .form-section--attachments :deep(.attachment-type-select .input-select) {
    min-height: var(--control-height);
  }

  .form-section--attachments :deep(.add-btn) {
    border-radius: var(--control-radius);
  }

  .dependent-field-hint {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    color: var(--gray-5);
    font-family: 'Medium';
    font-size: var(--xs-size);
    line-height: 1.5;

    i {
      flex: 0 0 auto;
      font-size: 0.8rem;
    }
  }

  @media (max-width: 1024px) {
    .form-section__grid--three {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .service-tabs {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 768px) {
    .project-form-title-date-row {
      grid-template-columns: minmax(0, 1fr);

      :deep(.multi-lang-input .header-input) {
        align-items: flex-start;
        flex-direction: column;
      }

      :deep(.multi-lang-input .lang-switcher) {
        margin-inline-start: 0;
      }
    }

    .form-section__grid--two,
    .form-section__grid--three,
    .form-section__grid--terms,
    .service-tabs {
      grid-template-columns: 1fr;
    }

    .form-section {
      padding: 1rem;
    }

    .form-section--attachments :deep(.attachment-controls-card) {
      align-items: stretch;
      flex-direction: column-reverse;
    }

    .form-section--attachments :deep(.add-btn) {
      width: 100%;
      border-radius: var(--control-radius);
    }
  }

  @media (max-width: 480px) {
    .project-form-heading {
      align-items: flex-start;
    }

    .project-form-heading__icon {
      width: 2.4rem;
      height: 2.4rem;
    }

    .form-section__header {
      gap: 0.6rem;
    }

    .form-section--attachments :deep(.attachment-card) {
      align-items: flex-start;
      flex-wrap: wrap;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .field-input,
    .service-tab,
    .service-tab__icon,
    .service-tab__check,
    :deep(.p-datepicker-input) {
      transition: none;
    }
  }
</style>
