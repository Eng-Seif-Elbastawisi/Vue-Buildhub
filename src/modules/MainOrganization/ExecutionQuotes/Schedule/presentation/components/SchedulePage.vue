<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import Dialog from 'primevue/dialog';
  import {
    DataLoading,
    DataSuccess,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import { validId, getTypeNameKey } from '../../core/constants/schedule.constants';
  import type ScheduleGroupModel from '../../core/models/schedule.group.model';
  import ScheduleOwnerParams from '../../core/params/schedule.owner.params';
  import ScheduleController from '../controllers/schedule.controller';
  import ScheduleGroupForm from './ScheduleGroupForm.vue';
  import ScheduleSequenceBoard from './ScheduleSequenceBoard.vue';
  import ScheduleTimeline from './ScheduleTimeline.vue';
  import ScheduleSettingsDialog from './ScheduleSettingsDialog.vue';
  import { quotePath, schedulePath } from '../schedule.routes';
  import '../styles/schedule.scss';
  const props = defineProps<{ mode: 'index' | 'add' | 'show' | 'edit' }>();
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
  const pageState = computed(() =>
    props.mode === 'index' ? controller.listState.value : controller.itemState.value,
  );
  const groups = computed<ScheduleGroupModel[] | null>(() =>
    controller.listState.value instanceof DataSuccess ? controller.listState.value.data : null,
  );
  const group = computed<ScheduleGroupModel | null>(() =>
    controller.itemState.value instanceof DataSuccess ? controller.itemState.value.data : null,
  );
  const settings = computed(() =>
    controller.settingsState.value instanceof DataSuccess
      ? controller.settingsState.value.data
      : null,
  );
  const showSettings = ref(false);
  const deleteId = ref<number | null>(null);
  const indexRoute = computed(() => schedulePath(route.path, quoteId.value));
  const formKey = computed(() => `${quoteId.value}:${groupId.value ?? 'new'}`);
  let loadGeneration = 0;
  async function load() {
    const generation = ++loadGeneration;
    showSettings.value = false;
    deleteId.value = null;
    if (!validRoute.value) {
      controller.release();
      return;
    }
    controller.activate(quoteId.value, groupId.value);
    const owner = quoteId.value;
    await controller.readOwner();
    if (
      generation !== loadGeneration ||
      owner !== quoteId.value ||
      !(controller.ownerState.value instanceof DataSuccess)
    )
      return;
    if (props.mode === 'index')
      await Promise.all([
        controller.fetchList(new ScheduleOwnerParams(owner)),
        controller.readSettings(new ScheduleOwnerParams(owner)),
      ]);
    else if (groupId.value !== null)
      await controller.fetchOne(new ScheduleOwnerParams(owner, groupId.value));
  }
  async function deleteGroup() {
    if (deleteId.value === null || controller.busy.value) return;
    const owner = quoteId.value;
    const deletion = await controller.delete(new ScheduleOwnerParams(owner, deleteId.value));
    if (deletion instanceof DataSuccess && owner === quoteId.value) deleteId.value = null;
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
  <section class="schedule" :class="{ 'standard-crud-page': mode === 'add' || mode === 'edit' }">
    <header class="schedule__header">
      <div>
        <p>
          {{ $t('schedule.quote_context', { id: quoteId }) }} {{ ownerState.data?.project?.title }}
        </p>
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
    <p v-else-if="ownerState instanceof DataLoading" role="status">{{ $t('schedule.loading') }}</p>
    <p v-else-if="!(ownerState instanceof DataSuccess)" role="alert">
      {{
        $t(
          ownerState.error?.type === ErrorType.unAuthorized ||
            ownerState.error?.type === ErrorType.forbidden
            ? 'schedule.unauthorized'
            : 'schedule.owner_error',
        )
      }}
    </p>
    <template v-else>
      <p v-if="controller.refreshFailed.value" role="alert">
        {{ $t('schedule.saved_refresh_failed') }}
        <AppButton @click="load">{{ $t('schedule.reload') }}</AppButton>
      </p>
      <template v-if="mode === 'index'">
        <div class="schedule__actions">
          <AppButton :to="`${indexRoute}/add`" :disabled="controller.busy.value">{{
            $t('schedule.create')
          }}</AppButton>
          <AppButton :disabled="controller.busy.value" @click="showSettings = true">{{
            $t('schedule.settings')
          }}</AppButton>
        </div>
        <dl class="schedule__summary">
          <div>
            <dt>{{ $t('schedule.planned_start') }}</dt>
            <dd>
              {{
                settings?.startDate ??
                controller.overviewState.value.data?.startDate ??
                $t('schedule.not_available')
              }}
            </dd>
          </div>
          <div>
            <dt>{{ $t('schedule.finish') }}</dt>
            <dd>{{ controller.calculatedFinish.value ?? $t('schedule.not_available') }}</dd>
          </div>
          <div>
            <dt>{{ $t('schedule.group_count') }}</dt>
            <dd>
              {{
                controller.overviewState.value.data?.count ??
                groups?.length ??
                $t('schedule.not_available')
              }}
            </dd>
          </div>
        </dl>
        <p v-if="controller.settingsState.value.error" role="alert">
          {{ $t(controller.settingsState.value.error.displayMessage) }}
        </p>
        <p v-if="pageState instanceof DataLoading" role="status">{{ $t('schedule.loading') }}</p>
        <p v-else-if="pageState.error" role="alert">
          {{ $t(pageState.error.displayMessage) }}
          <AppButton @click="load">{{ $t('schedule.retry') }}</AppButton>
        </p>
        <p v-else-if="groups?.length === 0">{{ $t('schedule.empty') }}</p>
        <template v-if="groups">
          <ScheduleSequenceBoard
            :groups="groups"
            :base-path="indexRoute"
            :quote-id="quoteId"
            @delete="deleteId = $event"
          />
          <ScheduleTimeline :groups="groups" />
        </template>
        <p v-if="controller.mutationState.value.error" role="alert">
          {{ $t(controller.mutationState.value.error.displayMessage) }}
        </p>
      </template>
      <ScheduleGroupForm
        v-else-if="mode === 'add'"
        :key="formKey"
        :quote-id="quoteId"
        @cancel="router.push(indexRoute)"
        @saved="saved"
      />
      <p v-else-if="pageState instanceof DataLoading" role="status">{{ $t('schedule.loading') }}</p>
      <p v-else-if="pageState.error" role="alert">{{ $t(pageState.error.displayMessage) }}</p>
      <ScheduleGroupForm
        v-else-if="mode === 'edit' && group?.selectionsAvailable"
        :key="formKey"
        :quote-id="quoteId"
        :group="group"
        @cancel="router.push(indexRoute)"
        @saved="saved"
      />
      <p v-else-if="mode === 'edit' && group" role="alert">
        {{ $t('schedule.selection_identity_pending') }}
      </p>
      <article v-else-if="mode === 'show' && group" class="schedule__panel">
        <h2>{{ group.title }}</h2>
        <p>{{ group.duration }} {{ $t(getTypeNameKey(group.durationType)) }}</p>
        <ul>
          <li v-for="stage in group.stages" :key="stage.quoteStageId">
            {{ stage.title }}
            <ul>
              <li v-for="child in stage.children" :key="child.subStageId">{{ child.title }}</li>
            </ul>
          </li>
        </ul>
        <ScheduleTimeline :groups="[group]" />
      </article>
      <ScheduleSettingsDialog
        v-if="showSettings"
        :key="quoteId"
        :quote-id="quoteId"
        :settings="settings"
        :readable="true"
        @close="showSettings = false"
      />
      <Dialog
        :visible="deleteId !== null"
        modal
        :header="$t('schedule.delete')"
        :closable="!controller.busy.value"
        @update:visible="deleteId = null"
      >
        <p>{{ $t('schedule.confirm_delete') }}</p>
        <AppButton theme="danger" :loading="controller.busy.value" @click="deleteGroup">{{
          $t('schedule.delete')
        }}</AppButton>
        <AppButton theme="secondary" :disabled="controller.busy.value" @click="deleteId = null">{{
          $t('schedule.cancel')
        }}</AppButton>
      </Dialog>
    </template>
  </section>
</template>
