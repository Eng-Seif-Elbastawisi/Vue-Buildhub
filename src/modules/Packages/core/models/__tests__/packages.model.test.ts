import { describe, it, expect } from 'vitest';
import ArticleModel from '../Article.model';
import ArticleSubjectModel from '../Subject.model';
import { ArticleGeneratedByEnum } from '../../constant/Article.generatedby.enum';

describe('ArticleModel', () => {
  const mockJson = {
    id: 1,
    article_title: 'Title of the Article',
    subject: {
      curriculum: 'Governmental',
      cycle: 'Primary',
      grade: 'First',
    },
    generated_by: ArticleGeneratedByEnum.manual,
    no_of_qs: 10,
  };

  it('should create an instance correctly from constructor', () => {
    const data = {
      id: 1,
      articleTitle: 'Title of the Article',
      subject: ArticleSubjectModel.example,
      generatedBy: ArticleGeneratedByEnum.manual,
      noOfQs: 10,
    };
    const model = new ArticleModel(data);

    expect(model.articleTitle).toBe('Title of the Article');
    expect(model.subject).toEqual(ArticleSubjectModel.example);
    expect(model.generatedBy).toBe(ArticleGeneratedByEnum.manual);
    expect(model.noOfQs).toBe(10);
  });

  it('should create an instance correctly from fromJson', () => {
    const model = ArticleModel.fromJson(mockJson);

    expect(model.id).toBe(1);
    expect(model.articleTitle).toBe('Title of the Article');
    expect(model.subject).toEqual({
      curriculum: 'Governmental',
      cycle: 'Primary',
      grade: 'First',
    });
    expect(model.generatedBy).toBe(ArticleGeneratedByEnum.manual);
    expect(model.noOfQs).toBe(10);
  });

  it('should throw error if json is null in fromJson', () => {
    expect(() => ArticleModel.fromJson(null)).toThrow();
  });

  it('should have a valid example', () => {
    expect(ArticleModel.example).toBeInstanceOf(ArticleModel);
    expect(ArticleModel.example.articleTitle).toBe('What is the capital of Egypt?');
  });
});
