import { BaseEndpoints } from "@/base/Data/Endpoints/BaseEndpoints";

export class SuppliersEndpoints extends BaseEndpoints {
  protected readonly prefix = "organization/";

  readonly index = this.url("fetch_suppliers");
  readonly show = this.url("show_supplier");
  readonly store = this.url("store_supplier");
  readonly update = this.url("update_supplier");
  readonly delete = this.url("delete_supplier");
}
