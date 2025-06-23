<script lang="ts">
  import { createFocusManager, EditBox, FocusHandler } from '@hcengineering/ui'
  import performance from '../../plugin'
  import { Card, getClient } from '@hcengineering/presentation'
  import { Progress, PTask } from '@hcengineering/performance'
  import { Ref } from '@hcengineering/core'
  import UnitBox from './unit/UnitBox.svelte'
  import { createEventDispatcher, onMount } from 'svelte'
  import { ObjectBox } from '@hcengineering/view-resources'
  import taskPlugin, { Project } from '@hcengineering/task'

  export let canSave = false
  export let task: Ref<PTask> | undefined = undefined
  export let space: Ref<Project> | undefined = undefined
  export let progress: Progress | undefined = undefined
  export let canChangeTask: boolean = true

  const data = {
    name: progress?.name ?? '',
    description: progress?.description ?? ''
  }

  space = space ?? progress?.space as Ref<Project>
  const client = getClient()
  const dispatch = createEventDispatcher()

  $: canSave = true

  let id: Ref<Progress> | undefined = progress?._id

  async function save (): Promise<void> {
    if (canSave) {
      if (task !== undefined && space !== undefined) {
        id = await client.createDoc(performance.class.Progress, space, {
          name: data.name,
          description: data.description,
          reports: 0
        })
      } else if (progress !== undefined) {
        await client.update(progress, {
          name: data.name,
          description: data.description
        })
      }
    }
  }
  const focusManager = createFocusManager()
  onMount(() => {
    focusManager.setFocusPos(1)
  })
</script>

<FocusHandler manager={focusManager} />

<Card
  label={performance.string.AddProgress}
  okAction={save}
  {canSave}
  width="small"
  on:close={() => {
    dispatch('close', id)
  }}
>
  <svelte:fragment slot="header">
    {#if canChangeTask}
      <ObjectBox
        docQuery={{
          progress: undefined
        }}
        size="small"
        kind="regular"
        showNavigate={false}
        icon={taskPlugin.icon.Task}
        bind:value={task}
        _class={performance.class.PTask}
        label={performance.string.Task}
      />
    {/if}
    <!-- <ObjectBox -->
    <!--   kind="regular" -->
    <!--   _class={performance.class.Progress} -->
    <!--   label={performance.string.ChooseTemplate} -->
    <!--   value={template?._id} -->
    <!--   showNavigate={false} -->
    <!--   docQuery={{ space, isTemplate: true }} -->
    <!--   on:object={handleTemplateSelected} -->
    <!--   on:change={(e) => { -->
    <!--     if (e.detail === null) { -->
    <!--       template = undefined -->
    <!--     } -->
    <!--   }} -->
    <!--   allowDeselect -->
    <!-- /> -->
  </svelte:fragment>
  <div class="m-1">
    <EditBox
      kind="default-large"
      fullSize
      bind:value={data.name}
      placeholder={performance.string.AddProgressNamePlaceholder}
      focusIndex={1}
    />
  </div>
</Card>
