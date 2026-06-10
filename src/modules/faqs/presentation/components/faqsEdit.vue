<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import FaqsController from '../controllers/faqs.controller';
  import type EditFaqsParams from '../../core/params/edit.faqs.params';
  import FaqsDetailsParams from '../../core/params/faqs.details.params';
  import FaqsForm from './faqsForm.vue';
  import type AddFaqsParams from '../../core/params/add.faqs.params';

  const controller = FaqsController.getInstance();
  const router = useRouter();
  const route = useRoute();

  const formParams = ref<EditFaqsParams | null>(null);
  const isLoaded = ref(false);
  const loading = ref(false);
  // const currentFaq = computed(() => controller.itemState.value)
  const currentFaq = computed(() => controller.itemState.value?.data);

  const saveChange = async () => {
    if (!formParams.value || !currentFaq.value?.id) return;
    loading.value = true;
    try {
      await controller.update(formParams.value);
      router.push('/faqs');
    } finally {
      loading.value = false;
    }
  };

  const cancel = () => {
    router.push('/faqs');
  };

  const updateData = (params: EditFaqsParams | AddFaqsParams) => {
    formParams.value = params as EditFaqsParams;
  };

  onMounted(async () => {
    await controller.fetchOne(new FaqsDetailsParams({ id: Number(route.params.id) }));
    isLoaded.value = true;
  });
</script>

<template>
  <div class="faqs-edit-page">
    <div class="faqs-header">
      <h2 class="faqs-title">{{ $t('faqs') }}</h2>
      <p class="faqs-description">{{ $t('faqs_description') }}</p>
    </div>

    <!-- <FaqsForm v-if="isLoaded" :faq="currentFaq.data!" @update-data="updateData" /> -->
    <FaqsForm v-if="isLoaded" :faq="currentFaq!" :loading="loading" @update-data="updateData" />
    <div v-if="isLoaded" class="form-actions" :class="{ disabled: loading }">
      <button class="btn btn-primary" type="button" @click="saveChange">
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('save_change') }}</span>
      </button>
      <button class="btn btn-cancel" type="button" @click="cancel">{{ $t('cancel') }}</button>
    </div>

    <div v-if="controller.errorMessage.value" class="error-toast">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .loader {
    width: 35px;
    height: 35px;  
    border-radius: 50%;
    border: 8px solid;
    border-color: #000 #0000;
    animation: l1 1s infinite;
  }
  @keyframes l1 {to{transform: rotate(.5turn)}}
  @keyframes l7 {to{transform: rotate(.5turn)}}
  .form-actions {
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }
</style>
