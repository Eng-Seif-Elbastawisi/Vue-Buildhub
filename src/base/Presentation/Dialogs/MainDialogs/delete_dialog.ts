import DialogService from "@/base/Presentation/Dialogs/dialog.service";

export default class ShowDeleteDialog extends DialogService {
  private static _instance: ShowDeleteDialog;
  constructor() {
    super();
  }

  static get instance() {
    if (!this._instance) {
      this._instance = new ShowDeleteDialog();
    }
    return this._instance;
  }
}
