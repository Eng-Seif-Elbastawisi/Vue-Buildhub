import type TitleInterface from '@/base/Data/Models/titleInterface';
import { QuestionGeneratedByEnum } from '../constant/generatedby.enum';
import { QuestionDifficultyEnum } from '../constant/question.difficulty.enum';
import { QuestionStatusEnum } from '../constant/question.status.enum';
import { QuestionTypeEnum } from '../constant/question.type.enum';

export default class questionsModel {
  public readonly id?: number;
  public readonly title: string;
  public readonly generatedBy: QuestionGeneratedByEnum;
  public readonly questionType: QuestionTypeEnum;
  public readonly difficulty: QuestionDifficultyEnum; 
  public readonly status: QuestionStatusEnum;
  public readonly subjects?: TitleInterface<number>;
  public readonly noOfQs?: number;
  public readonly e_c_branch?: TitleInterface<number>;

  constructor(data: {
    id?: number;
    title?: string;
    generatedBy?: QuestionGeneratedByEnum;
    questionType?: QuestionTypeEnum;
    difficulty?: QuestionDifficultyEnum;
    status?: QuestionStatusEnum;
    subjects?: TitleInterface<number>;
    noOfQs?: number;
    e_c_branch?: TitleInterface<number>;
  }) {
    this.id = data.id;
    this.title = data.title || '';
    this.generatedBy = data.generatedBy as QuestionGeneratedByEnum;
    this.questionType = data.questionType as QuestionTypeEnum;
    this.difficulty = data.difficulty as QuestionDifficultyEnum;
    this.status = data.status as QuestionStatusEnum;
    this.subjects = data.subjects;
    this.noOfQs = data.noOfQs;
    this.e_c_branch = data.e_c_branch;
    Object.freeze(this); 
  }

  static fromJson(json: any): questionsModel {
    if (!json) {
      throw new Error('Cannot create questionsModel from null or undefined');
    }
 
    return new questionsModel({
      id: json.question_id,
      title: json.question,
      generatedBy: json.from_source_type,
      questionType: json.question_type,
      difficulty: json.difficulty_level,
      status: json.review_status,
      subjects: json.e_c_subject,
      noOfQs: json.number_of_questions,
      e_c_branch: json.e_c_branch,
    });
  }

  static example: questionsModel = new questionsModel({
    id: 1,
    title: 'What is the capital of Egypt? ',
    generatedBy: QuestionGeneratedByEnum.manual,
    questionType: QuestionTypeEnum.mcq,
    difficulty: QuestionDifficultyEnum.easy,
    status: QuestionStatusEnum.not_Reviewd,
    subjects: {
      id: 1,
      title: 'Mathematics',
    },
    noOfQs: 10,
    e_c_branch: {
      id: 1,
      title: 'Mathematics',
    },
  });
}
