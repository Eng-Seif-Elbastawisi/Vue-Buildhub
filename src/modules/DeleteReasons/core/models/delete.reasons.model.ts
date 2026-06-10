
/**
 * Country model representing a nation's geographical and cultural data
 */
export default class DeleteResonsModel {
  public readonly id?: number;
  public readonly date?: string;
  public readonly name: string;
  public readonly Reason: string;
  public readonly notes: string;
  public readonly titles: Record<string, string>;

  constructor(data: {
    id?: number;
    date?: string;
    name: string;
    Reason: string;
    notes: string;
    titles: Record<string, string>;
  }) {
    this.id = data.id;
    this.date = data.date;
    this.name = data.name;
    this.Reason = data.Reason;
    this.notes = data.notes;
    this.titles = data.titles;

    Object.freeze(this);
  }

  /**
   * Create CountryModel from API response
   * @param json - Raw JSON data from API
   * @returns CountryModel instance
   */
  static fromJson(json: any): DeleteResonsModel {
    if (!json) {
      throw new Error('Cannot create CountryModel from null or undefined');
    }

    return new DeleteResonsModel({
      id: json.id,
      date: json.created_at,
      name: json.name,
      Reason: json.title,
      notes: json.notes,
      titles: this.mapTranslations(json.titles, 'title'),
    });
  }

  static mapTranslations = (translations: any[], key: string = 'value') => {
    const result: Record<string, string> = {};
    if (Array.isArray(translations)) {
      translations.forEach((t: any) => {
        if (t.locale && t[key]) {
          result[t.locale] = t[key];
        }
      });
    }
    return result;
  };

  static example: DeleteResonsModel = new DeleteResonsModel({
    id: 1,
    name: 'mohamed',
    notes: 'New Notes',
    Reason: 'reson',
    date: '1-9-2001',
    titles: {},
  });
}
