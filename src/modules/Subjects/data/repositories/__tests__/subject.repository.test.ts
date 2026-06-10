import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import SubjectRepository from '../subject.repository';

describe('SubjectRepository', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Reset singleton between tests
    (SubjectRepository as any).instance = undefined;
  });

  it('should be defined', () => {
    expect(SubjectRepository).toBeDefined();
  });

  it('getInstance returns an instance of SubjectRepository', () => {
    const repo = SubjectRepository.getInstance();
    expect(repo).toBeInstanceOf(SubjectRepository);
  });

  it('getInstance returns the same singleton on repeated calls', () => {
    const a = SubjectRepository.getInstance();
    const b = SubjectRepository.getInstance();
    expect(a).toBe(b);
  });
});
