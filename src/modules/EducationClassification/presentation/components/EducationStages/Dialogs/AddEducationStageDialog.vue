<script setup lang="ts">
  import { ref } from 'vue';
  import Dialog from 'primevue/dialog';
  const visible = ref(false);
  const { ClassificationId, parent_id } = defineProps<{
    ClassificationId?: number;
    parent_id?: number;
  }>();

  const emit = defineEmits(['update:data']);
  const title = ref();

  const saveData = () => {
    const EmmitedData = ref<{
      title: string;
      classification_id?: number;
      parent_id?: number;
    }>({
      title: title.value,
    });
    ClassificationId ? (EmmitedData.value.classification_id = ClassificationId) : null;
    parent_id ? (EmmitedData.value.parent_id = parent_id) : null;
    // console.log(EmmitedData.value);
    emit('update:data', EmmitedData.value);
  };
</script>

<template>
  <button @click="visible = true">Add Education Type</button>
  <Dialog v-model:visible="visible" modal :style="{ width: '25rem' }">
    <input id="title" v-model="title" type="text" />
    <label for="title">title</label>
    <button @click="saveData">save</button>
  </Dialog>
</template>
