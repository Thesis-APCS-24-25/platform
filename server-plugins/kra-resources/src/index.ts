//
// Copyright © 2022 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import chunter, { ChatMessage } from '@hcengineering/chunter'
import { Person, PersonAccount } from '@hcengineering/contact'
import core, {
  Account,
  AccountRole,
  concatLink,
  Doc,
  DocumentUpdate,
  Ref,
  Space,
  Tx,
  TxCreateDoc,
  TxCUD,
  TxProcessor,
  TxRemoveDoc,
  TxUpdateDoc,
  WithLookup
} from '@hcengineering/core'
import { NotificationContent } from '@hcengineering/notification'
import { getMetadata, IntlString } from '@hcengineering/platform'
import serverCore, { TriggerControl } from '@hcengineering/server-core'
import { NOTIFICATION_BODY_SIZE } from '@hcengineering/server-notification'
import { stripTags } from '@hcengineering/text-core'
import kra, { Issue, IssueParentInfo, Project, TimeSpendReport, kraId } from '@hcengineering/kra'
import { workbenchId } from '@hcengineering/workbench'

async function updateSubIssues (
  updateTx: TxUpdateDoc<Issue>,
  control: TriggerControl,
  update: DocumentUpdate<Issue> | ((node: Issue) => DocumentUpdate<Issue>)
): Promise<TxUpdateDoc<Issue>[]> {
  const subIssues = await control.findAll(control.ctx, kra.class.Issue, {
    'parents.parentId': updateTx.objectId
  })

  return subIssues.map((issue) => {
    const docUpdate = typeof update === 'function' ? update(issue) : update
    return control.txFactory.createTxUpdateDoc(issue._class, issue.space, issue._id, docUpdate)
  })
}

/**
 * @public
 */
export async function issueHTMLPresenter (doc: Doc, control: TriggerControl): Promise<string> {
  const issue = doc as Issue
  const front = control.branding?.front ?? getMetadata(serverCore.metadata.FrontUrl) ?? ''
  const path = `${workbenchId}/${control.workspace.workspaceUrl}/${kraId}/${issue.identifier}`
  const link = concatLink(front, path)
  return `<a href="${link}">${issue.identifier}</a> ${issue.title}`
}

/**
 * @public
 */
export async function getIssueId (doc: Issue, control: TriggerControl): Promise<string> {
  const issue = doc
  const project = (await control.findAll(control.ctx, kra.class.Project, { _id: issue.space }))[0]
  return `${project?.identifier ?? '?'}-${issue.number}`
}

/**
 * @public
 */
export async function issueTextPresenter (doc: Doc): Promise<string> {
  const issue = doc as Issue
  return `${issue.identifier} ${issue.title}`
}

function isSamePerson (control: TriggerControl, assignee: Ref<Person>, target: Ref<Account>): boolean {
  const targetAccount = control.modelDb.getObject(target) as PersonAccount
  return assignee === targetAccount?.person
}

/**
 * @public
 */
export async function getIssueNotificationContent (
  doc: Doc,
  tx: TxCUD<Doc>,
  target: Ref<Account>,
  control: TriggerControl
): Promise<NotificationContent> {
  const issue = doc as Issue

  const issueTitle = await issueTextPresenter(doc)

  const title = kra.string.IssueNotificationTitle
  let body = kra.string.IssueNotificationBody
  const intlParams: Record<string, string | number> = {
    issueTitle
  }
  const intlParamsNotLocalized: Record<string, IntlString> = {}

  if (tx._class === core.class.TxCreateDoc) {
    if (tx.objectClass === chunter.class.ChatMessage) {
      const createTx = tx as TxCreateDoc<ChatMessage>
      const message = createTx.attributes.message
      const plainTextMessage = stripTags(message, NOTIFICATION_BODY_SIZE)
      intlParams.message = plainTextMessage
    }
  } else if (tx._class === core.class.TxUpdateDoc) {
    const updateTx = tx as TxUpdateDoc<Issue>

    if (
      updateTx.operations.assignee !== null &&
      updateTx.operations.assignee !== undefined &&
      isSamePerson(control, updateTx.operations.assignee, target)
    ) {
      body = kra.string.IssueAssignedToYou
    } else {
      const attributes = control.hierarchy.getAllAttributes(doc._class)
      for (const attrName in updateTx.operations) {
        if (!Object.prototype.hasOwnProperty.call(updateTx.operations, attrName)) {
          continue
        }

        const attr = attributes.get(attrName)
        if (attr !== null && attr !== undefined) {
          intlParamsNotLocalized.property = attr.label
          if (attr.type._class === core.class.TypeString) {
            body = kra.string.IssueNotificationChangedProperty
            intlParams.newValue = (issue as any)[attr.name]?.toString()
          } else {
            body = kra.string.IssueNotificationChanged
          }
        }
        break
      }
    }
  }

  return {
    title,
    body,
    intlParams,
    intlParamsNotLocalized
  }
}

