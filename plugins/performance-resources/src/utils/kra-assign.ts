import { type TxOperations, type Ref, Data } from '@hcengineering/core'
import { KRAStatus, type EmployeeKRA, type KRA, type ReviewSession } from '@hcengineering/performance'
import performance from '../plugin'
import { type Member } from '@hcengineering/kra-team'

export async function assignKRA (
  client: TxOperations,
  space: Ref<ReviewSession>,
  kra: Ref<KRA>,
  weight: number,
  assignee: Ref<Member>
): Promise<void> {
  const data: Data<EmployeeKRA> = {
    status: KRAStatus.Drafting,
    kra,
    assignee,
    weight
  }
  await client.createDoc(performance.class.EmployeeKRA, space, data)
}

export async function unassignKRA (
  client: TxOperations,
  space: Ref<ReviewSession>,
  _id: Ref<EmployeeKRA>,
  kra: Ref<KRA>
): Promise<void> {
  await client.removeDoc(performance.class.EmployeeKRA, space, _id)
}

export async function updateWeight (
  client: TxOperations,
  space: Ref<ReviewSession>,
  _id: Ref<EmployeeKRA>,
  kra: Ref<KRA>,
  weight: number
): Promise<void> {
  await client.updateDoc(performance.class.EmployeeKRA, space, _id, { weight })
}
