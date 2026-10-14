import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';
export class PurchaseRequestPricesEndpoints extends BaseEndpoints {
  protected get prefix() {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }
  get index() {
    return this.url('fetch_purchase_request_prices');
  }
  get create() {
    return this.url('store_purchase_request_prices');
  }
}
