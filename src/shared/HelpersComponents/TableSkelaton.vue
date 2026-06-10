<!-- TableSkeleton.vue -->
<script setup lang="ts">
defineProps<{
    rows?: number;
    columns?: number;
    showIndex?: boolean;
    selectable?: boolean;
    hasActions?: boolean;
}>();
</script>

<template>
    <div class="app-table-wrapper skeleton-wrapper">
        <div class="table-responsive">
            <table class="app-table skeleton-table">
                <!-- Header -->
                <thead>
                    <tr>
                        <!-- Checkbox -->
                        <th v-if="selectable" class="th-checkbox">
                            <div class="skeleton skeleton-checkbox"></div>
                        </th>

                        <!-- Index -->
                        <th v-if="showIndex" class="th-index">
                            <div class="skeleton skeleton-text small"></div>
                        </th>

                        <!-- Headers -->
                        <th v-for="i in columns" :key="'head-' + i">
                            <div class="skeleton skeleton-text"></div>
                        </th>

                        <!-- Actions -->
                        <th v-if="hasActions" class="th-actions">
                            <div class="skeleton skeleton-text small"></div>
                        </th>
                    </tr>
                </thead>

                <!-- Body -->
                <tbody>
                    <tr v-for="row in rows || 6" :key="'row-' + row">
                        <!-- Checkbox -->
                        <td v-if="selectable" class="td-checkbox">
                            <div class="skeleton skeleton-checkbox"></div>
                        </td>

                        <!-- Index -->
                        <td v-if="showIndex" class="td-index">
                            <div class="skeleton skeleton-text tiny"></div>
                        </td>

                        <!-- Cells -->
                        <td v-for="col in columns" :key="'col-' + col">
                            <div
class="skeleton skeleton-text" :style="{
                                width:
                                    col % 4 === 0
                                        ? '90%'
                                        : col % 3 === 0
                                            ? '70%'
                                            : col % 2 === 0
                                                ? '55%'
                                                : '80%',
                            }"></div>
                        </td>

                        <!-- Actions -->
                        <td v-if="hasActions" class="td-actions">
                            <div class="actions-skeleton">
                                <div class="skeleton skeleton-circle"></div>
                                <div class="skeleton skeleton-circle"></div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped lang="scss">
.skeleton-wrapper {
    overflow: hidden;
}

/* Skeleton Animation */
.skeleton {
    position: relative;
    overflow: hidden;
    background: var(--gray-200);
    border-radius: 8px;

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        transform: translateX(-100%);
        background: linear-gradient(90deg,
                transparent,
                rgba(255, 255, 255, 0.5),
                transparent);
        animation: shimmer 1.4s infinite;
    }
}

@keyframes shimmer {
    100% {
        transform: translateX(100%);
    }
}

/* Shapes */
.skeleton-text {
    height: 14px;
    width: 100%;

    &.small {
        width: 60%;
    }

    &.tiny {
        width: 24px;
    }
}

.skeleton-checkbox {
    width: 18px;
    height: 18px;
    border-radius: 5px;
}

.skeleton-circle {
    width: 34px;
    height: 34px;
    border-radius: 50%;
}

/* Table Styling */
.skeleton-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;

    thead th {
        padding: 24px 16px;
        background: var(--color-light-gray);
        border-bottom: 1px solid var(--border-weak);
    }

    tbody tr {
        position: relative;

        td {
            padding: 18px 16px;
            border-bottom: 1px solid var(--border-weak);
        }
    }

    .th-checkbox,
    .td-checkbox {
        width: 50px;
        text-align: center;
    }

    .th-index,
    .td-index {
        width: 60px;
        text-align: center;
    }

    .th-actions,
    .td-actions {
        width: 120px;
        text-align: center;
    }
}

.actions-skeleton {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}
</style>