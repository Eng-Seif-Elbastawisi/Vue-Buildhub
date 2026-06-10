/**
 * Environment Configuration Values
 * Define settings for each deployment stage
 */

import type { EnvironmentConfig, EnvironmentStage } from './environment.types';

/**
 * Configuration for all environments
 */
export const environments: Record<EnvironmentStage, EnvironmentConfig> = {
  /**
   * Development environment
   * - Longer timeout for debugging
   * - Logging enabled
   * - Real API calls
   */
  development: {
    stage: 'development',
    apiBaseUrl: 'https://api.orbit.techlabeg.com/orbit/',
    timeout: 30000,
    enableLogging: true,
    useStaticData: false,
    enableRetry: true,
    maxRetryAttempts: 3,
    retryDelay: 1000,
  },

  /**
   * Production environment
   * - Shorter timeout for responsiveness
   * - Logging disabled for performance
   * - Real API calls
   */
  production: {
    stage: 'production',
    apiBaseUrl: 'https://back.orbitconsults.com/orbit/',
    timeout: 15000,
    enableLogging: false,
    useStaticData: false,
    enableRetry: true,
    maxRetryAttempts: 2,
    retryDelay: 500,
  },

  /**
   * Test environment
   * - Short timeout for fast test execution
   * - Logging enabled for debugging tests
   * - Uses static/mock data
   */
  test: {
    stage: 'test',
    apiBaseUrl: 'http://localhost:3000/',
    timeout: 5000,
    enableLogging: true,
    useStaticData: true,
    enableRetry: false,
    maxRetryAttempts: 0,
    retryDelay: 0,
  },
};

/**
 * Get the default environment based on VITE_APP_ENV or defaults to development
 */
export function getDefaultStage(): EnvironmentStage {
  const envVar = import.meta.env?.VITE_APP_ENV;
  if (envVar && isValidStage(envVar)) {
    return envVar as EnvironmentStage;
  }

  // Check if running in production build
  if (import.meta.env?.PROD) {
    return 'production';
  }

  return 'development';
}

/**
 * Validate if a string is a valid environment stage
 */
export function isValidStage(stage: string): stage is EnvironmentStage {
  return ['development', 'production', 'test'].includes(stage);
}
