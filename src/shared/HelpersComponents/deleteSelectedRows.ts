export interface DeletableTableRow {
  id?: number;
}

export async function deleteSelectedRows<Row extends DeletableTableRow>(
  selectedRows: Row[],
  deleteById: (id: number) => Promise<unknown>,
  refreshRows: () => Promise<unknown>,
): Promise<void> {
  for (const selectedRow of selectedRows) {
    if (selectedRow.id !== undefined) {
      await deleteById(selectedRow.id);
    }
  }

  await refreshRows();
}
