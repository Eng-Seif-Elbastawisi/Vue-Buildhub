import TitleModel from '@/base/Core/Models/titleModel';
import {
  responseObject,
  responseId,
  responseText,
} from '../../../WorkItems/core/models/work-items.response';

export default class PurchaseRequestProjectFloorSpaceModel {
  readonly id: number;
  readonly space: TitleModel;

  constructor(id: number, space: TitleModel) {
    this.id = id;
    this.space = space;
  }

  static fromJson(payload: unknown): PurchaseRequestProjectFloorSpaceModel {
    const record = responseObject(payload);
    const space = responseObject(record.space);
    responseId(space.id);
    responseText(space.title);

    return new PurchaseRequestProjectFloorSpaceModel(
      responseId(record.id),
      TitleModel.fromMap(space),
    );
  }
}
