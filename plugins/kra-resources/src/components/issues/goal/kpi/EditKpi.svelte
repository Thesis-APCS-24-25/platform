<script lang="ts">
  import { createFocusManager, EditBox, FocusHandler, ToggleWithLabel } from '@hcengineering/ui'
  import kra from '../../../../plugin'
  import { Card, getClient } from '@hcengineering/presentation'
  import { Goal, Issue, Kpi } from '@hcengineering/kra'
  import { Ref, Space } from '@hcengineering/core'
  import UnitBox from '../unit/UnitBox.svelte'
  import { createEventDispatcher, onMount } from 'svelte'
  import { ObjectBox } from '@hcengineering/view-resources'

  export let canSave = false
  export let issue: Ref<Issue> | undefined = undefined
  export let space: Ref<Space> | undefined = undefined
  export let kpi: Kpi | undefined = undefined
  export let canEditIssue: boolean = true

  let useAsTemplate: boolean = false

  const data = {
    name: kpi?.name ?? '',
    description: kpi?.description ?? '',
    target: kpi?.target,
    unit: kpi?.unit ?? undefined
  }

  let template: Kpi | undefined = undefined

  space = space ?? kpi?.space
  const client = getClient()
  const dispatch = createEventDispatcher()
  function handleTemplateSelected (evt: CustomEvent<Kpi | undefined>): void {
    if (evt.detail === undefined) {
      return
    }
    template = evt.detail
    data.name = template.name
    data.description = template.description
    data.unit = template.unit
  }

  $: canSave = data.name.length > 0 && Number.isFinite(data.target) && data.unit !== undefined

  let id: Ref<Goal> | undefined = kpi?._id

  async function save (): Promise<void> {
    if (canSave) {
      if (issue !== undefined && data.unit !== undefined && space !== undefined) {
        id = await client.createDoc(kra.class.Kpi, space, {
          name: data.name,
          description: data.description,
          target: data.target ?? 0,
          unit: data.unit,
          isTemplate: useAsTemplate,
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
  function handleIssueChange (evt: CustomEvent<Ref<Issue>>): void {
    issue = evt.detail
  }


  const focusManager = createFocusManager()
  onMount(() => {
    focusManager.setFocusPos(1)
  })
</script>

<FocusHandler manager={focusManager} />

<Card
  label={kra.string.AddKpi}
  okAction={save}
  {canSave}
  width="small"
  on:close={() => {
    dispatch('close', id)
  }}
>
  <svelte:fragment slot="header">
    {#if canEditIssue}
      <ObjectBox
        docQuery={{
          goal: undefined
        }}
        size="small"
        kind="regular"
        showNavigate={false}
        icon={kra.icon.Issue}
        value={issue}
        on:change={handleIssueChange}
        _class={kra.class.Issue}
        label={kra.string.Issue}
      />
    {/if}
    <ObjectBox
      kind="regular"
      _class={kra.class.Kpi}
      label={kra.string.ChooseTemplate}
      value={template?._id}
      showNavigate={false}
      docQuery={{ space, isTemplate: true }}
      on:object={handleTemplateSelected}
      allowDeselect
    />
  </svelte:fragment>
  <div class="m-1">
    <EditBox
      label={kra.string.Name}
      kind="default-large"
      fullSize
      bind:value={data.name}
      placeholder={kra.string.AddNamePlaceholder}
      focusIndex={1}
    />
  </div>

  <div class="m-1 flex-row-baseline items-end justify-between">
    <EditBox
      label={kra.string.Target}
      kind="default-large"
      format="number"
      maxWidth="15rem"
      bind:value={data.target}
      placeholder={kra.string.AddTargetPlaceholder}
      focusIndex={3}
    />
    {#if space !== undefined}
      <UnitBox size="large" {space} bind:value={data.unit} focusIndex={4} />
    {/if}
  </div>

  <svelte:fragment slot="pool">
      <ToggleWithLabel disabled={template !== undefined} bind:on={useAsTemplate} label={kra.string.UseAsTemplate} />
  </svelte:fragment>
</Card>
