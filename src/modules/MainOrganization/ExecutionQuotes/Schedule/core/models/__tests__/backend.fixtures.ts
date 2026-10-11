export const timelineResponse = () => ({
  id: 2,
  employee: { id: 1, name: 'Techlab Employee' },
  title: 'Main Execution Timeline',
  duration: 1,
  duration_type: 4,
  stages: [
    {
      id: 3,
      stage: { id: 129, title: 'منعم' },
      sub_stage: null,
      children: [
        {
          id: 4,
          stage: { id: 129, title: 'منعم' },
          sub_stage: { id: 149, title: 'sub stage' },
          created_at: '2026-10-07 12:08:40',
        },
      ],
      created_at: '2026-10-07 12:08:40',
    },
  ],
  created_at: '2026-10-07 12:08:40',
});
export const overviewResponse = () => ({
  status: true,
  message: 'Project timelines fetched successfully.',
  data: {
    basicData: { start_date: '2026-10-10 00:00:00', status: null, count_timeline: 1 },
    data: [timelineResponse()],
  },
});
