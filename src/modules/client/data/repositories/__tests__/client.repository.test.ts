import { describe, expect, it } from 'vitest';
import ClientRepository from '../client.repository';

describe('ClientRepository', () => {
  it('returns the same singleton', () => {
    expect(ClientRepository.getInstance()).toBe(ClientRepository.getInstance());
  });
});
