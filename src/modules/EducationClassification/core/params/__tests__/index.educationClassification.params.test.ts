import { describe, it, expect } from 'vitest';
import IndexEducationClassificationParams from '../index.educationClassification.params';

describe('IndexEducationClassificationParams', () => {
  it('should create an instance with default values', () => {
    const params = new IndexEducationClassificationParams();
    expect(params.word).toBe('');
    expect(params.pageNumber).toBe(1);
  });

  it('should map to an object correctly', () => {
    const params = new IndexEducationClassificationParams('test', 2, 20);
    const map = params.toMap();
    expect(map).toMatchObject({
      word: 'test',
      page: 2,
      per_page: 20,
    });
  });
});
