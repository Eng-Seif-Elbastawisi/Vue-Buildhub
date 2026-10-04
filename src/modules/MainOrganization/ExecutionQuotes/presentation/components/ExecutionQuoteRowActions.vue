<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import Menu from 'primevue/menu';
  import type { MenuItem } from 'primevue/menuitem';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';

  const props = defineProps<{
    available: boolean;
    canModify: boolean;
    canChangeStatus: boolean;
  }>();

  const emit = defineEmits<{
    view: [];
    addItem: [];
    addStage: [];
    changeStatus: [];
  }>();

  const { locale, t } = useI18n();
  const menu = ref<InstanceType<typeof Menu> | null>(null);
  const menuOpen = ref(false);

  const menuItems = computed<MenuItem[]>(() => {
    if (!props.available || !props.canModify) return [];

    const items: MenuItem[] = [
      {
        label: t('execution_quote.table.add_item'),
        icon: 'pi pi-list',
        class: 'execution-quote-index__add-item-button',
        command: () => emit('addItem'),
      },
      {
        label: t('execution_quote.table.add_stage'),
        icon: 'pi pi-sitemap',
        class: 'execution-quote-index__add-stage-button',
        command: () => emit('addStage'),
      },
    ];

    if (props.canChangeStatus) {
      items.push({
        label: t('execution_quote.status.change_action'),
        icon: 'pi pi-sync',
        class: 'execution-quote-index__change-status-button',
        command: () => emit('changeStatus'),
      });
    }

    return items;
  });
</script>

<template>
  <div v-if="available" class="execution-quote-index__row-actions">
    <AppButton
      class="execution-quote-index__view-button"
      size="sm"
      theme="primary"
      icon="right"
      @click.stop="emit('view')"
    >
      <template #icon>
        <i class="pi pi-eye" aria-hidden="true"></i>
      </template>

      {{ t('execution_quote.show.action') }}
    </AppButton>

    <AppButton
      v-if="menuItems.length"
      class="execution-quote-index__more-button"
      size="sm"
      theme="secondary"
      icon-only
      :title="t('execution_quote.table.more_actions')"
      :aria-label="t('execution_quote.table.more_actions')"
      aria-haspopup="menu"
      :aria-expanded="menuOpen"
      @click.stop="menu?.toggle($event)"
      @keydown.down.prevent="menu?.show($event)"
    >
      <template #icon>
        <i class="pi pi-ellipsis-h" aria-hidden="true"></i>
      </template>
    </AppButton>

    <Menu
      v-if="menuItems.length"
      ref="menu"
      :model="menuItems"
      popup
      append-to="body"
      class="execution-quote-index__actions-menu"
      :dir="locale === 'ar' ? 'rtl' : 'ltr'"
      :aria-label="t('general.actions')"
      @show="menuOpen = true"
      @hide="menuOpen = false"
    />
  </div>

  <span v-else class="execution-quote-index__no-actions" aria-hidden="true">—</span>
</template>
