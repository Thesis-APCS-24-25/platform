<script lang="ts">
  import { Issue, Project, RatingScale } from '@hcengineering/kra'
  import { createFocusManager, EditBox, FocusHandler, ToggleWithLabel } from '@hcengineering/ui'
  import kra from '../../../../plugin'
  import { Card, getClient } from '@hcengineering/presentation'
  import { Ref } from '@hcengineering/core'
  import { createEventDispatcher, onMount } from 'svelte'
  import { ObjectBox } from '@hcengineering/view-resources'

  export let canSave = false
  export let issue: Ref<Issue> | undefined = undefined
  export let space: Ref<Project> | undefined = undefined
  export let ratingScale: RatingScale | undefined = undefined
  export let canEditIssue: boolean = true

  let id = ratingScale?._id
  let useAsTemplate: boolean = false

  const dispatch = createEventDispatcher()

  const data = {
    name: ratingScale?.name ?? '',
    description: ratingScale?.description ?? ''
  }

  const focusManager = createFocusManager()
  onMount(() => {
    focusManager.setFocusPos(1)
  })

  const client = getClient()

  async function save(): Promise<void> {
    if (canSave) {
      if (space !== undefined && issue !== undefined) {
        id = await client.createDoc(kra.class.RatingScale, space, {
          name: data.name,
          description: data.description,
          reports: 0,
          isTemplate: useAsTemplate,
          unit: kra.ids.RatingScaleUnit
        })
      } else if (ratingScale !== undefined) {
        await client.update(ratingScale, {
          name: data.name,
          description: data.description
        })
      }
    }
  }
  let template: RatingScale | undefined = undefined

  function handleIssueChange(evt: CustomEvent<Ref<Issue>>): void {
    issue = evt.detail
  }

  function handleTemplateSelected(evt: CustomEvent<RatingScale | undefined>): void {
    if (evt.detail === undefined) {
      return
    }
    template = evt.detail
    data.name = template.name
  }

  $: canSave = data.name.length > 0
</script>

<FocusHandler manager={focusManager} />

<Card
  label={kra.string.AddRatingScale}
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
      _class={kra.class.RatingScale}
      label={kra.string.ChooseTemplate}
      value={template?._id}
      showNavigate={false}
      docQuery={{ space, isTemplate: true }}
      on:object={handleTemplateSelected}
      allowDeselect
    ></ObjectBox>
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
  <svelte:fragment slot="pool">
    <ToggleWithLabel disabled={template !== undefined} bind:on={useAsTemplate} label={kra.string.UseAsTemplate} />
  </svelte:fragment>
</Card>
