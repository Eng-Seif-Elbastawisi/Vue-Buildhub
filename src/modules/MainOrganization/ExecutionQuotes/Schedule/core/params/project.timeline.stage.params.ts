export default class ProjectTimelineStageParams {
  public quoteStageId: number;
  public children: number[];
  constructor(quoteStageId: number, children: number[]) {
    this.quoteStageId = quoteStageId;
    this.children = children;
  }
  toMap(): { quote_stage_id: number; children: number[] } {
    return { quote_stage_id: this.quoteStageId, children: [...this.children] };
  }
}
