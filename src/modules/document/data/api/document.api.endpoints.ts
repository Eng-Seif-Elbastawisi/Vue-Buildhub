import { BaseEndpoints } from "@/base/Data/Endpoints/BaseEndpoints";

export class DocumentEndpoints extends BaseEndpoints {
  protected readonly prefix = "dashboard/";

  readonly index = this.url("fetch_documents");
  readonly show = this.url("show_document");
  readonly store = this.url("store_document");
  readonly update = this.url("update_document");
  readonly delete = this.url("delete_document");
}
