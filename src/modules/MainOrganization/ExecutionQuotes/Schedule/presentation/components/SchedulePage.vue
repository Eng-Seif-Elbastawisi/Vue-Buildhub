<script setup lang="ts">
  import ProjectWorkspaceNav from '../../../presentation/components/ProjectWorkspaceNav.vue';
  import { computed, onBeforeUnmount, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import { validId } from '../../core/constants/schedule.constants';
  import ScheduleController from '../controllers/schedule.controller';
  import { quotePath, schedulePath } from '../schedule.routes';
  import '../styles/schedule.scss';

  const props = defineProps<{ mode: 'index' | 'add' | 'show' | 'edit' }>();
  const emit = defineEmits<{ ready: [quoteId: number, groupId: number | null]; reset: [] }>();
  const route = useRoute();
  const router = useRouter();
  const controller = ScheduleController.getInstance();
  const quoteId = computed(() => Number(route.params.id));
  const groupId = computed(() =>
    route.params.groupId === undefined ? null : Number(route.params.groupId),
  );
  const validRoute = computed(
    () =>
      validId(quoteId.value) &&
      (props.mode === 'index' || props.mode === 'add'
        ? groupId.value === null
        : groupId.value !== null && validId(groupId.value)),
  );
  const ownerState = computed(() => controller.ownerState.value);
  const indexRoute = computed(() => schedulePath(route.path, quoteId.value));
  const formKey = computed(() => `${quoteId.value}:${groupId.value ?? 'new'}`);
  let loadGeneration = 0;

  async function load() {
    const generation = ++loadGeneration;
    emit('reset');
    if (!validRoute.value) {
      controller.release();
      return;
    }
    controller.activate(quoteId.value, groupId.value);
    const owner = quoteId.value;
    await controller.readOwner();
    if (
      generation === loadGeneration &&
      owner === quoteId.value &&
      controller.ownerState.value instanceof DataSuccess
    )
      emit('ready', owner, groupId.value);
  }

  function saved() {
    if (!controller.refreshFailed.value) void router.push(indexRoute.value);
  }

  watch(() => [route.params.id, route.params.groupId, props.mode], load, { immediate: true });
  onBeforeUnmount(() => {
    loadGeneration++;
    controller.invalidateRequests();
  });
</script>
<template>
  <section class="schedule standard-crud-page">
    <ProjectWorkspaceNav :quote-id="quoteId" active="schedule" />
    <header class="schedule__header">
      <div class="schedule__owner">
        <i class="pi pi-building" aria-hidden="true"></i>
        <p>{{ $t('schedule.quote_context') }} {{ ownerState.data?.project?.title }}</p>
      </div>
      <div class="schedule__actions">
        <AppButton :to="quotePath(route.path, quoteId)" theme="secondary">{{
          $t('schedule.back_quote')
        }}</AppButton>
        <AppButton v-if="mode !== 'index'" :to="indexRoute" theme="secondary">{{
          $t('schedule.back')
        }}</AppButton>
      </div>
    </header>
    <p v-if="!validRoute" role="alert">{{ $t('schedule.invalid_ids') }}</p>
    <DataStatusBuilder v-else :controller="ownerState" :on-retry="load">
      <template #success>
        <slot
          :quote-id="quoteId"
          :index-route="indexRoute"
          :form-key="formKey"
          :saved="saved"
          :reload="load"
        />
      </template>
      <template #failed>
        <p role="alert">
          {{
            $t(
              ownerState.error?.type === ErrorType.unAuthorized ||
                ownerState.error?.type === ErrorType.forbidden
                ? 'schedule.unauthorized'
                : 'schedule.owner_error',
            )
          }}
        </p>
        <AppButton @click="load">{{ $t('schedule.retry') }}</AppButton>
      </template>
    </DataStatusBuilder>
  </section>
</template>

<style scoped>
  .schedule :deep(.status-success) {
    display: grid;
    min-width: 0;
    gap: 1.75rem;
  }
</style>
