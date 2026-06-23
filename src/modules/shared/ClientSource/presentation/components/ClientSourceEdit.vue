<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type EditClientSourceParams from '../../core/params/edit.client.source.params.ts';
import ClientSourceController from '../controllers/client.source.controller.ts';
import ShowClientSourceParams from '../../core/params/show.client.source.params.ts';
import ClientSourceForm from './ClientSourceForm.vue';

// Controller instance
const controller = ClientSourceController.getInstance();

// Form state
const params = ref<EditClientSourceParams | null>(null);
const loading = ref(false);
/**
 * Save (create or update) email
 */
const saveClientSource = async () => {
  if (!params.value) {
    console.error('No email parameters to save');
    return;
  }

  loading.value = true;
  try {
    await controller.update(params.value);
  } finally {
    loading.value = false;
  }
};

const updateData = (updatedParams: EditClientSourceParams) => {
  params.value = updatedParams;
  // saveEmail();
};

const route = useRoute();
onMounted(async () => {
  await controller.fetchOne(new ShowClientSourceParams(Number(route.params.id), true));
});
</script>

<template>
  <div class="email-crud-example"> 
    <div class="email-form-card">
      <ClientSourceForm
        :client-source="controller.itemData.value!"
        :loading="loading"
        @update-client-source="updateData"
      />

      <div class="actions" :class="{ disabled: loading }">
        <button type="button" @click="saveClientSource">Save Client Source</button>
      </div>

      <!-- Error Display -->
      <div v-if="controller.errorMessage.value" class="error">
        {{ controller.errorMessage.value }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.email-crud-example {
  padding: 0;
  padding-block: 20px;
}

.actions {
  padding: 0 0 10px 20px;
}

.actions {
  &.disabled {
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.7;
  }
}
</style>
