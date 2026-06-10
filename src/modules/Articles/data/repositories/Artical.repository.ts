import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import ArticleApiService from '../api/Artical.api-service';
import ShowQuestionsModel from '@/modules/Questions/core/models/show.questions.model';
import { questionsModel } from '@/modules/Questions';
import { QuestionGeneratedByEnum } from '@/modules/Questions/core/constant/generatedby.enum';

export default class ArticleRepository extends BaseRepository<ShowQuestionsModel, questionsModel[]> {
  private static instance: ArticleRepository;

  protected get apiService() {
    return ArticleApiService.getInstance();
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
      new questionsModel({
        id: 2,
        title: 'What are the benefits of renewable energy?',
        subjects: {id: 2, title: 'Science'},
        generatedBy: QuestionGeneratedByEnum.manual,
        noOfQs: 5,
      }),
      new questionsModel({
        id: 3,
        title: 'How does solar power work?',
        subjects: {id: 3, title: 'Physics'},
        generatedBy: QuestionGeneratedByEnum.ai,
        noOfQs: 8,
      }),
    ];
  }

  static getInstance(): ArticleRepository {
    if (!ArticleRepository.instance) {
      ArticleRepository.instance = new ArticleRepository();
    }
    return ArticleRepository.instance;
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
