export const AnswerEvaluationTypeEnum = {
  typical : 1,
  similar: 2,
  need_correct: 3,
 
} as const;

export type AnswerEvaluationTypeEnum = (typeof AnswerEvaluationTypeEnum)[keyof typeof AnswerEvaluationTypeEnum];
