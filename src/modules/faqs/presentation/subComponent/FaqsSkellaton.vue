<!-- FaqsSkeleton.vue -->
<template>
  <div class="faqs-page-skeleton">
    <!-- Header -->
    <div class="header-container">
      <div class="about-header">
        <div class="skeleton title"></div>
        <div class="skeleton description"></div>
      </div>

      <div class="header-actions">
        <div class="skeleton button"></div>
      </div>
    </div>

    <!-- FAQ List -->
    <div class="sections-list">
      <div v-for="item in 6" :key="item" class="faq-card">
        <div class="faq-row-header">
          <!-- Left -->
          <div class="faq-row-left">
            <div class="skeleton expand-btn"></div>

            <div class="faq-question-wrapper">
              <div class="skeleton faq-question"></div>
            </div>
          </div>

          <!-- Actions -->
          <div class="faq-row-actions">
            <div class="skeleton action-btn"></div>
            <div class="skeleton action-btn"></div>
          </div>
        </div>

        <!-- Optional fake answer -->
        <div v-if="item === 1 || item === 3" class="faq-answer">
          <div class="skeleton line"></div>
          <div class="skeleton line"></div>
          <div class="skeleton line short"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '../../../../styles/variables' as *;
  @use '../../../../styles/mixins/flex' as *;
  @use '../../../../styles/mixins/border' as *;

  .faqs-page-skeleton {
    @include flex-column(nowrap, flex-start, flex-start);

    gap: $XlSize;
    min-height: 80vh;

    .header-container {
      width: 100%;

      @include flex-row(nowrap, space-between, center);

      .about-header {
        @include flex-column(nowrap, flex-start, flex-start);

        gap: 8px;

        .title {
          width: 140px;
          height: 28px;
        }

        .description {
          width: 320px;
          height: 16px;
        }
      }

      .button {
        width: 140px;
        height: 42px;
        border-radius: 999px;
      }
    }

    .sections-list {
      width: 100%;
      padding: $XlSize;

      @include flex-column(nowrap, flex-start, flex-start);

      gap: $XsSize;
      background-color: $GraySoftAlpha50;
      border-radius: $BorderRadiusLg;
    }

    .faq-card {
      width: 100%;
      background-color: var(--standard-white);
      border-radius: $BorderRadiusLg;
      overflow: hidden;

      .faq-row-header {
        @include flex-row(nowrap, space-between, center);

        padding: $MdSize $XlSize;

        .faq-row-left {
          @include flex-row(nowrap, flex-start, center);

          gap: $XsSize;
          flex: 1;

          .expand-btn {
            width: $XlSize;
            height: $XlSize;
            border-radius: 50%;
            flex-shrink: 0;
          }

          .faq-question-wrapper {
            width: 100%;
          }

          .faq-question {
            width: 65%;
            height: 16px;
          }
        }

        .faq-row-actions {
          @include flex-row(nowrap, flex-end, center);

          gap: $XsSize2;

          .action-btn {
            width: calc($XlSize2 + 2px);
            height: calc($XlSize2 + 2px);
            border-radius: $BorderRadiusSm;
          }
        }
      }

      .faq-answer {
        padding: 0 $MdSize $XlSize $XlSize4;

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
