import { describe, expect, it, vi } from 'vitest';
import StageController from '../stage.controller';
import ChangeStageOrderParams from '../../../core/params/change.stage.order.params';
import StageRepository from '../../../data/repositories/stage.repository';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import StageModel from '../../../core/models/stage.model';
import IndexStageParams from '../../../core/params/index.stage.params';

describe('StageController', () => {
  it('returns the same singleton instance', () => {
    expect(StageController.getInstance()).toBe(StageController.getInstance());
  });

  it('uses non-blocking controller feedback settings', () => {
    const controller = StageController.getInstance() as unknown as {
      config: {
        showLoadingDialog: boolean;
        showSuccessDialog: boolean;
        showErrorDialog: boolean;
        autoRetry: boolean;
        showErrorTosat: boolean;
        showSuccessTosat: boolean;
        maxAutoRetries: number;
      };
    };

    expect(controller.config).toEqual({
      showLoadingDialog: false,
      showSuccessDialog: false,
      showErrorDialog: false,
      autoRetry: false,
      showErrorTosat: true,
      showSuccessTosat: true,
      maxAutoRetries: 1,
    });
  });

  it('calls repository.changeOrder when changeOrder is invoked with valid params', async () => {
    const controller = StageController.getInstance();
    const repo = StageRepository.getInstance();
    const spy = vi
      .spyOn(repo, 'changeOrder')
      .mockResolvedValue(new DataSuccess({ data: StageModel.example }));

    const params = new ChangeStageOrderParams({
      stageId: 10,
      order: 3,
    });

    const result = await controller.changeOrder(params);
    expect(spy).toHaveBeenCalledWith(params, { useJson: true });
    expect(result).toBeInstanceOf(DataSuccess);
  });

  it('offers only stages with a null parent for a main-stage select', async () => {
    const mainStage = StageModel.fromJson({ id: 1, title: 'Design', parent_id: null });
    const childStage = StageModel.fromJson({ id: 2, title: 'Review', parent_id: 1 });
    const index = vi.spyOn(StageRepository.getInstance(), 'index').mockResolvedValue(
      new DataSuccess({ data: [mainStage, childStage] }),
    );

    const options = await StageController.getInstance().fetchAsOptions(
      new IndexStageParams({ parentId: null, withPage: 0 }),
    );

    expect(options.map((option) => option.id)).toEqual([1]);
    index.mockRestore();
  });
});
