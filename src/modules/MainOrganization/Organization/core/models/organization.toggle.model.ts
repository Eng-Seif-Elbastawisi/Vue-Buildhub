export default class OrganizationToggledModel {
  public readonly id?: number;
  public readonly toggle_status: number;

  constructor(data: { id?: number; toggle_status: number }) {
    this.id = data.id;
    this.toggle_status = data.toggle_status;
    Object.freeze(this);
  }

  static fromJson(json: unknown): OrganizationToggledModel {
    if (!json || typeof json !== 'object') {
      throw new Error('Cannot create OrganizationToggledModel from null or undefined');
    }

    const source = json as Record<string, unknown>;

    const status = Number(source.toggle_status);

    return new OrganizationToggledModel({
      id: typeof source.id === 'number' ? source.id : undefined,
      toggle_status: status === 2 ? 2 : 1,
    });
  }

  static example: OrganizationToggledModel = new OrganizationToggledModel({
    id: 10,
    toggle_status: 1,
  });
}
