<script setup lang="ts">
  import { ref } from 'vue';
  import Popover from 'primevue/popover';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import ActionsIcon from '../icons/ActionsIcon.vue';

  interface ActionItem {
    text: string;
    icon: any;
    link?: string;
    action?: () => void;
  }

  defineEmits(['delete']);
  defineOptions({ inheritAttrs: false });

  const op = ref();

  const toggle = (event: Event) => {
    op.value.toggle(event);
  };

  const props = defineProps<{
    actionList: ActionItem[];
    showActions?: boolean;
    deleteDialogTitle?: string;
    deleteDialogMessage?: string;
  }>();
</script>

<template>
  <div class="list-trigger" @click="toggle">
    <ActionsIcon />
  </div>

  <Popover ref="op">
    <div class="list-body">
      <ul class="border-none">
        <li v-for="action in props.actionList" :key="action.text" class="list-item cursor-pointer">
          <router-link v-if="action.link" :to="action.link" class="flex items-center gap-[5px]">
            <span>{{ action.text }}</span>
            <component :is="action.icon" />
          </router-link>

          <button
            v-else-if="action.action && action.text != $t('delete')"
            class="flex items-center gap-sm"
            @click="action.action"
          >
            <span>{{ action.text }}</span>
            <component :is="action.icon" />
          </button>

          <DeleteDialog
            v-else-if="action.text == $t('delete')"
            :title="deleteDialogTitle"
            :message="deleteDialogMessage"
            @delete="action.action"
          />
        </li>
        <slot name="custom"></slot>
      </ul>
    </div>
  </Popover>
</template>

<style scoped></style>
