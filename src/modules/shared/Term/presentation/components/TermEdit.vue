<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import TermForm from './TermForm.vue';
  import type EditTermParams from '../../core/params/edit.term.params.ts';
  import TermController from '../controllers/term.controller.ts';
  import TermIdParams from '../../core/params/term-id.params.ts';

  const controller = TermController.getInstance();
  const route = useRoute();
  const params = ref<EditTermParams | null>(null);
  const loading = ref(false);

  const save = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => controller.fetchOne(new TermIdParams(Number(route.params.id))));
</script>

<template>
  <section class="department-page">
    <TermForm
      :term="controller.itemData.value ?? undefined"
      :loading="loading"
      @update-data="(value) => (params = value as EditTermParams)"
    />
    <AppButton :loading="loading" :title="$t('save')" type="button" @click="save">{{
      $t('save')
    }}</AppButton>
    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </section>
</template>

<style scoped>
  .error {
    margin-top: 20px;
    padding: 10px;
    background-color: var(--danger-light);
    color: var(--danger-dark);
    border: 1px solid #f5c6cb;
    border-radius: 4px;
  }
</style>
