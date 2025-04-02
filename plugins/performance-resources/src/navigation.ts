import { Ref } from "@hcengineering/core"
import { KRA, performanceId, ReviewSession } from "@hcengineering/performance"
import { getCurrentResolvedLocation, type Location } from "@hcengineering/ui"
import performance from "./plugin"
import { getClient } from "@hcengineering/presentation"

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