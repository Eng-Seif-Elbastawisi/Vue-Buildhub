<script setup lang="ts">
  import IndexDocumentTypeParams from '@/modules/document/core/params/documntType/index.document.type.params';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import { computed, onMounted, ref, watch } from 'vue';
  import { QuestionDifficultyEnum } from '../../core/constant/question.difficulty.enum';
  import AddquestionsParams from '../../core/params/add.question.params';
  import QuestionSkillParams from '../../core/params/subParams/question.skills.params';
  import TopicsParams from '../../core/params/subParams/topics.params';
  import type ShowQuestionsModel from '../../core/models/show.questions.model';
  import SkillsController from '@/modules/Skills/presentation/controllers/skills.controller';
  import IndexSkillsParams from '@/modules/Skills/core/params/index.skills.params';
  import type StageModel from '@/modules/Stages/core/models/stage.model';
  import StageController from '@/modules/Stages/presentation/controllers/stage.controller';
  import flattenBranchTree from '@/modules/document/core/TreeSelectHelper';
  import FullSubjectTreeController from '../../presentation/controllers/FullSubjectTree/full.subject.tree.controller';
  import FullSubjectTreeParams from '../../core/params/FullSubjectTree/full.subject.tree.params';
  import flattenSubjectBranchTree from '@/modules/Questions/core/SubjectTreeSelectHelper';
  import EducationTopicsController from '@/modules/EducationClassification/presentation/controllers/EducationTopics/education.topics.controller';
  import IndexEducationSubjectTopicParams from '@/modules/EducationClassification/core/params/EducationTopic/index.education.subject.topic.params';
  import { useRoute } from 'vue-router';

  const indexDocumentTypeParams = new IndexDocumentTypeParams();
  const emit = defineEmits(['updateData']);
  const { ContentData, draftData } = defineProps<{
    ContentData: ShowQuestionsModel;
    draftData?: AddquestionsParams;
  }>();

  // const SelectedSubject = ref<TitleInterface<number> | null>(null);
  const SelectedQuestionSequence = ref<TitleInterface<number> | null>(null);
  const SelectedTopic = ref<TitleInterface<number>[] | null>(null);
  const SelectedDifficultyLevel = ref<TitleInterface<number> | null>(null);
  const SelectedSkill = ref<TitleInterface<number>[] | null>(null);
  const selectedBranchTitle = ref<TitleInterface<number>>();

  const DifficultLevels = ref<TitleInterface<number>[]>([
    {
      id: QuestionDifficultyEnum.easy,
      title: 'Easy',
    },
    {
      id: QuestionDifficultyEnum.medium,
      title: 'Medium',
    },
    {
      id: QuestionDifficultyEnum.hard,
      title: 'Hard',
    },
  ]);

  const updateData = () => {
    emit(
      'updateData',
      new AddquestionsParams({
        difficultyLevel: SelectedDifficultyLevel.value?.id as QuestionDifficultyEnum,
        skills:
          SelectedSkill.value?.map((item) => {
            return new QuestionSkillParams({
              skillId: item.id,
              percentage: Number(item.subtitle),
            });
          }) || undefined,
        topics: SelectedTopic.value?.map((item) => new TopicsParams({ id: item.id })) || [],
        questionSequenceId: SelectedQuestionSequence.value?.id,
        subjectId: selectedBranchTitle.value?.id,
      }),
    );
  };

  watch(
    () => ContentData,
    (newData) => {
      SelectedDifficultyLevel.value = new TitleInterface<number>({
        id: newData.difficulty!,
        title: DifficultLevels.value.find((item) => item.id === newData.difficulty)
          ?.title as string,
      });
      SelectedTopic.value = newData.topics!;
      SelectedSkill.value = newData.skills!.map(
        (item) =>
          new TitleInterface<number>({
            id: item.id!,
            title: item.skill!,
            subtitle: item.precentage!,
          }),
      );

      handleBranchChange(newData.subjectTree!);
      handelSubjectUpdate(newData.sequenceTree!);
    },
  );

  const skillsController = SkillsController.getInstance();
  const indexSkillsParams = new IndexSkillsParams();

  const stageController = StageController.getInstance();
  const allStages = ref<StageModel[]>([]);

  const fullSubjectTreeController = FullSubjectTreeController.getInstance();

  onMounted(async () => {
    await stageController.fetchList(indexDocumentTypeParams);
    allStages.value = (stageController.listData.value ?? []) as StageModel[];
  });

  const branchOptions = computed<TitleInterface<number>[]>(() => {
    return allStages.value.flatMap((stage: StageModel) => flattenBranchTree(stage.branches));
  });

  const AllSubjectTree = ref<StageModel[]>([]);
  const handleBranchChange = async (selected: TitleInterface<number> | undefined) => {
    selectedBranchTitle.value = selected;
    const fullSubjectTreeParams = new FullSubjectTreeParams({
      id: selectedBranchTitle.value?.id as number,
    });
    if (selectedBranchTitle.value?.id) {
      const result = await fullSubjectTreeController.fetchList(fullSubjectTreeParams);
      AllSubjectTree.value = result.data!;
    }
    updateData();
  };

  const subjectOptions = computed<TitleInterface<number>[]>(() => {
    return (AllSubjectTree.value! || []).flatMap((stage: StageModel) => {
      return flattenSubjectBranchTree(stage.children);
    });
  });

  const topicsControoller = EducationTopicsController.getInstance();
  const topicsOptions = computed<TitleInterface<number>[]>(() => {
    return topicsControoller.listData.value?.map((item) => {
      return new TitleInterface<number>({
        id: item.id!,
        title: item.title!,
      });
    }) as TitleInterface<number>[];
  });

  const skillsOptions = computed<TitleInterface<number>[]>(() => {
    return skillsController.listData.value?.map((item) => {
      return new TitleInterface<number>({
        id: item.id!,
        title: item.title as string,
      });
    }) as TitleInterface<number>[];
  });

  const handelSubjectUpdate = async (selected: TitleInterface<number> | undefined) => {
    SelectedQuestionSequence.value = selected!;
    await topicsControoller.fetchList(
      new IndexEducationSubjectTopicParams({ SubjectId: selected?.id as number }),
    );
    updateData();
  };

  const route = useRoute();
  watch(
    () => draftData,
    () => {
      if (route.params.id) return;
      SelectedDifficultyLevel.value = new TitleInterface<number>({
        id: draftData?.difficultyLevel || 0,
        title: DifficultLevels.value.find((item) => item.id === draftData?.difficultyLevel)
          ?.title as string,
      });
      SelectedSkill.value =
        (draftData?.skills?.map(
          (item) =>
            new TitleInterface<number>({
              id: item.skillId,
              title: skillsOptions.value?.find((el) => el.id === item.skillId)?.title as string,
              subtitle: item.percentage,
            }),
        ) as TitleInterface<number>[]) ?? [];
      SelectedTopic.value =
        (draftData?.topics?.map(
          (item) =>
            new TitleInterface<number>({
              id: item.id || 0,
              title: topicsOptions.value?.find((el) => el.id === item.id)?.title as string,
            }),
        ) as TitleInterface<number>[]) ?? [];
      SelectedQuestionSequence.value = new TitleInterface<number>({
        id: draftData?.questionSequenceId || 0,
        title: subjectOptions.value?.find((item) => item.id === draftData?.questionSequenceId)
          ?.title as string,
      });

      selectedBranchTitle.value = new TitleInterface<number>({
        id: draftData?.subjectId || 0,
        title: branchOptions.value?.find((el) => el.id === draftData?.subjectId)?.title as string,
      });
      if (draftData?.subjectId) {
        handleBranchChange(selectedBranchTitle.value);
      }
      if (draftData?.questionSequenceId) {
        handelSubjectUpdate(SelectedQuestionSequence.value);
      }
    },
    { immediate: true, deep: true },
  );

  watch(
    [() => draftData, skillsOptions],
    ([draft, options]) => {
      if (!draft?.skills) return;
      if (!options?.length) return;

      SelectedSkill.value = draft?.skills?.map(
        (item) =>
          new TitleInterface<number>({
            id: item.skillId,
            title: options.find((el) => el.id === item.skillId)?.title ?? '',
            subtitle: item.percentage,
          }),
      );
    },
    { immediate: true },
  );

  watch(topicsOptions, (options) => {
    if (route.params.id) return;
    if (!draftData?.topics?.length || !options?.length) return;
    SelectedTopic.value = draftData.topics.map(
      (item) =>
        new TitleInterface<number>({
          id: item.id || 0,
          title: options.find((el) => el.id === item.id)?.title ?? '',
        }),
    );
    updateData();
  });
