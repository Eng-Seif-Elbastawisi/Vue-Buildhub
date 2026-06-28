import { describe, expect, it } from 'vitest';
import StoreSystemIdentityParams from '../store.system.identity.params';

describe('StoreSystemIdentityParams', () => {
  it('serializes store_setting payload without empty logo', () => {
    const params = new StoreSystemIdentityParams({
      name: 'Identity',
      primary_color: '#111111',
      secondary_color: '#222222',
      accent_color: '#333333',
      extracted_colors: ['#111111'],
      is_active: true,
    });

    expect(params.toMap()).toEqual({
      name: 'Identity',
      primary_color: '#111111',
      secondary_color: '#222222',
      accent_color: '#333333',
      extracted_colors: ['#111111'],
      is_active: true,
    });
  });
});
