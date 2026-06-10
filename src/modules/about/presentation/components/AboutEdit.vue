<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import type EditAboutParams from '../../core/params/edit.about.params';
  import AboutController from '../controllers/about.controller';
  import ShowAboutParams from '../../core/params/show.about.params';
  import AboutForm from './AboutForm.vue';

  const controller = AboutController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;

  const params = ref<EditAboutParams | null>(null);
  const loading = ref(false);

  const router = useRouter();
  /**
   * Update employee
   */
  const saveAbout = async () => {
    if (!params.value) {
      console.error('No data to save');
      return;
    }

    loading.value = true;
    try {
      // console.log(params.value, "params.value")
      await controller.update(params.value, undefined);
      router.push({ name: 'About' });
    } finally {
      loading.value = false;
    }
  };

  const updateData = (updatedParams: EditAboutParams) => {
    params.value = updatedParams;
  };

  onMounted(async () => {
    await controller.fetchOne(new ShowAboutParams(2));
  });
</script>

<template>
  <div class="employee-edit-page">
    <AboutForm
      :about="controller.itemState.value.data!"
      :form-key="formKey"
      :loading="loading"
      @update-data="updateData"
    />

    <div class="actions" :class="{ disabled: loading }">
      <!-- <AppButton title="Update Employee" size="sm" icon="right" type="submit" @click="saveAbout">
        Update Employee
        <template #icon>
          <IconAccept />
        </template>
</AppButton> -->
      <button class="btn btn-primary w-full" type="submit" @click="saveAbout">
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('save') }}</span>
      </button>
    </div>

    <!-- Error Display -->
    <div v-if="controller.errorMessage.value" class="error-toast">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  // .employee-edit-page {
  //   padding: 24px;
  //   max-width: 1000px;
  //   margin: 0 auto;
  // }

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
  .actions {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }

  .error-toast {
    margin-top: 20px;
    padding: 12px 16px;
    background-color: var(--error-light);
    color: var(--error-dark);
    border: 1px solid var(--error-border);
    border-radius: var(--radius-md);
    font-size: 0.9rem;
  }
</style>
