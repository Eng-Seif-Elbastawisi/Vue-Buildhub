import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type { ArticleQuestionTypeEnum } from '../constant/Article.question.type.enum';
import type TitleInterface from '@/base/Data/Models/titleInterface';
import type AttachmentsParams from '@/modules/Questions/core/params/subParams/attachments.params';

/**
 * Parameters for adding a new employee
 */
export default class EditArticlesParams implements Params {
  public id: number;
  public  question_description?: string;
  public  attachments?: AttachmentsParams[];
  public  question?:string;
  public  question_type?: ArticleQuestionTypeEnum;
  public e_c_subject_id?: number;
  public documents?: TitleInterface<string>;    
  public explanation?:{
    explanation?:string;
    attachments?:AttachmentsParams[];
  };
  
  

  public static readonly validation = new ClassValidation().setRules({
    question_type: { required: true },
    question: { required: true ,  minLength: 5 },
    documents: { required: true },
  });

  constructor(data: {
    id: number;
    question_description?: string;
    attachments?: AttachmentsParams[];
    question?:string;
    question_type?: ArticleQuestionTypeEnum;
    e_c_subject_id?: number;
    documents?: TitleInterface<string>;    
    explanation?:{
      explanation?:string;
      attachments?: AttachmentsParams[];
    };
  }) {
    this.id=data.id;
    this.question_description=data.question_description;
    this.attachments=data.attachments;
    this.question=data.question;
    this.question_type=data.question_type;
    this.e_c_subject_id=data.e_c_subject_id;
    this.documents=data.documents;
    this.explanation=data.explanation;
  }

  toMap(): { [p: string]: any } {
    return {
      question_id:this.id,
      question_description: this.question_description,
      attachments: this.attachments?.map((f) => f.toMap()),
      question: this.question,
      question_type: this.question_type,
      e_c_subject_id: this.e_c_subject_id,
      documents: [this.documents],
      explanation: this.explanation,
      difficulty_level:1,
    };
  }

  validate() {
    return EditArticlesParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditArticlesParams.validation.validateOrThrow(this);
  }
}
