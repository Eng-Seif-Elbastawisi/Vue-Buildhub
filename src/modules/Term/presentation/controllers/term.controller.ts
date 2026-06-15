import BaseController from '@/base/Presentation/Controller/baseController';
import type TermModel from '../../core/models/term.model';
import TermRepository from '../../data/repositories/term.repository';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';

export default class TermController extends BaseController<TermModel, TermModel[]> {
  private static instance: TermController;

  protected get repository() {
    return TermRepository.getInstance();
  }

  private constructor() {
    super();
  }

  static getInstance(): TermController {
    if (!TermController.instance) TermController.instance = new TermController();
    return TermController.instance;
  }
}
