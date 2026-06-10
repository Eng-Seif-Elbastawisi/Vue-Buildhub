import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type { AnswerEvaluationTypeEnum } from '../../constant/answer.evaluation.type.enum';
import type AttachmentsParams from './attachments.params';

export default class AnswersParams implements Params {
  public title?: string;
  public file?: AttachmentsParams[];
  public isCorrect?: boolean;
  public correctOrder?: number;
  public matchAnswer?: string;
  public answerEvaluation?: AnswerEvaluationTypeEnum;
  public similarPrecentage?: string;
  public rank?: number;
  public static readonly validation = new ClassValidation().setRules({
    title: { required: true },
    answerEvaluation: { required: true },
  });

  constructor(data: {
    title?: string;
    file?: AttachmentsParams[];
    isCorrect?: boolean;
    correctOrder?: number;
    matchAnswer?: string;
    answerEvaluation?: AnswerEvaluationTypeEnum;
    similarPrecentage?: string;
    rank?: number;
  }) {
    this.title = data.title;
    this.file = data.file;
    this.isCorrect = data.isCorrect;
    this.correctOrder = data.correctOrder;
    this.matchAnswer = data.matchAnswer;
    this.answerEvaluation = data.answerEvaluation;
    this.similarPrecentage = data.similarPrecentage;
    this.rank = data.rank;
  }

  toMap(): { [p: string]: any } {
    return {
      answer: this.title,
      attachments: this.file?.map((item) => item.toMap()),
      is_correct: this.isCorrect ,
      correct_order: this.correctOrder,
      match_answer: this.matchAnswer,
      answer_evaluation: this.answerEvaluation,
      similar_precentage: this.similarPrecentage,
      rank: this.rank,
    };
  }

  validate() {
    return AnswersParams.validation.validate(this);
  }

  validateOrThrow() {
    return AnswersParams.validation.validateOrThrow(this);
  }
}
