export default class ReportAttachmentParams {
  readonly file: string;
  constructor(file: string) {
    this.file = file;
  }
  toMap() {
    return { file: this.file };
  }
}
