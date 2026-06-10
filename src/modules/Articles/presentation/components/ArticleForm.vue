<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import EditArticlesParams from '../../core/params/edit.Articles.params';
import AddArticlesParams from '../../core/params/add.Artical.params';
import HandleFilesUpload from '@/shared/FormInputs/HandleFilesUpload.vue';
import UploadFileIcon from '@/shared/icons/UploadFileIcon.vue';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import FolderCrudIcon from '@/shared/icons/FolderCrudIcon.vue';
import Checkbox from 'primevue/checkbox';
import AccordionToggleIcon from '@/shared/icons/questions/AccordionToggleIcon.vue';
import { DocumentController, IndexDocumentParams } from '@/modules/document';
import AttachmentsParams from '@/modules/Questions/core/params/subParams/attachments.params';
import type TitleInterface from '@/base/Data/Models/titleInterface';
import type StageModel from '@/modules/Stages/core/models/stage.model';
import flattenSubjectBranchTree from '@/modules/Questions/core/SubjectTreeSelectHelper';
import FullSubjectTreeController from '@/modules/Questions/presentation/controllers/FullSubjectTree/full.subject.tree.controller';
import { CustomToast } from './CustomToast';
import type ShowQuestionsModel from '@/modules/Questions/core/models/show.questions.model';

const SelectedQuestionSequence = ref<TitleInterface<number> | null>(null);

const route = useRoute();
const emit = defineEmits(['updateData']);
const props = defineProps<{
  loading?: boolean;
  article?: ShowQuestionsModel;
  draftData?: AddArticlesParams;
}>();
const isSolutionSteps = ref(true);
const isSolutionHint = ref(true);
const isExplain = ref(false);
const UploadedImage = ref<string[]>([]);
const explanationAttachments = ref<string[]>([]);

// Document dependencies
const indexDocumentParams = new IndexDocumentParams();
const documentController = DocumentController.getInstance();
const SelectedDocument = ref<any>(null);
const question = ref('');
const articleSource = ref('');
const descriptionArticle = ref('');
const QuestionDescription = ref('');

const fullSubjectTreeController = FullSubjectTreeController.getInstance();
const AllSubjectTree = ref<StageModel[]>([]);

const subjectOptions = computed<TitleInterface<number>[]>(() => {
  return (AllSubjectTree.value! || []).flatMap((stage: StageModel) => {
    return flattenSubjectBranchTree(stage.children);
  });
});
const handelSubjectUpdate = async (selected: TitleInterface<number> | undefined) => {
  SelectedQuestionSequence.value = selected!;
  updateData();
};
onMounted(async () => {
  const result = await fullSubjectTreeController.fetchList();
  AllSubjectTree.value = result.data!;
  // console.log('AllSubjectTree.value', AllSubjectTree.value);
});

watch(
  () => props.article,
  (newValue) => {
    if (newValue) {
      QuestionDescription.value = newValue.question_description ?? "";
      question.value = newValue.question ?? "";
      SelectedQuestionSequence.value = newValue.e_c_subject ?? null;
      const selectedDoc = newValue.document?.find((doc: any) => doc.document_id);
      if (selectedDoc) {
        SelectedDocument.value = {
          id: selectedDoc.document_id,
          title: selectedDoc.document_title,
        };
        articleSource.value = selectedDoc?.text;
      }
      descriptionArticle.value = newValue.explanation?.explanation ?? "";
      isExplain.value = Boolean(descriptionArticle.value?.length > 0);
      explanationAttachments.value =
        newValue?.explanation?.attachments?.map((item: any) => item.file) ?? [];
      UploadedImage.value = newValue?.attachments?.map((item: any) => item.file) ?? [];
    }
  },
  { immediate: true },
);
const updateData = () => {
  let params: any;
  if (route?.params?.id) {
    params = new EditArticlesParams({
      id: Number(route.params.id),
      question_description: QuestionDescription.value,
      attachments:
        UploadedImage.value.map((file) => new AttachmentsParams({ alt: 'img', file })) || [],
      question: question.value,
      question_type: 5,
      e_c_subject_id: SelectedQuestionSequence.value?.id,
      documents: SelectedDocument.value?.id && {
        document_id: SelectedDocument.value?.id,
        text: articleSource.value,
      },
      explanation: {
        explanation: descriptionArticle.value,
        attachments:
          explanationAttachments.value.map(
            (file) => new AttachmentsParams({ alt: 'img', file }),
          ) || [],
      },
    });
  } else {
    params = new AddArticlesParams({
      question_description: QuestionDescription.value,
      attachments:
        UploadedImage.value.map((file) => new AttachmentsParams({ alt: 'img', file })) || [],
      question: question.value,
      question_type: 5,
      e_c_subject_id: SelectedQuestionSequence.value?.id,
      documents: SelectedDocument.value?.id && {
        document_id: SelectedDocument.value?.id,
        text: articleSource.value,
      },
      explanation: {
        explanation: descriptionArticle.value,
        attachments:
          explanationAttachments.value.map(
            (file) => new AttachmentsParams({ alt: 'img', file }),
          ) || [],
      },
    });
  }
  emit('updateData', params);
};

