import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class AttachmentTypeApiEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }

  readonly index = this.url('fetch_attachment_types');
  readonly show = this.url('show_attachment_type');
  readonly store = this.url('store_attachment_type');
  readonly update = this.url('update_attachment_type');
  readonly delete = this.url('delete_attachment_type');
}
