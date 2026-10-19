export function startedOverview(ids = [18]) {
  return {
    status: true,
    data: {
      basicData: { count_timeline: 1 },
      data: [
        {
          id: 2,
          title: 'Main',
          duration: 1,
          duration_type: 4,
          work_status: 1,
          stages: ids.map((id) => ({
            id,
            parent_id: null,
            quote_stage_id: 999,
            stage: { id: 77, title: 'Electrical' },
            sub_stage: null,
            children: [],
          })),
        },
      ],
    },
  };
}
