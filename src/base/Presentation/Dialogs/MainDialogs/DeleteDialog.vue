<script lang="ts" setup>
  import { inject, ref } from 'vue';
  import Dialog from 'primevue/dialog';
  const visible = ref(false);
  const emits = defineEmits(['delete']);
  const trigger = ref<HTMLElement | null>(null);
  const armDestructiveRemoval = inject<(element: HTMLElement | null) => void>(
    'dashboard-destructive-motion',
    () => undefined,
  );

  const confirmDelete = () => {
    armDestructiveRemoval(trigger.value);
    emits('delete');
    visible.value = false;
  };

  const {
    title = 'delete',
    message = 'delete_message',
    hasbtn,
    triggerLabel,
    triggerClass,
    disabled = false,
  } = defineProps<{
    title?: string;
    message?: string;
    hasbtn?: boolean;
    triggerLabel?: string;
    triggerClass?: string;
    disabled?: boolean;
  }>();
</script>

<template>
  <button v-if="hasbtn" ref="trigger" :disabled="disabled" @click="visible = true">
    <slot name="btn"> </slot>
  </button>
  <button v-else ref="trigger" :class="triggerClass" :disabled="disabled" @click="visible = true">
    {{ triggerLabel ?? $t('Delete') }}
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14.25 5.25L13.5995 14.3569C13.5434 15.1418 12.8903 15.75 12.1033 15.75H5.89668C5.10972 15.75 4.45656 15.1418 4.40049 14.3569L3.75 5.25M7.5 8.25V12.75M10.5 8.25V12.75M11.25 5.25V3C11.25 2.58579 10.9142 2.25 10.5 2.25H7.5C7.08579 2.25 6.75 2.58579 6.75 3V5.25M3 5.25H15"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
  <Dialog
    v-model:visible="visible"
    :modal="true"
    :pt="{
      root: 'delete-dialog dashboard-destructive-dialog',
      header: 'dialog-header',
      content: 'dialog-body',
    }"
    :style="{ width: 'min(35rem, calc(100vw - 2rem))' }"
  >
    <template #container>
      <span class="dashboard-destructive-dialog__mark" aria-hidden="true">
        <i class="pi pi-trash"></i>
      </span>

      <h4 class="dialog-title">{{ title }}</h4>
      <p class="dialog-message">{{ message }}</p>
      <div class="flex gap-2 items-center btns">
        <button class="btn btn-delete-danger" :disabled="disabled" @click="confirmDelete">
          {{ $t('yes_delete_it') }}
        </button>
        <button class="btn btn-third" @click="visible = false">{{ $t('cancel') }}</button>
      </div>
    </template>
  </Dialog>
</template>

<style lang="scss">
  .dashboard-destructive-dialog .dashboard-destructive-dialog__mark {
    display: grid;
    width: 48px;
    height: 48px;
    place-items: center;
    margin: 0 auto 14px;
    border: 1px solid var(--danger-light, var(--quote-line));
    border-radius: 12px;
    color: var(--danger-dark, var(--quote-ink));
    background: color-mix(
      in sRGB,
      var(--danger-light, var(--white)) 55%,
      var(--quote-paper, var(--white))
    );
    font-size: 1.2rem;
    animation: dashboard-destructive-settle var(--motion-base, 200ms) var(--motion-ease, ease-out)
      both;
  }

  @keyframes dashboard-destructive-settle {
    from {
      opacity: 0.55;
      transform: translateY(-3px) scaleY(1.08);
    }

    to {
      opacity: 1;
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .dashboard-destructive-dialog .dashboard-destructive-dialog__mark {
      animation: none;
    }
  }
</style>
