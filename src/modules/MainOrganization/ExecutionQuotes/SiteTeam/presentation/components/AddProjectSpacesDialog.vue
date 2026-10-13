<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import Dialog from 'primevue/dialog';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import {
    DataLoading,
    DataSuccess,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import IndexSpaceParams from '@/modules/shared/Space/core/params/index.space.params';
  import AddProjectFloorSpaceParams from '@/modules/MainOrganization/ProjectFloor/core/params/add.project.floor.space.params';
  import AddProjectFloorSpacesParams from '@/modules/MainOrganization/ProjectFloor/core/params/add.project.floor.spaces.params';
  import SiteTeamController from '../controllers/site-team.controller';
  const props = defineProps<{ visible: boolean }>();
  const emit = defineEmits<{ 'update:visible': [boolean] }>();
  const { t } = useI18n();
  const controller = SiteTeamController.getInstance();
  let rowId = 0;
  function newRow() {
    return {
      key: ++rowId,
      space: null as TitleInterface<string | number> | null,
      length: '',
      width: '',
      height: '',
      notes: '',
    };
  }
  const rows = ref([newRow()]);
  const floor = ref<TitleInterface<string | number> | null>(null);
  const search = ref('');
  const submitted = ref(false);
  const busy = computed(() => controller.spaceSaveState.value instanceof DataLoading);
  const failure = computed(() => controller.spaceSaveState.value.error?.displayMessage);
  const floorOptions = computed(() =>
    (controller.floorsState.value.data ?? [])
      .filter((item) => item.id)
      .map(
        (item) =>
          new TitleInterface({
            id: Number(item.id),
            title:
              item.floor_number === 0
                ? t('site_team.ground_floor')
                : t('site_team.floor_number', { number: item.floor_number ?? item.id }),
          }),
      ),
  );
  const params = computed(() => new IndexSpaceParams(search.value, 1, 10, 0));
  watch(
    () => props.visible,
    (visible) => {
      if (!visible) return;
      rows.value = [newRow()];
      floor.value = null;
      search.value = '';
      submitted.value = false;
    },
    { immediate: true },
  );
  function rowParams(row: ReturnType<typeof newRow>) {
    return new AddProjectFloorSpaceParams(
      Number(row.space?.id),
      Number(row.length),
      Number(row.width),
      Number(row.height),
      row.notes,
    );
  }
  function invalidField(row: ReturnType<typeof newRow>, field: string) {
    return (
      submitted.value &&
      rowParams(row)
        .validate()
        .errors.some((error) => error.field === field)
    );
  }
  async function save() {
    if (busy.value) return;
    submitted.value = true;
    const request = new AddProjectFloorSpacesParams(
      Number(floor.value?.id),
      rows.value.map(rowParams),
    );
    if (!request.validate().isValid) return;
    const result = await controller.saveSpaces(request);
    if (result instanceof DataSuccess) emit('update:visible', false);
  }
</script>
<template>
  <Dialog
    :visible="visible"
    modal
    class="site-team-dialog site-team-dialog--spaces"
    :header="$t('site_team.add_spaces')"
    :closable="!busy"
    :close-on-escape="!busy"
    @update:visible="emit('update:visible', $event)"
  >
    <form class="site-team-form" @submit.prevent="save">
      <h3>{{ $t('site_team.select_floor') }}</h3>
      <UpdatedCustomInputSelect
        id="site-floor"
        v-model="floor"
        label="site_team.project_floor"
        :placeholder="$t('site_team.select_floor')"
        :static-options="floorOptions"
        :disabled="busy"
      />
      <p v-if="submitted && !floor" role="alert">{{ $t('site_team.floor_required') }}</p>
     
      <fieldset
        v-for="(row, index) in rows"
        :key="row.key"
        class="site-team-space-row"
        :disabled="busy"
      >
        <legend>{{ $t('site_team.space_row', { number: index + 1 }) }}</legend>
        <UpdatedCustomInputSelect
          :id="`space-${row.key}`"
          v-model="row.space"
          label="site_team.space_type"
          :placeholder="$t('site_team.select_space')"
          :controller="controller.spaceOptions"
          :params="params"
          :disabled="busy"
        />
        <small v-if="invalidField(row, 'spaceId')" role="alert">{{
          $t('site_team.space_required')
        }}</small>
        <div class="site-team-dimensions">
          <div
            v-for="dimension in ['length', 'width', 'height'] as const"
            :key="dimension"
            class="input-wrapper"
          >
            <label :for="`${dimension}-${row.key}`" class="label">{{
              $t(`site_team.${dimension}`)
            }}</label>
            <input
              :id="`${dimension}-${row.key}`"
              v-model="row[dimension]"
              type="number"
              step="any"
              class="input"
              :aria-invalid="invalidField(row, dimension)"
              :aria-describedby="`${dimension}-error-${row.key}`"
            />
            <small
              v-if="invalidField(row, dimension)"
              :id="`${dimension}-error-${row.key}`"
              role="alert"
              >{{ $t('site_team.dimension_required') }}</small
            >
          </div>
        </div>
        <div class="input-wrapper">
          <label :for="`notes-${row.key}`" class="label">{{ $t('site_team.notes') }}</label>
          <textarea :id="`notes-${row.key}`" v-model="row.notes" rows="2" class="input"></textarea>
        </div>
        <AppButton
          theme="secondary"
          size="sm"
          :disabled="rows.length === 1 || busy"
          @click="rows = rows.filter((item) => item.key !== row.key)"
          >{{ $t('site_team.remove_row') }}</AppButton
        >
      </fieldset>
      <AppButton theme="secondary" :disabled="busy" @click="rows.push(newRow())">{{
        $t('site_team.add_row')
      }}</AppButton>
      <p v-if="failure" role="alert">{{ $t(failure) }}</p>
      <div class="site-team-actions">
        <AppButton theme="secondary" :disabled="busy" @click="emit('update:visible', false)">{{
          $t('site_team.cancel')
        }}</AppButton>
        <AppButton type="submit" :loading="busy">{{ $t('site_team.save_spaces') }}</AppButton>
      </div>
    </form>
  </Dialog>
</template>
