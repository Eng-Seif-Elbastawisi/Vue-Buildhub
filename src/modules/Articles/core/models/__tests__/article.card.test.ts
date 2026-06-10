import { describe, it, expect } from 'vitest';
import ArticleCardModel from '../article.card';
import { ArticleDifficultyEnum } from '../../constant/Article.difficulty.enum';
import { ArticleTypeEnum } from '../../constant/Article.type.enum';

describe('ArticleCardModel', () => {
  it('should construct correctly with default values', () => {
    const model = new ArticleCardModel({
      id: 1,
      title: 'Test',
      createdAt: '2026-05-31',
      questions: 'What is 1+1?',
    });

    expect(model.id).toBe(1);
    expect(model.title).toBe('Test');
    expect(model.createdAt).toBe('2026-05-31');
    expect(model.questions).toBe('What is 1+1?');
    expect(model.articledifficulty).toBe(ArticleDifficultyEnum.easy);
    expect(model.status).toBe(ArticleTypeEnum.mcq);
  });

  it('should deserialize correctly from json', () => {
    const json = {
      id: 2,
      title: 'JSON Test',
      createdAt: '2026-05-31',
      questions: 'What is 2+2?',
      articledifficulty: ArticleDifficultyEnum.medium,
      status: ArticleTypeEnum.ranking,
    };

    const model = ArticleCardModel.fromJson(json);

    expect(model.id).toBe(2);
    expect(model.title).toBe('JSON Test');
    expect(model.createdAt).toBe('2026-05-31');
    expect(model.questions).toBe('What is 2+2?');
    expect(model.articledifficulty).toBe(ArticleDifficultyEnum.medium);
    expect(model.status).toBe(ArticleTypeEnum.ranking);
  });
});
