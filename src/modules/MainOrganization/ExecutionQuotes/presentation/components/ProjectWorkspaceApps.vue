<script setup lang="ts">
  import ScheduleShortcut from '../../Schedule/presentation/components/ScheduleShortcut.vue';
  import SiteTeamShortcut from '../../SiteTeam/presentation/components/SiteTeamShortcut.vue';
  import WorkItemsShortcut from '../../WorkItems/presentation/components/WorkItemsShortcut.vue';
  import ProcurementShortcut from '../../Procurement/presentation/components/ProcurementShortcut.vue';
  import MaterialReceiptShortcut from '../../Warehouse/presentation/components/MaterialReceiptShortcut.vue';
  import { useRoute } from 'vue-router';
  import { quotePath } from '../../Schedule/presentation/schedule.routes';
  import ProjectManagementShortcut from '../../Schedule/presentation/components/ProjectManagementShortcut.vue';
  const route = useRoute();
  defineProps<{ quoteId: number }>();
</script>
<template>
  <section class="workspace-apps" aria-labelledby="workspace-apps-title">
    <header class="workspace-apps__header">
      <div>
        <h2 id="workspace-apps-title">{{ $t('project_workspace.apps') }}</h2>
        <p>{{ $t('project_workspace.description') }}</p>
      </div>
      <i class="pi pi-th-large" aria-hidden="true"></i>
    </header>
    <div class="workspace-apps__grid">
      <ProjectManagementShortcut
        :title="$t('intelligence.title')"
        :description="$t('intelligence.description')"
        :open-label="$t('intelligence.explore')"
        icon="pi pi-chart-bar"
        :to="`${quotePath(route.path, quoteId)}/intelligence`"
        :metrics="[]"
        state="available"
      />
      <ScheduleShortcut :quote-id="quoteId" compact />
      <SiteTeamShortcut :quote-id="quoteId" />
      <WorkItemsShortcut :quote-id="quoteId" />
      <ProcurementShortcut :quote-id="quoteId" />
      <MaterialReceiptShortcut :quote-id="quoteId" />
    </div>
  </section>
</template>
<style scoped lang="scss">
  .workspace-apps {
    padding-block: 1rem 2rem;
  }

  .workspace-apps__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-block-end: 1.5rem;
  }

  .workspace-apps__header h2 {
    margin: 0 0 0.5rem;
    color: color-mix(in sRGB, var(--SecondaryColor) 20%, var(--gray-800));
    font-size: 1.5rem;
    font-weight: 600;
  }

  .workspace-apps__header p {
    margin: 0;
    color: var(--subtitle-color);
    max-width: 65ch;
  }

  .workspace-apps__header > .pi {
    color: var(--PrimaryColor);
    font-size: 1.4rem;
  }

  .workspace-apps__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 23rem), 1fr));
    align-items: stretch;
    gap: 1.25rem;
  }

  .workspace-apps__grid :deep(.schedule-shortcuts) {
    display: grid;
  }
</style>
