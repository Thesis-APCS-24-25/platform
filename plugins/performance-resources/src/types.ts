import { type Person } from '@hcengineering/contact'
import { type Ref } from '@hcengineering/core'

export interface KRAAssigneeItem {
  assignTo: Ref<Person>
  weight: number
}
