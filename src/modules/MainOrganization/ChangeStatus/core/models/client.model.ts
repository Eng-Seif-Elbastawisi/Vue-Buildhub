import { StatusTypeEnum } from '../constant/change_status.type.enum';

export default class ChangeStatusModel {
  public readonly id?: number;
  public readonly type?: StatusTypeEnum;

  constructor(data: { id?: number; type?: StatusTypeEnum }) {
    this.id = data.id;
    this.type = data.type;
    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ChangeStatusModel {
    if (!json) throw new Error('Cannot create ClientModel from null or undefined');

    return new ChangeStatusModel({
      id: json.id as number | undefined,
      type: json.type as StatusTypeEnum | undefined,
    });
  }

  static example: ChangeStatusModel = new ChangeStatusModel({
    id: 10,
    type: StatusTypeEnum.MEASUREMENT_UNIT,
  });
}
