import BaseController from "@/base/Presentation/Controller/baseController";
import type { ControllerConfig } from "@/base/Presentation/Controller/baseController";
import type { ApiCallOptions } from "@/base/Data/ApiService/baseApiService";
import type Params from "@/base/Core/Params/params";
import { DataSuccess } from "@/base/Core/NetworkStructure/Resources/dataState/dataState";
import router from "@/router";
import { useFormsStore } from "@/stores/formsStore";
import SubjectRepository from "../../data/repositories/subject.repository";
import type SubjectModel from "../../core/models/subject.model";

/**
 * Country Controller for managing countries
 *
 * This controller provides methods for CRUD operations on countries.
 */
export default class SubjectController extends BaseController<
  SubjectModel,
  SubjectModel[]
> {
  private static instance: SubjectController;

  protected get repository() {
    return SubjectRepository.getInstance();
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
   * @returns CountryController instance
   */
  static getInstance(): SubjectController {
    if (!SubjectController.instance) {
      SubjectController.instance = new SubjectController();
    }
    return SubjectController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.create(params, options);
    if (result instanceof DataSuccess) {
      router.push({ name: "Countries" });
      if (formKey) {
        FormStore.clearFormData(formKey);
      }
    }
    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.update(params, options);
    if (result instanceof DataSuccess) {
      router.push({ name: "Countries" });
      if (formKey) {
        FormStore.clearFormData(formKey);
      }
    }
    return result;
  }
}
