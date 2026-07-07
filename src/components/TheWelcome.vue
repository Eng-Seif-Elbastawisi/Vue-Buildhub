<script setup lang="ts">
  import WelcomeItem from './WelcomeItem.vue';
  import DocumentationIcon from './icons/IconDocumentation.vue';
  import ToolingIcon from './icons/IconTooling.vue';
  import EcosystemIcon from './icons/IconEcosystem.vue';
  import CommunityIcon from './icons/IconCommunity.vue';
  import SupportIcon from './icons/IconSupport.vue';

  const openReadmeInEditor = () => fetch('/__open-in-editor?file=README.md');
</script>

<template>
  <WelcomeItem>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>{{ $t('vue_starter.documentation') }}</template>

    {{ $t('vue_starter.vue_docs_prefix') }}
    <a href="https://vuejs.org/" target="_blank" rel="noopener">{{
      $t('vue_starter.official_documentation')
    }}</a>
    {{ $t('vue_starter.vue_docs_suffix') }}
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <ToolingIcon />
    </template>
    <template #heading>{{ $t('vue_starter.tooling') }}</template>

    {{ $t('vue_starter.tooling_prefix') }}
    <a href="https://vite.dev/guide/features.html" target="_blank" rel="noopener">{{
      $t('vue_starter.vite')
    }}</a
    >.
    {{ $t('vue_starter.recommended_ide') }}
    <a href="https://code.visualstudio.com/" target="_blank" rel="noopener">{{
      $t('vue_starter.vscode')
    }}</a>
    +
    <a href="https://github.com/vuejs/language-tools" target="_blank" rel="noopener">{{
      $t('vue_starter.vue_official')
    }}</a
    >. {{ $t('vue_starter.testing_prefix') }}
    <a href="https://vitest.dev/" target="_blank" rel="noopener">{{ $t('vue_starter.vitest') }}</a>
    {{ $t('and') }}
    <a href="https://www.cypress.io/" target="_blank" rel="noopener">{{
      $t('vue_starter.cypress')
    }}</a>
    /
    <a href="https://playwright.dev/" target="_blank" rel="noopener">{{
      $t('vue_starter.playwright')
    }}</a
    >.

    <br />

    {{ $t('vue_starter.more_instructions') }}
    <a href="javascript:void(0)" @click="openReadmeInEditor"><code>README.md</code></a
    >.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <EcosystemIcon />
    </template>
    <template #heading>{{ $t('vue_starter.ecosystem') }}</template>

    {{ $t('vue_starter.ecosystem_prefix') }}
    <a href="https://pinia.vuejs.org/" target="_blank" rel="noopener">{{
      $t('vue_starter.pinia')
    }}</a
    >,
    <a href="https://router.vuejs.org/" target="_blank" rel="noopener">{{
      $t('vue_starter.vue_router')
    }}</a
    >,
    <a href="https://test-utils.vuejs.org/" target="_blank" rel="noopener">{{
      $t('vue_starter.vue_test_utils')
    }}</a
    >{{ $t('comma_and') }}
    <a href="https://github.com/vuejs/devtools" target="_blank" rel="noopener">{{
      $t('vue_starter.vue_dev_tools')
    }}</a
    >.
    {{ $t('vue_starter.more_resources_prefix') }}
    <a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener">{{
      $t('vue_starter.awesome_vue')
    }}</a>
    {{ $t('vue_starter.visit_suffix') }}
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <CommunityIcon />
    </template>
    <template #heading>{{ $t('vue_starter.community') }}</template>

    {{ $t('vue_starter.community_prefix') }}
    <a href="https://chat.vuejs.org" target="_blank" rel="noopener">{{
      $t('vue_starter.vue_land')
    }}</a>
    {{ $t('vue_starter.discord_suffix') }}
    <a href="https://stackoverflow.com/questions/tagged/vue.js" target="_blank" rel="noopener">{{
      $t('vue_starter.stackoverflow')
    }}</a
    >. {{ $t('vue_starter.follow_prefix') }}
    <a href="https://bsky.app/profile/vuejs.org" target="_blank" rel="noopener">@vuejs.org</a>
    {{ $t('vue_starter.bluesky_suffix') }}
    <a href="https://x.com/vuejs" target="_blank" rel="noopener">@vuejs</a>
    {{ $t('vue_starter.x_suffix') }}
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <SupportIcon />
    </template>
    <template #heading>{{ $t('vue_starter.support_vue') }}</template>

    {{ $t('vue_starter.support_prefix') }}
    <a href="https://vuejs.org/sponsor/" target="_blank" rel="noopener">{{
      $t('vue_starter.becoming_sponsor')
    }}</a
    >.
  </WelcomeItem>
</template>
