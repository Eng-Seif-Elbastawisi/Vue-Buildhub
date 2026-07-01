import { describe, expect, it } from 'vitest';
import SystemIdentityShowModel from '../system.identity.show.model';

describe('SystemIdentityShowModel', () => {
  it('maps show json through the base identity model', () => {
    const model = SystemIdentityShowModel.fromJson({
      id: 7,
      name: 'Show Identity',
      primary_color: '#123456',
      secondary_color: '#101418',
      accent_color: '#abcdef',
      extracted_colors: '["#123456"]',
      is_active: false,
    });

    expect(model.name).toBe('Show Identity');
    expect(model.extractedColors).toEqual(['#123456']);
    expect(model.isActive).toBe(false);
  });
});
