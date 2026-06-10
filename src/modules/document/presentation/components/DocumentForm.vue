<script setup lang="ts">
  import { ref, watch, computed, onMounted } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import { useFormsStore } from '@/stores/formsStore';
  import AddDocumentParams from '../../core/params/add.document.params';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import DocumentIcon from '@/shared/icons/DocaumentType/DocumentIcon.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import IndexDocumentTypeParams from '../../core/params/documntType/index.document.type.params';
  import DocumentTypeController from '../controllers/DocumentType/document.type.controller';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import HandleFilesUpload, { type UploadedFile } from '@/shared/FormInputs/HandleFilesUpload.vue';
  import UplaodImageInput from '@/shared/icons/UploadImage/UplaodImageInput.vue';
  import FileIcon from '@/shared/icons/UploadImage/FileIcon.vue';
  import DocumentTranslationParams from '../../core/params/translation.params';
  import DeleteTagIcon from '@/shared/icons/DocaumentType/DeleteTagIcon.vue';
  import StageController from '@/modules/Stages/presentation/controllers/stage.controller';
  import type StageModel from '@/modules/Stages/core/models/stage.model';
  // import type BranchesModel from '@/modules/Stages/core/models/branches.model';
  import type DocumentShowModel from '../../core/models/document.show.model';
  import flattenBranchTree from '@/modules/document/core/TreeSelectHelper';
  const emit = defineEmits(['updateData']);

  const { document, formKey, loading } = defineProps<{
    document?: DocumentShowModel;
    formKey?: string;
    loading?: boolean;
  }>();
  const tag = ref<string>('');
  const tags = ref<string[]>([]);
  const FormStore = useFormsStore();

  onBeforeRouteLeave((to, from) => {
    const savedData = formKey ? FormStore.getFormData(formKey) : null;

    if (savedData && to.path !== from.path && formKey) {
      FormStore.showReturnWarning(formKey);
    }
  });

  const title = ref<Record<string, string>>({});
  const description = ref<Record<string, string>>({});
  const RefrenceNumber = ref<string>('');
  const selectedDocumentType = ref<TitleInterface<number> | null>(null);
  // const selectedBranch = ref<BranchesModel | null>(null);
  const selectedSubject = ref<TitleInterface<number> | null>(null);
  const allStages = ref<StageModel[]>([]);
  const indexDocumentTypeParams = new IndexDocumentTypeParams('', 1, 10, 0);
  const documentTypeController = DocumentTypeController.getInstance();
  const stageController = StageController.getInstance();
  const UploadedImage = ref<string>();
  const UploadedFiles = ref<string>();

  onMounted(async () => {
    await stageController.fetchList(indexDocumentTypeParams);
    allStages.value = (stageController.listData.value ?? []) as StageModel[];
  });

  const branchOptions = computed<TitleInterface<number>[]>(() => {
    return allStages.value.flatMap((stage: StageModel) => flattenBranchTree(stage.branches));
  });

  const selectedBranchTitle = ref<TitleInterface<number>>();
  watch(
    () => document,
    (newDoc) => {
      if (newDoc) {
        title.value = newDoc.translations.title;
        selectedDocumentType.value = newDoc.documentType;

        // ← فقط اضبط لو القيمة اتغيرت فعلاً
        if (UploadedImage.value !== newDoc.images) {
          UploadedImage.value = newDoc.images;
        }
        if (UploadedFiles.value !== newDoc.files) {
          UploadedFiles.value = newDoc.files;
        }

        RefrenceNumber.value = newDoc.RefNumber;
        selectedBranchTitle.value = new TitleInterface({
          id: newDoc.subject.id,
          title: `${newDoc.stage.title} → ${newDoc.subject.title}`,
          subtitle: newDoc.stage.id,
        });
        selectedSubject.value = new TitleInterface({
          id: newDoc.subject.id,
          title: newDoc.subject.title,
        });
        selectedDocumentType.value = new TitleInterface({
          id: newDoc.documentType.id,
          title: newDoc.documentType.title,
        });
        tags.value = newDoc.tags;
      }
    },
    { immediate: true },
  );

  const updateData = () => {
    const params = new AddDocumentParams({
      translations: new DocumentTranslationParams({
        description: description.value,
        title: title.value,
      }),
      documentTypeId: selectedDocumentType.value?.id || 0,
      stage_id: selectedBranchTitle.value?.subtitle || 0,
      subjects: selectedBranchTitle.value?.id || 0,
      files: UploadedFiles.value!,
      images: UploadedImage.value || '',
      refNumber: RefrenceNumber.value,
      tags: tags.value,
    });

    emit('updateData', params);
  };

  const handleBranchChange = (selected: TitleInterface<number> | undefined) => {
    selectedBranchTitle.value = selected;
    console.log(selected, 'selected');
    updateData();
  };

  // const handleImageChange = (files: UploadedFile[]) => {
  //   UploadedImage.value = files?.[0]?.base64;
  //   updateData();
  // };

  // const handleFilsChange = (files: UploadedFile[]) => {
  //   UploadedFiles.value = files?.[0]?.base64;
  //   updateData();
  // };

  const handleImageChange = (files: UploadedFile[]) => {
    if (files.length === 0) {
      UploadedImage.value = '';
    } else {
      // لو base64 موجود (رفع جديد) بعته، لو لأ بعت الـ URL (صورة من السيرفر)
      UploadedImage.value = files[0]?.base64 || files[0]?.url || '';
    }
    updateData();
  };

  const handleFilsChange = (files: UploadedFile[]) => {
    if (files.length === 0) {
      UploadedFiles.value = '';
    } else {
      UploadedFiles.value = files[0]?.base64 || files[0]?.url || '';
    }
    updateData();
  };

  const setTags = () => {
    if (tag.value.length > 0) {
      tags.value.push(tag.value);

      tag.value = '';
    }
  };

  const deletetag = (tagId: number) => {
    tags.value.splice(tagId, 1);
  };
