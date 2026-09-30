import { describe, expect, it } from 'vitest';

import { QuoteStatusEnum } from '../../constants/quote.status.enum';
import ExecutionQuoteShowModel from '../execution.quote.show.model';

describe('ExecutionQuoteShowModel', () => {
  it.each([
    [QuoteStatusEnum.DRAFT, QuoteStatusEnum.DRAFT],
    [String(QuoteStatusEnum.REVISION_REQUIRED), QuoteStatusEnum.REVISION_REQUIRED],
    [99, undefined],
  ])('maps valid quote statuses and rejects unsupported values', (rawStatus, expectedStatus) => {
    const model = ExecutionQuoteShowModel.fromJson({ quote_status: rawStatus });

    expect(model.quoteStatus).toBe(expectedStatus);
  });

  it.each([
    [{ quote_type: 2 }, 2],
    [{ quote_type: '1' }, 1],
    [{ quote_type_id: '2' }, 2],
  ])('maps the quote type used by execution quote tables', (rawQuoteType, expectedTypeId) => {
    const model = ExecutionQuoteShowModel.fromJson(rawQuoteType);

    expect(model.quoteType?.id).toBe(expectedTypeId);
  });

  it('maps quote-wide supervision totals from the backend response', () => {
    const model = ExecutionQuoteShowModel.fromJson({
      percentage: '10.00',
      supervision_fee: '100.00',
      total_client_price: '1100.00',
    });

    expect(model).toMatchObject({
      supervisionPercentage: 10,
      supervisionFee: 100,
      clientQuotePrice: 1100,
    });
  });

  it('keeps quote items when the backend serializes identifiers as numeric strings', () => {
    const model = ExecutionQuoteShowModel.fromJson({
      quote_stages: [
        {
          id: '43',
          stage: { id: '152', title: 'Electrical stage' },
          sub_stage: { id: '153', title: 'Electrical setup' },
          items: [
            {
              id: '118',
              item_type: '2',
              itemable_id: '39',
              itemable: { id: '39', title: 'Material' },
              measurement_unit: { id: '165', title: 'Square kilometer' },
              expected_price: '1000.00',
              quantity: '1',
            },
          ],
        },
      ],
    });

    expect(model.quoteStages[0]).toMatchObject({
      id: 43,
      stageId: 152,
      subStageId: 153,
      items: [
        expect.objectContaining({
          id: 118,
          itemType: 2,
          itemableId: 39,
          unitId: 165,
        }),
      ],
    });
  });

  it('maps items from the nested quote-stage response used after saving a stage', () => {
    const model = ExecutionQuoteShowModel.fromJson({
      quote_type: 2,
      supervision_type: 1,
      supervision_value: '50.00',
      supervision_price: '409.50',
      total_quote_price: 819,
      client_quote_price: 0,
      quote_stages: [
        {
          id: 94,
          quote_id: 132,
          project_id: 101,
          stage: { id: 129, title: 'Main stage' },
          sub_stages: [
            {
              id: 2,
              sub_stage: { id: 150, title: 'Sub stage' },
              items: [
                {
                  id: 176,
                  item_type: 2,
                  itemable_id: 39,
                  itemable: { id: 39, title: 'Material' },
                  measurement_unit: { id: 165, title: 'Square kilometer' },
                  expected_price: '819.00',
                  quantity: 1,
                },
              ],
            },
          ],
          total_price: '819.00',
          client_price: null,
        },
      ],
    });

    expect(model).toMatchObject({
      supervisionPercentage: 50,
      supervisionFee: 409.5,
      totalQuotePrice: 819,
      clientQuotePrice: 0,
      quoteStagesCount: 1,
      quoteItemsCount: 1,
      quoteStages: [
        expect.objectContaining({
          id: 94,
          stageId: 129,
          subStageId: 150,
          items: [
            expect.objectContaining({
              id: 176,
              itemableId: 39,
              unitId: 165,
              expectedPrice: 819,
              quantity: 1,
            }),
          ],
        }),
      ],
    });
  });

  it('maps the execution quote show resource', () => {
    const quote = ExecutionQuoteShowModel.fromJson({
      id: 41,
      organization: { id: 1, name: 'Techlab', address: 'Techlab Headquarters' },
      employee: { id: 1, name: 'Techlab Employee' },
      quote_source: 1,
      project: {
        id: 207,
        client: { id: 30, title: 'شارع' },
        title: '007',
        description: null,
        date: '2026-08-09',
        created_at: '2026-08-09 06:13:43',
      },
      client: {
        id: 30,
        organization: { id: 1, name: 'Techlab', address: 'Techlab Headquarters' },
        employee: { id: 4, name: 'rawan mamdooh' },
        name: 'شارع',
        phone: '111',
        email: '1012@test.com',
        address: 'mansoura',
        type: 1,
        client_source: { id: 11, title: 'Website' },
        status: 1,
        created_at: '2026-07-22 13:29:29',
      },
      quote_type: { id: 1, title: 'Lump_SUM' },
      quote_status: QuoteStatusEnum.DRAFT,
      price_employee: { id: 68, name: 'type test' },
      total_quote_price: '123456.78',
      client_quote_price: '150000.00',
      attachments: [
        {
          id: 9,
          file: 'https://cdn.example.com/site-plan.png',
          file_size: '2 MB',
          alt: 'Site plan',
          link: null,
          created_at: '2026-09-23 12:42:35',
        },
      ],
      quote_stages: [
        {
          id: 5,
          quote_id: 41,
          project_id: 207,
          stage: { id: 129, title: 'Main stage' },
          sub_stage: { id: 150, title: 'Sub stage' },
          items: [
            {
              id: 7,
              item_type: 1,
              itemable_id: 17,
              itemable_type: 'Product',
              itemable: { id: 17, title: 'تيست1' },
              expected_price: '44444444.00',
              quantity: 1,
              measurement_unit: { id: 165, title: 'Square kilometer' },
            },
          ],
          client_price: '52000000.00',
          percentage: '10.00',
          total_price: '44444444.00',
          created_at: '2026-09-23 12:42:40',
        },
      ],
      created_at: '2026-09-23 11:56:21',
    });

    expect(quote).toMatchObject({
      id: 41,
      organization: { id: 1, name: 'Techlab', address: 'Techlab Headquarters' },
      employee: { id: 1, name: 'Techlab Employee' },
      quoteSource: 1,
      project: {
        id: 207,
        client: { id: 30, title: 'شارع' },
        title: '007',
        description: null,
        date: '2026-08-09',
        createdAt: '2026-08-09 06:13:43',
      },
      client: {
        id: 30,
        organization: { id: 1, name: 'Techlab', address: 'Techlab Headquarters' },
        employee: { id: 4, name: 'rawan mamdooh' },
        name: 'شارع',
        phone: '111',
        email: '1012@test.com',
        address: 'mansoura',
        clientSource: { id: 11, title: 'Website' },
        status: 1,
        createdAt: '2026-07-22 13:29:29',
      },
      quoteType: { id: 1, title: 'Lump_SUM' },
      quoteStatus: QuoteStatusEnum.DRAFT,
      priceEmployee: { id: 68, name: 'type test' },
      totalQuotePrice: 123456.78,
      clientQuotePrice: 150000,
      attachments: [
        {
          id: 9,
          file: 'https://cdn.example.com/site-plan.png',
          fileSize: '2 MB',
          alt: 'Site plan',
          link: null,
          createdAt: '2026-09-23 12:42:35',
        },
      ],
      quoteStages: [
        {
          id: 5,
          quoteId: 41,
          projectId: 207,
          stageId: 129,
          subStageId: 150,
          stage: { id: 129, title: 'Main stage' },
          subStage: { id: 150, title: 'Sub stage' },
          items: [
            {
              id: 7,
              itemType: 1,
              itemableId: 17,
              itemableType: 'Product',
              itemable: { id: 17, title: 'تيست1' },
              expectedPrice: 44444444,
              quantity: 1,
              unitId: 165,
              measurementUnit: { id: 165, title: 'Square kilometer' },
            },
          ],
          clientPrice: 52000000,
          percentage: 10,
          totalPrice: 44444444,
          createdAt: '2026-09-23 12:42:40',
        },
      ],
      quoteStagesCount: 1,
      quoteItemsCount: 1,
      createdAt: '2026-09-23 11:56:21',
    });
  });
});
