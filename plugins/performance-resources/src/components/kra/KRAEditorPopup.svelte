<script lang="ts">
  import { ObjectPopup } from '@hcengineering/presentation'
  import performance, { KRA } from '@hcengineering/performance'
  import { DocumentQuery, Ref } from '@hcengineering/core'

  export let value: Ref<KRA> | undefined = undefined
  export let docQuery: DocumentQuery<KRA> = { }
</script>

<ObjectPopup
  groupBy="space"
  type="presenter"
  width="large"
  {docQuery}
  closeAfterSelect
  selected={value}
  _class={performance.class.KRA}
  searchMode="spotlight"
  on:update
  on:close
/>
