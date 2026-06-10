<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import ArticleQuestion from "../../../../../shared/icons/ArticleQuestion.vue";
import UpdatedCustomInputSelect from "../../../../../shared/FormInputs/UpdatedCustomInputSelect.vue";
import TitleInterface from "@/base/Data/Models/titleInterface";
import QuestionCard from "./QuestionCard.vue";
import type ShowQuestionsModel from "@/modules/Questions/core/models/show.questions.model.ts";
import { QuestionTypeEnum } from "@/modules/Questions/core/constant/question.type.enum.ts";
import { QuestionStatusEnum } from "@/modules/Questions/core/constant/question.status.enum.ts";
import { QuestionDifficultyEnum } from "@/modules/Questions/core/constant/question.difficulty.enum.ts";
import { useRoute } from "vue-router";
const { t } = useI18n();
const { artical } = defineProps<{
  artical?: ShowQuestionsModel;
}>()
const route = useRoute();
const emit = defineEmits(['update-data']);

// Reactive State
const word = ref("");
const SelectedDifficulty = ref<TitleInterface<number> | null>(null);
const SelectedType = ref<TitleInterface<number> | null>(null);
const SelectedStatus = ref<TitleInterface<number> | null>(null);

// Static options mapped from QuestionDifficultyEnum
const difficultyOptions = computed<TitleInterface<number>[]>((() => [
  new TitleInterface({
    id: QuestionDifficultyEnum.easy,
    title: t("easy"),
  }),
  new TitleInterface({
    id: QuestionDifficultyEnum.medium,
    title: t("medium"),
  }),
  new TitleInterface({
    id: QuestionDifficultyEnum.hard,
    title: t("hard"),
  }),
]));
// Static options mapped from ArticleStatusEnum
const statusOptions = computed<TitleInterface<QuestionStatusEnum>[]>((() => [
  new TitleInterface({
    id: QuestionStatusEnum.approved,
    title: t("approved"),
  }),
  new TitleInterface({
    id: QuestionStatusEnum.under_review,
    title: t("under_review"),
  }),
  new TitleInterface({
    id: QuestionStatusEnum.rejected,
    title: t("rejected"),
  }),
  new TitleInterface({
    id: QuestionStatusEnum.not_Reviewd,
    title: t("not_reviewd"),
  }),
]));
// Static options mapped from ArticleTypeEnum
const typeOptions = computed<TitleInterface<number>[]>((() => [
  new TitleInterface({
    id: QuestionTypeEnum.mcq,
    title: t("mcq"),
  }),
  new TitleInterface({
    id: QuestionTypeEnum.ranking,
    title: t("ranking"),
  }),
  new TitleInterface({
    id: QuestionTypeEnum.true_false,
    title: t("true_false"),
  }),
  new TitleInterface({
    id: QuestionTypeEnum.complate,
    title: t("complate"),
  }),
  new TitleInterface({
    id: QuestionTypeEnum.matching,
    title: t("matching"),
  }),
]));

const Search = () => {
  // console.warn("Searching for:", word.value);
  updateData();
};
watch(
  [SelectedDifficulty, SelectedType, SelectedStatus],
  () => {
    updateData();
  }
);
// const updateData = () => {
//   emit('update-data', {
//     selectedDifficulty: SelectedDifficulty.value,
//     selectedType: SelectedType.value,
//     selectedStatus: SelectedStatus.value,
//   });
// };
const updateData = () => {
  emit('update-data', {
    difficulty: SelectedDifficulty.value?.id ?? undefined,
    question_type: SelectedType.value?.id ?? undefined,
    status: SelectedStatus.value?.id ?? undefined,
    word: word.value,
  });
};

</script>
<template>
  <div class="article_question">
    <header class="form-header">
      <div class="header-text">
        <div class="icon_article">
          <ArticleQuestion />
        </div>
        <div class="contant">
          <h6>{{ $t('questions') }}</h6>
          <p>{{ $t('questions_linked_to_this_passage') }}</p>
        </div>
      </div>
      <div class="btn-add-question">
        <router-link :to="`/questions/add?article_id=${route.params.id}`" title="add new question" class="btn btn-add">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {{ $t('add new question') }}
        </router-link>
      </div>
    </header>
    <div class="fillters-search">
      <div class="search-field">
        <span class="search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input v-model="word" :placeholder="$t('search by id, question title,  type , difficulty')" class="search-input"
          type="text" @input="Search" />
      </div>
      <div class="fillters">
        <div class="input-select">
          <UpdatedCustomInputSelect id="doc-difficulty" v-model="SelectedDifficulty" :label="``"
            :static-options="difficultyOptions" :placeholder="$t('select_difficulty')" />
        </div>
        <div class="input-select">

          <UpdatedCustomInputSelect id="doc-type" v-model="SelectedType" :label="``" :static-options="typeOptions"
            :placeholder="$t('select_type')" />
        </div>
        <div class="input-select">

          <UpdatedCustomInputSelect id="doc-status" v-model="SelectedStatus" :label="``" :static-options="statusOptions"
            :placeholder="$t('select_status')" />
        </div>
      </div>
    </div>
    <div class="question_list">
      <!-- v-for="question in article?.articlecard" :key="question.id" -->
      <QuestionCard v-if="artical?.questions" :allquestion="artical.questions" />
    </div>
  </div>
</template>
<style scoped lang="scss">
@use '../../../../../styles/variables' as *;
@use '../../../../../styles/mixins/flex' as *;
</style>