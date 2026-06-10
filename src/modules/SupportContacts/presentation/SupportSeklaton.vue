<!-- SupportContactsSkeleton.vue -->
<template>
  <div class="support-contact-page-skeleton">
    <!-- Header -->
    <div class="header-container">
      <div class="about-header">
        <div class="skeleton title"></div>
        <div class="skeleton description"></div>
      </div>

      <div class="header-actions">
        <div class="skeleton outline-btn"></div>
        <div class="skeleton filled-btn"></div>
      </div>
    </div>

    <!-- Cards -->
    <div class="sections-list">
      <div v-for="card in 3" :key="card" class="support-view-card">
        <!-- Section Title -->
        <div class="section-title-bar">
          <div class="skeleton section-title"></div>
        </div>

        <!-- Contact Items -->
        <div class="contact-info-row">
          <div v-for="item in 3" :key="item" class="contact-item">
            <div class="skeleton contact-icon"></div>

            <div class="contact-info">
              <div class="skeleton contact-label"></div>
              <div class="skeleton contact-value"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '../../../styles/variables' as *;
  @use '../../../styles/mixins/flex' as *;

  .support-contact-page-skeleton {
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
          width: 260px;
          height: 28px;
        }

        .description {
          width: 360px;
          height: 16px;
        }
      }

      .header-actions {
        @include flex-row(nowrap, flex-end, center);

        gap: 12px;

        .outline-btn,
        .filled-btn {
          width: 170px;
          height: 42px;
          border-radius: 999px;
        }

        .filled-btn {
          width: 120px;
        }
      }
    }

    .sections-list {
      width: 100%;

      @include flex-column(nowrap, flex-start, flex-start);

      gap: 16px;
    }

    .support-view-card {
      width: 100%;
      border-radius: 16px;
      overflow: hidden;
      background: var(--standard-white);

      .section-title-bar {
        padding: 16px 20px;
        border-bottom: 1px dashed #e5e7eb;

        .section-title {
          width: 180px;
          height: 18px;
        }
      }

      .contact-info-row {
        padding: 20px;

        @include flex-row(nowrap, flex-start, center);

        gap: 60px;
        flex-wrap: wrap;

        .contact-item {
          @include flex-row(nowrap, flex-start, center);

          gap: 12px;
          min-width: 220px;

          .contact-icon {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            flex-shrink: 0;
          }

          .contact-info {
            @include flex-column(nowrap, flex-start, flex-start);

            gap: 8px;

            .contact-label {
              width: 90px;
              height: 12px;
            }

            .contact-value {
              width: 140px;
              height: 14px;
            }
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
