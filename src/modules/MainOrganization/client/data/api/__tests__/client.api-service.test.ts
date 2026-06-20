import { describe, expect, it } from 'vitest';
import ClientApiService from '../client.api-service';

describe('ClientApiService', () => {
  it('returns the same singleton', () => {
    expect(ClientApiService.getInstance()).toBe(ClientApiService.getInstance());
  });
});
