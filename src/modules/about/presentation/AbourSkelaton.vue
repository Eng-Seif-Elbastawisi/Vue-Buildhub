<!-- AboutSkeleton.vue -->
<template>
  <div class="about-page-skeleton">
    <!-- Header -->
    <div class="header-container">
      <div class="about-header">
        <div class="skeleton title"></div>
        <div class="skeleton description"></div>
      </div>

      <div class="skeleton button"></div>
    </div>

    <!-- Content -->
    <div class="about-content">
      <!-- Text -->
      <div class="text-content">
        <div class="skeleton heading"></div>

        <div class="paragraph">
          <div class="skeleton line"></div>
          <div class="skeleton line"></div>
          <div class="skeleton line short"></div>
        </div>
      </div>

      <!-- Image -->
      <div class="image-content">
        <div class="skeleton image"></div>
      </div>

      <!-- Social -->
      <div class="social-content">
        <div class="socail-header">
          <div class="skeleton social-title"></div>
        </div>

        <div class="social-icons">
          <div v-for="item in 5" :key="item" class="skeleton social-icon"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '../../../styles/variables' as *;
  @use '../../../styles/mixins/flex' as *;

  .about-page-skeleton {
    @include flex-column(nowrap, flex-start, flex-start);

    gap: 10px;
    min-height: 80vh;

    .header-container {
      width: 100%;

      @include flex-row(nowrap, space-between, center);

      .about-header {
        @include flex-column(nowrap, flex-start, flex-start);

        gap: $XsSize4;
        width: 40%;

        .title {
          width: 180px;
          height: 28px;
        }

        .description {
          width: 320px;
          height: 16px;
        }
      }

      .button {
        width: 120px;
        height: 44px;
        border-radius: 12px;
      }
    }

    .about-content {
      width: 100%;
      padding: $XlSize2;
      border-radius: $XlSize2;
      background-color: $ColorLightGray;

      @include flex-column(nowrap, flex-start, flex-start);

      gap: $XlSize;

      .text-content {
        width: 100%;

        @include flex-column(nowrap, flex-start, flex-start);

        gap: $XsSize5;

        .heading {
          width: 220px;
          height: 24px;
        }

        .paragraph {
          width: 100%;

          @include flex-column(nowrap, flex-start, flex-start);

          gap: 10px;

          .line {
            width: 100%;
            height: 14px;

            &.short {
              width: 70%;
            }
          }
        }
      }

      .image-content {
        width: 100%;

        .image {
          width: 100%;
          height: 350px;
          border-radius: 16px;
        }
      }

      .social-content {
        @include flex-column(nowrap, flex-start, flex-start);

        gap: $XsSize3;
        width: 100%;

        .social-title {
          width: 160px;
          height: 18px;
        }

        .social-icons {
          @include flex-row(nowrap, flex-start, center);

          gap: $XsSize;

          .social-icon {
            width: 42px;
            height: 42px;
            border-radius: 50%;
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
