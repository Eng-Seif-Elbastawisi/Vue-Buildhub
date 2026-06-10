<!-- <script setup lang="ts" generic="T">
  import AddAnswer from '@/shared/icons/AddAnswer.vue';
  import DeleteItemAction from '@/shared/icons/DeleteItemAction.vue';
  import { onMounted, ref } from 'vue';

  const emit = defineEmits(['update:data']);
  const props = defineProps<{
    items: T[];
  }>();

  const Answers = ref<T[]>(props.items);

  const addNewAnswer = () => {
    Answers.value.push({
      title: '',
      isDanger: false,
    });
    UpdateData();
  };

  const DeleteItem = (index: number) => {
    Answers.value.splice(index, 1);
    UpdateData();
  };

  const UpdateData = () => {
    emit(
      'update:data',
      Answers.value.filter((answer) => answer.title.trim() !== ''),
    );
  };

  onMounted(() => {
    emit(
      'update:data',
      Answers.value.filter((answer) => answer.title.trim() !== ''),
    );
  });
</script>
<template>
  {{ Answers }}
  <div class="template-container">
    <div class="heirarchy-info">
      <div class="timeline-container">
        <div class="timeline-wrapper">
          <div class="timeline-line"></div>
          <div
            v-for="(item, index) in items"
            :key="index"
            class="timeline-item"
            :class="{ active: index === 0 }"
            :style="{ animationDelay: `${index * 0.15}s` }"
          >
            <div class="timeline-marker">
              <div class="timeline-dot">
                <div class="timeline-dot-inner"></div>
                <div class="timeline-pulse"></div>
              </div>

              <div class="timeline-icon">
                <DeleteItemAction
                  v-if="index >= 0 && index !== Answers.length - 1"
                  class="cursor-pointer"
                  @click="DeleteItem(index)"
                />
                <AddAnswer v-else class="cursor-pointer" @click="addNewAnswer" />
              </div>
            </div>

            <div class="timeline-content">
              <slot></slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> -->
<template>
  <div>timeline</div>
</template>