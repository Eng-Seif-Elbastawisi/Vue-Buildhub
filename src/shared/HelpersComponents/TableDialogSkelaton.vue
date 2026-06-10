<!-- DocumentTypeSkeleton.vue -->
<script setup lang="ts">
defineProps<{
    rows?: number;
}>();
</script>

<template>
    <div class="document-type-skeleton-list">
        <div v-for="i in rows || 6" :key="i" class="document-type-row skeleton-row">
            <!-- Title -->
            <div class="item-title">
                <div class="skeleton skeleton-small-text"></div>
                <div
class="skeleton skeleton-main-text" :style="{
                    width:
                        i % 3 === 0
                            ? '180px'
                            : i % 2 === 0
                                ? '140px'
                                : '220px',
                }"></div>
            </div>

            <!-- Actions -->
            <div class="item-actions">
                <div class="skeleton skeleton-icon"></div>
                <div class="skeleton skeleton-icon"></div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.document-type-skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

/* Skeleton Base */
.skeleton {
    position: relative;
    overflow: hidden;
    background: var(--gray-200);
    border-radius: 10px;

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        transform: translateX(-100%);
        background: linear-gradient(90deg,
                transparent,
                rgba(255, 255, 255, 0.6),
                transparent);
        animation: shimmer 1.3s infinite;
    }
}

@keyframes shimmer {
    100% {
        transform: translateX(100%);
    }
}

/* Row */
.skeleton-row {
    width: 100%;
    background-color: var(--color-light-gray);
    border-radius: 16px;
    padding: 16px;

    display: flex;
    align-items: center;
    justify-content: space-between;
}

/* Title */
.item-title {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.skeleton-small-text {
    width: 90px;
    height: 11px;
    border-radius: 6px;
}

.skeleton-main-text {
    width: 200px;
    height: 18px;
    border-radius: 8px;
}

/* Actions */
.item-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.skeleton-icon {
    width: 34px;
    height: 34px;
    border-radius: 50%;
}
</style>