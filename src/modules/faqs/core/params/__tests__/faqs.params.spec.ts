import { describe, it, expect } from 'vitest';
import AddFaqsParams from '../add.faqs.params';
import DeleteFaqsParams from '../delete.faqs.params';
import EditFaqsParams from '../edit.faqs.params';
import FaqsDetailsParams from '../faqs.details.params';
import IndexFaqsParams from '../index.faqs.params';

describe('Faqs Parameters', () => {
  it('AddFaqsParams converts to Map correctly', () => {
    const details = new FaqsDetailsParams({ question: { en: 'q' }, answer: { en: 'a' } });
    const params = new AddFaqsParams({ faqs: [details] });
    const map = params.toMap();
    expect(map.faqs[0].translations.question.en).toBe('q');
  });

  it('DeleteFaqsParams converts to Map correctly', () => {
    const params = new DeleteFaqsParams({ id: 1 });
    const map = params.toMap();
    expect(map.id).toBe(1);
  });

  it('EditFaqsParams converts to Map correctly', () => {
    const params = new EditFaqsParams({ id: 1, question: { en: 'q' }, answer: { en: 'a' } });
    const map = params.toMap();
    expect(map.translations.question.en).toBe('q');
  });

  it('IndexFaqsParams converts to Map correctly', () => {
    const params = new IndexFaqsParams();
    const map = params.toMap();
    expect(map.page).toBe(1);
  });
});
