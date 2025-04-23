<script lang="ts">
  import { TableBrowser } from '@hcengineering/view-resources'
  import performance from '../../plugin'
  import { DocumentQuery } from '@hcengineering/core'
  import { EmployeeKRA } from '@hcengineering/performance'

  export let query: DocumentQuery<EmployeeKRA> = {}
</script>

<TableBrowser _class={performance.class.EmployeeKRA} {query} config={['assignee', 'weight']} />
