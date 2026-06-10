import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class DocumentTypeEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly store = this.url('store_document_type');
  readonly index = this.url('fetch_document_types');
  readonly update = this.url('update_document_type');
  readonly delete = this.url('delete_document_type');
  readonly show = this.url('show_document_type');
}
