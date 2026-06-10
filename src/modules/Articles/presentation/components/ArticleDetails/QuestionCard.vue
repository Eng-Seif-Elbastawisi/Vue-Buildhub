<script lang="ts" setup>
import DropList from '@/shared/HelpersComponents/DropList.vue';
import EditIcon from '@/shared/icons/DropListIcons/EditIcon.vue';
import DeletIcon from '@/shared/icons/DropListIcons/DeletIcon.vue';
import { useI18n } from 'vue-i18n';
import ArticleController from '../../../presentation/controllers/Article.controller';
import DeleteArticlesParams from '../../../core/params/delet.Articles.params';
import type ShowQuestionsModel from '@/modules/Questions/core/models/show.questions.model';
import { QuestionTypeEnum } from '@/modules/Questions/core/constant/question.type.enum';
import McqIcon from '@/shared/icons/McqIcon.vue';
import TrueFalse from '@/shared/icons/TrueFalse.vue';
import MatcingingIcon from '@/shared/icons/MatcingingIcon.vue';
import { QuestionDifficultyEnum } from '@/modules/Questions/core/constant/question.difficulty.enum';
import router from '@/router';
import ShowArticlesParams from '@/modules/Articles/core/params/show.Articles.params';
import { useRoute } from 'vue-router';


const { allquestion } = defineProps<{
    allquestion: ShowQuestionsModel[];
}>()
const route = useRoute();
const articleId = Number(route.params.id);
const controller = ArticleController.getInstance();
const { t } = useI18n();
const getDifficultyClass = (difficulty: QuestionDifficultyEnum) => {
    switch (difficulty) {
        case QuestionDifficultyEnum.easy:
            return t("easy");
        case QuestionDifficultyEnum.medium:
            return t("medium");
        case QuestionDifficultyEnum.hard:
            return t("hard");
        default:
            return "N/A";
    }
};

const getStatusClass = (status: QuestionTypeEnum) => {
    switch (status) {
        case QuestionTypeEnum.mcq:
            return t("MCQ");
        case QuestionTypeEnum.ranking:
            return t("Ranking");
        case QuestionTypeEnum.true_false:
            return t("True/False");
        case QuestionTypeEnum.complate:
            return t("Complate");
        case QuestionTypeEnum.matching:
            return t("Matching");
        default:
            return "N/A";
    }
};


// droplist
const actionList = (question_id: number, deleteArticleQuestion: (question_id: number) => void) => [
    {
        text: t('Edit'),
        icon: EditIcon,
        action: () => {
            router.push(`/questions/edit/${question_id}`);
        },
    },
    {
        text: t('delete'),
        icon: DeletIcon,
        action: () => {
            console.log('delete action called');
            deleteArticleQuestion(question_id);
        },
    }
];

// const deleteArticleQuestion = async (question_id: number) => {
//     await controller.delete(new DeleteArticlesParams(question_id));
//     emit('refetch');
// };
// QuestionCard.vue


const deleteArticleQuestion = async (question_id: number) => {
    try {
        await controller.delete(new DeleteArticlesParams(question_id));
        controller.fetchOne(new ShowArticlesParams(articleId))
    } catch (error) {
        console.error('Delete failed:', error);
    }
};
</script>
<template>
    <div class="question_card">
        <div v-for="(value, index) in allquestion" :key="value?.id" class="num-question">
            <div class="contant-card">
                <div class="header-card">
                    <div class="title">
                        <h6>questions <span>{{ index + 1 }}</span></h6>
                    </div>
                    <div class="actions">
                        <DropList :action-list="actionList(value?.question_id!, deleteArticleQuestion)"
                            :delete-dialog-title="$t('are_you_sure_you_want_to_remove_this_education_classification')
                                " :delete-dialog-message="$t(
                                    'Deleting_this_classification_will_remove_all_related_data_including_any_configurations_and_tree_structures_This_action_is_irreversible_and_the_classification_must_be_created_again_if_needed',
                                )
                                    " />
                    </div>
                </div>
                <div class="types-date">
                    <div class="date">
                        <span class="label">{{ $t('created_at') }} : </span>
                        <span class="value">{{ value?.createdAt }}</span>
                    </div>
                    <div class="type">
                        <span class="value" :class="getDifficultyClass(value.difficulty!)">{{
                            getDifficultyClass(value?.difficulty!) }}</span>
                        <span class="value-status" :class="getStatusClass(value.questionType!)">
                            <McqIcon v-if="value.questionType! === QuestionTypeEnum.mcq" />
                            <TrueFalse v-if="value.questionType! === QuestionTypeEnum.true_false" />
                            <MatcingingIcon v-if="value.questionType! === QuestionTypeEnum.matching" />
                            {{ getStatusClass(value?.questionType!) }}
                        </span>
                    </div>
                </div>
                <div class="question_text">
                    <p>{{ value?.questionTitle }}</p>
                </div>
                <div class="all_answers">
                    <div v-for="(answer, index) in value?.answers" :key="index" class="answer">
                        <div class="imge-text">
                            <div class="text">
                                <span class="label">{{ $t('Answers') }} {{ index + 1 }}</span>
                                <p class="answer_text">{{ answer.answer }}</p>
                            </div>
                            <div class="imge">
                                <img v-if="answer.image" :src="answer.image[0]?.file" :alt="answer?.answer">
                            </div>
                        </div>
                        <!-- <div class="count-answer"> -->
                        <!-- <p class="corret">{{ answer. }}%</p>
                            <p class="student">{{ answer.countStudent }} stds</p> -->
                        <!-- </div> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
@use '../../../../../styles/variables' as *;
@use '../../../../../styles/mixins/flex' as *;

.header-card {
    span {
        box-shadow: 0 0 0px 1px rgba(170, 170, 170, 0.15);
        border: 1PX solid rgba(230, 230, 230, 1);
        padding: 0 7px;
        border-radius: 5px;
        color: rgba(48, 48, 48, 1);
        font-family: "demi";
        font-weight: $BaseFontSemiBoldWeight;
        font-size: $MdSize2;
    }
}

.type {

    // .value{
    //     padding: $XsSize4 $XlSize3;
    //     border-radius: $XlSize4;
    // }
    .Easy {
        color: rgba(24, 169, 87, 1);
        border: 1px solid rgba(183, 233, 201, 1);
        background-color: rgba(233, 249, 238, 1);
    }

    .Hard {
        color: rgba(214, 69, 69, 1);
        border: 1px solid rgba(245, 194, 192, 1);
        background-color: rgba(255, 236, 235, 1);
    }

    .Medium {
        color: rgba(217, 145, 0, 1);
        border: 1px solid rgba(242, 213, 156, 1);
        background-color: rgba(255, 247, 230, 1);
    }
}

.value-status {
    display: flex;
    align-items: center;
    gap: 5px;

}
</style>