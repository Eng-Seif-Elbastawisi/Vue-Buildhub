import { QuestionGeneratedByEnum } from '../constant/generatedby.enum';
import { QuestionDifficultyEnum } from '../constant/question.difficulty.enum';
import { QuestionStatusEnum } from '../constant/question.status.enum';
import { QuestionTypeEnum } from '../constant/question.type.enum';
import AnswerModel from './subModels/answer.model';
import QuestionClarificationModel from './subModels/question.clarification.model';
import SolutionHintModel from './subModels/solution.hint.model';
import SolutionStepsModel from './subModels/solution.steps.model';
// import SubjectTreeModel from './subModels/subject.tree.model';
// import sequenceTreeModel from './subModels/sequence.model';
import QuestionDocumentModel from './subModels/question.document.model';
import AttachmentModel from './subModels/attachment.model';
import QuestionSkillsModel from './subModels/question.skills.model';
import TitleInterface from '@/base/Data/Models/titleInterface';
import { AnswerEvaluationTypeEnum } from '../constant/answer.evaluation.type.enum';
import ExplanationModel from './subModels/explanation.model';
import DocumentArticleModel from './subModels/document.model';
//  انت انسان زبال يا محمود يا زبال 
export default class ShowQuestionsModel { 
  public readonly id?: number;
  public readonly questionType?: QuestionTypeEnum;
  public readonly difficulty?: QuestionDifficultyEnum;
  public readonly topics?: TitleInterface<number>[];
  public readonly questionTitle?: string;
  public readonly questionImage?: AttachmentModel[];

  public readonly status?: QuestionStatusEnum;
  public readonly generatedBy?: QuestionGeneratedByEnum;
  public readonly createdAt?: string;
  public readonly approvedBy?: string;

  public readonly answers?: AnswerModel[];
  public readonly questionClarification?: QuestionClarificationModel;
  public readonly solutionSteps?: SolutionStepsModel;
  public readonly solutionHint?: SolutionHintModel;
  public readonly subjectTree?: TitleInterface<number>;
  public readonly sequenceTree?: TitleInterface<number>;
  public readonly questionDocuments?: QuestionDocumentModel[];
  public readonly skills?: QuestionSkillsModel[];
  public readonly questionLogHistory?: any;

  public readonly isClarification?: boolean;
  public readonly isQusetionSteps?: boolean;
  public readonly isQusetionHints?: boolean;
  public readonly subjects?: TitleInterface<number>;

  public readonly question_description?: string;
  public readonly question?: string;
  public readonly e_c_subject?: TitleInterface<number>;
  public readonly document?: DocumentArticleModel[];
  public readonly explanation?: ExplanationModel;
  public readonly created_at?:  string;
  public readonly created_by?: TitleInterface<string>;
  public readonly number_of_questions?: number;
  public readonly question_id?: number;
  public readonly questions?: ShowQuestionsModel[];
   public readonly attachments?: string[];
  
  

  

  constructor(data: {
    id?: number;
    generatedBy?: QuestionGeneratedByEnum;
    questionType?: QuestionTypeEnum;
    difficulty?: QuestionDifficultyEnum;
    status?: QuestionStatusEnum;
    topics?: TitleInterface<number>[];
    questionTitle?: string;
    questionImage?: AttachmentModel[];
    createdAt?: string;
    approvedBy?: string;
    answers?: AnswerModel[];
    questionClarification?: QuestionClarificationModel;
    solutionSteps?: SolutionStepsModel;
    solutionHint?: SolutionHintModel;
    subjectTree?: TitleInterface<number>;
    sequenceTree?: TitleInterface<number>;
    questionDocuments?: QuestionDocumentModel[];
    skills?: QuestionSkillsModel[];
    questionLogHistory?: any;
    isClarification?: boolean;
    isQusetionSteps?: boolean;
    isQusetionHints?: boolean;
    subjects?: TitleInterface<number>;
    question_description?: string;
    question?: string;
    e_c_subject?: TitleInterface<number>;
    document?: DocumentArticleModel[];
    explanation?: ExplanationModel;
    created_at?:  string;
    created_by?: TitleInterface<string>;
    number_of_questions?: number;
    question_id?: number;
    questions?: ShowQuestionsModel[];
    attachments?: string[];
  }) {
    this.id = data.id;
    this.generatedBy = data.generatedBy;
    this.questionType = data.questionType;
    this.difficulty = data.difficulty;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.approvedBy = data.approvedBy;
    this.questionTitle = data.questionTitle;
    this.questionImage = data.questionImage;
    this.topics = data.topics;
    this.answers = data.answers;
    this.questionClarification = data.questionClarification;
    this.solutionSteps = data.solutionSteps;
    this.solutionHint = data.solutionHint;
    this.subjectTree = data.subjectTree;
    this.sequenceTree = data.sequenceTree;
    this.questionDocuments = data.questionDocuments;
    this.skills = data.skills;
    this.questionLogHistory = data.questionLogHistory;
    this.isClarification = data.isClarification;
    this.isQusetionSteps = data.isQusetionSteps;
    this.isQusetionHints = data.isQusetionHints;
    this.subjects = data.subjects;
    this.question_description = data.question_description;
    this.question = data.question;
    this.e_c_subject = data.e_c_subject;
    this.document = data.document;
    this.explanation = data.explanation;
    this.created_at = data.created_at;
    this.created_by = data.created_by;
    this.number_of_questions = data.number_of_questions;
    this.question_id = data.question_id;
    this.questions = data.questions;
    this.attachments = data.attachments;

    Object.freeze(this);
  }

