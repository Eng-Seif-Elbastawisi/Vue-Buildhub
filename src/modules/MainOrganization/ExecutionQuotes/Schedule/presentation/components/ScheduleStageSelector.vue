<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import {
    DataLoading,
    DataSuccess,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import ProjectTimelineStageParams from '../../core/params/project.timeline.stage.params';
  import ScheduleController from '../controllers/schedule.controller';
  const props = defineProps<{ modelValue: ProjectTimelineStageParams[]; disabled?: boolean }>();
  const emit = defineEmits<{ 'update:modelValue': [ProjectTimelineStageParams[]] }>();
  const controller = ScheduleController.getInstance();
  const activeParent = ref<number | null>(null);
  const rootState = computed(() => controller.lookups.value.get(null));
  const childState = computed(() =>
    activeParent.value === null ? undefined : controller.lookups.value.get(activeParent.value),
  );
  const selected = computed(() =>
    props.modelValue.find((selection) => selection.quoteStageId === activeParent.value),
  );
  function toggleParent(parentId: number) {
    const selections = props.modelValue.some((selection) => selection.quoteStageId === parentId)
      ? props.modelValue.filter((selection) => selection.quoteStageId !== parentId)
      : [...props.modelValue, new ProjectTimelineStageParams(parentId, [])];
    emit('update:modelValue', selections);
  }
  function openParent(parentId: number) {
    activeParent.value = parentId;
    void controller.lookup(parentId);
  }
  function toggleChild(childId: number) {
    emit(
      'update:modelValue',
      props.modelValue.map((selection) =>
        selection.quoteStageId !== activeParent.value
          ? selection
          : new ProjectTimelineStageParams(
              selection.quoteStageId,
              selection.children.includes(childId)
                ? selection.children.filter((id) => id !== childId)
                : [...selection.children, childId],
            ),
      ),
    );
  }
  function parentLabel(parentId: number) {
    return controller.stageLabels.value.get(parentId)?.title;
  }
  onMounted(() => {
    void controller.lookup(null);
  });
</script>
<template>
  <div class="schedule__panels">
    <section class="schedule__panel" :aria-label="$t('schedule.available')">
      <h3>{{ $t('schedule.available') }}</h3>
      <p v-if="rootState instanceof DataLoading" role="status">{{ $t('schedule.loading') }}</p>
      <template v-else-if="rootState instanceof DataSuccess">
        <p v-if="!rootState.data?.length">{{ $t('schedule.no_stages') }}</p>
        <div v-for="stage in rootState.data" :key="stage.id" class="schedule__row">
          <label v-if="stage.id">
            <input
              type="checkbox"
              :disabled="disabled"
              :checked="modelValue.some((selection) => selection.quoteStageId === stage.id)"
              @change="toggleParent(stage.id)"
            />
            {{ stage.title || $t('schedule.stage_id', { id: stage.id }) }}
          </label>
          <AppButton v-if="stage.id" size="sm" theme="secondary" @click="openParent(stage.id)">{{
            $t('schedule.children')
          }}</AppButton>
        </div>
        <div v-if="rootState.pagination" class="schedule__actions">
          <AppButton
            :disabled="!rootState.pagination.hasPreviousPage"
            @click="controller.lookup(null, rootState.pagination.previousPage)"
            >{{ $t('schedule.previous') }}</AppButton
          >
          <AppButton
            :disabled="!rootState.pagination.hasNextPage"
            @click="controller.lookup(null, rootState.pagination.nextPage)"
            >{{ $t('schedule.next') }}</AppButton
          >
        </div>
      </template>
      <p v-else-if="rootState?.error" role="alert">
        {{ $t('schedule.lookup_error') }}
        <AppButton @click="controller.lookup(null)">{{ $t('schedule.retry') }}</AppButton>
      </p>
      <section v-if="activeParent !== null">
        <h4>{{ parentLabel(activeParent) || $t('schedule.stage_id', { id: activeParent }) }}</h4>
        <p v-if="!selected">{{ $t('schedule.select_parent') }}</p>
        <p v-if="childState instanceof DataLoading" role="status">{{ $t('schedule.loading') }}</p>
        <template v-else-if="childState instanceof DataSuccess">
          <p v-if="!childState.data?.length">{{ $t('schedule.no_stages') }}</p>
          <label v-for="child in childState.data" :key="child.id" class="schedule__row">
            <template v-if="child.id">
              <input
                type="checkbox"
                :disabled="disabled || !selected"
                :checked="selected?.children.includes(child.id)"
                @change="toggleChild(child.id)"
              />
              {{ child.title || $t('schedule.substage_id', { id: child.id }) }}
            </template>
          </label>
          <div v-if="childState.pagination" class="schedule__actions">
            <AppButton
              :disabled="!childState.pagination.hasPreviousPage"
              @click="controller.lookup(activeParent, childState.pagination.previousPage)"
              >{{ $t('schedule.previous') }}</AppButton
            >
            <AppButton
              :disabled="!childState.pagination.hasNextPage"
              @click="controller.lookup(activeParent, childState.pagination.nextPage)"
              >{{ $t('schedule.next') }}</AppButton
            >
          </div>
        </template>
        <p v-else-if="childState?.error" role="alert">
          {{ $t('schedule.lookup_error') }}
          <AppButton @click="controller.lookup(activeParent)">{{ $t('schedule.retry') }}</AppButton>
        </p>
      </section>
    </section>
    <section class="schedule__panel" :aria-label="$t('schedule.selected')">
      <h3>{{ $t('schedule.selected') }}</h3>
      <p v-if="!modelValue.length">{{ $t('schedule.no_selection') }}</p>
      <article v-for="selection in modelValue" :key="selection.quoteStageId">
        <div class="schedule__row">
          <AppButton theme="secondary" @click="openParent(selection.quoteStageId)">{{
            parentLabel(selection.quoteStageId) ||
            $t('schedule.stage_id', { id: selection.quoteStageId })
          }}</AppButton>
          <AppButton
            :disabled="disabled"
            theme="danger"
            @click="toggleParent(selection.quoteStageId)"
            >{{ $t('schedule.remove') }}</AppButton
          >
        </div>
        <div v-for="childId in selection.children" :key="childId" class="schedule__row">
          <span>{{
            controller.childLabels.value.get(childId)?.title ||
            $t('schedule.substage_id', { id: childId })
          }}</span>
          <AppButton
            :disabled="disabled"
            theme="secondary"
            @click="
              emit(
                'update:modelValue',
                modelValue.map((entry) =>
                  entry.quoteStageId === selection.quoteStageId
                    ? new ProjectTimelineStageParams(
                        entry.quoteStageId,
                        entry.children.filter((id) => id !== childId),
                      )
                    : entry,
                ),
              )
            "
            >{{ $t('schedule.remove') }}</AppButton
          >
        </div>
        <p v-if="!selection.children.length">{{ $t('schedule.empty_child_pending') }}</p>
      </article>
    </section>
  </div>
</template>
