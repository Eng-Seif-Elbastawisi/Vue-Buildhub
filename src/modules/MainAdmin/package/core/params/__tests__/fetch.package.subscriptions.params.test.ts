import { describe, expect, it } from 'vitest';
import FetchPackageSubscriptionsParams from '../fetch.package.subscriptions.params';

describe('FetchPackageSubscriptionsParams', () => {
  it('maps an empty fetch payload by default', () => {
    expect(new FetchPackageSubscriptionsParams().toMap()).toEqual({});
  });

  it('maps a trimmed search word when provided', () => {
    expect(new FetchPackageSubscriptionsParams({ word: ' pro ' }).toMap()).toEqual({
      word: 'pro',
    });
  });
});
