<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import IconAccept from '@/shared/icons/IconAccept.vue';
  import type EditSkillsParams from '../../core/params/edit.skills.params';
  import ShowSkillsParams from '../../core/params/show.skills.params';
  import SkillsController from '../controllers/skills.controller';
  import SkillsForm from './SkillsForm.vue';

  const controller = SkillsController.getInstance();
  const route = useRoute();
  const router = useRouter();
  const formKey = route.fullPath;

  const params = ref<EditSkillsParams | null>(null);
  const loading = ref(false);

  /**
   * Update skill
   */
  const saveSkill = async () => {
    if (!params.value) {
      console.error('No skill parameters to save');
      return;
    }

    loading.value = true;
    try {
      const data = await controller.update(params.value, undefined);
      if (data) router.push({ name: 'Skills' });
    } finally {
      loading.value = false;
    }
  };

  const updateData = (updatedParams: EditSkillsParams) => {
    params.value = updatedParams;
  };

  onMounted(async () => {
    await controller.fetchOne(new ShowSkillsParams(Number(route.params.id), true));
  });
</script>

<template>
  <div class="skills-edit-page">
    <SkillsForm
      :skill="controller.itemData.value!"
      :form-key="formKey"
      :loading="loading"
      @update-data="updateData"
    />

    <div class="actions" :class="{ disabled: loading }">
      <button class="btn btn-primary w-full" @click="saveSkill">
        <span v-if="loading" class="loader-skills"></span>
        <span v-else> {{ $t('save') }} <IconAccept /> </span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error-toast">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .loader-skills {
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
