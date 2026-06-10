/**
 * Country model representing a nation's geographical and cultural data
 */
export default class DeleteAccountsModel {
  public readonly date?: string;
  public readonly name: string;
  public readonly Reason: string;
  public readonly notes: string;

  constructor(data: { date?: string; name: string; Reason: string; notes: string }) {
    this.date = data.date;
    this.name = data.name;
    this.Reason = data.Reason;
    this.notes = data.notes;

    Object.freeze(this);
  }

  /**
   * Create CountryModel from API response
   * @param json - Raw JSON data from API
   * @returns CountryModel instance
   */
  static fromJson(json: any): DeleteAccountsModel {
    if (!json) {
      throw new Error('Cannot create CountryModel from null or undefined');
    }

    return new DeleteAccountsModel({
      date: json.date,
      name: json.name,
      Reason: json.Reason,
      notes: json.notes,
    });
  }

  static example: DeleteAccountsModel = new DeleteAccountsModel({
    name: 'mohamed',
    Reason: 'reason',
    date: '1-9-2001',
    notes: 'notes',
  });
}
