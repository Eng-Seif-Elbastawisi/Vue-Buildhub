import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';
import { ArticleApiService } from '@/modules/Articles';
import ArticleAnswerModel from '@/modules/Articles/core/models/subModels/Article.answer.model';
import type ShowQuestionsModel from '@/modules/Questions/core/models/show.questions.model';

export default class ArticleRepository extends BaseRepository<ArticleAnswerModel, ShowQuestionsModel[]> {
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

  protected get mockItem(): ArticleAnswerModel {
    return ArticleAnswerModel.fromJson({});
  }

  protected get mockList(): ArticleAnswerModel[] {
    return [
      new ArticleAnswerModel({
        id: 2,
        answer: 'What are the benefits of renewable energy?' as unknown as any,
        countCorrect: true as unknown as any,
        countStudent: 10 as unknown as any,
        image: 'https://i.imgur.com/6mI9sXy.jpg' as unknown as any,
      }),
      new ArticleAnswerModel({
        id: 3,
        answer: 'How does solar power work?' as unknown as any,
        countCorrect: false as unknown as any,
        countStudent: 15 as unknown as any,
        image: 'https://i.imgur.com/6mI9sXy.jpg' as unknown as any,
      }),
      new ArticleAnswerModel({
        id: 4,
        answer: 'What are the challenges of wind energy?' as unknown as any,
        countCorrect: false as unknown as any,
        countStudent: 20 as unknown as any,
        image: 'https://i.imgur.com/6mI9sXy.jpg' as unknown as any,
      }),
    ];
  }

  static getInstance(): ArticleRepository {
    if (!ArticleRepository.instance) {
      ArticleRepository.instance = new ArticleRepository();
    }
    return ArticleRepository.instance;
  }

  protected parseItem(data: any): ArticleAnswerModel {
    return ArticleAnswerModel.fromJson(data);
  }

  protected parseList(data: any): ArticleAnswerModel[] {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: ArticleAnswerModel[], item) => {
      try {
        if (item != null) {
          acc.push(ArticleAnswerModel.fromJson(item));
        }
      } catch {}
      return acc;
    }, []);
  }
}
