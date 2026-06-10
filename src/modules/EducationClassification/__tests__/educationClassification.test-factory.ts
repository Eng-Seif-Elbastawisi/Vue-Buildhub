import TestDataFactory from '@/base/Core/Testing/testDataFactory';
import EducationClassificationModel from '../core/models/education.classification.model';

/**
 * Test data factory for education classification-related test data
 * Provides utilities to create mock education classifications for testing
 */
export class EducationClassificationTestFactory extends TestDataFactory {
  /**
   * Create a mock EducationClassificationModel with default or custom values
   */
  static createMockEducationClassification(
    overrides?: Partial<{
      id: number;
      title: string;
    }>,
  ): EducationClassificationModel {
    return new EducationClassificationModel({
      id: overrides?.id ?? this.randomInt(1, 1000),
      title: overrides?.title ?? `EducationClassification ${this.randomInt()}`,
      created_at: '2022-01-01',
      status: true,
    });
  }

  /**
   * Create a mock API JSON response for an education classification
   */
  static createMockEducationClassificationJson(
    overrides?: Partial<{
      id: number;
      title: string;
    }>,
  ): any {
    return {
      id: overrides?.id ?? this.randomInt(1, 1000),
      title: overrides?.title ?? `EducationClassification ${this.randomInt()}`,
      created_at: '2022-01-01',
      status: true,
    };
  }

  /**
   * Create an array of mock education classifications
   */
  static createMockEducationClassificationList(count: number = 5): EducationClassificationModel[] {
    return this.generateArray(count, (index) =>
      this.createMockEducationClassification({
        id: index + 1,
        title: `EducationClassification ${index + 1}`,
      }),
    );
  }

  /**
   * Create an array of mock education classification JSON responses
   */
  static createMockEducationClassificationJsonList(count: number = 5): any[] {
    return this.generateArray(count, (index) =>
      this.createMockEducationClassificationJson({
        id: index + 1,
        title: `EducationClassification ${index + 1}`,
      }),
    );
  }

  /**
   * Create a successful API response for a single education classification
   */
  static createEducationClassificationApiResponse(
    educationClassification?: EducationClassificationModel | any,
  ) {
    const data =
      educationClassification instanceof EducationClassificationModel
        ? {
            id: educationClassification.id,
            title: educationClassification.title,
            created_at: educationClassification.created_at,
            status: educationClassification.status,
          }
        : (educationClassification ?? this.createMockEducationClassificationJson());
    return this.apiResponse(data, true, 'Education classification retrieved successfully');
  }

  /**
   * Create a successful API response for a list of education classifications
   */
  static createEducationClassificationListApiResponse(
    list?: EducationClassificationModel[] | any[],
  ) {
    const data =
      list?.map((e: any) =>
        e instanceof EducationClassificationModel
          ? {
              id: e.id,
              title: e.title,
              created_at: e.created_at,
              status: e.status,
            }
          : e,
      ) ?? this.createMockEducationClassificationJsonList();
    return this.apiResponse(data, true, 'Education classifications retrieved successfully');
  }

  /**
   * Create invalid data for negative testing
   */
  static createInvalidEducationClassificationData(): any {
    return {
      id: null,
      title: '',
    };
  }

  /**
   * Create error response for testing error handling
   */
  static createErrorEducationClassificationResponse(
    message: string = 'Education classification operation failed',
    statusCode: number = 500,
  ) {
    return this.errorApiResponse(message, statusCode);
  }

  /**
   * Create empty response for testing empty state
   */
  static createEmptyEducationClassificationListResponse() {
    return this.apiResponse([], true, 'No education classifications found');
  }
}

export default EducationClassificationTestFactory;