</script>

<template>
  <div class="document-form-card">
    <div class="document-form-header">
      <DocumentIcon />

      <div class="document-form-header-text">
        <h4>{{ $t('add_document') }}</h4>

        <p>{{ $t('Upload your document and fill in its details') }}</p>
      </div>
    </div>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group">
        <MultiLangInput
          :field-key="`title`"
          :label="$t(`Document_name`)"
          :languages="['en', 'ar']"
          :model-value="title"
          :type="`title`"
          @update:model-value="
            title = $event;
            updateData();
          "
        />
      </div>

      <div
        class="field-group col-span-1 ref-number-group"
        :class="{ 'disabled-input': document?.RefNumber }"
      >
        <label class="field-label" for="doc-ref">{{ $t('Reference_Number') }}</label>

        <div class="input-wrap">
          <input
            id="doc-ref"
            v-model="RefrenceNumber"
            type="text"
            :placeholder="$t('enter_refrence_number')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group select-group col-span-2">
        <UpdatedCustomInputSelect
          id="documentType"
          :class="`field-input`"
          :label="`Document Type`"
          :params="indexDocumentTypeParams"
          :controller="documentTypeController as any"
          :model-value="selectedDocumentType"
          :relaod="false"
          :placeholder="$t('enter your document type')"
          @update:model-value="
            selectedDocumentType = $event;
            updateData();
          "
        />
      </div>

      <div class="field-group col-span-2">
        <UpdatedCustomInputSelect
          id="doc-branch"
          :label="`subject name`"
          :static-options="branchOptions"
          v-model="selectedBranchTitle"
          :placeholder="$t('Enter subject name')"
          :reload="true"
          @update:model-value="handleBranchChange($event)"
        />
      </div>

      <div class="field-group col-span-2">
        <MultiLangInput
          :field-key="`description`"
          :label="$t(`Description`)"
          :languages="['en', 'ar']"
          :model-value="description"
          :type="`description`"
          @update:model-value="
            description = $event;
            updateData();
          "
        />
      </div>

      <div class="field-group tags-group col-span-2">
        <label class="field-label" for="tag">{{ $t('Tag') }}</label>

        <div class="input-wrap input-tag-wrap">
          <input
            id="tags"
            v-model="tag"
            type="text"
            :placeholder="$t('Add Tag....')"
            class="field-input"
            @input="updateData"
          />

          <button class="btn btn-primary" @click="setTags">{{ $t('Add Tag') }}</button>
        </div>

        <div class="tags-container" :class="tags.length > 0 ? `border` : ``">
          <div v-for="(tagItem, tagIndex) in tags" :key="tagIndex" class="tag">
            <span>{{ tagItem }}</span>

            <DeleteTagIcon class="delete" @click="deletetag(tagIndex)" />
          </div>
        </div>
      </div>

      <div class="field-group col-span-2">
        <HandleFilesUpload
          :label="`upload image`"
          accept="image/*"
          :multiple="true"
          :index="1"
          :file="UploadedImage"
          :have-content="true"
          :class="`image-input`"
          @change="handleImageChange"
        >
          <template #content>
            <div class="add-imaegs-data">
              <UplaodImageInput />

              <p class="first-text">
                {{ $t('Click to upload') }} <span>{{ $t('or drag and drop') }}</span>
              </p>

              <p class="second-text">{{ $t('JPG, JPEG, PNG less than 1MB') }}</p>
            </div>
          </template>
        </HandleFilesUpload>
      </div>

      <div class="field-group col-span-2">
        <HandleFilesUpload
          :label="`upload document`"
          accept=".pdf"
          :multiple="true"
          :index="2"
          :file="UploadedFiles"
          :have-content="true"
          :class="`image-input`"
          @change="handleFilsChange"
        >
          <template #content>
            <div class="add-imaegs-data">
              <FileIcon />

              <p class="first-text">
                <span>{{ $t('Click to upload') }}</span>

                {{ $t('the Main Document') }}
              </p>

              <p class="second-text">{{ $t('PDF, DOCX,ZIP less than 1MB') }}</p>
            </div>
          </template>
        </HandleFilesUpload>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .disabled-input {
    pointer-events: none;
    opacity: 0.5;
  }
</style>
