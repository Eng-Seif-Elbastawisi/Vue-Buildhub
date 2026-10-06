import AddContractorParams from './add.contractor.params';

export default class EditContractorParams extends AddContractorParams {
  constructor(
    public contractorId: number,
    name: string,
    stageIds: number[],
  ) {
    super(name, stageIds);
  }

  toMap(): { id: number; name: string; stage_ids: number[] } {
    return { contractor_id: this.contractorId, ...super.toMap() };
  }
}
