<script lang="ts" setup>
import Skeleton from 'primevue/skeleton'

const { rows, cols } = defineProps<{
  rows: number
  cols: number
}>()
</script>

<template>
  <div class="table-responsive">
    <table class="main-table">
      <thead>
        <tr>
          <th v-for="i in cols" :key="i" scope="col">#</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="i in rows" :key="i">
          <td v-for="j in cols" :key="j">
            <Skeleton></Skeleton>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