</script>

<template>
  <div class="contant_tabs">
    <div class="form-group">
      <div class="input">
        <UpdatedCustomInputSelect
          id="doc-branch"
          :label="`subject name`"
          :static-options="branchOptions"
          :model-value="selectedBranchTitle"
          :placeholder="$t('Enter subject name')"
          :reload="true"
          @update:model-value="handleBranchChange($event)"
        />
      </div>
      <div class="input"> 
        <UpdatedCustomInputSelect
          id="question-sequence"
          v-model="SelectedQuestionSequence"
          :label="`question sequence`"
          :static-options="subjectOptions"
          placeholder="Question sequence"
          @update:model-value="handelSubjectUpdate"
        />
      </div>
      <div class="input">
        <UpdatedCustomInputSelect
          id="topics"
          v-model="SelectedTopic"
          :label="`topics`"
          :static-options="topicsOptions"
          :type="2"
          placeholder="Topics"
          @update:model-value="updateData"
        />
      </div>
      <div class="input">
        <UpdatedCustomInputSelect
          id="difficulty-level"
          v-model="SelectedDifficultyLevel"
          :label="`Difficulty level`"
          :static-options="DifficultLevels as TitleInterface<number>[]"
          placeholder="Difficulty level"
          @update:model-value="updateData"
        />
      </div>
    </div>
    <div class="new-form-group">
      <UpdatedCustomInputSelect
        id="skills"
        v-model="SelectedSkill"
        :label="`skill`"
        :type="2"
        :params="indexSkillsParams"
        :controller="skillsController"
        placeholder="Subject Type"
        @update:model-value="updateData"
      />
      <div v-for="(skill, index) in SelectedSkill" :key="index" class="skill-percentage">
        <label :for="`skill-percentage-${index}`">
          {{ skill.title }}
        </label>
        <input
          :id="`skill-percentage-${index}`"
          v-model="skill.subtitle"
          type="number"
          placeholder="Percentage"
          @input="updateData"
        />
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
  .skill-percentage {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    margin-block: 10px;

    & label {
      width: 80%;
      border: 1px solid #e6e6e6;
      padding: 10px;
      border-radius: 10px;
    }

    & input {
      width: 20%;
      padding: 10px;
      border: 1px solid #e6e6e6;
      border-radius: 4px;
      background-color: white;
      color: black;
      border-radius: 10px;

      &:focus {
        outline: none;
        border: 1px solid #e6e6e6;
      }
    }
  }
</style>
