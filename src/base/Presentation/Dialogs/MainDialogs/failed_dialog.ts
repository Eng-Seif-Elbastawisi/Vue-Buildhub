import DialogService from "@/base/Presentation/Dialogs/dialog.service";

export default class ShowFailedDialog extends DialogService {
  private static _instance: ShowFailedDialog;

  constructor() {
    super();
  }

  static get instance() {
    if (!this._instance) {
      this._instance = new ShowFailedDialog();
    }
    return this._instance;
  }
}
