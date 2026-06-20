export default class ClientModel {
  public readonly id?: number;
  public readonly phone?: number;
  public readonly name?: string;
  public readonly email?: string;
  public readonly address?: string;

  constructor(data: {
    id?: number;
    phone?: number;
    name?: string;
    email?: string;
    address?: string;
  }) {
    this.id = data.id;
    this.phone = data.phone;
    this.name = data.name;
    this.email = data.email;
    this.address = data.address;
    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ClientModel {
    if (!json) throw new Error('Cannot create ClientModel from null or undefined');

    return new ClientModel({
      id: json.id as number | undefined,
      phone: json.phone as number | undefined,
      name: json.name as string | undefined,
      email: json.email as string | undefined,
      address: json.address as string | undefined,
    });
  }

  static example: ClientModel = new ClientModel({
    id: 10,
    phone: 100100100,
    name: 'ali',
    email: 'email',
    address: 'address',
  });
}
