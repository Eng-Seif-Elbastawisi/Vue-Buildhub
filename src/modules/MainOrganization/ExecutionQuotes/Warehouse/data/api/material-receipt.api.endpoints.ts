import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';
export class MaterialReceiptEndpoints extends BaseEndpoints {
  protected get prefix() {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }
  get index() {
    return this.url('fetch_purchase_request_receipts');
  }
  get show() {
    return this.url('fetch_purchase_request_receipts_history');
  }
  get create() {
    return this.url('store_purchase_request_receipt');
  }
}