/**
 * @public
 */
export async function OnProjectRemove (txes: Tx[], control: TriggerControl): Promise<Tx[]> {
  const result: Tx[] = []
  for (const tx of txes) {
    const ctx = tx as TxRemoveDoc<Project>
    const classes = [kra.class.Issue, kra.class.IssueTemplate]
    for (const cls of classes) {
      const docs = await control.findAll(control.ctx, cls, {
        space: ctx.objectId
      })
      for (const doc of docs) {
        const tx = control.txFactory.createTxRemoveDoc(cls, doc.space, doc._id)
        result.push(tx)
      }
    }
  }
  control.ctx.contextData.broadcast.targets.projectRemove = (it) => {
    return []
  }
  return result
}

/**
 * @public
 */
export async function OnWorkspaceOwnerAdded (txes: Tx[], control: TriggerControl): Promise<Tx[]> {
  const result: Tx[] = []
  for (const tx of txes) {
    let ownerId: Ref<PersonAccount> | undefined
    if (control.hierarchy.isDerived(tx._class, core.class.TxCreateDoc)) {
      const createTx = tx as TxCreateDoc<PersonAccount>

      if (createTx.attributes.role === AccountRole.Owner) {
        ownerId = createTx.objectId
      }
    } else if (control.hierarchy.isDerived(tx._class, core.class.TxUpdateDoc)) {
      const updateTx = tx as TxUpdateDoc<PersonAccount>

      if (updateTx.operations.role === AccountRole.Owner) {
        ownerId = updateTx.objectId
      }
    }

    if (ownerId === undefined) {
      continue
    }

    const targetProject = (
      await control.findAll(control.ctx, kra.class.Project, {
        _id: kra.project.DefaultProject
      })
    )[0]

    if (targetProject === undefined) {
      continue
    }

    if (
      targetProject.owners === undefined ||
      targetProject.owners.length === 0 ||
      targetProject.owners[0] === core.account.System
    ) {
      result.push(
        control.txFactory.createTxUpdateDoc(kra.class.Project, targetProject.space, targetProject._id, {
          owners: [ownerId]
        })
      )
    }
  }
  return result
}

/**
 * @public
 */
export async function OnIssueUpdate (txes: Tx[], control: TriggerControl): Promise<Tx[]> {
  const result: Tx[] = []
  for (const actualTx of txes) {
    // Check TimeReport operations
    if (
      actualTx._class === core.class.TxCreateDoc ||
      actualTx._class === core.class.TxUpdateDoc ||
      actualTx._class === core.class.TxRemoveDoc
    ) {
      const cud = actualTx as TxCUD<TimeSpendReport>
      if (cud.objectClass === kra.class.TimeSpendReport) {
        result.push(...(await doTimeReportUpdate(cud, control)))
      }
    }

    if (actualTx._class === core.class.TxCreateDoc) {
      const createTx = actualTx as TxCreateDoc<Issue>
      if (control.hierarchy.isDerived(createTx.objectClass, kra.class.Issue)) {
        const issue = TxProcessor.createDoc2Doc(createTx)
        updateIssueParentEstimations(issue, result, control, [], issue.parents)
        continue
      }
    }

    if (actualTx._class === core.class.TxUpdateDoc) {
      const updateTx = actualTx as TxUpdateDoc<Issue>
      if (control.hierarchy.isDerived(updateTx.objectClass, kra.class.Issue)) {
        result.push(...(await doIssueUpdate(updateTx, control)))
        continue
      }
    }
    if (actualTx._class === core.class.TxRemoveDoc) {
      const removeTx = actualTx as TxRemoveDoc<Issue>
      if (control.hierarchy.isDerived(removeTx.objectClass, kra.class.Issue)) {
        const parentIssue = await control.findAll(control.ctx, kra.class.Issue, {
          'childInfo.childId': removeTx.objectId
        })
        const parents: IssueParentInfo[] = parentIssue.map((it) => ({
          parentId: it._id,
          parentTitle: it.title,
          identifier: it.identifier,
          space: it.space
        }))
        updateIssueParentEstimations(
          {
            _id: removeTx.objectId,
            estimation: 0,
            reportedTime: 0,
            space: removeTx.space
          },
          result,
          control,
          parents,
          []
        )
      }
    }
  }
  return result
}

