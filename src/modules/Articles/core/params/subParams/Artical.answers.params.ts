import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type { AnswerEvaluationTypeEnum } from '../../constant/answer.evaluation.type.enum';

export default class ArticalAnswersParams implements Params {
  public title?: string;
  public file?: string;
  public isCorrect?: boolean;
  public correctOrder?: number;
  public matchAnswer?: string;
  public answerEvaluation?: AnswerEvaluationTypeEnum;
  public similarPrecentage?: number;

  public static readonly validation = new ClassValidation().setRules({
    title: { required: true },
    answerEvaluation: { required: true },
  });

  constructor(data: {
    title?: string;
    file?: string;
    isCorrect?: boolean;
    correctOrder?: number;
    matchAnswer?: string;
    answerEvaluation?: AnswerEvaluationTypeEnum;
    similarPrecentage?: number;
  }) {
    this.title = data.title;
    this.file = data.file;
    this.isCorrect = data.isCorrect;
    this.correctOrder = data.correctOrder;
    this.matchAnswer = data.matchAnswer;
    this.answerEvaluation = data.answerEvaluation;
    this.similarPrecentage = data.similarPrecentage;
  }

  toMap(): { [p: string]: any } {
    return {
      title: this.title,
      file: this.file,
      is_correct: this.isCorrect,
      correct_order: this.correctOrder,
      match_answer: this.matchAnswer,
      answer_evaluation: this.answerEvaluation,
      similar_precentage: this.similarPrecentage,
    };
  }

  validate() {
    return ArticalAnswersParams.validation.validate(this);
  }

  validateOrThrow() {
    return ArticalAnswersParams.validation.validateOrThrow(this);
  }
}
