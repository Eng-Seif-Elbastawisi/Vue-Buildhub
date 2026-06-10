<script setup lang="ts">
  import DeletIcon from '@/shared/icons/DropListIcons/DeletIcon.vue';
  import { onMounted, ref, watch } from 'vue';
  import AddNewAnswerIcon from '@/shared/icons/AddNewAnswerIcon.vue';
  import SelectionTabs from '../SelectionTabs.vue';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import { AnswerEvaluationTypeEnum } from '@/modules/Questions/core/constant/answer.evaluation.type.enum';
  import type AnswerModel from '@/modules/Questions/core/models/subModels/answer.model';
  import AnswersParams from '@/modules/Questions/core/params/subParams/answers.params';
  import { useRoute } from 'vue-router';
  const emit = defineEmits(['update:data']);
  const { questionData, draftData } = defineProps<{
    questionData: AnswerModel[];
    draftData: AnswersParams[];
  }>();
  const similarPrecentge = ref<number>(0);

  const selectedTab = ref<number | null>(
    questionData?.[0]?.EvaluationType || AnswerEvaluationTypeEnum.typical,
  );

  const Answers = ref<AnswerModel[]>([
    {
      answer: '',
      similar: similarPrecentge.value.toString(),
      EvaluationType: selectedTab.value as AnswerEvaluationTypeEnum,
    },
  ]);

  const addNewAnswer = () => {
    Answers.value.push({
      answer: '',
      similar: similarPrecentge.value.toString(),
      EvaluationType: selectedTab.value as AnswerEvaluationTypeEnum,
    });

    UpdateData();
  };

  const DeleteItem = (index: number) => {
    Answers.value.splice(index, 1);
    UpdateData();
  };

  const UpdateData = () => {
    emit(
      'update:data',
      Answers.value.map((el: AnswerModel) => {
        return new AnswersParams({
          title: el.answer,
          similarPrecentage: similarPrecentge.value.toString(),
          answerEvaluation: el.EvaluationType,
        });
      }),
    );
  };

  onMounted(() => {
    emit(
      'update:data',
      Answers.value.map((el: AnswerModel) => {
        return new AnswersParams({
          title: el.answer,
          similarPrecentage: similarPrecentge.value.toString(),
          answerEvaluation: el.EvaluationType,
        });
      }),
    );
  });

  const tabs = ref<TitleInterface<number>[]>([
    {
      id: AnswerEvaluationTypeEnum.typical,
      title: 'typical',
    },
    {
      id: AnswerEvaluationTypeEnum.similar,
      title: 'similar',
    },
    {
      id: AnswerEvaluationTypeEnum.need_correct,
      title: 'needCorrect',
    },
  ]);

  const selectTab = (tab: number) => {
    selectedTab.value = tab;
    UpdateData();
  };

  watch(
    () => questionData,
    (newvalue) => {
      if (newvalue) {
        Answers.value = newvalue;
      }
      UpdateData();
    },
    {
      deep: true,
      immediate: true,
    },
  );
  const route = useRoute();
  watch(
    () => draftData,
    (newvalue) => {
      if (route.params.id) return;
      if (newvalue && newvalue.length > 0) {
        Answers.value = newvalue.map((item) => {
          return {
            answer: item.title,
          } as AnswerModel;
        });
      }
      selectedTab.value = newvalue?.[0]?.answerEvaluation as AnswerEvaluationTypeEnum;
    },
    { deep: true, immediate: true },
  );
  const UpdateSImilar = () => {
    UpdateData();
  };
</script>

<template>
  <div class="complate-answers-time-line-container">
    <SelectionTabs
      class="field-group col-span-2"
      :tabs="tabs"
      :selected-tab="selectedTab"
      @update:model-value="selectTab"
    />
    <div
      v-if="selectedTab == AnswerEvaluationTypeEnum.similar"
      class="matching-section field-group col-span-2"
    >
      <label class="field-label" :for="`similar-precentge`">{{ $t(`similar_percentage`) }}</label>
      <input
        class="field-input"
        :id="`similar-precentge`"
        v-model="similarPrecentge"
        type="number"
        :placeholder="$t('similar_percentage')"
        @input="UpdateSImilar"
      />
    </div>
    <div
      v-for="(item, index) in Answers"
      :key="index"
      class="timeline-item"
      :style="{ animationDelay: `${index * 0.15}s` }"
    >
      <div class="timeline-content">
        <div
          class="timeline-form-content"
          :class="{ similar: selectedTab == AnswerEvaluationTypeEnum.similar }"
        >
          <div v-if="selectedTab != AnswerEvaluationTypeEnum.need_correct" class="matching-section">
            <label :for="`answer-${index}`"> {{ $t(`answer`) }}</label>
            <input
              :id="`answer-${index}`"
              v-model="item.answer"
              type="text"
              :placeholder="$t('add_your_answer')"
              @input="UpdateData"
            />
          </div>
          <div
            v-if="Answers.length > 1 && selectedTab != AnswerEvaluationTypeEnum.need_correct"
            class="delete-icon-container"
          >
            <button type="button" class="delete-btn" @click="DeleteItem(index)">
              <DeletIcon />
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="Answers.length - 1 == index && selectedTab != AnswerEvaluationTypeEnum.need_correct"
        class="add-row"
        @click="addNewAnswer"
      >
        <div class="add-icon">
          <AddNewAnswerIcon />
          <span class="add-text">{{ $t('add_another_answer') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