const handleImageChange = (file: any) => {
  UploadedImage.value = file[0]?.base64 ? [file[0].base64] : [];
  updateData();
};

const handleExplanationAttachments = (file: any) => {
  explanationAttachments.value = file[0]?.base64 ? [file[0].base64] : [];
  updateData();
};

const ArticleDraftData = ref<AddArticlesParams>();

// const draftRef = localStorage.getItem('article-draft') ? CustomToast() : null;
const draftRef =
  !route.params.id && localStorage.getItem('article-draft')
    ? CustomToast()
    : null;

watch(draftRef!, (newVal) => {
  if (!newVal) return;

  ArticleDraftData.value = newVal;

  QuestionDescription.value = newVal.question_description ?? '';
  question.value = newVal.question ?? '';

  articleSource.value = newVal.documents?.text ?? '';

  if (newVal.e_c_subject_id) {
    SelectedQuestionSequence.value = {
      id: newVal.e_c_subject_id,
      title: '',
    };
  }

  if (newVal.documents?.id) {
    SelectedDocument.value = {
      id: newVal.documents.id,
      title: newVal.documents.title,
    };
  }
  console.log('draft', newVal.documents);
  UploadedImage.value =
    newVal.attachments?.map((item: any) => item.file) ?? [];

  descriptionArticle.value =
    newVal.explanation?.explanation ?? '';

  explanationAttachments.value =
    newVal.explanation?.attachments?.map(
      (item: any) => item.file,
    ) ?? [];

  updateData();
});

</script>

