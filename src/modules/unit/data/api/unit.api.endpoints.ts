import { BaseEndpoints } from "@/base/Data/Endpoints/BaseEndpoints";

export class UnitEndpoints extends BaseEndpoints {
  protected readonly prefix = "organization/";

  readonly index = this.url("fetch_units");
  readonly show = this.url("show_unit");
  readonly store = this.url("store_unit");
  readonly update = this.url("update_unit");
  readonly delete = this.url("delete_unit");
}
