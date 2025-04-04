import performance, { type ReviewSession } from '@hcengineering/performance'
import core, { getCurrentAccount, Timestamp, type Ref, type TxOperations } from '@hcengineering/core'
import type { ProjectType } from '@hcengineering/task'
import {
  EastSideColor,
  FeijoaColor,
  FernColor,
  FlamingoColor,
  getCurrentResolvedLocation,
  MalibuColor,
  MediumTurquoiseColor,
  MoodyBlueColor,
  SalmonColor,
  SeaBuckthornColor,
  SeagullColor
} from '@hcengineering/ui'
import { Team } from '@hcengineering/kra-team'

export async function createReviewSession (
  client: TxOperations,
  name: string,
  description: string,
  reviewSessionStart: Timestamp,
  reviewSessionEnd: Timestamp,
  team: Ref<Team>,
  type: Ref<ProjectType>
): Promise<Ref<ReviewSession>> {
  const reviewSessionRef = await client.createDoc(performance.class.ReviewSession, core.space.Space, {
    reviewSessionStatus: performance.reviewSessionStatus.Drafting,
    reviewSessionStart,
    reviewSessionEnd,
    name,
    description,
    private: false,
    archived: false,
    members: [getCurrentAccount()._id],
    team,
    type
  })

  return reviewSessionRef
}

export function getReviewSessionAvailableColors (): string[] {
  return [
    FernColor,
    SeaBuckthornColor,
    FlamingoColor,
    MalibuColor,
    MoodyBlueColor,
    FeijoaColor,
    EastSideColor,
    MediumTurquoiseColor,
    SalmonColor,
    SeagullColor
  ]
}
