<script lang="ts">
  import { WithLookup } from '@hcengineering/core'
  import KraAssigneeBoxList from './KRAAssigneeBoxList.svelte'
  import { KRA } from '@hcengineering/performance'
  import { IntlString } from '@hcengineering/platform'
  import { ButtonKind, ButtonSize, TooltipAlignment } from '@hcengineering/ui'
  import contact, { Person } from '@hcengineering/contact'

  export let value: WithLookup<KRA>

  export let label: IntlString | undefined = undefined
  export let kind: ButtonKind = 'no-border'
  export let size: ButtonSize = 'small'
  export let justify: 'left' | 'center' = 'center'
  export let width: string | undefined = undefined
  export let labelDirection: TooltipAlignment | undefined = undefined
  export let emptyLabel: IntlString = contact.string.Members
  export let readonly: boolean = false

  export let sort: ((a: Person, b: Person) => number) | undefined = undefined
  const { space, _id: kra } = value
</script>

<KraAssigneeBoxList {space} {kra} {kind} {justify} {width} {labelDirection} {emptyLabel} {readonly} {label} {size} {sort}/>
