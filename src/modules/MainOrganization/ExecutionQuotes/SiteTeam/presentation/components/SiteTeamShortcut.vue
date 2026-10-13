<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import SiteTeamController from '../controllers/site-team.controller';
  import ProjectManagementShortcut from '../../../Schedule/presentation/components/ProjectManagementShortcut.vue';
  import { siteTeamPath } from '../site-team.routes';
  const props = defineProps<{ quoteId: number }>();
  const route = useRoute();
  const { t } = useI18n();
  const controller = SiteTeamController.getInstance();
  // Only expose already loaded metrics for this Quote; shortcuts do not trigger background requests.
  const metrics = computed(() =>
    controller.ownerState.value.data?.id === props.quoteId
      ? [
          { label: t('site_team.floors'), value: controller.floorsState.value.data?.length },
          {
            label: t('site_team.engineers'),
            value: controller.engineersState.value.data?.length,
          },
        ]
      : [],
  );
</script>
<template>
  <ProjectManagementShortcut
    :title="$t('site_team.title')"
    :open-label="$t('site_team.open')"
    :description="$t('site_team.description')"
    icon="pi pi-map-marker"
    :to="siteTeamPath(route.path, quoteId)"
    :metrics="metrics"
    state="available"
  />
</template>
