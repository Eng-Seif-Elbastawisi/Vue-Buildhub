import { describe, expect, it } from 'vitest';
import ClientController from '../client.controller';

describe('ClientController', () => {
  it('returns the same singleton', () => {
    expect(ClientController.getInstance()).toBe(ClientController.getInstance());
  });
});
