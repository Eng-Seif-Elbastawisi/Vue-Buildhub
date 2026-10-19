<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import TimelineStartRequiredAlert from '../../../shared/components/TimelineStartRequiredAlert.vue';
  import ProjectWorkspaceNav from '../../../presentation/components/ProjectWorkspaceNav.vue';
  import { positiveId } from '../../core/constants/work-items.constants';
  import WorkItemsController from '../controllers/work-items.controller';
  import ShopDrawingsList from './ShopDrawingsList.vue';
  import ShopDrawingFormDialog from './ShopDrawingFormDialog.vue';

  const route = useRoute();
  const controller = WorkItemsController.getInstance();
  const quoteId = computed(() => Number(route.params.id));
  const drawingOpen = ref(false);

  watch(
    quoteId,
    (id) => {
      drawingOpen.value = false;
      controller.activate(id);
      if (positiveId(id)) void Promise.all([controller.loadDrawings(), controller.loadStages()]);
    },
    { immediate: true },
  );
  onBeforeUnmount(() => controller.release());
</script>

<template>
  <div class="work-items-page" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
    <ProjectWorkspaceNav :quote-id="quoteId" active="drawings" />
    <header class="work-items-header">
      <div>
        <h1>{{ $t('work_items.drawings') }}</h1>
        <p>{{ $t('work_items.drawings_subtitle') }}</p>
      </div>
      <AppButton :disabled="!positiveId(quoteId)" @click="drawingOpen = true">{{
        $t('work_items.new_drawing')
      }}</AppButton>
    </header>
    <p v-if="!positiveId(quoteId)" role="alert">{{ $t('work_items.invalid_quote') }}</p>
    <ShopDrawingsList
      v-else
      :key="`drawings-${quoteId}`"
      open
      :state="controller.drawingsState.value"
      @retry="controller.loadDrawings()"
    />
    <ShopDrawingFormDialog
      v-if="positiveId(quoteId)"
      :key="`drawing-${quoteId}`"
      v-model:visible="drawingOpen"
    />
    <TimelineStartRequiredAlert
      :quote-id="quoteId"
      :state="controller.stagesState.value"
      @refresh="controller.loadStages()"
    />
  </div>
</template>

<style lang="scss">
  @use '../styles/work-items';
</style>
