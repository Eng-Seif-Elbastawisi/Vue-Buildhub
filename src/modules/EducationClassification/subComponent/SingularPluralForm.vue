<script setup lang="ts">
import MultiLangInput from '@/shared/MultiLangInput.vue';
import { onMounted, reactive, watch } from 'vue';

type Branch = {
  singular: Record<string, string>;
  plural: Record<string, string>;
};

const props = defineProps<{
  numberOfBranches: number; 
  label: string;
  initialBranches?: Branch[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update', value: Branch[]): void;
}>();

const branches = reactive<Branch[]>(
  Array.from({ length: props.numberOfBranches }, (_, i) => ({
    singular: { ...props.initialBranches?.[i]?.singular },
    plural: { ...props.initialBranches?.[i]?.plural },
  })),
);

watch(
  [() => props.numberOfBranches, () => props.initialBranches],
  ([newCount, newInitial]) => {
    // console.log(newCount, 'new');
    branches.splice(0);
    for (let i = 0; i < newCount; i++) {
      branches.push({
        singular: { ...(newInitial?.[i]?.singular ?? {}) },
        plural: { ...(newInitial?.[i]?.plural ?? {}) },
      });
    }
  },
  { deep: true },
);
onMounted(() => {
  // console.log(props.numberOfBranches, 'numberOfBranches');
});
const SaveData = () => {
  emit('update', branches);
};
</script>

<template>
  <div class="branches">
    <div v-for="(branch, index) in branches" :key="index" class="branch-row">
      <!-- Singular -->

      <div class="input-group" :class="{ disabled: loading }">
        <MultiLangInput
:field-key="`title_Singular`" :label="`${label} ${index + 1} (Singular)`"
          :languages="['en', 'ar']" :type="`title`" :model-value="branch.singular"
          @update:model-value="branch.singular = $event" />
      </div>

      <!-- Plural -->
      <div class="input-group" :class="{ disabled: loading }">
        <MultiLangInput
:field-key="`title_Plural`" :label="`${label} ${index + 1} (Plural)`" :languages="['en', 'ar']"
          :type="`title`" :model-value="branch.plural" @update:model-value="branch.plural = $event" />
      </div>
    </div>
    <!-- <button v-if="numberOfBranches" class="save-btn" @click="SaveData" :disabled="loading">
      {{ loading ? $t('loading') : $t('save') }}
    </button> -->
    <button v-if="numberOfBranches" class="save-btn" :disabled="loading" @click="SaveData">
      <!-- <img v-if="loading" src="@/assets/images/original-a5a6bbdebdd0c283b9e2dae1408882bd.gif" alt="loading"
        class="loading-img"  /> -->
      <!-- <LodingBtn v-if="loading" class="loading-img"/> -->
      <span v-if="loading" class="loader"></span>

      <span v-else>
        {{ $t('save') }}
      </span>
    </button>
  </div>
</template>
