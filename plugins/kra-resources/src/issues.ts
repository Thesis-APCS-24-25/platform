import { type Doc, type DocumentUpdate, type Ref, type RelatedDocument, type TxOperations } from '@hcengineering/core'
import { getMetadata } from '@hcengineering/platform'
import presentation, { getClient } from '@hcengineering/presentation'
import { kraId, type Issue } from '@hcengineering/kra'
import { getCurrentResolvedLocation, getPanelURI, type Location, type ResolvedLocation } from '@hcengineering/ui'
import { accessDeniedStore } from '@hcengineering/view-resources'
import { workbenchId } from '@hcengineering/workbench'
import tracker from './plugin'

export function isIssueId (shortLink: string): boolean {
  return /^\S+-\d+$/.test(shortLink)
}

export async function issueIdentifierProvider (client: TxOperations, ref: Ref<Issue>, doc?: Issue): Promise<string> {
  const object = doc ?? (await client.findOne(tracker.class.Issue, { _id: ref }))

  if (object === undefined) {
    return ''
  }

  return object.identifier
}

export async function issueTitleProvider (client: TxOperations, ref: Ref<Doc>, doc?: Issue): Promise<string> {
  const object = doc ?? (await client.findOne(tracker.class.Issue, { _id: ref as Ref<Issue> }))

  if (object === undefined) {
    return ''
  }

  return await getIssueTitle(object)
}

export async function getTitle (doc: Doc): Promise<string> {
  const issue = doc as Issue
  return issue.identifier
}

export function generateIssuePanelUri (issue: Issue): string {
  return getPanelURI(tracker.component.EditIssue, issue.identifier, issue._class, 'content')
}

export async function issueLinkFragmentProvider (doc: Doc): Promise<Location> {
  const loc = getCurrentResolvedLocation()
  loc.path.length = 2
  loc.fragment = undefined
  loc.query = undefined
  loc.path[2] = kraId
  loc.path[3] = await getTitle(doc)

  return loc
}

export async function getIssueTitle (doc: Issue): Promise<string> {
  return await Promise.resolve(doc.title)
}

export async function issueLinkProvider (doc: Doc): Promise<string> {
  return await getTitle(doc).then(generateIssueShortLink)
}

export function generateIssueShortLink (issueId: string): string {
  const location = getCurrentResolvedLocation()
  const frontUrl = getMetadata(presentation.metadata.FrontUrl)
  const protocolAndHost = frontUrl ?? `${window.location.protocol}//${window.location.host}`
  return `${protocolAndHost}/${workbenchId}/${location.path[1]}/${kraId}/${issueId}`
}

export async function generateIssueLocation (loc: Location, issueId: string): Promise<ResolvedLocation | undefined> {
  const client = getClient()
  const issue = await client.findOne(tracker.class.Issue, { identifier: issueId }, { showArchived: true })
  if (issue === undefined) {
    accessDeniedStore.set(true)
    console.error(`Could not find issue ${issueId}.`)
    return undefined
  }
  const appComponent = loc.path[0] ?? ''
  const workspace = loc.path[1] ?? ''
  return {
    loc: {
      path: [appComponent, workspace],
      fragment: generateIssuePanelUri(issue)
    },
    defaultLocation: {
      path: [appComponent, workspace, kraId, issue.space, 'issues'],
      fragment: generateIssuePanelUri(issue)
    }
  }
}

export async function resolveLocation (loc: Location): Promise<ResolvedLocation | undefined> {
  const app = loc.path[2]
  if (app !== kraId) {
    return undefined
  }

  const shortLink = loc.path[3]

  // issue shortlink
  if (isIssueId(shortLink)) {
    return await generateIssueLocation(loc, shortLink)
  }

  return undefined
}

export async function updateIssueRelation (
  client: TxOperations,
  value: Issue,
  id: RelatedDocument,
  prop: 'blockedBy' | 'relations',
  operation: '$push' | '$pull'
): Promise<void> {
  let update: DocumentUpdate<Issue> = {}
  switch (operation) {
    case '$push':
      update = { $push: { [prop]: { _id: id._id, _class: id._class } } }
      break
    case '$pull':
      update = { $pull: { [prop]: { _id: id._id } } }
      break
  }
  await client.update(value, update)
}

export async function getIssueIdByIdentifier (identifier: string): Promise<Ref<Issue> | undefined> {
  if (!isIssueId(identifier)) return
  const client = getClient()
  const issue = await client.findOne(tracker.class.Issue, { identifier })

  return issue?._id
}
