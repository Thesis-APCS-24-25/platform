<!--
// Copyright © 2020, 2021 Anticrm Platform Contributors.
// Copyright © 2021, 2023 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
-->
<script lang="ts">
  import { Ref } from '@hcengineering/core'
  import { Card, SpaceSelector, createQuery, getClient } from '@hcengineering/presentation'
  import { Issue, Project } from '@hcengineering/kra'
  import ui, { Button, IconForward, Label, Spinner, Toggle, tooltip } from '@hcengineering/ui'
  import view from '@hcengineering/view'
  import { createEventDispatcher } from 'svelte'
  import tracker from '../../plugin'
  import { IssueToUpdate, collectIssues, moveIssueToSpace } from '../../utils'
  import ProjectPresenter from '../projects/ProjectPresenter.svelte'
  import IssuePresenter from './IssuePresenter.svelte'
  import PriorityEditor from './PriorityEditor.svelte'
  import TitlePresenter from './TitlePresenter.svelte'

  export let selected: Issue | Issue[]
  $: docs = Array.isArray(selected) ? selected : [selected]

  const client = getClient()
  const dispatch = createEventDispatcher()
  const hierarchy = client.getHierarchy()

  let targetProject: Project | undefined
  let originProject: Project | undefined
  let space: Ref<Project>

  $: {
    const doc = docs[0]
    if (space === undefined) {
      space = doc.space
    }
  }

  let processing = false

  const moveAll = async () => {
    if (targetProject === undefined) {
      return
    }
    processing = true
    for (const issue of toMove) {
      const upd = issueToUpdate.get(issue._id) ?? {}

      issueToUpdate.set(issue._id, upd)
    }

    await moveIssueToSpace(client, docs, targetProject, issueToUpdate)
    processing = false
    dispatch('close')
  }

  const targetSpaceQuery = createQuery()
  const originSpaceQuery = createQuery()

  let issueToUpdate = new Map<Ref<Issue>, IssueToUpdate>()

  $: targetSpaceQuery.query(tracker.class.Project, { _id: space }, (res) => {
    ;[targetProject] = res
  })

  $: originSpaceQuery.query(tracker.class.Project, { _id: docs[0].space }, (res) => {
    ;[originProject] = res
  })

  let toMove: Issue[] = []
  let loading = true
  $: {
    collectIssues(client, docs).then((res) => {
      toMove = res
      loading = false
    })
  }

  $: if (keepOriginalAttribytes) {
    setOriginalAttributes()
  } else if (targetProject !== undefined) {
    setReplacementAttributres(targetProject)
  }

  let keepOriginalAttribytes: boolean = false
  let showManageAttributes: boolean = false
  $: isManageAttributesAvailable = issueToUpdate.size > 0 && docs[0]?.space !== targetProject?._id

  function setOriginalAttributes () {
    for (const issue of toMove) {
      const upd = issueToUpdate.get(issue._id) ?? {}
      upd.createComponent = false
      upd.useComponent = false
      issueToUpdate.set(issue._id, upd)
    }
    for (const issue of toMove) {
      let upd = issueToUpdate.get(issue._id) ?? {}

      issueToUpdate.set(issue._id, upd)
    }
  }

  function setReplacementAttributres (currentSpace: Project) {
    for (const issue of toMove) {
      const upd = issueToUpdate.get(issue._id) ?? {}

      if (issue.attachedTo !== tracker.ids.NoParent && toMove.find((it) => it._id === issue.attachedTo) === undefined) {
        upd.attachedTo = tracker.ids.NoParent
        upd.attachedToClass = tracker.class.Issue
      }
      issueToUpdate.set(issue._id, upd)
    }
  }

  $: spaceQuery = originProject ? { type: originProject.type, archived: false } : { archived: false }
</script>

<Card
  label={showManageAttributes ? tracker.string.ManageAttributes : tracker.string.MoveIssues}
  okLabel={view.string.Move}
  okAction={moveAll}
  canSave={docs[0]?.space !== targetProject?._id}
  onCancel={() => dispatch('close')}
  backAction={() => {
    showManageAttributes = !showManageAttributes
  }}
  isBack={showManageAttributes}
  thinHeader
  accentHeader
  hideSubheader={showManageAttributes}
  hideContent={showManageAttributes}
  hideAttachments
  numberOfBlocks={showManageAttributes
    ? toMove.length
    : targetProject !== undefined && !keepOriginalAttribytes && docs[0]?.space !== targetProject?._id
      ? 1
      : 0}
  on:changeContent
>
  <svelte:fragment slot="title" let:label>
    {#if !showManageAttributes}
      <Label {label} />
      {#if Array.isArray(selected) && selected.length}
        <span class="content-dark-color ml-1-5">{selected.length}</span>
      {/if}
    {:else}
      <Label {label} />
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="subheader">
    {#if !showManageAttributes}
      <span class="content-halfcontent-color overflow-label" style:margin-top={'-.5rem'}>
        <Label label={tracker.string.MoveIssuesDescription} />
      </span>
    {/if}
  </svelte:fragment>

  {#if !showManageAttributes}
    <div class="flex-between">
      {#if targetProject !== undefined}
        <SpaceSelector
          _class={targetProject._class}
          query={spaceQuery}
          label={hierarchy.getClass(tracker.class.Project).label}
          bind:space
          kind={'regular'}
          size={'large'}
          component={ProjectPresenter}
          defaultIcon={tracker.icon.Home}
        />
        <Button
          label={tracker.string.ManageAttributes}
          iconRight={IconForward}
          kind={'ghost'}
          size={'small'}
          padding={'0 1rem'}
          disabled={!isManageAttributesAvailable}
          on:click={() => {
            if (!isManageAttributesAvailable) {
              return
            }
            showManageAttributes = !showManageAttributes
          }}
        />
      {/if}
    </div>
  {:else if loading}<Spinner />{/if}

  <svelte:fragment slot="blocks" let:block>
    {#if toMove.length > 0 && targetProject}
      {@const issue = toMove[block]}
      {#key keepOriginalAttribytes}
        {#if issue.space !== targetProject._id}
          <div class="flex-row-center min-h-9 gap-1-5 content-color">
            <PriorityEditor value={issue} isEditable={false} kind={'list'} size={'small'} shouldShowLabel={false} />
            <IssuePresenter value={issue} disabled kind={'list'} />
            <TitlePresenter disabled value={issue} showParent={false} maxWidth={'7.5rem'} />
          </div>
        {/if}
      {/key}
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="footer">
    <div
      class="flex-row-center gap-2"
      use:tooltip={{
        component: Label,
        props: { label: tracker.string.KeepOriginalAttributesTooltip }
      }}
    >
      <Toggle
        disabled={!isManageAttributesAvailable}
        on:change={() => {
          keepOriginalAttribytes = !keepOriginalAttribytes
        }}
      />
      <span class="lines-limit-2">
        <Label label={tracker.string.KeepOriginalAttributes} />
      </span>
    </div>
  </svelte:fragment>
  <svelte:fragment slot="buttons">
    <Button label={ui.string.Cancel} size={'large'} disabled={processing} on:click={() => dispatch('close')} />
  </svelte:fragment>
</Card>
