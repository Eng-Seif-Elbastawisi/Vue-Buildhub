<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ArticleController from '../../controllers/Article.controller';
import { onMounted } from 'vue';
import ShowArticlesParams from '../../../core/params/show.Articles.params';
import OverViewArticle from './OverViewArticle.vue';
import ArticleQuestion from './ArticleQuestion.vue';
import type { QuestionTypeEnum } from '@/modules/Questions/core/constant/question.type.enum.ts';
import type { QuestionStatusEnum } from '@/modules/Questions/core/constant/question.status.enum.ts';
import type { QuestionDifficultyEnum } from '@/modules/Questions/core/constant/question.difficulty.enum.ts';
// import AnalysisReport from './AnalysisReport.vue';


const controller = ArticleController.getInstance();
const state = computed(() => controller.itemState.value);
const route = useRoute();

// const fetchArticle = async () => {
//     await controller.fetchOne(new ShowArticlesParams(Number(route.params.id)));
// }
onMounted(() => {
    fetchArticle();
});

// const updateData = (filters: any) => {  
//   console.log(filters);

//   fetchArticle();
// };
const fetchArticle = async (filters?: {
    question_type?: QuestionTypeEnum;
    difficulty?: QuestionDifficultyEnum;
    status?: QuestionStatusEnum;
    word?: string;
}) => {
    await controller.fetchOne(
        new ShowArticlesParams(
            Number(route.params.id),
            filters?.question_type,
            filters?.difficulty,
            filters?.status,
            filters?.word
        )
    );
};

const updateData = (filters: any) => {
    fetchArticle(filters);
};

</script>
<template>
    <div class="Article_details">
        <OverViewArticle :artical="state.data!" />
        <!-- <AnalysisReport :artical="state.data!" /> -->
        <ArticleQuestion :artical="state.data!" @update-data="updateData" />
    </div>
</template>