/**
 * Environment Manager
 * Singleton for managing environment configuration with runtime switching
 */

import { ref, readonly, type Ref } from 'vue';
import type { EnvironmentConfig, EnvironmentStage } from './environment.types';
import { environments, getDefaultStage } from './environment.config';

/**
 * Environment Manager - Singleton
 * Provides reactive access to environment configuration
 * Supports runtime switching for testing scenarios
 */
class EnvironmentManager {
  private static _instance: EnvironmentManager;

  /** Current environment stage (reactive) */
  private _stage: Ref<EnvironmentStage>;

  /** Current configuration (reactive) */
  private _config: Ref<EnvironmentConfig>;

  private constructor() {
    const initialStage = getDefaultStage();
    this._stage = ref(initialStage);
    this._config = ref(environments[initialStage]);
  }

  /**
   * Get singleton instance
   */
  static get instance(): EnvironmentManager {
    if (!this._instance) {
      this._instance = new EnvironmentManager();
    }
    return this._instance;
  }

  /**
   * Current environment stage (readonly reactive)
   */
  get stage(): Readonly<Ref<EnvironmentStage>> {
    return readonly(this._stage);
  }

  /**
   * Current configuration (readonly reactive)
   */
  get config(): Readonly<Ref<EnvironmentConfig>> {
    return readonly(this._config);
  }

  /**
   * Get current stage value
   */
  get currentStage(): EnvironmentStage {
    return this._stage.value;
  }

  /**
   * Get current configuration value
   */
  get currentConfig(): EnvironmentConfig {
    return this._config.value;
  }

  // Convenience accessors

  /**
   * Get API base URL
   */
  get apiBaseUrl(): string {
    return this._config.value.apiBaseUrl;
  }

  /**
   * Get default timeout
   */
  get timeout(): number {
    return this._config.value.timeout;
  }

  /**
   * Check if logging is enabled
   */
  get isLoggingEnabled(): boolean {
    return this._config.value.enableLogging;
  }

  /**
   * Check if using static data
   */
  get useStaticData(): boolean {
    return this._config.value.useStaticData;
  }

  /**
   * Check if retry is enabled
   */
  get isRetryEnabled(): boolean {
    return this._config.value.enableRetry;
  }

  /**
   * Get max retry attempts
   */
  get maxRetryAttempts(): number {
    return this._config.value.maxRetryAttempts;
  }

  /**
   * Get retry delay
   */
  get retryDelay(): number {
    return this._config.value.retryDelay;
  }

  // Environment checks

  /**
   * Check if running in development
   */
  get isDevelopment(): boolean {
    return this._stage.value === 'development';
  }

  /**
   * Check if running in production
   */
  get isProduction(): boolean {
    return this._stage.value === 'production';
  }

  /**
   * Check if running in test mode
   */
  get isTest(): boolean {
    // console.log(this._stage.value, 'this._stage.value');
    return this._stage.value === 'test';
  }

  // Runtime switching (primarily for testing)

  /**
   * Switch to a different environment at runtime
   * @param stage - Target environment stage
   */
  switchTo(stage: EnvironmentStage): void {
    if (this._stage.value !== stage) {
      this._stage.value = stage;
      this._config.value = environments[stage];

      // if (this.isLoggingEnabled) {
      //   console.info(`[EnvironmentManager] Switched to ${stage} environment`);
      // }
    }
  }

  /**
   * Override specific configuration values
   * Useful for testing specific scenarios
   * @param overrides - Partial configuration to override
   */
  override(overrides: Partial<EnvironmentConfig>): void {
    this._config.value = {
      ...this._config.value,
      ...overrides,
    };
  }

  /**
   * Reset to default configuration for current stage
   */
  reset(): void {
    this._config.value = environments[this._stage.value];
  }

  /**
   * Log message if logging is enabled
   */
  log(_message: string, ..._args: any[]): void {
    if (this.isLoggingEnabled) {
      // console.log(`[${this.currentStage}] ${message}`, ...args);
    }
  }

  /**
   * Log warning if logging is enabled
   */
  warn(_message: string, ..._args: any[]): void {
    // if (this.isLoggingEnabled) {
    //   console.warn(`[${this.currentStage}] ${message}`, ...args);
    // }
  }

  /**
   * Log error (always logged)
   */
  error(_message: string, ..._args: any[]): void {
    // console.error(`[${this.currentStage}] ${message}`, ...args);
  }
}

// Export singleton instance
export default EnvironmentManager;

// Export for destructuring convenience
export const env = EnvironmentManager.instance;
