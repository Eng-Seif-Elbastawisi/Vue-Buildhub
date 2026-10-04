import { afterEach, describe, expect, it } from 'vitest';
import { dialogManager } from '../dialog.manager';

describe('construction dialog feedback', () => {
  afterEach(() => dialogManager.reset());

  it('keeps delete errors verbatim and marks them for the blocked-removal scene', () => {
    const backendMessage = 'This item is related to other data';

    dialogManager.deleteError(backendMessage);

    expect(dialogManager.currentDialog.value?.message).toBe(backendMessage);
    expect(dialogManager.currentDialog.value?.constructionState).toBe('delete-error');
  });

  it('marks deletion loading without relying on localized message text', () => {
    dialogManager.loading('جارٍ الحذف', 'delete');

    expect(dialogManager.loadingKind.value).toBe('delete');
    dialogManager.hideLoading();
    expect(dialogManager.loadingKind.value).toBe('default');
  });
});
