import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type EducationClassificationTreeModel from '@/modules/EducationClassification/core/models/EducationTree/education.classification.tree.model';
import EducationTreeRepository from '@/modules/EducationClassification/data/repositories/EducationTree/education.configuration.tree.repository';

/**
 * Education Tree Controller for managing education configuration trees
 *
 * This controller provides methods for CRUD operations on education tree.
 */
export default class EducationTreeController extends BaseController<
  EducationClassificationTreeModel,
  EducationClassificationTreeModel[]
> {
  private static instance: EducationTreeController;

  protected get repository() {
    return EducationTreeRepository.getInstance();
  }

  /**
   * Controller configuration
   * Defines behavior for loading, success, and error dialogs
   */
  protected get config(): ControllerConfig {
    return {
      showLoadingDialog: true,
      showSuccessDialog: true,
      showErrorDialog: true,
      autoRetry: true,
      maxAutoRetries: 1,
    };
  }

  private constructor() {
    super();
  }

  /**
   * Get singleton instance
   * @returns EducationTreeController instance
   */
  static getInstance(): EducationTreeController {
    if (!EducationTreeController.instance) {
      EducationTreeController.instance = new EducationTreeController();
    }
    return EducationTreeController.instance;
  }

  // async create(params: Params, options?: ApiCallOptions, formKey?: string) {
  //   const FormStore = useFormsStore();

  //   const result = await super.create(params, options);
  //   if (result instanceof DataSuccess) {
  //     router.push({ name: 'EducationClassifications' });
  //     if (formKey) {
  //       FormStore.clearFormData(formKey);
  //     }
  //   }
  //   return result;
  // }

  // async update(params: Params, options?: ApiCallOptions, formKey?: string) {
  //   const FormStore = useFormsStore();

  //   const result = await super.update(params, options);
  //   if (result instanceof DataSuccess) {
  //     router.push({ name: 'EducationClassifications' });
  //     if (formKey) {
  //       FormStore.clearFormData(formKey);
  //     }
  //   }
  //   return result;
  // }
}
