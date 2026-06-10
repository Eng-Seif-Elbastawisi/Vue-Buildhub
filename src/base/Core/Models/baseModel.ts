import { env } from '@/base/Core/Config';

/**
 * BaseModel - Base class for all data models
 * Provides standardized pattern for returning real vs mock data based on environment
 */
export default abstract class BaseModel {
  /**
   * Returns data based on the current environment.
   * - In production: returns fromJson(data)
   * - In test: returns example()
   * - In other modes (dev): returns example() if useStaticData is true, otherwise fromJson(data)
   *
   * @param this - The model class constructor
   * @param data - The raw data from API to be parsed via fromJson
   */
  static using<T extends BaseModel>(
    this: { new (...args: any[]): T; fromJson: (data: any) => T; example: () => T },
    data: any,
  ): T {
    if (env.isProduction) {
      return this.fromJson(data);
    }

    if (env.isTest) {
      return this.example();
    }

    // In development or other modes, check the useStaticData flag
    return env.useStaticData ? this.example() : this.fromJson(data);
  }

  /**
   * Instantiates the model from raw JSON data.
   * Must be implemented by child classes.
   */
  static fromJson(_data: any): BaseModel {
    throw new Error('fromJson() must be implemented by child class');
  }

  /**
   * Returns an example/mock instance of the model.
   * Must be implemented by child classes.
   */
  static example(): BaseModel {
    throw new Error('example() must be implemented by child class');
  }
}
