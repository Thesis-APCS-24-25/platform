<script lang="ts">
  import { createFocusManager, EditBox, FocusHandler, ToggleWithLabel } from '@hcengineering/ui'
  import performance from '../../../plugin'
  import { Card, getClient } from '@hcengineering/presentation'
  import { Progress, Kpi, PTask } from '@hcengineering/performance'
  import { Ref, Space } from '@hcengineering/core'
  import UnitBox from '../unit/UnitBox.svelte'
  import { createEventDispatcher, onMount } from 'svelte'
  import { ObjectBox } from '@hcengineering/view-resources'
  import task from '@hcengineering/task'

  export let canSave = false
  export let issue: Ref<PTask> | undefined = undefined
  export let space: Ref<Space> | undefined = undefined
  export let kpi: Kpi | undefined = undefined
  export let canChangeTask: boolean = true

  let useAsTemplate: boolean = false

  const data = {
    name: kpi?.name ?? '',
    description: kpi?.description ?? '',
    target: kpi?.target,
    unit: kpi?.unit ?? undefined
  }

  $: console.log(data.unit)
  let template: Kpi | undefined = undefined

  space = space ?? kpi?.space
  const client = getClient()
  const dispatch = createEventDispatcher()
  function handleTemplateSelected (evt: CustomEvent<Kpi | undefined>): void {
    if (evt.detail === undefined) {
      return
    }
    template = evt.detail
    data.unit = template.unit
  }

  $: canSave = Number.isFinite(data.target) && data.unit != null

  let id: Ref<Progress> | undefined = kpi?._id

  async function save (): Promise<void> {
    if (canSave) {
      if (issue !== undefined && data.unit !== undefined && space !== undefined) {
        id = await client.createDoc(performance.class.Kpi, space, {
          name: data.name,
          description: data.description,
          target: data.target ?? 0,
          unit: data.unit,
          reports: 0
        })
      } else if (kpi !== undefined) {
        await client.update(kpi, {
          name: data.name,
          description: data.description,
          target: data.target,
          unit: data.unit
        })
      }
    }
  }
  function handleIssueChange (evt: CustomEvent<Ref<PTask>>): void {
    issue = evt.detail
  }

  const focusManager = createFocusManager()
  onMount(() => {
    focusManager.setFocusPos(1)
  })
</script>

<FocusHandler manager={focusManager} />

<Card
  label={performance.string.AddKpi}
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
        icon={task.icon.Task}
        value={issue}
        on:change={handleIssueChange}
        _class={performance.class.PTask}
        label={performance.string.Task}
      />
    {/if}
    <ObjectBox
      kind="regular"
      _class={performance.class.Kpi}
      label={performance.string.ChooseTemplate}
      value={template?._id}
      showNavigate={false}
      docQuery={{ space, isTemplate: true }}
      on:object={handleTemplateSelected}
      on:change={(e) => {
        if (e.detail === null) {
          template = undefined
        }
      }}
      allowDeselect
    />

  </svelte:fragment>
  <div class="m-1 flex-row-baseline items-end justify-between">
    <EditBox
      label={performance.string.Target}
      kind="default-large"
      format="number"
      maxWidth="15rem"
      bind:value={data.target}
      placeholder={performance.string.AddTargetPlaceholder}
      focusIndex={1}
    />
    {#if space !== undefined}
      <UnitBox size="large" {space} bind:value={data.unit} focusIndex={2} />
    {/if}
  </div>

  <div class="m-1">
    <EditBox
      label={performance.string.Name}
      kind="default-large"
      fullSize
      bind:value={data.name}
      placeholder={performance.string.AddProgressNamePlaceholder}
      focusIndex={3}
    />
  </div>

  <svelte:fragment slot="pool">
    <ToggleWithLabel
      disabled={template !== undefined}
      bind:on={useAsTemplate}
      label={performance.string.UseAsTemplate}
    />
  </svelte:fragment>
</Card>
