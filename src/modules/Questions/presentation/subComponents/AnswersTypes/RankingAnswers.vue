<script setup lang="ts">
  import DeletIcon from '@/shared/icons/DropListIcons/DeletIcon.vue';
  import { onMounted, ref, watch } from 'vue';
  import AddNewAnswerIcon from '@/shared/icons/AddNewAnswerIcon.vue';
  import type AnswerModel from '@/modules/Questions/core/models/subModels/answer.model';
  import AnswersParams from '@/modules/Questions/core/params/subParams/answers.params';
  import { useRoute } from 'vue-router';

  const emit = defineEmits(['update:data']);
  const { questionData, draftData } = defineProps<{
    questionData: AnswerModel[];
    draftData?: AnswersParams[];
  }>();

  const Answers = ref<AnswerModel[]>([
    {
      answer: '',
      rank: 0,
    },
  ]);

  const addNewAnswer = () => {
    Answers.value.push({ answer: '', rank: 0 });

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
          rank: el.rank,
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
          rank: el.rank,
        });
      }),
    );
  });

  watch(
    () => questionData,
    (newvalue) => {
      if (newvalue) {
        Answers.value = newvalue;
      }
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
        Answers.value = newvalue.map((item) => ({
          answer: item.title ?? '',
          rank: item.rank ?? 0,
        }));
        UpdateData();
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );
</script>

<template>
  <div class="ranking-answers-time-line-container">
    <div
      v-for="(item, index) in Answers"
      :key="index"
      class="timeline-item"
      :style="{ animationDelay: `${index * 0.15}s` }"
    >
      <div class="timeline-content">
        <div class="timeline-form-content">
          <div class="field-group">
            <label class="field-label" :for="`answer-${index}`">{{ $t(`answer`) }}</label>
            <div class="input-wrap">
              <input
                :id="`answer-${index}`"
                v-model="item.answer"
                type="text"
                :placeholder="$t('add_your_answer')"
                class="field-input"
                @input="UpdateData"
              />
            </div>
          </div>

          <div class="ranking-section">
            <input
              :id="`rank-${index}`"
              v-model="item.rank"
              type="number"
              placeholder="ranking"
              @input="UpdateData"
            />
          </div>
          <div v-if="Answers.length > 1" class="delete-icon-container">
            <button type="button" class="delete-btn" @click="DeleteItem(index)">
              <DeletIcon />
            </button>
          </div>
        </div>
      </div>

      <div v-if="Answers.length - 1 == index" class="add-row" @click="addNewAnswer">
        <div class="add-icon">
          <AddNewAnswerIcon />
          <span class="add-text">{{ $t('add_another_answer') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
