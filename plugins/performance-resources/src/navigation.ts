import { type Ref } from '@hcengineering/core'
import { type KRA, performanceId, type ReviewSession } from '@hcengineering/performance'
import { getCurrentResolvedLocation, type Location } from '@hcengineering/ui'
import performance from './plugin'
import { getClient } from '@hcengineering/presentation'
import { type NavigatorModel } from '@hcengineering/workbench'
import { derived, get } from 'svelte/store'
import { currentTeam } from './utils/team'
import { checkMyPermission, permissionsStore } from '@hcengineering/view-resources'
import kraTeam from '@hcengineering/kra-team'

export function getReviewSessionLink (_id: Ref<ReviewSession>): Location {
  const loc = getCurrentResolvedLocation()
  loc.path.length = 2
  loc.fragment = undefined
  loc.query = undefined
  loc.path[2] = performanceId
  loc.path[3] = _id

  return loc
}

export function isKRAId (shortLink: string): boolean {
  return /^\S+-\d+$/.test(shortLink)
}

export async function getKRAIdByIdentifier (identifier: string): Promise<Ref<KRA> | undefined> {
  if (!isKRAId(identifier)) return
  const client = getClient()
  const issue = await client.findOne(performance.class.KRA, { identifier })

  return issue?._id
}

export function parseKRAId (shortLink?: string): Ref<KRA> | undefined {
  if (shortLink === undefined) {
    return undefined
  }
  const parts = shortLink.split('-')
  if (parts.length > 1) {
    return parts[parts.length - 1] as Ref<KRA>
  }
  return undefined
}

export function getKRAIdFromFragment (fragment: string): Ref<KRA> | undefined {
  const [, id] = decodeURIComponent(fragment).split('|')

  if (id == null) {
    return undefined
  }

  return (parseKRAId(id) ?? id) as Ref<KRA>
}

export const navigatorModel = derived([currentTeam, permissionsStore], ([team, permissionsStore]) => {
  if (team === undefined) {
    return { spaces: [] }
  }
  const canCreateRS = checkMyPermission(kraTeam.permission.CreateReviewSession, team, permissionsStore)
  const canViewDashboard = checkMyPermission(kraTeam.permission.ViewDashboard, team, permissionsStore)
  const nav: NavigatorModel = {
    specials: canCreateRS
      ? [
          {
            id: 'all-review-sessions',
            label: performance.string.AllReviewSessions,
            component: performance.component.AllReviewSessions,
            icon: performance.icon.ReviewSession,
            componentProps: {
              _class: performance.class.ReviewSession
            }
          }
        ]
      : [],

    spaces: [
      {
        id: 'active-review-sessions',
        icon: performance.icon.Active,
        label: performance.string.ActiveReviewSessions,
        spaceClass: performance.class.ReviewSession,
        specials: [
          ...(canViewDashboard
            ? [
                {
                  id: 'dashboard',
                  label: performance.string.PerformanceDashboard,
                  component: performance.component.PerformanceDashboard
                }
              ]
            : []),
          {
            id: 'my-kras',
            label: performance.string.MyKRAs,
            component: performance.component.MyKRAs
          },
          {
            id: 'kras',
            label: performance.string.AssignedKRAs,
            component: performance.component.AllKRAs
          }
        ]
      },
      {
        id: 'drafting-review-sessions',
        label: performance.string.DraftingReviewSessions,
        spaceClass: performance.class.ReviewSession,
        specials: [
          {
            id: 'kras',
            label: performance.string.AssignedKRAs,
            component: performance.component.AllKRAs
          }
        ]
      },
      {
        id: 'concluded-review-sessions',
        label: performance.string.ConcludedReviewSessions,
        spaceClass: performance.class.ReviewSession,
        specials: [
          ...(canViewDashboard
            ? [
                {
                  id: 'dashboard',
                  label: performance.string.PerformanceDashboard,
                  component: performance.component.PerformanceDashboard
                }
              ]
            : []),
          {
            id: 'my-kras',
            label: performance.string.MyKRAs,
            component: performance.component.MyKRAs
          },
          {
            id: 'kras',
            label: performance.string.AssignedKRAs,
            component: performance.component.AllKRAs
          },
          {
            id: 'my-reports',
            position: 'bottom',
            label: performance.string.PerformanceReports,
            component: performance.component.PerformanceReports,
            componentProps: {
              _class: performance.class.PerformanceReport
            }
          }
        ]
      }
    ]
  }
  return nav
})
