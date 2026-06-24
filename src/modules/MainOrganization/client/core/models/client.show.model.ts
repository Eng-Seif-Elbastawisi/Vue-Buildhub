import { ClientTypeEnum } from "../constant/client.type.enum";

export default class ClientShowModel {
  public readonly id?: number;
  public readonly phone?: string;
  public readonly name?: string;
  public readonly email?: string;
  public readonly address?: string;
  public readonly type?: ClientTypeEnum;

  constructor(data: {
    id?: number;
    phone?: string;
    name?: string;
    email?: string;
    address?: string;
    type?: ClientTypeEnum;
  }) {
    this.id = data.id;
    this.phone = data.phone;
    this.name = data.name;
    this.email = data.email;
    this.address = data.address;
    this.type = data.type;
    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ClientShowModel {
    if (!json) throw new Error('Invalid ClientShowModel data');

    return new ClientShowModel({
      id: json.id as number | undefined,
      phone: json.phone as string | undefined,
      name: json.name as string | undefined,
      email: json.email as string | undefined,
      address: json.address as string | undefined,
      type: json.type as ClientTypeEnum | undefined,
    });
  }

  static example: ClientShowModel = new ClientShowModel({
    id: 1,
    phone: '123456789',
    name: "ali",
    email: 'email',
    address: 'address',
    type: ClientTypeEnum.COMPANY,
  });
}
