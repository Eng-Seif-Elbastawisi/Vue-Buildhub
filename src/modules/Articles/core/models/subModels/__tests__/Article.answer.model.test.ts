import { describe, it, expect } from 'vitest';
import ArticleAnswerModel from '../Article.answer.model';

describe('ArticleAnswerModel', () => {
  it('should construct correctly', () => {
    const model = new ArticleAnswerModel({
      id: 1,
      answer: 'Test Answer',
      image: 'image.png',
      countCorrect: 80,
      countStudent: 100,
    });

    expect(model.id).toBe(1);
    expect(model.answer).toBe('Test Answer');
    expect(model.image).toBe('image.png');
    expect(model.countCorrect).toBe(80);
    expect(model.countStudent).toBe(100);
  });

  it('should deserialize correctly from json', () => {
    const json = {
      id: 2,
      answer: 'JSON Answer',
      image: 'json.png',
      countCorrect: 50,
      countStudent: 200,
    };

    const model = ArticleAnswerModel.fromJson(json);

    expect(model.id).toBe(2);
    expect(model.answer).toBe('JSON Answer');
    expect(model.image).toBe('json.png');
    expect(model.countCorrect).toBe(50);
    expect(model.countStudent).toBe(200);
  });
});
