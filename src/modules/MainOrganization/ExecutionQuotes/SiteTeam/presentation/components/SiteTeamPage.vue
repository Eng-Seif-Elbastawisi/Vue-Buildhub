<script setup lang="ts">
  import ProjectWorkspaceNav from '../../../presentation/components/ProjectWorkspaceNav.vue';
  import { computed, onBeforeUnmount, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import Skeleton from 'primevue/skeleton';
  import type ProjectFloorModel from '@/modules/MainOrganization/ProjectFloor/core/models/project.floor.model';
  import {
    DataLoading,
    DataSuccess,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import { quotePath } from '../../../Schedule/presentation/schedule.routes';
  import SiteTeamController from '../controllers/site-team.controller';
  import { positiveId } from '../../core/params/quote.site-team.params';
  import SiteInfoDialog from './SiteInfoDialog.vue';
  import EngineerSelectionDialog from './EngineerSelectionDialog.vue';
  import AddProjectSpacesDialog from './AddProjectSpacesDialog.vue';
  import '../styles/site-team.scss';
  const route = useRoute();
  const { locale } = useI18n();
  const controller = SiteTeamController.getInstance();
  const quoteId = computed(() => Number(route.params.id));
  const validRoute = computed(() => positiveId(quoteId.value));
  const site = computed(() => controller.siteState.value);
  const engineers = computed(() => controller.engineersState.value);
  const floors = computed(() => controller.floorsState.value);
  const siteDialog = ref(false);
  const engineerDialog = ref(false);
  const spacesDialog = ref(false);
  const spaceCount = computed(() =>
    floors.value instanceof DataSuccess
      ? (floors.value.data ?? []).reduce(
          (count: number, floor: ProjectFloorModel) => count + floor.spaces.length,
          0,
        )
      : undefined,
  );
  watch(
    quoteId,
    (id) => {
      siteDialog.value = engineerDialog.value = spacesDialog.value = false;
      controller.activate(id);
      if (positiveId(id)) void controller.load();
    },
    { immediate: true },
  );
  onBeforeUnmount(() => controller.release());
</script>
<template>
  <section class="site-team" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <ProjectWorkspaceNav :quote-id="quoteId" active="site-team" />
    <header class="site-team-header">
      <div>
        <h2 class="site-team-project-title">
          {{ controller.ownerState.value.data?.project?.title || $t('schedule.quote_context') }}
        </h2>
        <p>{{ $t('site_team.description') }}</p>
      </div>
      <AppButton v-if="validRoute" :to="quotePath(route.path, quoteId)" theme="secondary">{{
        $t('schedule.back_quote')
      }}</AppButton>
    </header>
    <p v-if="!validRoute" role="alert">{{ $t('site_team.invalid_quote') }}</p>
    <template v-else>
      <div class="site-team-actions">
        <AppButton :disabled="!(site instanceof DataSuccess)" @click="siteDialog = true">{{
          $t('site_team.update_site')
        }}</AppButton>
        <AppButton
          theme="secondary"
          :disabled="!floors.data?.length"
          @click="spacesDialog = true"
          >{{ $t('site_team.add_spaces') }}</AppButton
        >
        <AppButton theme="secondary" @click="engineerDialog = true">{{
          $t('site_team.assign_engineers')
        }}</AppButton>
      </div>
      <div class="site-team-summary">
        <article class="site-team-card">
          <div class="site-team-section-heading">
            <i class="pi pi-map-marker" aria-hidden="true"></i>
            <h2>{{ $t('site_team.site_information') }}</h2>
            <span
              v-if="site.data?.deliveryDate || site.data?.siteCondition"
              class="site-team-badge"
              >{{ $t('site_team.recorded') }}</span
            >
          </div>
          <DataStatusBuilder :controller="site" :on-retry="() => controller.loadSite()">
            <template #success
              ><dl>
                <dt>{{ $t('site_team.delivery_date') }}</dt>
                <dd>{{ site.data?.deliveryDate || $t('site_team.not_recorded') }}</dd>
              </dl>
              <p class="site-team-condition">
                {{ site.data?.siteCondition || $t('site_team.site_empty') }}
              </p>
              <AppButton theme="secondary" size="sm" @click="siteDialog = true">{{
                $t('site_team.update_site')
              }}</AppButton></template
            >
            <template #loader>
              <Skeleton height="5rem" />
            </template>
          </DataStatusBuilder>
        </article>
        <article class="site-team-card">
          <div class="site-team-section-heading">
            <i class="pi pi-building" aria-hidden="true"></i>
            <h2>{{ $t('site_team.project_locations') }}</h2>
          </div>
          <Skeleton
            v-if="
              floors instanceof DataLoading || controller.ownerState.value instanceof DataLoading
            "
            height="5rem"
          />
          <template v-else-if="floors instanceof DataSuccess"
            ><div class="site-team-metrics">
              <div>
                <strong>{{ floors.data?.length ?? 0 }}</strong
                ><span>{{ $t('site_team.floors') }}</span>
              </div>
              <div>
                <strong>{{ spaceCount }}</strong
                ><span>{{ $t('site_team.spaces') }}</span>
              </div>
            </div>
            <a href="#site-floors">{{ $t('site_team.view_locations') }}</a></template
          >
          <p v-else>
            {{
              $t(controller.projectId.value ? 'site_team.floor_empty' : 'site_team.project_missing')
            }}
          </p>
        </article>
        <article class="site-team-card">
          <div class="site-team-section-heading">
            <i class="pi pi-users" aria-hidden="true"></i>
            <h2>{{ $t('site_team.assigned_engineers') }}</h2>
          </div>
          <DataStatusBuilder :controller="engineers" :on-retry="() => controller.loadEngineers()">
            <template #success
              ><div class="site-team-metrics">
                <div>
                  <strong>{{ engineers.data?.length }}</strong
                  ><span>{{ $t('site_team.engineers') }}</span>
                </div>
              </div>
              <div class="site-team-avatar-group">
                <span
                  v-for="employee in engineers.data?.slice(0, 4)"
                  :key="employee.id"
                  :title="employee.name"
                  class="site-team-avatar"
                  >{{ employee.name }}</span
                >
              </div>
              <AppButton theme="secondary" size="sm" @click="engineerDialog = true">{{
                $t('site_team.manage_engineers')
              }}</AppButton></template
            >
            <template #loader>
              <Skeleton v-if="engineers instanceof DataLoading" height="5rem" />
            </template>
          </DataStatusBuilder>
        </article>
      </div>
      <div class="site-team-details">
        <section id="site-floors" class="site-team-card">
          <div class="site-team-section-heading">
            <h2>{{ $t('site_team.floors_spaces') }}</h2>
            <AppButton
              theme="secondary"
              size="sm"
              :disabled="!floors.data?.length"
              @click="spacesDialog = true"
              >{{ $t('site_team.add_spaces') }}</AppButton
            >
          </div>
          <p
            v-if="
              !controller.projectId.value && !(controller.ownerState.value instanceof DataLoading)
            "
          >
            {{ $t('site_team.project_missing') }}
          </p>
          <AppButton
            v-if="controller.ownerState.value.hasError"
            theme="secondary"
            @click="controller.loadOwner()"
            >{{ $t('site_team.retry') }}</AppButton
          >
          <DataStatusBuilder
            v-if="controller.projectId.value"
            :controller="floors"
            :on-retry="() => controller.loadFloors()"
          >
            <template #empty
              ><p class="site-team-empty">{{ $t('site_team.floor_empty') }}</p></template
            >
            <template #success>
              <p v-if="!floors.data?.length" class="site-team-empty">
                {{ $t('site_team.floor_empty') }}
              </p>
              <details v-for="floor in floors.data" :key="floor.id" class="site-team-floor" open>
                <summary>
                  <i class="pi pi-building" aria-hidden="true"></i
                  ><span>{{
                    floor.floor_number === 0
                      ? $t('site_team.ground_floor')
                      : $t('site_team.floor_number', { number: floor.floor_number ?? floor.id })
                  }}</span
                  ><span class="site-team-badge">{{
                    $t('site_team.space_count', { count: floor.spaces.length })
                  }}</span>
                </summary>
                <ul v-if="floor.spaces.length" class="site-team-space-list">
                  <li v-for="(space, index) in floor.spaces" :key="space.id ?? index">
                    <div>
                      <h3>{{ space.space.title }}</h3>
                      <p v-if="space.notes">{{ space.notes }}</p>
                    </div>
                    <span
                      v-if="space.length || space.width || space.height"
                      class="site-team-measurement"
                      dir="ltr"
                      >{{ space.length || '—' }} × {{ space.width || '—' }} ×
                      {{ space.height || '—' }}</span
                    >
                  </li>
                </ul>
                <p v-else class="site-team-empty">{{ $t('site_team.space_empty') }}</p>
              </details>
            </template>
          </DataStatusBuilder>
        </section>
        <section class="site-team-card" aria-labelledby="site-team-members-title">
          <div class="site-team-section-heading">
            <i class="pi pi-users" aria-hidden="true"></i>
            <h2 id="site-team-members-title">{{ $t('site_team.assigned_engineers') }}</h2>
          </div>
          <DataStatusBuilder :controller="engineers" :on-retry="() => controller.loadEngineers()">
            <template #success>
              <p v-if="!engineers.data?.length" class="site-team-empty">
                {{ $t('site_team.engineer_empty') }}
              </p>
              <ul v-else class="site-team-member-list">
                <li v-for="employee in engineers.data" :key="employee.id">
                  <span class="site-team-member-avatar" aria-hidden="true">{{
                    employee.name?.slice(0, 1)
                  }}</span>
                  <div>
                    <strong>{{ employee.name }}</strong>
                    <p v-if="employee.email">{{ employee.email }}</p>
                  </div>
                </li>
              </ul>
            </template>
            <template #loader><Skeleton height="5rem" /></template>
          </DataStatusBuilder>
        </section>
      </div>
      <SiteInfoDialog v-if="siteDialog" v-model:visible="siteDialog" :quote-id="quoteId" />
      <EngineerSelectionDialog
        v-if="engineerDialog"
        v-model:visible="engineerDialog"
        :quote-id="quoteId"
      />
      <AddProjectSpacesDialog v-if="spacesDialog" v-model:visible="spacesDialog" />
    </template>
  </section>
</template>
