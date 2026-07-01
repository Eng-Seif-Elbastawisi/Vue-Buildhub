import { describe, expect, it } from 'vitest';
import AddStageParams from '../add.stges.params';
import DeleteStageParams from '../delete.stage.params';
import EditStageParams from '../edit.stage.params';
import IndexStageParams from '../index.stage.params';
import ShowStageParams from '../show.stage.params';

const translations = { title: { en: 'Primary', ar: 'Primary AR' } };

describe('stage params', () => {
  it('maps add and edit payloads', () => {
    const add = new AddStageParams({ translations, parentId: 5 });
    const edit = new EditStageParams({ id: 3, translations });

    expect(add.toMap()).toEqual({ translations, parent_id: 5 });
    expect(edit.toMap()).toEqual({ stage_id: 3, translations });
    expect(add.validate().isValid).toBe(true);
    expect(edit.validate().isValid).toBe(true);
  });

  it('omits empty optional parent id and maps list filters', () => {
    expect(new AddStageParams({ translations }).toMap()).toEqual({ translations });
    expect(new IndexStageParams('primary', 2, 20, 1).toMap()).toEqual({
      word: 'primary',
      with_pagination: 1,
      page: 2,
      per_page: 20,
    });
    expect(new IndexStageParams().toMap()).toEqual({ with_pagination: 1, page: 1, per_page: 10 });
  });

  it('maps and validates identifiers', () => {
    expect(new ShowStageParams({ id: 4 }).toMap()).toEqual({ stage_id: 4 });
    expect(new DeleteStageParams(4).toMap()).toEqual({ stage_id: 4 });
    expect(new ShowStageParams({ id: null as unknown as number }).validate().isValid).toBe(false);
  });
});
