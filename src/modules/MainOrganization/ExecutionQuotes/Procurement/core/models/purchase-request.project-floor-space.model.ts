import ExecutionQuoteAttachmentModel from '../../../core/models/execution.quote.attachment.model';
import TitleModel from '@/base/Core/Models/titleModel';
import {
  responseObject,
  responseId,
  responseText,
  nullableText,
} from '../../../WorkItems/core/models/work-items.response';

export default class PurchaseRequestProjectFloorSpaceModel {
  readonly id: number;
  readonly space: TitleModel;
  readonly length: string | null;
  readonly width: string | null;
  readonly height: string | null;
  readonly notes: string | null;
  readonly attachments: ExecutionQuoteAttachmentModel[];

  constructor(
    id: number,
    space: TitleModel,
    details: {
      length?: string | null;
      width?: string | null;
      height?: string | null;
      notes?: string | null;
      attachments?: ExecutionQuoteAttachmentModel[];
    } = {},
  ) {
    this.length = details.length ?? null;
    this.width = details.width ?? null;
    this.height = details.height ?? null;
    this.notes = details.notes ?? null;
    this.attachments = details.attachments ?? [];
    this.id = id;
    this.space = space;
  }

  static fromJson(payload: unknown): PurchaseRequestProjectFloorSpaceModel {
    const record = responseObject(payload);
    const space = responseObject(record.space);
    responseId(space.id);
    responseText(space.title);

    if (record.attachments != null && !Array.isArray(record.attachments))
      throw new Error('work_items.invalid_response');
    return new PurchaseRequestProjectFloorSpaceModel(
      responseId(record.id),
      TitleModel.fromMap(space),
      {
        length: nullableText(record.length),
        width: nullableText(record.width),
        height: nullableText(record.height),
        notes: nullableText(record.notes),
        attachments: (record.attachments ?? []).map((attachment: unknown) =>
          ExecutionQuoteAttachmentModel.fromJson(responseObject(attachment)),
        ),
      },
    );
  }
}
