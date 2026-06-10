/**
 * Dialog Types
 * Type definitions for the unified dialog system
 */

/**
 * Dialog type enumeration
 */
export const DialogType = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    CONFIRM: 'confirm',
    LOADING: 'loading',
    PROGRESS: 'progress',
} as const;

export type DialogType = (typeof DialogType)[keyof typeof DialogType];

/**
 * Toast position options
 */
export type ToastPosition =
    | 'top-right'
    | 'top-left'
    | 'top-center'
    | 'bottom-right'
    | 'bottom-left'
    | 'bottom-center';

/**
 * Dialog action button configuration
 */
export interface DialogAction {
    /** Button label */
    label: string;

    /** Action type for styling */
    type?: 'primary' | 'secondary' | 'danger' | 'text';

    /** Click handler */
    onClick: () => void | Promise<void>;

    /** Whether to close dialog after action */
    closeOnClick?: boolean;

    /** Disable button */
    disabled?: boolean;

    /** Loading state for async actions */
    loading?: boolean;
}

/**
 * Dialog configuration options
 */
export interface DialogOptions {
    /** Unique identifier */
    id?: string;

    /** Dialog type determines styling and icon */
    type: DialogType;

    /** Dialog title */
    title?: string;

    /** Dialog message/content */
    message: string;

    /** Auto-dismiss duration in milliseconds (0 = no auto-dismiss) */
    duration?: number;

    /** Show close button */
    showClose?: boolean;

    /** Action buttons */
    actions?: DialogAction[];

    /** Progress value (0-100) for progress dialogs */
    progress?: number;

    /** Image for dialog */
    image?: string;

    /** Confirm callback */
    onConfirm?: () => void | Promise<void>;

    /** Cancel callback */
    onCancel?: () => void;

    /** Close callback */
    onClose?: () => void;

    /** Click backdrop to close */
    closeOnBackdrop?: boolean;

    /** Press Escape to close */
    closeOnEscape?: boolean;

    /** Custom icon component/path */
    icon?: string;

    /** Additional CSS class */
    customClass?: string;
}

/**
 * Toast notification options
 */
export interface ToastOptions {
    /** Unique identifier */
    id?: string;

    /** Toast type */
    type: DialogType;

    /** Toast message */
    message: string;

    /** Toast title (optional) */
    title?: string;

    /** Auto-dismiss duration in milliseconds */
    duration?: number;

    /** Position on screen */
    position?: ToastPosition;

    /** Show close button */
    showClose?: boolean;

    /** Click action */
    onClick?: () => void;

    /** Close callback */
    onClose?: () => void;

    /** Custom icon */
    icon?: string;
}

/**
 * Internal toast with required id
 */
export interface Toast extends ToastOptions {
    id: string;
    createdAt: number;
}

/**
 * Dialog state for reactive management
 */
export interface DialogState {
    /** Currently displayed dialog */
    current: DialogOptions | null;

    /** Dialog queue for sequential display */
    queue: DialogOptions[];

    /** Active toasts */
    toasts: Toast[];

    /** Loading dialog state */
    isLoading: boolean;

    /** Loading message */
    loadingMessage?: string;
}

/**
 * Default dialog options
 */
export const DEFAULT_DIALOG_OPTIONS: Partial<DialogOptions> = {
    duration: 3000,
    showClose: true,
    closeOnBackdrop: true,
    closeOnEscape: true,
};

/**
 * Default toast options
 */
export const DEFAULT_TOAST_OPTIONS: Partial<ToastOptions> = {
    duration: 4000,
    position: 'top-right',
    showClose: true,
};

/**
 * Dialog icons by type
 */
export const DIALOG_ICONS: Record<DialogType, string> = {
    [DialogType.SUCCESS]: '✓',
    [DialogType.ERROR]: '✕',
    [DialogType.WARNING]: '⚠',
    [DialogType.INFO]: 'ℹ',
    [DialogType.CONFIRM]: '?',
    [DialogType.LOADING]: '⟳',
    [DialogType.PROGRESS]: '⏳',
};

/**
 * Dialog colors by type (CSS custom properties)
 */
export const DIALOG_COLORS: Record<DialogType, string> = {
    [DialogType.SUCCESS]: 'var(--color-success, #22c55e)',
    [DialogType.ERROR]: 'var(--color-error, #ef4444)',
    [DialogType.WARNING]: 'var(--color-warning, #f59e0b)',
    [DialogType.INFO]: 'var(--color-info, #3b82f6)',
    [DialogType.CONFIRM]: 'var(--color-primary, #6366f1)',
    [DialogType.LOADING]: 'var(--color-primary, #6366f1)',
    [DialogType.PROGRESS]: 'var(--color-primary, #6366f1)',
};