async function doTimeReportUpdate (cud: TxCUD<TimeSpendReport>, control: TriggerControl): Promise<Tx[]> {
  const { attachedTo: attachedToId, attachedToClass } = cud
  if (attachedToClass === undefined || attachedToId === undefined) {
    return []
  }
  const attachedTo = attachedToId as Ref<Issue>
  switch (cud._class) {
    case core.class.TxCreateDoc: {
      const ccud = cud as TxCreateDoc<TimeSpendReport>
      const [currentIssue] = await control.findAll(control.ctx, kra.class.Issue, { _id: attachedTo }, { limit: 1 })
      const res = [
        control.txFactory.createTxUpdateDoc<Issue>(
          attachedToClass,
          cud.objectSpace,
          attachedTo,
          {
            $inc: { reportedTime: ccud.attributes.value }
          },
          false,
          currentIssue.modifiedOn
        )
      ]
      currentIssue.reportedTime += ccud.attributes.value
      currentIssue.remainingTime = Math.max(0, currentIssue.estimation - currentIssue.reportedTime)
      updateIssueParentEstimations(currentIssue, res, control, currentIssue.parents, currentIssue.parents)
      return res
    }
    case core.class.TxUpdateDoc: {
      const upd = cud as TxUpdateDoc<TimeSpendReport>
      if (upd.operations.value !== undefined) {
        const logTxes = Array.from(
          await control.findAll(control.ctx, core.class.TxCUD, {
            objectId: cud.objectId
          })
        ).filter((it) => it._id !== cud._id)
        const doc: TimeSpendReport | undefined = TxProcessor.buildDoc2Doc(logTxes)

        const res: Tx[] = []
        const [currentIssue] = await control.findAll(control.ctx, kra.class.Issue, { _id: attachedTo }, { limit: 1 })
        if (doc !== undefined) {
          res.push(
            control.txFactory.createTxUpdateDoc<Issue>(
              attachedToClass,
              cud.objectSpace,
              attachedTo,
              {
                $inc: { reportedTime: upd.operations.value - doc.value }
              },
              false,
              currentIssue.modifiedOn
            )
          )
          currentIssue.reportedTime -= doc.value
          currentIssue.reportedTime += upd.operations.value
          currentIssue.remainingTime = Math.max(0, currentIssue.estimation - currentIssue.reportedTime)
        }

        updateIssueParentEstimations(currentIssue, res, control, currentIssue.parents, currentIssue.parents)
        return res
      }
      break
    }
    case core.class.TxRemoveDoc: {
      if (!control.removedMap.has(attachedTo)) {
        const logTxes = Array.from(
          await control.findAll(control.ctx, core.class.TxCUD, {
            objectId: cud.objectId
          })
        ).filter((it) => it._id !== cud._id)
        const doc: TimeSpendReport | undefined = TxProcessor.buildDoc2Doc(logTxes)
        if (doc !== undefined) {
          const [currentIssue] = await control.findAll(control.ctx, kra.class.Issue, { _id: attachedTo }, { limit: 1 })
          const res = [
            control.txFactory.createTxUpdateDoc<Issue>(
              attachedToClass,
              cud.objectSpace,
              attachedTo,
              {
                $inc: { reportedTime: -1 * doc.value }
              },
              false,
              currentIssue.modifiedOn
            )
          ]
          currentIssue.reportedTime -= doc.value
          currentIssue.remainingTime = Math.max(0, currentIssue.estimation - currentIssue.reportedTime)
          updateIssueParentEstimations(currentIssue, res, control, currentIssue.parents, currentIssue.parents)
          return res
        }
      }
    }
  }
  return []
}

