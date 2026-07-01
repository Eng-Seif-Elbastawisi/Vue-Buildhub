<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import AuthShell from '@/modules/auth/presentation/components/AuthShell.vue';
  import LoginForm from '@/modules/MainOrganization/auth_organization/presentation/components/LoginForm.vue';

  const route = useRoute();
  const mode = computed<'admin' | 'organization'>(() => {
    const path = route.path.toLowerCase();

    if (
      route.meta.loginMode === 'admin' ||
      path.includes('login-admin') ||
      path.includes('admin/login')
    ) {
      return 'admin';
    }

    return 'organization';
  });
</script>

<template>
  <AuthShell v-slot="{ mode: shellMode, badge }" :mode="mode">
    <LoginForm :mode="shellMode" :badge="badge" />
  </AuthShell>
</template>

<style scoped></style>
