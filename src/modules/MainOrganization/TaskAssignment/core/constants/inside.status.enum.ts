export const InsideStatusType = {
    ASSIGN: 1,
    WORKING: 2,
    HOLD: 3,
    REVIEW: 4,
} as const;
export type InsideStatusType = (typeof InsideStatusType)[keyof typeof InsideStatusType];
export const Type = InsideStatusType;
export type Type = InsideStatusType;

/**
 * Get i18n key for department type display name
 * Use this with $t() in components to get localized display names
 */
export function getTypeNameKey(type?: InsideStatusType): string {
    switch (type) {
        case InsideStatusType.ASSIGN:
            return 'assigned';
        case InsideStatusType.WORKING:
            return 'working';
        case InsideStatusType.HOLD:
            return 'hold';
        case InsideStatusType.REVIEW:
            return 'review';
        default:
            return 'assigned';
    }
}
