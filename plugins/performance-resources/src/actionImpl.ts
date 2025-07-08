import { KRAStatus, type EmployeeKRA } from '@hcengineering/performance'
import { getClient, MessageBox } from '@hcengineering/presentation'
import { showPopup } from '@hcengineering/ui'
import performance from './plugin'

export async function approveKRA (employeeKRA: EmployeeKRA | EmployeeKRA[]): Promise<void> {
  const objs = Array.isArray(employeeKRA) ? employeeKRA : [employeeKRA]
  if (objs.some((obj) => obj.weight === 0)) {
    showPopup(
      MessageBox,
      {
        label: performance.string.ApproveKRA,
        message: performance.string.WeightIsZero,
        canSubmit: false
      }
    )
    return
  }
  const client = getClient()
  await Promise.all(objs.map(async (value) => {
    return await client.update(
      value,
      { status: KRAStatus.Approved }
    )
  }))
}
