import { describe, it, expect } from 'vitest';
import FaqsDetailsParams from '../faqs.details.params';

const makeParams = (
  overrides: Partial<{ answer: Record<string, string>; question: Record<string, string> }> = {},
) =>
  new FaqsDetailsParams({
    question: { en: 'What is Vue?', ar: 'ما هو Vue؟' },
    answer: { en: 'A JavaScript framework.', ar: 'إطار عمل JavaScript.' },
    ...overrides,
  });

describe('FaqsDetailsParams', () => {
  it('constructs with the given question and answer', () => {
    const params = makeParams();
    expect(params.question).toEqual({ en: 'What is Vue?', ar: 'ما هو Vue؟' });
    expect(params.answer).toEqual({ en: 'A JavaScript framework.', ar: 'إطار عمل JavaScript.' });
  });

  it('toMap nests fields under translations', () => {
    const params = makeParams();
    expect(params.toMap()).toEqual({
      translations: {
        question: { en: 'What is Vue?', ar: 'ما هو Vue؟' },
        answer: { en: 'A JavaScript framework.', ar: 'إطار عمل JavaScript.' },
      },
    });
  });

  it('validate returns isValid:true when fields are populated', () => {
    expect(makeParams().validate().isValid).toBe(true);
  });

  it('validate returns isValid:false when answer is null', () => {
    const params = makeParams({ answer: null as any });
    expect(params.validate().isValid).toBe(false);
  });

  it('validate returns isValid:false when question is null', () => {
    const params = makeParams({ question: null as any });
    expect(params.validate().isValid).toBe(false);
  });
});
