<script setup lang="ts">
  import { ref, watch } from 'vue';
  import ToggleSwitch from 'primevue/toggleswitch';

  import ChangeStatusController from '../controllers/change_status.controller';
  import { type StatusTypeEnum } from '../../core/constant/change_status.type.enum';
  import ChangeStatusParams from '../../core/params/change_status.params';

  const props = defineProps<{
    id: number;
    type: StatusTypeEnum;
    initialIsActive?: boolean;
  }>();

  const emit = defineEmits<{
    reload: [];
  }>();

  const isActive = ref(props.initialIsActive ?? false);
  const isLoading = ref(false);

  watch(
    () => props.initialIsActive,
    (newVal) => {
      isActive.value = newVal ?? false;
    },
  );

  const controller = ChangeStatusController.getInstance();

  const confirm = async (value: boolean) => {
    if (isLoading.value) return;

    isActive.value = value;

    isLoading.value = true;

    try {
      await controller.changeStatus(
        new ChangeStatusParams({
          typeId: props.id,
          type: props.type,
        }),
      );

      emit('reload');
    } catch (error) {
      console.error(error);

      isActive.value = !value;
    } finally {
      isLoading.value = false;
    }
  };
</script>

<template>
  <div
    class="change-status-wrapper"
    :class="{ 'change-status-wrapper--deactivating': isLoading && !isActive }"
  >
    <i v-if="isLoading" class="pi pi-spin pi-spinner status-loader" />

    <ToggleSwitch
      v-else
      :model-value="isActive"
      :input-id="`switch-${id}-${type}`"
      :disabled="isLoading"
      @update:model-value="confirm"
    />
  </div>
</template>

<style scoped lang="scss">
  .change-status-wrapper {
    width: 40px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    transition: background-color var(--motion-base, 200ms) var(--motion-ease, ease-out);
  }

  .change-status-wrapper--deactivating {
    background: var(--danger-light, var(--gray-100));
  }

  .change-status-wrapper--deactivating .status-loader {
    color: var(--danger-dark, var(--gray-700));
    animation-duration: var(--motion-loading, 1000ms);
  }

  .status-loader {
    font-size: 18px;
  }

  @media (prefers-reduced-motion: reduce) {
    .change-status-wrapper {
      transition: none;
    }

    .change-status-wrapper--deactivating .status-loader {
      animation: none;
    }
  }
</style>
