<!--
// Copyright © 2022 Hardcore Engineering Inc.
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
  import { generateId, Ref } from '@hcengineering/core'
  import presentation, { createQuery, getClient, KeyedAttribute } from '@hcengineering/presentation'
  import tags, { TagElement, TagReference } from '@hcengineering/tags'
  import { TaskKindSelector } from '@hcengineering/task-resources'
  import { StyledTextArea } from '@hcengineering/text-editor-resources'
  import {
    IssuePriority,
    IssueTemplateChild,
    Project
  } from '@hcengineering/kra'
  import { Button, Component, EditBox } from '@hcengineering/ui'
  import { createEventDispatcher } from 'svelte'
  import tracker from '../../plugin'
  import AssigneeEditor from '../issues/AssigneeEditor.svelte'
  import PriorityEditor from '../issues/PriorityEditor.svelte'
  import EstimationEditor from './EstimationEditor.svelte'

  export let projectId: Ref<Project>
  export let childIssue: IssueTemplateChild | undefined = undefined
  export let showBorder = false
  export let isScrollable: boolean = false
  export let maxHeight: 'max' | 'card' | 'limited' | string | undefined = undefined

  const dispatch = createEventDispatcher()
  const client = getClient()

  let newIssue: IssueTemplateChild = childIssue !== undefined ? { ...childIssue } : getIssueDefaults()
  let thisRef: HTMLDivElement | undefined
  let focusIssueTitle: () => void
  let labels: TagElement[] = []
  let canSave = getTitle(newIssue.title ?? '').length > 0
  $: canSave = getTitle(newIssue.title ?? '').length > 0

  const labelsQuery = createQuery()

  $: labelsQuery.query(tags.class.TagElement, { _id: { $in: childIssue?.labels ?? [] } }, (res) => {
    labels = res
  })

  const key: KeyedAttribute = {
    key: 'labels',
    attr: client.getHierarchy().getAttribute(tracker.class.IssueTemplate, 'labels')
  }

  function getIssueDefaults (): IssueTemplateChild {
    return {
      id: generateId(),
      title: '',
      description: '',
      assignee: null,
      priority: IssuePriority.NoPriority,
      estimation: 0
    }
  }

  function resetToDefaults (): void {
    newIssue = getIssueDefaults()
    labels = []
    focusIssueTitle?.()
  }

  function getTitle (value: string): string {
    return value.trim()
  }

  function close (): void {
    dispatch('close')
  }

  function onDelete (): void {
    dispatch('close', ['delete', newIssue])
  }

  function createIssue (): void {
    if (!canSave) {
      return
    }

    const value: IssueTemplateChild = {
      ...newIssue,
      title: getTitle(newIssue.title),
      labels: labels.map((it) => it._id)
    }
    if (childIssue === undefined) {
      dispatch('create', value)
    } else {
      dispatch('close', ['update', value])
    }

    resetToDefaults()
  }

  function addTagRef (tag: TagElement): void {
    labels = [...labels, tag]
  }

  const projectQuery = createQuery()
  $: projectQuery.query(
    tracker.class.Project,
    {
      _id: projectId
    },
    (res) => {
      ;[currentProject] = res
    }
  )
  let currentProject: Project | undefined = undefined

  $: thisRef !== undefined && thisRef.scrollIntoView({ behavior: 'smooth' })

  $: labelRefs = labels.map((it) => ({ ...(it as unknown as TagReference), _id: generateId(), tag: it._id }))
</script>

<div bind:this={thisRef} class="flex-col antiEmphasized clear-mins" class:antiPopup={showBorder}>
  <div class="flex-col w-full clear-mins">
    <EditBox
      bind:value={newIssue.title}
      bind:focusInput={focusIssueTitle}
      kind={'large-style'}
      placeholder={tracker.string.SubIssueTitlePlaceholder}
      autoFocus
    />
    <div class="mt-4 clear-mins">
      {#key newIssue.description}
        <StyledTextArea
          bind:content={newIssue.description}
          placeholder={tracker.string.SubIssueDescriptionPlaceholder}
          showButtons={false}
          {isScrollable}
          {maxHeight}
          on:changeContent
        />
      {/key}
    </div>
  </div>
  <div class="mt-4 flex-between items-end">
    <div class="inline-flex flex-wrap xsmall-gap">
      <TaskKindSelector
        projectType={currentProject?.type}
        kind="no-border"
        bind:value={newIssue.kind}
        baseClass={tracker.class.Issue}
      />
      <PriorityEditor
        value={newIssue}
        shouldShowLabel
        isEditable
        kind="no-border"
        size="small"
        justify="center"
        on:change={({ detail }) => (newIssue.priority = detail)}
      />
      {#key newIssue.assignee}
        <AssigneeEditor
          object={{ ...newIssue, space: projectId }}
          size="small"
          kind="no-border"
          width="auto"
          on:change={({ detail }) => (newIssue.assignee = detail)}
        />
      {/key}
      <EstimationEditor
        kind={'no-border'}
        size={'small'}
        bind:value={newIssue}
        on:change={(evt) => {
          newIssue.estimation = evt.detail
        }}
      />
      <Component
        is={tags.component.TagsDropdownEditor}
        props={{
          items: labelRefs,
          key,
          targetClass: tracker.class.Issue,
          countLabel: tracker.string.NumberLabels
        }}
        on:open={(evt) => {
          addTagRef(evt.detail)
        }}
        on:delete={(evt) => {
          labels = labels.filter((it) => it._id !== evt.detail)
        }}
      />
    </div>
    <div class="ml-2 buttons-group small-gap">
      {#if childIssue !== undefined}
        <Button label={presentation.string.Delete} size="small" kind="dangerous" on:click={onDelete} />
      {/if}
      <Button label={presentation.string.Cancel} size="small" kind="ghost" on:click={close} />
      <Button
        disabled={!canSave}
        label={presentation.string.Save}
        size="small"
        kind="no-border"
        on:click={createIssue}
      />
    </div>
  </div>
</div>

<style lang="scss">
  .xsmall-gap {
    gap: 0.375rem;
  }

  .items-end {
    align-items: flex-end;
  }
</style>
