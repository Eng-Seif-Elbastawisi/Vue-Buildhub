import { describe, expect, it } from 'vitest';
import ShowSystemIdentityParams from '../show.system.identity.params';

describe('ShowSystemIdentityParams', () => {
  it('serializes an empty show_setting payload', () => {
    expect(new ShowSystemIdentityParams().toMap()).toEqual({});
  });
});
