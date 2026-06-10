import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class QuestionEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('fetch_questions');
  readonly show = this.url('show_question');
  readonly store = this.url('store_question');
  readonly update = this.url('update_question');
  readonly delete = this.url('delete_question');
}
