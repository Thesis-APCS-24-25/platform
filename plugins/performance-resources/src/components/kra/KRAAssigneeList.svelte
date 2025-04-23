<script lang="ts">
  import performance from '../../plugin'
  import { ListView } from '@hcengineering/ui'
  import { Class, Doc, DocumentQuery, Ref } from '@hcengineering/core'
  import { Viewlet, ViewletPreference, ViewOptions } from '@hcengineering/view'
  import { EmployeeKRA } from '@hcengineering/performance'
  import { KRAAssigneeItem } from '../../types'

  export let items: KRAAssigneeItem[] = []
</script>

<ListView count={items.length} {items} />
