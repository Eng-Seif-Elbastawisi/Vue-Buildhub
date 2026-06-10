import { QuestionTypeEnum } from '@/modules/Questions/core/constant/question.type.enum';
import MCQAnswers from './MCQAnswers.vue';
import RankingAnswers from './RankingAnswers.vue';
import TrueOrFalseAnswers from './TrueOrFalseAnswers.vue';
import ComplateAnswers from './ComplateAnswers.vue';
import MatchingAnswers from './MatchingAnswers.vue';

export const AnswerTypeHelper = (type: QuestionTypeEnum) => {
  const components = {
    [QuestionTypeEnum.mcq]: MCQAnswers,
    [QuestionTypeEnum.ranking]: RankingAnswers,
    [QuestionTypeEnum.true_false]: TrueOrFalseAnswers,
    [QuestionTypeEnum.complate]: ComplateAnswers,
    [QuestionTypeEnum.matching]: MatchingAnswers,
  };

  return components[type];
};
