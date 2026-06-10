import { describe, it, expect } from 'vitest';
import FaqsModel from './faqs.model';

describe('FaqsModel', () => {
  const mockData = {
    id: 1,
    question: { en: 'Q', ar: 'س' },
    answer: { en: 'A', ar: 'ج' },
  };

  it('creates an instance from constructor', () => {
    const model = new FaqsModel(mockData);
    expect(model.id).toBe(1);
    expect(model.question.en).toBe('Q');
    expect(model.answer.ar).toBe('ج');
  });

  it('creates an instance fromJson', () => {
    const json = {
      id: 1,
      translations: {
        question: { en: 'Q' },
        answer: { en: 'A' },
      },
    };
    const model = FaqsModel.fromJson(json);
    expect(model.id).toBe(1);
    expect(model.question.en).toBe('Q');
  });

  it('has examples', () => {
    expect(FaqsModel.examples.length).toBeGreaterThan(0);
    expect(FaqsModel.example).toBeInstanceOf(FaqsModel);
  });
});
