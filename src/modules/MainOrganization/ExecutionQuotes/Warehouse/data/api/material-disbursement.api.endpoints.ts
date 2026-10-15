import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class MaterialDisbursementEndpoints extends BaseEndpoints {
  protected get prefix() {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }

  get index() {
    return this.url('fetch_purchase_request_disbursement_stock');
  }

  get show() {
    return this.url('fetch_purchase_request_disbursements');
  }

  get create() {
    return this.url('store_purchase_request_disbursement');
  }
}