  static fromJson(json: any): ShowQuestionsModel {
    if (!json) {
      throw new Error('Cannot create questionsModel from null or undefined');
    }

    return new ShowQuestionsModel({
      id: json.id,
      generatedBy: json.generated_by,
      questionType: json.question_type,
      difficulty: json.difficulty_level,
      status: json.status,
      createdAt: json.created_at,
      approvedBy: json.approved_by,
      questionTitle: json.question,
      questionImage: json.attachments ? json.attachments.map(AttachmentModel.fromJson) : [],
      topics: json.topics.map(
        (topic: any) =>
          new TitleInterface<number>({
            id: topic.e_c_s_topic_id,
            title: topic.title,
          }),
      ),
      answers: json.answers ? json.answers.map((answer: any) => AnswerModel.fromJson(answer)) : [],
      questionClarification: json.explanation
        ? QuestionClarificationModel.fromJson(json.explanation)
        : {},
      solutionSteps: json.answer_step
        ? SolutionStepsModel.fromJson(json.answer_step)
        : undefined,
      solutionHint: json.answer_hint ? SolutionHintModel.fromJson(json.answer_hint) : undefined,
      subjectTree: new TitleInterface<number>({
        id: json.e_c_branch?.e_c_branch_id,
        title: json.e_c_branch?.title,
        full_title: json.e_c_branch?.full_title,
      }),
      sequenceTree: new TitleInterface<number>({
        id: json.e_c_subject?.e_c_subject_id,
        title: json.e_c_subject?.title,
      }),
      questionDocuments: json.documents
        ? json.documents.map((document: any) => QuestionDocumentModel.fromJson(document))
        : [],
      skills: json.skills
        ? json.skills.map((skill: any) => QuestionSkillsModel.fromJson(skill))
        : [],
      questionLogHistory: json.question_logs_history,
      isClarification: json.is_clarification,
      isQusetionSteps: json.is_question_steps,
      isQusetionHints: json.is_question_hint,
      subjects: json.e_c_subjects,
      question: json.question,
      question_description: json.question_description,
      e_c_subject: new TitleInterface({
        id: json.e_c_subject?.e_c_subject_id,
        title: json.e_c_subject?.title,
      }),
      document: json.documents?.map((doc: any) => DocumentArticleModel.fromJson(doc)) ?? [],
      explanation: ExplanationModel.fromJson(json.explanation),
      created_at: json.created_at,
      created_by: new TitleInterface<string>({
        id: json.created_by?.id,
        title: json.created_by?.name,
      }),
      number_of_questions: json.number_of_questions,
      question_id: json.question_id,
      questions: json.questions?.map((question: any) => ShowQuestionsModel.fromJson(question)) ?? [],
      attachments: json.attachments,
    });
  }

  static example: ShowQuestionsModel = new ShowQuestionsModel({
    id: 1,
    generatedBy: QuestionGeneratedByEnum.manual,
    questionType: QuestionTypeEnum.mcq,
    difficulty: QuestionDifficultyEnum.easy,
    status: QuestionStatusEnum.approved,
    createdAt: '2022-01-01',
    approvedBy: 'Mohamed Abdelmoneam',
    questionTitle: 'Question Title',
    questionImage: [
      {
        id: 2,
        alt: 'Document 2',
        file: 'https://cyber.comolho.com/static/img/avatar.png',
      },
      {
        id: 3,
        alt: 'Document 3',
        file: 'https://cyber.comolho.com/static/img/avatar.png',
      },
    ],
    topics: [
      { id: 2, title: 'Document 2' },
      { id: 3, title: 'Document 3' },
    ],
    answers: [
      {
        ...AnswerModel.example,
        answer: 'answer 1',
        match: 'matching answert',
        rank: 10,
        similar: 'Similar',
        EvaluationType: AnswerEvaluationTypeEnum.similar,
      },
      { ...AnswerModel.example, answer: 'answer 2', is_right_answer: false },
    ],
    questionClarification: QuestionClarificationModel.example,
    solutionSteps: SolutionStepsModel.example,
    solutionHint: SolutionHintModel.example,
    subjectTree: {
      id: 2,
      title: 'Document 2',
    },
    sequenceTree: {
      id: 3,
      title: 'Document 3',
    },
    questionDocuments: [QuestionDocumentModel.example,QuestionDocumentModel.example],
    skills: [
      new QuestionSkillsModel({
        id: 2,
        skill: 'Document 2',
        precentage: 10,
      }),
      new QuestionSkillsModel({
        id: 3,
        skill: 'Document 3',
        precentage: 90,
      }),
    ],

    questionLogHistory: [
      {
        date: '05-10-2025',
        status: 'Waiting Review',
        time: '5:15 PM',
        createdBy: 'System AI',
      },
      {
        date: '04-10-2025',
        status: 'added',
        time: '1:20 PM',
        createdBy: 'Ahmed Hawam',
      },
      {
        date: '04-10-2025',
        status: 'approved',
        time: '1:20 PM',
        createdBy: 'Ahmed Hawam',
      },
      {
        date: '04-10-2025',
        status: 'rejected',
        time: '1:20 PM',
        createdBy: 'System AI',
      },
    ],
    isClarification: true,
    isQusetionSteps: true,
    isQusetionHints: true,
    subjects: new TitleInterface({
      id: 2,
      title: 'Document 2',
    }),
    question_description: 'question description',
    question: 'question',
    e_c_subject: new TitleInterface({
      id: 2,
      title: 'Document 2',
    }),
    document: [DocumentArticleModel.example],
    explanation: ExplanationModel.example,
    created_at: '2022-01-01',
    created_by: new TitleInterface({
      id: 2,
      title: 'Document 2',
    }),
    number_of_questions: 2,
    questions: [],
    attachments: [],
  });
}
