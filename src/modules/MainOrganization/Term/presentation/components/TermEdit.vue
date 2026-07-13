<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddTermParams from '../../core/params/add.term.params.ts';
  import EditTermParams from '../../core/params/edit.term.params.ts';
  import ShowTermParams from '../../core/params/show.term.params.ts';
  import TermController from '../controllers/term.controller.ts';
  import TermForm from './TermForm.vue';

  const controller = TermController.getInstance();
  const route = useRoute();
  const termId = Number(route.params.term_id);
  const params = ref<EditTermParams | null>(null);
  const loading = ref(false);
  const updateData = (data: AddTermParams) => {
    params.value = new EditTermParams({
      termId,
      translations: data.translations,
    });
  };
  const saveTerm = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value, undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };
  onMounted(async () => {
    await controller.fetchOne(new ShowTermParams({ termId, allLocales: true }));
  });
</script>

<template>
  <div class="Term-crud-page">
    <TermForm :Term="controller.itemData.value!" :loading="loading" @update-data="updateData" />
    <button
      :class="{ 'btn--loading': loading }"
      class="btn btn-primary"
      type="button"
      :disabled="loading"
      @click="saveTerm"
    >
      {{ $t('Term.update') }}
    </button>
    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped>
  .Term-crud-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .error {
    margin-top: 20px;
    padding: 10px;
    background-color: var(--danger-light);
    color: var(--danger-dark);
    border: 1px solid #f5c6cb;
    border-radius: 4px;
  }

  .btn-primary {
    width: 100%;
  }
</style>
