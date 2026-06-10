import TitleInterface from "@/base/Data/Models/titleInterface";

export default class TitleModel extends TitleInterface<string> {
  constructor(title: string, id: number, subtitle?: string) {
    super({ id: id, title: title, subtitle: subtitle });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromMap(data: any): TitleModel {
    return new TitleModel(
      data?.title ?? data?.name ?? "",
      data?.id,
      data?.subtitle || data?.status || data?.child_count || data?.note || data?.upload_document,
    );
  }
}
