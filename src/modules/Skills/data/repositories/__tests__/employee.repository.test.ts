import { describe, it, expect } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import employeeRepository from '../employee.repository';

describe('employee.repository', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should be defined', () => {
    expect(employeeRepository).toBeDefined();
  });
});
