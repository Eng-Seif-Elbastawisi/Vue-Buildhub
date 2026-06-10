<!-- PrivacyPolicySkeleton.vue -->
<template>
  <div class="privacy-container-skeleton">
    <!-- Header -->
    <div class="header-container">
      <div class="privacy-header">
        <div class="skeleton title"></div>
        <div class="skeleton description"></div>
      </div>

      <div class="skeleton button"></div>
    </div>

    <!-- Content -->
    <div class="privacy-content">
      <div class="skeleton content-title"></div>

      <div class="content-lines">
        <div class="skeleton line"></div>
        <div class="skeleton line"></div>
        <div class="skeleton line"></div>
        <div class="skeleton line short"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '../../../../styles/variables' as *;
  @use '../../../../styles/mixins/flex' as *;

  .privacy-container-skeleton {
    min-height: 80vh;

    @include flex-column(nowrap, flex-start, flex-start);

    gap: $XlSize;

    .header-container {
      width: 100%;

      @include flex-row(nowrap, space-between, center);

      .privacy-header {
        @include flex-column(nowrap, flex-start, flex-start);

        gap: 8px;

        .title {
          width: 190px;
          height: 28px;
        }

        .description {
          width: 420px;
          height: 16px;
        }
      }

      .button {
        width: 120px;
        height: 42px;
        border-radius: 12px;
      }
    }

    .privacy-content {
      width: 100%;
      padding: 24px;
      background-color: #fafafa;
      border-radius: 20px;

      @include flex-column(nowrap, flex-start, flex-start);

      gap: 18px;

      .content-title {
        width: 220px;
        height: 24px;
      }

      .content-lines {
        width: 100%;

        @include flex-column(nowrap, flex-start, flex-start);

        gap: 12px;

        .line {
          width: 100%;
          height: 14px;

          &.short {
            width: 75%;
          }
        }
      }
    }
  }

  .skeleton {
    position: relative;
    overflow: hidden;
    background: #e5e7eb;
    border-radius: 8px;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
      animation: shimmer 1.5s infinite;
    }
  }

  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
</style>
