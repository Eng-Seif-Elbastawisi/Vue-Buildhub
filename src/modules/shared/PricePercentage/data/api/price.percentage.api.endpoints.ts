import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { UserType } from '@/modules/auth/core/constants/userType.enum';
import { useUserStore } from '@/stores/user';

export class PricePercentageApiEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === UserType.ADMIN ? 'mainportal/' : 'organization/';
  }

  readonly update = this.url('set_invoice_offer');
}
