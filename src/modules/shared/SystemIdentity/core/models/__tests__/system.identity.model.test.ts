import { describe, expect, it } from 'vitest';
import SystemIdentityModel from '../system.identity.model';

describe('SystemIdentityModel', () => {
  it('maps api json safely', () => {
    const model = SystemIdentityModel.fromJson({
      id: 5,
      name: 'Identity',
      logo: 'logo.png',
      primary_color: '#111111',
      secondary_color: '#222222',
      accent_color: '#333333',
      extracted_colors: ['#111111', '#222222'],
      is_active: true,
    });

    expect(model.id).toBe(5);
    expect(model.primaryColor).toBe('#111111');
    expect(model.extractedColors).toEqual(['#111111', '#222222']);
    expect(model.isActive).toBe(true);
  });
});
