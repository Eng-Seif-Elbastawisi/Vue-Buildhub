import { describe, it, expect } from 'vitest';
import AddFaqsParams from '../add.faqs.params';
import FaqsDetailsParams from '../faqs.details.params';

const makeDetails = () =>
  new FaqsDetailsParams({
    question: { en: 'What is this?', ar: 'ما هذا؟' },
    answer: { en: 'This is a FAQ.', ar: 'هذا سؤال شائع.' },
  });

describe('AddFaqsParams', () => {
  it('constructs with a list of FaqsDetailsParams', () => {
    const params = new AddFaqsParams({ faqs: [makeDetails()] });
    expect(params.faqs).toHaveLength(1);
  });

  it('toMap serialises each faq using FaqsDetailsParams.toMap', () => {
    const details = makeDetails();
    const params = new AddFaqsParams({ faqs: [details] });
    const map = params.toMap();
    expect(map.faqs).toHaveLength(1);
    expect(map.faqs[0]).toEqual(details.toMap());
  });

  it('toMap returns an empty faqs array when no items are given', () => {
    const params = new AddFaqsParams({ faqs: [] });
    expect(params.toMap().faqs).toEqual([]);
  });

  it('validate returns isValid:false when faqs is empty', () => {
    const params = new AddFaqsParams({ faqs: [] });
    expect(params.validate().isValid).toBe(false);
  });

  it('validate returns isValid:true when faqs has at least one item', () => {
    const params = new AddFaqsParams({ faqs: [makeDetails()] });
    expect(params.validate().isValid).toBe(true);
  });
});
