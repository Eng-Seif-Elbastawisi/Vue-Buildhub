import { describe, it, expect } from 'vitest';
import DeleteFaqsParams from '../delete.faqs.params';

describe('DeleteFaqsParams', () => {
  it('constructs with the given id', () => {
    const params = new DeleteFaqsParams({ id: 42 });
    expect(params.id).toBe(42);
  });

  it('toMap returns the id', () => {
    const params = new DeleteFaqsParams({ id: 7 });
    expect(params.toMap()).toEqual({ id: 7 });
  });

  it('validate returns isValid:true for a valid id', () => {
    const params = new DeleteFaqsParams({ id: 1 });
    expect(params.validate().isValid).toBe(true);
  });

  it('validate returns isValid:false when id is null', () => {
    const params = new DeleteFaqsParams({ id: null as any });
    expect(params.validate().isValid).toBe(false);
  });
});
