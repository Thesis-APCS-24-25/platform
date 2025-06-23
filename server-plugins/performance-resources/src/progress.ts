import core, { Tx, TxRemoveDoc, TxCUD, TxCreateDoc, Ref, TxUpdateDoc, TxProcessor } from '@hcengineering/core'
import { TriggerControl } from '@hcengineering/server-core'
import performance, { Progress, ProgressReport } from '@hcengineering/performance'

export async function OnProgressRemove (txes: Tx[], control: TriggerControl): Promise<Tx[]> {
  const result: Tx[] = []
  for (const tx of txes) {
    const ctx = tx as TxRemoveDoc<Progress>
    const docs = await control.findAll(control.ctx, performance.class.ProgressReport, {
      attachedTo: ctx.objectId
    })
    for (const doc of docs) {
      const tx = control.txFactory.createTxRemoveDoc(doc._class, doc.space, doc._id)
      result.push(tx)
    }
  }
  return result
}

export async function OnProgressUpdate (txes: Tx[], control: TriggerControl): Promise<Tx[]> {
  const result: Tx[] = []
  for (const actualTx of txes) {
    // Check TimeProgressReport operations
    if (
      actualTx._class === core.class.TxCreateDoc ||
      actualTx._class === core.class.TxUpdateDoc ||
      actualTx._class === core.class.TxRemoveDoc
    ) {
      const cud = actualTx as TxCUD<ProgressReport>
      if (cud.objectClass === performance.class.ProgressReport) {
        result.push(...(await doProgressProgressReportUpdate(cud, control)))
      }
    }

    if (actualTx._class === core.class.TxCreateDoc) {
      const createTx = actualTx as TxCreateDoc<Progress>
      if (control.hierarchy.isDerived(createTx.objectClass, performance.class.Progress)) {
        const tx = control.txFactory.createTxUpdateDoc(
          createTx.objectClass,
          createTx.objectSpace,
          createTx.objectId,
          {
            progress: 0
          },
          false,
          createTx.createdOn
        )
        result.push(tx)
        continue
      }
    }
  }
  return result
}

async function doProgressProgressReportUpdate (cud: TxCUD<ProgressReport>, control: TriggerControl): Promise<Tx[]> {
  const { attachedTo: attachedToId, attachedToClass } = cud

  if (attachedToClass === undefined || attachedToId === undefined) {
    return []
  }

  const attachedTo = attachedToId as Ref<Progress>

  async function getCurrentProgress (): Promise<Progress | undefined> {
    const [currentProgress] = await control.findAll(
      control.ctx,
      performance.class.Progress,
      { _id: attachedTo },
      { limit: 1 }
    )
    return currentProgress
  }

  function createUpdateTx (currentProgress: Progress, progressUpdate: number, isIncrement: boolean): Tx {
    const update = isIncrement ? { $inc: { progress: progressUpdate } } : { progress: progressUpdate }
    if (attachedToClass === undefined) {
      throw new Error('Attached-to class is undefined, which is unexpected')
    }
    return control.txFactory.createTxUpdateDoc<Progress>(
      attachedToClass,
      cud.objectSpace,
      attachedTo,
      update,
      false,
      currentProgress.modifiedOn
    )
  }

  switch (cud._class) {
    case core.class.TxCreateDoc: {
      const ccud = cud as TxCreateDoc<ProgressReport>
      const currentProgress = await getCurrentProgress()
      if (currentProgress === undefined) return []

      const res: Tx[] = []
      res.push(createUpdateTx(currentProgress, ccud.attributes.value, true))
      return res
    }

    case core.class.TxUpdateDoc: {
      const upd = cud as TxUpdateDoc<ProgressReport>
      if (upd.operations.value === undefined) return []

      const logTxes = Array.from(
        await control.findAll(control.ctx, core.class.TxCUD, { objectId: cud.objectId })
      ).filter((it) => it._id !== cud._id)

      const doc: ProgressReport | undefined = TxProcessor.buildDoc2Doc(logTxes)
      if (doc === undefined) return []

      const currentProgress = await getCurrentProgress()
      if (currentProgress === undefined) return []

      const res: Tx[] = []
      res.push(createUpdateTx(currentProgress, upd.operations.value - doc.value, true))
      return res
    }

    case core.class.TxRemoveDoc: {
      if (control.removedMap.has(attachedTo)) return []

      const logTxes = Array.from(
        await control.findAll(control.ctx, core.class.TxCUD, { objectId: cud.objectId })
      ).filter((it) => it._id !== cud._id)

      const doc: ProgressReport | undefined = TxProcessor.buildDoc2Doc(logTxes)
      if (doc === undefined) return []

      const currentProgress = await getCurrentProgress()
      if (currentProgress === undefined) return []

      const res: Tx[] = []
      res.push(createUpdateTx(currentProgress, -1 * doc.value, true))
      return res
    }

    default:
      return []
  }
}