async function doIssueUpdate (updateTx: TxUpdateDoc<Issue>, control: TriggerControl): Promise<Tx[]> {
  const res: Tx[] = []

  let currentIssue: WithLookup<Issue> | undefined

  async function getCurrentIssue (): Promise<WithLookup<Issue>> {
    if (currentIssue !== undefined) {
      return currentIssue
    }
    // We need to remove estimation information from out parent issue
    ;[currentIssue] = await control.findAll(control.ctx, kra.class.Issue, { _id: updateTx.objectId }, { limit: 1 })
    return currentIssue
  }

  if (Object.prototype.hasOwnProperty.call(updateTx.operations, 'attachedTo')) {
    const [newParent] = await control.findAll(
      control.ctx,
      kra.class.Issue,
      { _id: updateTx.operations.attachedTo as Ref<Issue> },
      { limit: 1 }
    )

    const updatedParents: IssueParentInfo[] =
      newParent !== undefined
        ? [
            {
              parentId: newParent._id,
              parentTitle: newParent.title,
              space: newParent.space,
              identifier: newParent.identifier
            },
            ...newParent.parents
          ]
        : []

    function update (issue: Issue): DocumentUpdate<Issue> {
      const parentInfoIndex = issue.parents.findIndex(({ parentId }) => parentId === updateTx.objectId)
      const parentsUpdate =
        parentInfoIndex === -1
          ? {}
          : {
              parents: [...issue.parents].slice(0, parentInfoIndex + 1).concat(updatedParents)
            }

      return { ...parentsUpdate }
    }

    res.push(
      control.txFactory.createTxUpdateDoc(updateTx.objectClass, updateTx.objectSpace, updateTx.objectId, {
        parents: updatedParents
      }),
      ...(await updateSubIssues(updateTx, control, update))
    )

    // Remove from parent estimation list.
    const issue = await getCurrentIssue()
    updateIssueParentEstimations(issue, res, control, issue.parents, updatedParents)
  }

  if (
    Object.prototype.hasOwnProperty.call(updateTx.operations, 'estimation') ||
    Object.prototype.hasOwnProperty.call(updateTx.operations, 'reportedTime') ||
    (Object.prototype.hasOwnProperty.call(updateTx.operations, '$inc') &&
      Object.prototype.hasOwnProperty.call(updateTx.operations.$inc, 'reportedTime'))
  ) {
    const issue = await getCurrentIssue()

    issue.estimation = updateTx.operations.estimation ?? issue.estimation
    issue.reportedTime = updateTx.operations.reportedTime ?? issue.reportedTime
    issue.remainingTime = Math.max(0, issue.estimation - issue.reportedTime)

    res.push(
      control.txFactory.createTxUpdateDoc(kra.class.Issue, issue.space, issue._id, {
        remainingTime: issue.remainingTime
      })
    )

    updateIssueParentEstimations(issue, res, control, issue.parents, issue.parents)
  }

  if (Object.prototype.hasOwnProperty.call(updateTx.operations, 'title')) {
    function update (issue: Issue): DocumentUpdate<Issue> {
      const parentInfoIndex = issue.parents.findIndex(({ parentId }) => parentId === updateTx.objectId)
      const updatedParentInfo = {
        ...issue.parents[parentInfoIndex],
        parentTitle: updateTx.operations.title as string
      }
      const updatedParents = [...issue.parents]

      updatedParents[parentInfoIndex] = updatedParentInfo

      return { parents: updatedParents }
    }

    res.push(...(await updateSubIssues(updateTx, control, update)))
  }

  return res
}
function updateIssueParentEstimations (
  issue: {
    _id: Ref<Issue>
    space: Ref<Space>
    estimation: number
    reportedTime: number
  },
  res: Tx[],
  control: TriggerControl,
  sourceParents: IssueParentInfo[],
  targetParents: IssueParentInfo[]
): void {
  for (const pinfo of sourceParents) {
    res.push(
      control.txFactory.createTxUpdateDoc(kra.class.Issue, pinfo.space, pinfo.parentId, {
        $pull: {
          childInfo: { childId: issue._id }
        }
      })
    )
  }
  for (const pinfo of targetParents) {
    res.push(
      control.txFactory.createTxUpdateDoc(kra.class.Issue, pinfo.space, pinfo.parentId, {
        $push: {
          childInfo: {
            childId: issue._id,
            estimation: issue.estimation,
            reportedTime: issue.reportedTime
          }
        }
      })
    )
  }
}

async function issueLinkIdProvider (issue: Issue): Promise<string> {
  return issue.identifier
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async () => ({
  function: {
    IssueHTMLPresenter: issueHTMLPresenter,
    IssueTextPresenter: issueTextPresenter,
    IssueNotificationContentProvider: getIssueNotificationContent,
    IssueLinkIdProvider: issueLinkIdProvider
  },
  trigger: {
    OnIssueUpdate,
    OnProjectRemove,
    OnWorkspaceOwnerAdded
  }
})
