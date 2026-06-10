import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type { QuestionDifficultyEnum } from '@/modules/Questions/core/constant/question.difficulty.enum';
import type { QuestionStatusEnum } from '@/modules/Questions/core/constant/question.status.enum';
import type { QuestionTypeEnum } from '@/modules/Questions/core/constant/question.type.enum';

/**
 * Parameters for showing an employee
 */
export default class ShowArticlesParams implements Params {
  public id: number;
  public question_type?: QuestionTypeEnum;
  public difficulty?: QuestionDifficultyEnum;
  public status?: QuestionStatusEnum;
  public word?: string;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
  });

  constructor(id: number, question_type?: QuestionTypeEnum, difficulty?: QuestionDifficultyEnum, status?: QuestionStatusEnum, word?: string) {
    this.id = id;
    this.question_type = question_type;
    this.difficulty = difficulty;
    this.status = status;
    this.word = word;
  }

  toMap(): { [p: string]: any } {
    return {
      question_id: this.id,
      question_type: this.question_type,
      difficulty_level: this.difficulty,
      review_status: this.status,
      word: this.word,
    };
  }

  validate() {
    return ShowArticlesParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowArticlesParams.validation.validateOrThrow(this);
  }
}
