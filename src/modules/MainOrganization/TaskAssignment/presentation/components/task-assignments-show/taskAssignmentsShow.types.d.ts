export type DialogAction = 'START' | 'HOLD' | 'FINISH';

export interface StatusMeta {
  className: string;
  icon: string;
}

export interface TaskAssignmentStatusActionModel {
  activeAction: DialogAction | null;
  confirmationMessage: string;
  loading: boolean;
  notes: string;
  showFinish: boolean;
  showHold: boolean;
  showStart: boolean;
  title: string;
  visible: boolean;
}
