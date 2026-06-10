<script setup lang="ts">
  import Accordion from 'primevue/accordion';
  import AccordionPanel from 'primevue/accordionpanel';
  import AccordionHeader from 'primevue/accordionheader';
  import AccordionContent from 'primevue/accordioncontent';
  import AccordionToggleIcon from '@/shared/icons/questions/AccordionToggleIcon.vue';
  import { onMounted, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import AddquestionsParams from '@/modules/Questions/core/params/add.question.params';
  import EditquestionsParams from '@/modules/Questions/core/params/edit.question.params';
  import HandleFilesUpload from '@/shared/FormInputs/HandleFilesUpload.vue';
  import UplaodImageInput from '@/shared/icons/UploadImage/UplaodImageInput.vue';
  import SelectionTabs from '../../subComponents/SelectionTabs.vue';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import { QuestionTypeEnum } from '@/modules/Questions/core/constant/question.type.enum';
  import QuestionContantTabs from '../../subComponents/QuestionContantTabs.vue';
  import QuestionSource from '../../subComponents/QuestionSource.vue';
  import QuestionSourceParams from '@/modules/Questions/core/params/subParams/question.source.params';
  import type { QuestionDifficultyEnum } from '@/modules/Questions/core/constant/question.difficulty.enum';
  import QuestionSkillParams from '@/modules/Questions/core/params/subParams/question.skills.params';
  import type QuestionClarificationParams from '@/modules/Questions/core/params/subParams/question.clarification.params';
  import ShowQuestionsModel from '@/modules/Questions/core/models/show.questions.model';
  import QuestionDocumentModel from '@/modules/Questions/core/models/subModels/question.document.model';
  import TopicsParams from '@/modules/Questions/core/params/subParams/topics.params';
  import AttachmentsParams from '@/modules/Questions/core/params/subParams/attachments.params';

  const emit = defineEmits(['updateData']);
  const route = useRoute();

  const { loading, questionData, draftData } = defineProps<{
    loading?: boolean;
    questionData?: ShowQuestionsModel;
    draftData?: AddquestionsParams;
  }>();

  const selectedDifficultyLevel = ref<number | null>(null);
  const SelectedSkill = ref<QuestionSkillParams[] | null>(null);
  const SelectedTopic = ref<number[] | null>(null);
  const SelectedQuestionSequence = ref<number | null>(null);
  const SelectedSubject = ref<number | null>(null);
  const title = ref<string>('');

  const updateData = () => {
    let params: any;
    if (route.params.id) {
      params = new EditquestionsParams({
        id: Number(route.params.id),
        title: title.value,
        image: UploadedImage.value.map((file) => new AttachmentsParams({ alt: '', file })) || [],
        questionType: selectedTab.value as QuestionTypeEnum,
        subjectId: SelectedSubject.value ? SelectedSubject.value : null,
        skills: SelectedSkill.value || [],
        difficultyLevel: selectedDifficultyLevel.value
          ? (selectedDifficultyLevel.value as QuestionDifficultyEnum)
          : null,
        topics: SelectedTopic.value
          ? SelectedTopic.value.map((item: number) => new TopicsParams({ id: item }))
          : [],
        questionSequenceId: SelectedQuestionSequence.value ? SelectedQuestionSequence.value : null,
        questionSource: new QuestionSourceParams({
          documentId: SelectedDocumet.value || 0,
          source: questionSource.value || '',
        }),
      });
    } else {
      params = new AddquestionsParams({
        title: title.value,
        image: UploadedImage.value.map((file) => new AttachmentsParams({ alt: '', file })) || [],
        questionType: selectedTab.value as QuestionTypeEnum,
        subjectId: SelectedSubject.value ? SelectedSubject.value : null,
        skills: SelectedSkill.value || [],
        difficultyLevel: selectedDifficultyLevel.value
          ? (selectedDifficultyLevel.value as QuestionDifficultyEnum)
          : null,
        topics: SelectedTopic.value
          ? SelectedTopic.value.map((item) => new TopicsParams({ id: item }))
          : [],
        questionSequenceId: SelectedQuestionSequence.value ? SelectedQuestionSequence.value : null,
        questionSource: new QuestionSourceParams({
          documentId: SelectedDocumet.value || 0,
          source: questionSource.value || '',
        }),
      });
    }
    emit('updateData', params);
  };
  const UploadedImage = ref<string[]>([]);

  const handleImageChange = (file: any) => {
    UploadedImage.value = file[0]?.base64 ? [file[0].base64] : [];
    updateData();
  };

  const tabs = ref<TitleInterface<number>[]>([
    {
      id: QuestionTypeEnum.mcq,
      title: 'MCQ',
    },
    {
      id: QuestionTypeEnum.true_false,
      title: 'trueAndFalse',
    },
    {
      id: QuestionTypeEnum.ranking,
      title: 'ranking',
    },
    {
      id: QuestionTypeEnum.complate,
      title: 'complete',
    },
    {
      id: QuestionTypeEnum.matching,
      title: 'matching',
    },
  ]);

  const selectedTab = ref<number | null>(QuestionTypeEnum.mcq);
  const selectTab = (tab: number) => {
    selectedTab.value = tab;
    updateData();
  };

  const getQuestionCOntent = (data: AddquestionsParams) => {
    selectedDifficultyLevel.value = data.difficultyLevel!;
    SelectedSkill.value = data.skills
      ? data.skills!.map((item) => {
          return new QuestionSkillParams({
            skillId: item.skillId,
            percentage: item?.percentage,
          });
        })
      : [];
    SelectedTopic.value = data.topics ? data.topics.map((item: any) => item.id) : [];
    SelectedQuestionSequence.value = data.questionSequenceId!;
    SelectedSubject.value = data.subjectId!;
    updateData();
  };

  const questionSource = ref<string>('');
  const SelectedDocumet = ref<number | null>(null);
  const GetQuestionSource = (data: QuestionClarificationParams) => {
    SelectedDocumet.value = data.documentId!;
    questionSource.value = data.source!;
    updateData();
  };
  onMounted(() => {
    updateData();
  });

  const ContentData = ref<ShowQuestionsModel | null>(null);
  const DocumentSource = ref<QuestionDocumentModel | null>(null);
  watch(
    () => questionData,
    (newValue) => {
      if (newValue) {
        title.value = newValue?.questionTitle || '';
        UploadedImage.value = newValue?.questionImage
          ? newValue?.questionImage.map((img) => img.file!)
          : [];
        selectedTab.value = newValue?.questionType || null;
        // SelectedSubject.value = newValue?.subjectTree;
        SelectedSkill.value =
          newValue?.skills!.map((item) => {
            return new QuestionSkillParams({
              skillId: item.id!,
              percentage: item.precentage!,
            });
          }) || [];
        selectedDifficultyLevel.value = newValue?.difficulty || null;
        SelectedTopic.value = newValue?.topics ? newValue?.topics.map((item: any) => item.id) : [];
        SelectedQuestionSequence.value = newValue?.sequenceTree?.id || null;
        SelectedDocumet.value = newValue?.questionDocuments?.[0]?.id || null;
        questionSource.value = newValue?.questionDocuments?.[0]?.source || '';
        // console.log(newValue.subjectTree, 'subjectTree');
        // console.log(newValue.sequenceTree, 'sequenceTree');

        ContentData.value = new ShowQuestionsModel({
          questionType: newValue?.questionType,
          difficulty: newValue?.difficulty,
          topics: newValue?.topics,
          subjectTree: newValue?.subjectTree,
          sequenceTree: newValue?.sequenceTree,
          questionDocuments: newValue?.questionDocuments,
          skills: newValue?.skills,
        });
        DocumentSource.value = new QuestionDocumentModel({
          id: newValue?.questionDocuments?.[0]?.id,
          title: newValue?.questionDocuments?.[0]?.title,
          source: newValue?.questionDocuments?.[0]?.source,
        });
      }
    },
  );
  const isActive = ref(true);
  const accordionTransition = {
    enterFromClass: 'accordion-enter-from',
    enterActiveClass: 'accordion-enter-active',
    enterToClass: 'accordion-enter-to',
    leaveFromClass: 'accordion-leave-from',
    leaveActiveClass: 'accordion-leave-active',
    leaveToClass: 'accordion-leave-to',
  };

  watch(
    () => draftData,
    () => {
      selectedDifficultyLevel.value = draftData?.difficultyLevel ?? null;
      SelectedSkill.value = draftData?.skills ?? [];
      SelectedTopic.value = draftData?.topics?.map((item) => item.id as number) ?? [];
      SelectedQuestionSequence.value = draftData?.questionSequenceId ?? null;
      SelectedSubject.value = draftData?.subjectId ?? null;
      title.value = draftData?.title ?? '';
      UploadedImage.value = draftData?.image?.map((item: any) => item.file) ?? [];
      selectedTab.value = draftData?.questionType || QuestionTypeEnum.mcq;
    },
    { immediate: true },
  );
</script>

<template>
  <Accordion
    :pt="{
      root: 'basic-data-form',
      panel: 'accordion-panel',
    }"
    :value="isActive ? '0' : ''"
    :lazy="true"
    @update:value="isActive = !isActive"
  >
    <AccordionPanel value="0">
      <AccordionHeader>
        <template #toggleicon>
          <div class="toggll-container">
            <p class="title">basic question data</p>
            <AccordionToggleIcon :class="{ 'rotate-180': !isActive }" />
          </div>
          <span class="dashed-border"></span>
        </template>
      </AccordionHeader>
      <AccordionContent
        :pt="{
          root: 'accordion-content-root',
          content: 'accordion-content-inner',
          transition: accordionTransition,
        }"
      >
        <div class="form-fields">
          <div class="field-group col-span-2" :class="{ disabled: loading }">
            <label class="field-label" for="name">{{ $t(`question title`) }}</label>
            <div class="input-wrap">
              <input
                id="title"
                v-model="title"
                type="text"
                placeholder="Enter question title"
                class="field-input"
                @input="updateData"
              />
            </div>
          </div>

          <div class="field-group col-span-2" :class="{ disabled: loading }">
            <HandleFilesUpload
              :label="`upload image`"
              accept="image/*"
              :multiple="false"
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
                    <span>{{ 'Click to upload' }}</span
                    >{{ $t('or drag and drop') }}
                  </p>
                  <p class="second-text">{{ $t('JPG, JPEG, PNG less than 1MB') }}</p>
                </div>
              </template>
            </HandleFilesUpload>
          </div>

          <SelectionTabs
            class="field-group col-span-2"
            :tabs="tabs"
            :selected-tab="selectedTab"
            @update:model-value="selectTab"
          />
          <QuestionContantTabs
            :draft-data="draftData"
            :ContentData="ContentData!"
            class="field-group col-span-2"
            @update-data="getQuestionCOntent"
          />
          <QuestionSource
            :draft-data="draftData"
            :document-source="DocumentSource"
            class="field-group col-span-2"
            @update-data="GetQuestionSource"
          />
        </div>
      </AccordionContent>
    </AccordionPanel>
  </Accordion>
</template>

<style scoped>
  .accordion-enter-active,
  .accordion-leave-active {
    display: grid;
    transition: grid-template-rows 0.3s ease;
  }

  .accordion-enter-from,
  .accordion-leave-to {
    grid-template-rows: 0fr;
    transform: translateY(-50%);
    opacity: 0;
  }

  .accordion-enter-to,
  .accordion-leave-from {
    grid-template-rows: 1fr;
    transform: translateY(0);
    opacity: 1;
  }

  .accordion-content-inner {
    min-height: 0;
    transition: all 0.3s linear;
  }
</style>
