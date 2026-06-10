/**
 * Dialog Manager
 * Reactive singleton for managing dialogs and toasts
 */

import { ref, computed, type Ref, type ComputedRef } from 'vue';

//images for dialogs
import successImage from '@/assets/images/dialogs/Success.gif';
import errorImage from '@/assets/images/dialogs/error.png';
import warningImage from '@/assets/images/dialogs/warning.png';
import infoImage from '@/assets/images/dialogs/info.png';

import {
  DialogType,
  type DialogOptions,
  type ToastOptions,
  type Toast,
  type DialogState,
  DEFAULT_DIALOG_OPTIONS,
  DEFAULT_TOAST_OPTIONS,
} from './dialog.types';

const ImgDialog = {
  success: successImage,
  error: errorImage,
  warning: warningImage,
  info: infoImage,
};

/**
 * Generate unique ID
 */
function generateId(): string {
  return `dialog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * DialogManager - Singleton for managing dialogs and toasts
 */
class DialogManager {
  private static _instance: DialogManager;

  // =========================================================================
  // Reactive State
  // =========================================================================

  /** Current dialog being displayed */
  public currentDialog: Ref<DialogOptions | null> = ref(null);

  /** Queue of pending dialogs */
  public dialogQueue: Ref<DialogOptions[]> = ref([]);

  /** Active toasts */
  public toasts: Ref<Toast[]> = ref([]);

  /** Loading state */
  public isLoading: Ref<boolean> = ref(false);

  /** Loading message */
  public loadingMessage: Ref<string> = ref('');

  /** Progress value for loading */
  public loadingProgress: Ref<number> = ref(0);

  // =========================================================================
  // Computed Properties
  // =========================================================================

  /** Check if any dialog is open */
  public hasOpenDialog: ComputedRef<boolean> = computed(() => {
    return this.currentDialog.value !== null || this.isLoading.value;
  });

  /** Check if there are pending dialogs */
  public hasPendingDialogs: ComputedRef<boolean> = computed(() => {
    return this.dialogQueue.value.length > 0;
  });

  /** Get toast count */
  public toastCount: ComputedRef<number> = computed(() => {
    return this.toasts.value.length;
  });

  // =========================================================================
  // Constructor
  // =========================================================================

  private constructor() {}

  /**
   * Get singleton instance
   */
  static get instance(): DialogManager {
    if (!this._instance) {
      this._instance = new DialogManager();
    }
    return this._instance;
  }

  // =========================================================================
  // Dialog Methods
  // =========================================================================

  /**
   * Show a dialog
   */
  show(options: DialogOptions): string {
    const dialogOptions: DialogOptions = {
      ...DEFAULT_DIALOG_OPTIONS,
      ...options,
      id: options.id || generateId(),
    };

    // If a dialog is already open, queue this one
    if (this.currentDialog.value) {
      this.dialogQueue.value.push(dialogOptions);
    } else {
      this.currentDialog.value = dialogOptions;
    }

    return dialogOptions.id!;
  }

  /**
   * Show success dialog
   */
  success(message: string, options?: Partial<DialogOptions>): string {
    return this.show({
      type: DialogType.SUCCESS,
      title: 'Success',
      image: ImgDialog.success,
      message,
      duration: 3000,
      ...options,
    });
  }

  /**
   * Show error dialog
   */
  error(message: string, options?: Partial<DialogOptions>): string {
    return this.show({
      type: DialogType.ERROR,
      title: 'Error',
      image: ImgDialog.error,
      message,
      duration: 5000,
      ...options,
    });
  }

  /**
   * Show warning dialog
   */
  warning(message: string, options?: Partial<DialogOptions>): string {
    return this.show({
      type: DialogType.WARNING,
      title: 'Warning',
      image: ImgDialog.warning,
      message,
      duration: 4000,
      ...options,
    });
  }

  /**
   * Show info dialog
   */
  info(message: string, options?: Partial<DialogOptions>): string {
    return this.show({
      type: DialogType.INFO,
      title: 'Information',
      image: ImgDialog.info,
      message,
      duration: 3000,
      ...options,
    });
  }

  /**
   * Show confirmation dialog
   */
  confirm(
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: Partial<DialogOptions>,
  ): string {
    return this.show({
      type: DialogType.CONFIRM,
      title: 'Confirm',
      image: ImgDialog.warning,
      message,
      duration: 0, // Don't auto-dismiss
      closeOnBackdrop: false,
      onConfirm,
      actions: [
        {
          label: 'Cancel',
          type: 'secondary',
          onClick: () => this.closeDialog(),
          closeOnClick: true,
        },
        {
          label: 'Confirm',
          type: 'primary',
          onClick: async () => {
            await onConfirm();
            this.closeDialog();
          },
          closeOnClick: true,
        },
      ],
      ...options,
    });
  }

  /**
   * Close current dialog
   */
  closeDialog(): void {
    const current = this.currentDialog.value;

    if (current?.onClose) {
      current.onClose();
    }

    this.currentDialog.value = null;

    // Show next dialog in queue
    if (this.dialogQueue.value.length > 0) {
      const next = this.dialogQueue.value.shift();
      if (next) {
        setTimeout(() => {
          this.currentDialog.value = next;
        }, 100); // Small delay for animation
      }
    }
  }

  /**
   * Close all dialogs including queue
   */
  closeAllDialogs(): void {
    this.dialogQueue.value = [];
    this.closeDialog();
  }

  // =========================================================================
  // Loading Methods
  // =========================================================================

  /**
   * Show loading dialog
   */
  loading(message: string = 'Loading...'): void {
    this.isLoading.value = true;
    this.loadingMessage.value = message;
    this.loadingProgress.value = 0;
  }

  /**
   * Update loading progress
   */
  progress(value: number, message?: string): void {
    this.loadingProgress.value = Math.min(Math.max(value, 0), 100);
    if (message) {
      this.loadingMessage.value = message;
    }
  }

  /**
   * Hide loading dialog
   */
  hideLoading(): void {
    this.isLoading.value = false;
    this.loadingMessage.value = '';
    this.loadingProgress.value = 0;
  }

  // =========================================================================
  // Toast Methods
  // =========================================================================

  /**
   * Show a toast notification
   */
  toast(options: ToastOptions): string {
    const toastId = options.id || generateId();

    const toast: Toast = {
      ...DEFAULT_TOAST_OPTIONS,
      ...options,
      id: toastId,
      createdAt: Date.now(),
    };

    this.toasts.value.push(toast);

    // Auto-dismiss
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.dismissToast(toastId);
      }, toast.duration);
    }

    return toastId;
  }

  /**
   * Show success toast
   */
  toastSuccess(message: string, options?: Partial<ToastOptions>): string {
    return this.toast({
      type: DialogType.SUCCESS,
      message,
      ...options,
    });
  }

  /**
   * Show error toastap
   */
  toastError(message: string, options?: Partial<ToastOptions>): string {
    return this.toast({
      type: DialogType.ERROR,
      message,
      duration: 10000, // Longer for errors
      ...options,
    });
  }

  /**
   * Show warning toast
   */
  toastWarning(message: string, options?: Partial<ToastOptions>): string {
    return this.toast({
      type: DialogType.WARNING,
      message,
      duration: 10000,
      ...options,
    });
  }

  /**
   * Show info toast
   */
  toastInfo(message: string, options?: Partial<ToastOptions>): string {
    return this.toast({
      type: DialogType.INFO,
      message,
      ...options,
    });
  }

  /**
   * Dismiss a toast by ID
   */
  dismissToast(id: string): void {
    const index = this.toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      const toast = this.toasts.value[index];
      if (toast && toast.onClose) {
        toast.onClose();
      }
      this.toasts.value.splice(index, 1);
    }
  }

  /**
   * Dismiss all toasts
   */
  dismissAllToasts(): void {
    this.toasts.value.forEach((toast) => {
      if (toast && toast.onClose) {
        toast.onClose();
      }
    });
    this.toasts.value = [];
  }

  // =========================================================================
  // Utility Methods
  // =========================================================================

  /**
   * Reset all dialog state
   */
  reset(): void {
    this.currentDialog.value = null;
    this.dialogQueue.value = [];
    this.toasts.value = [];
    this.isLoading.value = false;
    this.loadingMessage.value = '';
    this.loadingProgress.value = 0;
  }

  /**
   * Get dialog state for debugging
   */
  getState(): DialogState {
    return {
      current: this.currentDialog.value,
      queue: this.dialogQueue.value,
      toasts: this.toasts.value,
      isLoading: this.isLoading.value,
      loadingMessage: this.loadingMessage.value,
    };
  }
}

// Export singleton instance
export default DialogManager;

// Export for convenience
export const dialogManager = DialogManager.instance;
