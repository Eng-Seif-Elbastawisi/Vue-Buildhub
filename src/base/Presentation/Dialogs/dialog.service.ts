export default class DialogService {
  openDialog({
    dialogName,
    imageElement = null,
    titleContent = null,
    messageContent = null,
  }: {
    dialogName: string;
    imageElement: string | null;
    titleContent: string | null;
    messageContent: string | null;
  }) {
    const dialog: HTMLDialogElement | null = document.querySelector(
      `.${dialogName}`,
    );
    const title: HTMLElement | null = document.querySelector(`.dialog-title`);
    const message: HTMLElement | null =
      document.querySelector(`.dialog-message`);
    const image: HTMLImageElement | null =
      document.querySelector(`.dialog-icon`);
    if (dialog) {
      dialog.showModal();
      if (image)
        if (typeof imageElement === "string") {
          image.src = imageElement;
        }
      if (message) message.textContent = messageContent;
      if (title) title.textContent = titleContent;
      setTimeout(() => {
        dialog.close();
      }, 3000);
    }
  }

  closeDialog(dialogName: string) {
    const dialog: HTMLDialogElement | null = document.querySelector(
      `.${dialogName}`,
    );
    if (dialog) dialog.close();
  }

  returnValue(dialogName: string) {
    const dialog: HTMLDialogElement | null = document.querySelector(
      `.${dialogName}`,
    );
    if (dialog) return dialog.returnValue;
  }
}
