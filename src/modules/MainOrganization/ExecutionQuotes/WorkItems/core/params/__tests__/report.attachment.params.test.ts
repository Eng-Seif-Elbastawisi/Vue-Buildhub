import { expect, it } from 'vitest';
import StoreReportParams from '../store.report.params';
import ReportAttachmentParams from '../report.attachment.params';
it('keeps both encoded files in the report request and rejects stored URLs', () => {
  const attachments = ['data:image/jpeg;base64,YQ==', 'data:application/pdf;base64,Yg=='].map(
    (file) => new ReportAttachmentParams(file),
  );
  const report = new StoreReportParams(18, '2026-10-12', null, 1, 1, null, attachments);
  expect(report.toMap().attachments).toEqual([
    { file: 'data:image/jpeg;base64,YQ==' },
    { file: 'data:application/pdf;base64,Yg==' },
  ]);
  report.attachments = [new ReportAttachmentParams('https://example.test/stored.jpg')];
  expect(report.validate().isValid).toBe(false);
});
