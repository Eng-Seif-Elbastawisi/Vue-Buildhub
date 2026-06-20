import { BaseEndpoints } from "@/base/Data/Endpoints/BaseEndpoints";

export class MaterialApiEndpoints extends BaseEndpoints {
  protected readonly prefix = "dashboard/";

  readonly index = this.url("fetch_material");
  readonly show = this.url("show_material");
  readonly store = this.url("add_material");
  readonly update = this.url("update_material");
  readonly delete = this.url("delete_material");
}
