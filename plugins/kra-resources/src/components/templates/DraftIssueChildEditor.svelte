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
  import { AttachmentStyledBox } from '@hcengineering/attachment-resources'
  import core, { Account, Doc, generateId, Ref } from '@hcengineering/core'
  import presentation, { DraftController, getClient, KeyedAttribute } from '@hcengineering/presentation'
  import tags, { TagElement, TagReference } from '@hcengineering/tags'
  import { TaskType } from '@hcengineering/task'
  import { TaskKindSelector } from '@hcengineering/task-resources'
  import {
    Issue,
    IssueDraft,
    IssuePriority,
    Project
  } from '@hcengineering/kra'
  import { Button, Component, EditBox } from '@hcengineering/ui'
  import { createEventDispatcher, onDestroy } from 'svelte'
  import tracker from '../../plugin'
  import AssigneeEditor from '../issues/AssigneeEditor.svelte'
  import PriorityEditor from '../issues/PriorityEditor.svelte'
  import StatusEditor from '../issues/StatusEditor.svelte'
  import EstimationEditor from './EstimationEditor.svelte'

  export let parendIssueId: Ref<Issue>
  export let project: Project
  export let childIssue: IssueDraft | undefined = undefined
  export let showBorder = false
  export let shouldSaveDraft: boolean = false

  const dispatch = createEventDispatcher()
  const client = getClient()
  const draftController = new DraftController<IssueDraft>(`${parendIssueId}_subIssue`)
  const draft = shouldSaveDraft ? draftController.get() : undefined
  let object = childIssue ?? draft ?? getIssueDefaults()
  let thisRef: HTMLDivElement
  let focusIssueTitle: () => void

  $: thisRef != null && thisRef.scrollIntoView({ behavior: 'smooth' })
  $: canSave = getTitle(object.title ?? '').length > 0

  $: objectId = object._id

  onDestroy(() => {
    draftController.destroy()
  })

  const key: KeyedAttribute = {
    key: 'labels',
    attr: client.getHierarchy().getAttribute(tracker.class.IssueTemplate, 'labels')
  }

  let descriptionBox: AttachmentStyledBox

  function getIssueDefaults (): IssueDraft {
    return {
      _id: generateId(),
      title: '',
      description: '',
      kind: '' as Ref<TaskType>,
      assignee: project.defaultAssignee ?? null,
      status: project.defaultIssueStatus,
      space: project._id,
      startDate: null,
      dueDate: null,
      subIssues: [],
      attachments: 0,
      labels: [],
      priority: IssuePriority.NoPriority,
      estimation: 0
    }
  }

  const empty = {
    space: project._id,
    status: project.defaultIssueStatus,
    assignee: project.defaultAssignee ?? null,
    priority: IssuePriority.NoPriority
  }

  function objectChange (object: IssueDraft, empty: any): void {
    if (shouldSaveDraft) {
      draftController.save(object, empty)
    }
  }

  $: objectChange(object, empty)

  function resetToDefaults (): void {
    object = getIssueDefaults()
    focusIssueTitle?.()
  }

  function getTitle (value: string): string {
    return value.trim()
  }

  export function removeDraft (): void {
    draftController.remove()
  }

  function close (): void {
    removeDraft()
    dispatch('close')
  }

  async function createIssue (): Promise<void> {
    if (!canSave) {
      return
    }

    dispatch(childIssue !== undefined ? 'close' : 'create', object)

    removeDraft()
    resetToDefaults()
  }

  function tagAsRef (tag: TagElement): TagReference {
    return {
      _class: tags.class.TagReference,
      _id: generateId(),
      attachedTo: '' as Ref<Doc>,
      attachedToClass: tracker.class.Issue,
      collection: 'labels',
      space: core.space.Workspace,
      modifiedOn: 0,
      modifiedBy: '' as Ref<Account>,
      title: tag.title,
      tag: tag._id,
      color: tag.color
    }
  }

  function addTagRef (tag: TagElement): void {
    object.labels = [...object.labels, tagAsRef(tag)]
  }
</script>

<div
  id="sub-issue-child-editor"
  bind:this={thisRef}
  class="flex-col antiEmphasized clear-mins"
  class:antiPopup={showBorder}
>
  <div class="flex-col w-full clear-mins">
    <div id="sub-issue-name">
      <EditBox
        bind:value={object.title}
        bind:focusInput={focusIssueTitle}
        kind={'large-style'}
        placeholder={tracker.string.SubIssueTitlePlaceholder}
        autoFocus
        fullSize
      />
    </div>
    <div class="mt-4 clear-mins" id="sub-issue-description">
      {#key objectId}
        <AttachmentStyledBox
          bind:this={descriptionBox}
          objectId={object._id}
          space={project._id}
          _class={tracker.class.Issue}
          bind:content={object.description}
          placeholder={tracker.string.SubIssueDescriptionPlaceholder}
          showButtons={false}
          alwaysEdit
          shouldSaveDraft
          maxHeight={'limited'}
          on:changeContent
        />
      {/key}
    </div>
  </div>
  <div class="mt-4 flex-between">
    <div class="buttons-group xsmall-gap">
      <div id="sub-issue-status-editor">
        <StatusEditor
          value={object}
          kind="no-border"
          size="small"
          shouldShowLabel={true}
          on:change={({ detail }) => (object.status = detail)}
        />
      </div>
      <div id="sub-issue-priority-editor">
        <PriorityEditor
          value={object}
          shouldShowLabel
          isEditable
          kind="no-border"
          size="small"
          justify="center"
          on:change={({ detail }) => (object.priority = detail)}
        />
      </div>
      <TaskKindSelector
        projectType={project.type}
        kind="no-border"
        bind:value={object.kind}
        baseClass={tracker.class.Issue}
      />
      <div id="sub-issue-assignee-editor">
        {#key object.assignee}
          <AssigneeEditor
            {object}
            size="small"
            kind="no-border"
            on:change={({ detail }) => (object.assignee = detail)}
          />
        {/key}
      </div>
      <div id="sub-issue-estimation-editor">
        <EstimationEditor
          kind={'no-border'}
          size={'small'}
          bind:value={object}
          on:change={(evt) => {
            object.estimation = evt.detail
          }}
        />
      </div>
      <Component
        is={tags.component.TagsDropdownEditor}
        props={{
          items: object.labels,
          key,
          targetClass: tracker.class.Issue,
          countLabel: tracker.string.NumberLabels
        }}
        on:open={(evt) => {
          addTagRef(evt.detail)
        }}
        on:delete={(evt) => {
          object.labels = object.labels.filter((it) => it._id !== evt.detail)
        }}
      />
    </div>
    <div class="buttons-group small-gap">
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
  .antiPopup {
    max-width: 100%;
  }
</style>
