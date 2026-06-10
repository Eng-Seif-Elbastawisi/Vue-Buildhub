import { describe, it, expect } from 'vitest';
import EditFaqsParams from '../edit.faqs.params';

const makeParams = (
  overrides: Partial<{
    id: number;
    question: Record<string, string>;
    answer: Record<string, string>;
  }> = {},
) =>
  new EditFaqsParams({
    id: 1,
    question: { en: 'Updated question?', ar: 'سؤال محدث؟' },
    answer: { en: 'Updated answer.', ar: 'إجابة محدثة.' },
    ...overrides,
  });

describe('EditFaqsParams', () => {
  it('constructs with correct fields', () => {
    const params = makeParams();
    expect(params.id).toBe(1);
    expect(params.question).toEqual({ en: 'Updated question?', ar: 'سؤال محدث؟' });
    expect(params.answer).toEqual({ en: 'Updated answer.', ar: 'إجابة محدثة.' });
  });

  it('toMap wraps translations correctly', () => {
    const params = makeParams();
    expect(params.toMap()).toEqual({
      translations: {
        question: { en: 'Updated question?', ar: 'سؤال محدث؟' },
        answer: { en: 'Updated answer.', ar: 'إجابة محدثة.' },
      },
    });
  });

  it('validate returns isValid:true with a valid id', () => {
    expect(makeParams().validate().isValid).toBe(true);
  });

  it('validate returns isValid:false when id is null', () => {
    const params = makeParams({ id: null as any });
    expect(params.validate().isValid).toBe(false);
  });
});
