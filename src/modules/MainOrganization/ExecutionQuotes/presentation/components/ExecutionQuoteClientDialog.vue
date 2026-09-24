<script setup lang="ts">
  import Dialog from 'primevue/dialog';
  import { ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
  import type ClientShowModel from '@/modules/MainOrganization/client/core/models/client.show.model';
  import type AddClientParams from '@/modules/MainOrganization/client/core/params/add.client.params';
  import ClientForm from '@/modules/MainOrganization/client/presentation/components/clientForm.vue';
  import ClientController from '@/modules/MainOrganization/client/presentation/controllers/client.controller';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';

  const props = defineProps<{
    modelValue: boolean;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [visible: boolean];
    created: [client: ClientShowModel];
  }>();

  const { t } = useI18n();
  const clientController = ClientController.getInstance();
  const clientParams = ref<AddClientParams | null>(null);
  const saving = ref(false);

  const updateVisibility = (visible: boolean) => {
    if (!saving.value) emit('update:modelValue', visible);
  };

  const saveClient = async () => {
    if (!clientParams.value) return;

    const validation = clientParams.value.validate();
    if (!validation.isValid) {
      dialogManager.toastWarning(
        validation.errors[0]?.message ?? t('execution_quote.client_dialog.required_data'),
      );
      return;
    }

    saving.value = true;
    try {
      const response = await clientController.createInline(clientParams.value);
      if (!(response instanceof DataSuccess) || !response.data?.id) return;

      emit('created', response.data);
      emit('update:modelValue', false);
    } finally {
      saving.value = false;
    }
  };

  watch(
    () => props.modelValue,
    (visible) => {
      if (!visible) clientParams.value = null;
    },
  );
</script>

<template>
  <Dialog
    :visible="modelValue"
    modal
    append-to="body"
    class="execution-quote-client-dialog"
    :closable="!saving"
    :dismissable-mask="!saving"
    :draggable="false"
    @update:visible="updateVisibility"
  >
    <template #header>
      <div class="execution-quote-client-dialog__header">
        <span aria-hidden="true">
          <i class="pi pi-user-plus"></i>
        </span>
        <div>
          <h2>{{ $t('execution_quote.client_dialog.title') }}</h2>
          <p>{{ $t('execution_quote.client_dialog.description') }}</p>
        </div>
      </div>
    </template>

    <ClientForm v-if="modelValue" :loading="saving" @update-data="clientParams = $event" />

    <div v-if="clientController.errorMessage.value" class="execution-quote-client-dialog__error">
      {{ clientController.errorMessage.value }}
    </div>

    <template #footer>
      <div class="execution-quote-client-dialog__actions">
        <AppButton theme="secondary" outline :disabled="saving" @click="updateVisibility(false)">
          {{ $t('execution_quote.client_dialog.cancel') }}
        </AppButton>
        <AppButton :loading="saving" @click="saveClient">
          {{ $t('execution_quote.client_dialog.save') }}
        </AppButton>
      </div>
    </template>
  </Dialog>
</template>

<style scoped lang="scss">
  :deep(.execution-quote-client-dialog) {
    width: min(44rem, calc(100vw - 2rem));
  }

  .execution-quote-client-dialog__header,
  .execution-quote-client-dialog__actions {
    display: flex;
    align-items: center;
  }

  .execution-quote-client-dialog__header {
    gap: 0.75rem;
    text-align: start;
  }

  .execution-quote-client-dialog__header > span {
    display: grid;
    flex: 0 0 2.75rem;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: var(--radius-md);
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
  }

  .execution-quote-client-dialog__header h2,
  .execution-quote-client-dialog__header p {
    margin: 0;
  }

  .execution-quote-client-dialog__header h2 {
    color: var(--title-card-color);
    font-size: var(--md-size-2);
  }

  .execution-quote-client-dialog__header p {
    margin-block-start: 0.25rem;
    color: var(--subtitle-color);
    font-size: var(--sm-size);
  }

  .execution-quote-client-dialog__actions {
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .execution-quote-client-dialog__error {
    margin-block-start: 1rem;
    padding: 0.75rem;
    border: 1px solid var(--danger);
    border-radius: var(--radius-sm);
    background: var(--danger-light);
    color: var(--danger-dark);
    text-align: start;
  }
</style>
