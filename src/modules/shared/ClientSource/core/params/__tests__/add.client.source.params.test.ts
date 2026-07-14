import { describe, expect, it } from 'vitest';
import AddClientSourceParams from '../add.client.source.params';

const translations = { title: { en: 'Referral', ar: 'Referral AR' } };
const emptyTranslations = { title: { en: ' ', ar: '' } };

describe('AddClientSourceParams', () => {
  it('maps and validates client source create payloads', () => {
    const params = new AddClientSourceParams({ translations, parentId: 5 });

    expect(params.toMap()).toEqual({ translations, parent_id: 5 });
    expect(params.validate().isValid).toBe(true);
  });

  it('omits empty optional parent id', () => {
    expect(new AddClientSourceParams({ translations }).toMap()).toEqual({ translations });
  });

  it('requires a translated title', () => {
    const params = new AddClientSourceParams({ translations: emptyTranslations });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'translations' }],
    });
  });
});
