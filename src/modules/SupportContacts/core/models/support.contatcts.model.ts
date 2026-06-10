import type ContactsModel from './contatcts.model';

/**
 * Employee model representing an employee entity
 */
export default class SupportContactsModel {
  public readonly id?: number;
  public readonly titles: Record<string, string> | string;
  public readonly supportContacts: ContactsModel[];

  constructor(data: {
    id?: number;
    titles?: Record<string, string> | string;
    supportContacts: ContactsModel[];
  }) {
    this.id = data.id;
    this.titles = data.titles ?? {};
    this.supportContacts = data.supportContacts;

    Object.freeze(this);
  }

  static fromJson(json: any): SupportContactsModel {
    if (!json) {
      throw new Error('Cannot create SupportContactsModel from null or undefined');
    }

    return new SupportContactsModel({
      id: json.id,
      titles: typeof json.titles === 'string' ? json.titles : SupportContactsModel.normalizeLocaleField(json.titles, 'title') ,
      supportContacts: json.support_contacts,
    });
  }

  private static normalizeLocaleField(raw: unknown, valueKey: string): Record<string, string> {
    if (Array.isArray(raw)) {
      return (raw as Array<Record<string, string>>).reduce(
        (acc, item) => {
          if (item?.locale) acc[item.locale] = item[valueKey] ?? '';
          return acc;
        },
        {} as Record<string, string>,
      );
    }
    if (raw && typeof raw === 'object') return raw as Record<string, string>;
    return {};
  }

  static example: SupportContactsModel = new SupportContactsModel({
    id: 1,
    supportContacts: [],
    titles: {},
  });
}
