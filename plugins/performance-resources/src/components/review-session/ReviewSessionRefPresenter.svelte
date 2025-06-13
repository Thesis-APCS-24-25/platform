<script lang="ts">
  import { Ref } from '@hcengineering/core'
  import performance, { ReviewSession } from '@hcengineering/performance'
  import { createQuery } from '@hcengineering/presentation'
  import { Icon } from '@hcengineering/ui'
  import { TreeNode } from '@hcengineering/view-resources'

  export let value: Ref<ReviewSession> | undefined = undefined

  let rs: ReviewSession | undefined = undefined
  const query = createQuery()
  $: if (value !== undefined) {
    query.query(
      performance.class.ReviewSession,
      {
        _id: value
      },
      (res) => {
        if (res.length > 0) {
          rs = res[0] as ReviewSession
        }
      },
      {
        limit: 1
      }
    )
  }
</script>

{#if rs !== undefined}
  <div class="container">
    <span class="icon">
      <Icon icon={performance.icon.ReviewSession} size='small'/>
    </span>

    <span class="title font-medium-12">
      {rs.name}
    </span>
  </div>
{/if}

<style lang="scss">
  .container {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    margin-left: 0.5rem;
    gap: 0.5rem;
  }
</style>
