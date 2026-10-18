<script setup lang="ts">
  import Dialog from 'primevue/dialog';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';

  defineProps<{ visible: boolean }>();
  const emit = defineEmits<{ keep: []; discard: [] }>();
</script>
<template>
  <Dialog
    :visible="visible"
    modal
    class="workspace-dialog procurement-discard-dialog"
    :header="$t('unsaved_changes')"
    :style="{ width: '28rem', maxWidth: 'calc(100vw - 2rem)' }"
    :closable="false"
    :dismissable-mask="false"
    @update:visible="emit('keep')"
  >
    <p>{{ $t('procurement.discard_form_changes') }}</p>
    <div class="procurement-actions">
      <AppButton type="button" theme="secondary" @click="emit('keep')">{{
        $t('keep_editing')
      }}</AppButton>
      <AppButton type="button" @click="emit('discard')">{{ $t('leave_without_saving') }}</AppButton>
    </div>
  </Dialog>
</template>
