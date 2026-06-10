<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import Privecyicon from '@/shared/icons/privecyicon.vue';
  import TranslationParams from '@/modules/about/core/params/translation.params';
  import TermsConditionsController from '../controllers/terms-conditions.controller';
  import AddTermsConditionsParams from '../../core/params/add.terms-conditions.params';
  import { useRouter } from 'vue-router';

  const emit = defineEmits(['update:data']);

  const title = ref<Record<string, string> | string>();
  const description = ref<Record<string, string> | string>();
  const termsConditionsController = TermsConditionsController.getInstance();
  const loading = ref(false);

  const status = computed(() => termsConditionsController.listState.value);
  const updateData = () => {
    const Data = {
      title: title.value,
      description: description.value,
    };
    emit('update:data', Data);
  };

  // ─── Init ───────────────────────────────
  onMounted(() => {
    updateData();
  });

  const SubmitData = async () => {
    loading.value = true;
    try {
      await termsConditionsController.create(
        new AddTermsConditionsParams({
          translations: new TranslationParams({
            title: title.value as Record<string, string>,
            description: description.value as Record<string, string>,
          }),
        }),
      );
    } finally {
      loading.value = false;
      router.push({ name: 'TermsConditions' });
    }
  };

  const ShowPrivacy = async () => {
    await termsConditionsController.fetchList();

    const firstItem = status.value.data?.[0];
    // console.log(firstItem, 'firstItem');
    if (firstItem) {
      title.value = firstItem?.title;
      description.value = firstItem?.description;
    }
  };

  onMounted(() => {
    ShowPrivacy();
  });

  onUnmounted(() => {
    title.value = {};
    description.value = {};
  });

  const ResetData = () => {
    title.value = {};
    description.value = {};
  };
  const router = useRouter();
  const goBack = () => {
    router.back();
  };
</script>

<template>
  <div class="terms-container">
    <!-- Header -->
    <div class="terms-header">
      <h3>{{ $t('Terms & Conditions') }}</h3>
      <p>{{ $t('Add or update the terms and conditions of your platform') }}</p>
    </div>

    <div class="form-header-left">
      <p><Privecyicon /> {{ $t(`Terms Details`) }}</p>
      <button class="reset-btn" @click="ResetData">{{ $t(`reset`) }}</button>
    </div>

    <!-- List -->
    <div class="terms-list">
      <!-- Question -->
      <div class="field" :class="{ disabled: loading }">
        <MultiLangInput
          :field-key="`terms`"
          :label="`terms title`"
          :languages="['en', 'ar']"
          :type="`title`"
          :model-value="title as Record<string, string>"
          @update:model-value="title = $event"
        />
      </div>
      <div class="field" :class="{ disabled: loading }">
        <MultiLangInput
          :field-key="`terms`"
          :label="`terms description`"
          :languages="['en', 'ar']"
          :model-value="description as Record<string, string>"
          :type="`description`"
          @update:model-value="description = $event"
        />
      </div>
    </div>

    <!-- Add Button -->
    <div class="btn-container" :class="{ disabled: loading }">
      <button class="btn btn-primary" @click="SubmitData">
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t(`Save`) }}</span>
      </button>
      <button class="btn btn-cancel" @click="goBack">{{ $t(`cancel`) }}</button>
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
  @keyframes l1 {
    to {
      transform: rotate(0.5turn);
    }
  }
  @keyframes l7 {
    to {
      transform: rotate(0.5turn);
    }
  }
  .field {
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }

  .btn-container {
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }
</style>
