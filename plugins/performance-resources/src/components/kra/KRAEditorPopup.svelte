<script lang="ts">
  import { ObjectPopup } from '@hcengineering/presentation'
  import performance, { KRA } from '@hcengineering/performance'
  import { DocumentQuery, Ref } from '@hcengineering/core'
  import ReviewSessionRefPresenter from '../review-session/ReviewSessionRefPresenter.svelte'

  export let value: Ref<KRA> | undefined = undefined
  export let docQuery: DocumentQuery<KRA> = { }
  export let allowDeselect: boolean = false
</script>

<ObjectPopup
  groupBy="space"
  type="presenter"
  width="large"
  {docQuery}
  closeAfterSelect
  {allowDeselect}
  selected={value}
  _class={performance.class.KRA}
  searchMode="spotlight"
  on:update
  on:close
>
  <svelte:fragment slot="category" let:item>
    <ReviewSessionRefPresenter value={item.space} />
  </svelte:fragment>
</ObjectPopup>
