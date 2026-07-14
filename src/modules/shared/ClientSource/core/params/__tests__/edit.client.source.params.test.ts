import { describe, expect, it } from 'vitest';
import EditClientSourceParams from '../edit.client.source.params';

const translations = { title: { en: 'Referral', ar: 'Referral AR' } };
const emptyTranslations = { title: { en: '', ar: ' ' } };

describe('EditClientSourceParams', () => {
  it('maps and validates client source update payloads', () => {
    const params = new EditClientSourceParams({ id: 3, translations });

    expect(params.toMap()).toEqual({ client_source_id: 3, translations });
    expect(params.validate().isValid).toBe(true);
  });

  it('requires a client source id', () => {
    const params = new EditClientSourceParams({
      id: undefined as unknown as number,
      translations,
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'id' }],
    });
  });

  it('requires a translated title', () => {
    const params = new EditClientSourceParams({ id: 3, translations: emptyTranslations });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'translations' }],
    });
  });
});
