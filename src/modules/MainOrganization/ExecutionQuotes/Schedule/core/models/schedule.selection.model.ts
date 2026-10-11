import type TitleModel from '@/base/Core/Models/titleModel';
// Editable selections remain distinct from returned timeline association objects.
export default class ScheduleSelectionModel {
  readonly quoteStageId: number;
  readonly children: number[];
  readonly parentLabel?: TitleModel;
  readonly childLabels?: TitleModel[];
  constructor(
    quoteStageId: number,
    children: number[],
    parentLabel?: TitleModel,
    childLabels?: TitleModel[],
  ) {
    this.quoteStageId = quoteStageId;
    this.children = children;
    this.parentLabel = parentLabel;
    this.childLabels = childLabels;
  }
}