<template>
  <div class="article-details-form-card">
    <header class="form-header">
      <div class="form-title">
        <div class="header-text">
          <h3>
            <FolderCrudIcon /> {{ route?.params?.id ? $t('Edit Article') : $t('Add New Article') }}
          </h3>
        </div>
      </div>
    </header>
    <Accordion :class="{ disabled: props.loading }" :value="isSolutionSteps ? 1 : 0" :pt="{
      root: `article-solution-steps ${isSolutionSteps ? 'active' : ''}`,
    }" @update:value="isSolutionSteps = !isSolutionSteps">
      <AccordionPanel :value="1">
        <AccordionHeader>
          <template #toggleicon>
            <div class="article-solution-steps-header">
              <div class="toggll-container">
                <div>{{ $t('basic artical data') }}</div>
                <AccordionToggleIcon :class="{ 'rotate-180': isSolutionSteps }" />
              </div>
              <span class="dashed-border"></span>
              <!-- <Checkbox v-model="isSolutionSteps" :binary="true" :input-id="`is-correct`" name="is-correct" /> -->
            </div>
          </template>
        </AccordionHeader>
        <AccordionContent>
          <div class="input-wrapper">
            <label for="descreption">{{ $t('artical ') }}</label>
            <div class="description-container">
              <div class="description-header">
                <span>B / U</span>
                <HandleFilesUpload :label="``" accept="image/*" :multiple="true" :index="1" :file="UploadedImage"
                  :have-content="true" :class="`image-input`" @change="handleImageChange">
                  <template #content>
                    <div class="upload-attachment-container">
                      <UploadFileIcon />
                      <span class="upload-attachment">{{ $t('upload_attachment') }}</span>
                    </div>
                  </template>
                </HandleFilesUpload>
              </div>
              <textarea id="descreption" v-model="QuestionDescription" name="descreption"
                :placeholder="$t('Enter Question clarification')" @input="updateData"></textarea>
            </div>
          </div>
          <div class="document-tab">
            <div class="form-group">
              <div class="field-group">
                <label class="field-label" for="name">{{ $t('title of artical') }}</label>
                <div class="input-wrap">
                  <input id="article-source" v-model="question" type="text" :placeholder="$t('enter title of artical ')"
                    class="field-input" @input="updateData" />
                </div>
              </div>
              <div class="input">
                <div class="input">
                  <UpdatedCustomInputSelect id="question-sequence" v-model="SelectedQuestionSequence" :label="`subject`"
                    :static-options="subjectOptions" placeholder="select subject"
                    @update:model-value="handelSubjectUpdate" />
                </div>
                <!-- <UpdatedCustomInputSelect id="doc-subject" v-model="SelectedSubject" :label="`subject`"
                  :params="indexDocumentTypeParams" :controller="documentTypeController" placeholder="select subject"
                  @update:model-value="updateData" /> -->
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <Accordion :class="{ disabled: props.loading }" :value="isSolutionHint ? 1 : 0" :pt="{
      root: `article-solution-steps ${isSolutionHint ? 'active' : ''}`,
    }" @update:value="isSolutionHint = !isSolutionHint">
      <AccordionPanel :value="1">
        <AccordionHeader>
          <template #toggleicon>
            <div class="article-solution-steps-header">
              <div class="toggll-container">
                <div>{{ $t('artical source') }}</div>
                <AccordionToggleIcon />
              </div>
              <span class="dashed-border"></span>
              <!-- <Checkbox v-model="isSolutionSteps" :binary="true" :input-id="`is-correct`" name="is-correct" /> -->
            </div>
          </template>
        </AccordionHeader>
        <AccordionContent>
          <div class="document-tab">
            <div class="form-group form-group-grid">
              <div class="input">
                <UpdatedCustomInputSelect id="doc-subject" v-model="SelectedDocument" :label="`Documents`"
                  :params="indexDocumentParams" :controller="documentController" placeholder="select Documents"
                  @update:model-value="updateData" />
              </div>
              <div class="field-group">
                <label class="field-label" for="name">{{ $t('source') }}</label>
                <div class="input-wrap">
                  <input id="article-source" v-model="articleSource" type="text" :placeholder="$t('enter source')"
                    class="field-input" @input="updateData" />
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
    <Accordion :class="{ disabled: props.loading }" :value="isExplain ? 1 : 0" :pt="{
      root: `article-solution-steps-explain ${isExplain ? 'active' : ''}`,
    }" @update:value="isExplain = !isExplain">
      <AccordionPanel :value="1">
        <AccordionHeader>
          <template #toggleicon>
            <div class="article-solution-steps-header-explain">
              <div>{{ $t('Is there any explanation?') }}</div>
              <Checkbox v-model="isExplain" :binary="true" :input-id="`is-correct`" name="is-correct" />
            </div>
          </template>
        </AccordionHeader>
        <AccordionContent>
          <div class="input-wrapper">
            <label for="descreption">{{ $t('Description') }}</label>
            <div class="description-container">
              <div class="description-header">
                <span>B / U</span>
                <HandleFilesUpload :label="``" accept="image/*" :multiple="true" :index="2"
                  :file="explanationAttachments" :have-content="true" :class="`image-input`"
                  @change="handleExplanationAttachments">
                  <template #content>
                    <div class="upload-attachment-container">
                      <UploadFileIcon />
                      <span class="upload-attachment">{{ $t('upload_attachment') }}</span>
                    </div>
                  </template>
                </HandleFilesUpload>
              </div>
              <textarea id="descreption" v-model="descriptionArticle" name="descreption" @input="updateData"></textarea>
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<style scoped lang="scss">
@use '../../../../styles/variables' as *;
@use '../../../../styles/mixins/flex' as *;

.disabled {
  cursor: not-allowed;
  pointer-events: none;
  opacity: 0.7;
}

.toggll-container {
  @include flex-row(nowrap, flex-start, center);
  gap: $XsSize4;

  .title {
    color: $PrimaryColor;
    font-size: $MdSize2;
    font-weight: $BaseFontSemiBoldWeight;
  }

  svg {
    transition: all 0.3s ease-in-out;
    &.rotate-180 {
      transform: rotate(180deg);
    }
  }
}
</style>