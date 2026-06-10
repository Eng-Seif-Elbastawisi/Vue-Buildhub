export default class ShowLoader {
  private static _instance: ShowLoader;
  private constructor() {}

  static get instance() {
    if (!this._instance) {
      this._instance = new ShowLoader();
    }
    return this._instance;
  }

  private dialog: HTMLDialogElement | null =
    document.querySelector(".loader-dialog");
  public showLoader() {
    this.dialog?.showModal();
  }

  public hideLoader() {
    this.dialog?.close();
  }
}
