import ScheduleGroupModel from '../../../core/models/schedule.group.model';
import ProjectTimelineStageModel from '../../../core/models/project.timeline.stage.model';
import ProjectTimelineSubStageModel from '../../../core/models/project.timeline.sub-stage.model';
export function groupFixture(id = 201, finishDate?: string | null) {
  return new ScheduleGroupModel({
    id,
    title: 'First Fix',
    stages: [
      new ProjectTimelineStageModel({
        quoteStageId: 10,
        title: 'Stage',
        children: [new ProjectTimelineSubStageModel({ subStageId: 11, title: 'Child' })],
      }),
    ],
    selectionsAvailable: true,
    duration: 6,
    durationType: 1,
    finishDate,
  });
}

import ProjectTimelineOverviewModel from '../../../core/models/project.timeline.overview.model';
import ProjectTimelineBasicDataModel from '../../../core/models/project.timeline.basic-data.model';
export function overviewFixture(groups: ScheduleGroupModel[]) {
  return new ProjectTimelineOverviewModel(
    new ProjectTimelineBasicDataModel(undefined, undefined, null, groups.length),
    groups,
  );
}
