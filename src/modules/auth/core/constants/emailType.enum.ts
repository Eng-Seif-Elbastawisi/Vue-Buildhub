/**
 * Email type enumeration
 */
export const EmailType = {
    EMPLOYEE: 1,
    PERSONAL: 2,
    WORK: 3,
    OTHER: 4,
} as const;

export type EmailType = typeof EmailType[keyof typeof EmailType];

/**
 * Get i18n key for email type display name
 * Use this with $t() in components to get localized display names
 */
export function getEmailTypeNameKey(type: EmailType): string {
    switch (type) {
        case EmailType.EMPLOYEE:
            return "employee";
        case EmailType.PERSONAL:
            return "personal";
        case EmailType.WORK:
            return "work";
        case EmailType.OTHER:
            return "other";
        default:
            return "unknown";
    }
}
