<script lang="ts">
  import { createQuery } from '@hcengineering/presentation'
  import kra from '../../../plugin'
  import { Class, Ref } from '@hcengineering/core'
  import IconKpi from './IconKpi.svelte'
  import performance, { Progress } from '@hcengineering/performance'
  import { Button, Icon, IconClose, Label } from '@hcengineering/ui'

  export let progress: Ref<Progress>
  export let _class: Ref<Class<Progress>> = performance.class.Progress
  export let onRemove: () => void = () => {}

  let unnamed = false

  const progressQuery = createQuery()

  let _progress: Progress | null = null

  $: progressQuery.query(
    performance.class.Progress,
    {
      _id: progress
    },
    (res) => {
      if (res.length > 0) {
        _progress = res[0]
        if (_progress.name === undefined || _progress.name.trim() === '') {
          unnamed = true
        } else {
          unnamed = false
        }
      } else {
        _progress = null
      }
    }
  )

  $: icon = _class === performance.class.Progress ? performance.icon.Progress : performance.icon.Kpi
</script>

{#if _progress}
  <div class="container">
    <div class="icon">
      <Icon {icon} size={'small'} />
    </div>
    <div class="title">
      {#if unnamed}
        <Label label={performance.string.UnnamedProgress} />
      {:else}
        <div>{_progress.name}</div>
      {/if}
    </div>
    <Button
      icon={IconClose}
      showTooltip={{ label: kra.string.RemoveProgress, direction: 'bottom' }}
      kind={'ghost'}
      size={'small'}
      on:click={onRemove}
    />
  </div>
{/if}

<style lang="scss">
  .icon {
    display: flex;
    // align-items: center;
    // justify-content: center;
    margin-right: 0.5rem;
    margin-left: 0.25rem;
  }

  .container {
    width: fit-content;
    display: flex;
    flex-direction: row;
    padding: 0.25rem;
    align-items: center;
    border-radius: 0.25rem;
    border: 1px solid var(--theme-button-border);
    background-color: var(--theme-surface);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .title {
    padding: 0 0.5rem;
    margin: 0 0.25rem;
    border-left: 1px solid var(--theme-button-border);
    border-right: 1px solid var(--theme-button-border);
  }

  .title > div:first-child {
    color: var(--theme-caption-color);
  }
</style>
