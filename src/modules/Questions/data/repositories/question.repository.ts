import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import questionsModel from '../../core/models/questions.model';
import QuestionApiService from '../api/question.api-service';
import { QuestionDifficultyEnum } from '../../core/constant/question.difficulty.enum';
import { QuestionTypeEnum } from '../../core/constant/question.type.enum';
import { QuestionStatusEnum } from '../../core/constant/question.status.enum';
import { QuestionGeneratedByEnum } from '../../core/constant/generatedby.enum';
import ShowQuestionsModel from '../../core/models/show.questions.model';

export default class questionsRepository extends BaseRepository<
  ShowQuestionsModel,
  questionsModel[]
> {
  private static instance: questionsRepository;

  protected get apiService() {
    return QuestionApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): ShowQuestionsModel {
    return ShowQuestionsModel.example;
  }

  protected get mockList(): questionsModel[] {
    return [
      questionsModel.example,
      {
        ...questionsModel.example,
        id: 2,
        title: 'What are the benefits of renewable energy?',
        difficulty: QuestionDifficultyEnum.easy,
        questionType: QuestionTypeEnum.mcq,
        generatedBy: QuestionGeneratedByEnum.manual,
        status: QuestionStatusEnum.approved,
      },
      {
        ...questionsModel.example,
        id: 3,
        title: 'How does solar power work?',
        difficulty: QuestionDifficultyEnum.medium,
        questionType: QuestionTypeEnum.complate,
        generatedBy: QuestionGeneratedByEnum.ai,
        status: QuestionStatusEnum.not_Reviewd,
      },
      {
        ...questionsModel.example,
        id: 4,
        title: 'What are the challenges of wind energy?',
        difficulty: QuestionDifficultyEnum.hard,
        questionType: QuestionTypeEnum.true_false,
        generatedBy: QuestionGeneratedByEnum.manual,
        status: QuestionStatusEnum.under_review,
      },
    ];
  }

  static getInstance(): questionsRepository {
    if (!questionsRepository.instance) {
      questionsRepository.instance = new questionsRepository();
    }
    return questionsRepository.instance;
  }

  protected parseItem(data: any): ShowQuestionsModel {
    return ShowQuestionsModel.fromJson(data);
  }

  protected parseList(data: any): questionsModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: questionsModel[], item) => {
      try {
        if (item != null) {
          acc.push(questionsModel.fromJson(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
