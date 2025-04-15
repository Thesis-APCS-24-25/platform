import performance, { type ReviewSessionStatus, type ReviewSession } from '@hcengineering/performance'
import { getCurrentAccount, type Timestamp, type Ref, type TxOperations, type Space } from '@hcengineering/core'
import type { ProjectType } from '@hcengineering/task'
import {
  EastSideColor,
  FeijoaColor,
  FernColor,
  FlamingoColor,
  MalibuColor,
  MediumTurquoiseColor,
  MoodyBlueColor,
  SalmonColor,
  SeaBuckthornColor,
  SeagullColor
} from '@hcengineering/ui'
import { type ViewletDescriptor } from '@hcengineering/view'
import { get } from 'svelte/store'
import { statusStore } from '@hcengineering/view-resources'

export const listReviewSessionStatusOrder = [
  performance.reviewSessionStatus.Drafting,
  performance.reviewSessionStatus.InProgress,
  performance.reviewSessionStatus.Concluded
]

export async function reviewSessionStatusSort (
  client: TxOperations,
  value: Array<Ref<ReviewSessionStatus>>,
  space: Ref<Space> | undefined,
  viewletDescriptorId?: Ref<ViewletDescriptor>
): Promise<Array<Ref<ReviewSessionStatus>>> {
  const statuses = get(statusStore).byId
  //   if (viewletDescriptorId === tracker.viewlet.Kanban) {
  //     value.sort((a, b) => {
  //       const aVal = statuses.get(a)
  //       const bVal = statuses.get(b)
  //       const res =
  //         listIssueKanbanStatusOrder.indexOf(aVal?.category as Ref<StatusCategory>) -
  //         listIssueKanbanStatusOrder.indexOf(bVal?.category as Ref<StatusCategory>)
  //       if (res === 0) {
  //         if (type != null) {
  //           const aIndex = getStatusIndex(type, taskTypes, a)
  //           const bIndex = getStatusIndex(type, taskTypes, b)
  //           return aIndex - bIndex
  //         } else {
  //           return (aVal?.name ?? '').localeCompare(bVal?.name ?? '')
  //         }
  //       }
  //       return res
  //     })
  //   } else {
  value.sort((a, b) => {
    const aVal = statuses.get(a) as ReviewSessionStatus
    const bVal = statuses.get(b) as ReviewSessionStatus
    const res =
        listReviewSessionStatusOrder.indexOf(aVal._id) -
        listReviewSessionStatusOrder.indexOf(bVal._id)
    if (res === 0) {
      return aVal.name.localeCompare(bVal.name)
    }
    return res
  })
  //   }
  alert(value)
  return value
}

export async function createReviewSession (
  client: TxOperations,
  name: string,
  description: string,
  reviewSessionStart: Timestamp,
  reviewSessionEnd: Timestamp,
  team: Ref<Space>,
  type: Ref<ProjectType>
): Promise<Ref<ReviewSession>> {
  const reviewSessionRef = await client.createDoc(performance.class.ReviewSession, team, {
    reviewSessionStatus: performance.reviewSessionStatus.Drafting,
    reviewSessionStart,
    reviewSessionEnd,
    name,
    description,
    private: false,
    archived: false,
    members: [getCurrentAccount()._id],
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
