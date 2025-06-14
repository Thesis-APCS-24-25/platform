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
  import { Person } from '@hcengineering/contact'
  import { Data, Doc, Ref, generateId } from '@hcengineering/core'
  import { Card, KeyedAttribute, SpaceSelector, createQuery, getClient } from '@hcengineering/presentation'
  import tags, { TagElement, TagReference } from '@hcengineering/tags'
  import { TaskType } from '@hcengineering/task'
  import { TaskKindSelector } from '@hcengineering/task-resources'
  import { StyledTextBox } from '@hcengineering/text-editor-resources'
  import { IssuePriority, IssueTemplate, Project } from '@hcengineering/kra'
  import { Component, EditBox, Label } from '@hcengineering/ui'
  import { createEventDispatcher } from 'svelte'
  import tracker from '../../plugin'
  import ComponentSelector from '../components/ComponentSelector.svelte'
  import AssigneeEditor from '../issues/AssigneeEditor.svelte'
  import PriorityEditor from '../issues/PriorityEditor.svelte'
  import MilestoneSelector from '../milestones/MilestoneSelector.svelte'
  import ProjectPresenter from '../projects/ProjectPresenter.svelte'
  import EstimationEditor from './EstimationEditor.svelte'
  import SubIssueTemplates from './IssueTemplateChilds.svelte'

  export let space: Ref<Project>
  export let priority: IssuePriority = IssuePriority.NoPriority
  export let assignee: Ref<Person> | null = null
  export let relatedTo: Doc | undefined

  let labels: TagElement[] = []
  let kind: Ref<TaskType> | undefined = undefined

  let objectId: Ref<IssueTemplate> = generateId()
  let object: Data<IssueTemplate> = {
    title: '',
    description: '',
    assignee,
    priority,
    estimation: 0,
    children: [],
    labels: [],
    comments: 0,
    attachments: 0,
    relations: []
  }

  const dispatch = createEventDispatcher()
  const client = getClient()

  const key: KeyedAttribute = {
    key: 'labels',
    attr: client.getHierarchy().getAttribute(tracker.class.Issue, 'labels')
  }

  $: _space = space

  $: canSave = getTitle(object.title ?? '').length > 0

  function getTitle (value: string) {
    return value.trim()
  }

  export function canClose (): boolean {
    return !canSave
  }

  async function createIssueTemplate () {
    if (!canSave) {
      return
    }

    const value: Data<IssueTemplate> = {
      title: getTitle(object.title),
      description: object.description,
      assignee: object.assignee,
      priority: object.priority,
      estimation: object.estimation,
      children: object.children,
      comments: 0,
      attachments: 0,
      labels: labels.map((it) => it._id),
      kind,
      relations: relatedTo !== undefined ? [{ _id: relatedTo._id, _class: relatedTo._class }] : []
    }

    await client.createDoc(tracker.class.IssueTemplate, _space, value, objectId)
    objectId = generateId()
  }

  function addTagRef (tag: TagElement): void {
    labels = [...labels, tag]
  }

  let currentProject: Project | undefined
  const spaceQuery = createQuery()
  $: if (_space !== undefined) {
    spaceQuery.query(tracker.class.Project, { _id: _space }, (res) => {
      currentProject = res[0]
    })
  } else {
    spaceQuery.unsubscribe()
    currentProject = undefined
  }

  $: labelRefs = labels.map((it) => ({ ...(it as unknown as TagReference), _id: generateId(), tag: it._id }))
</script>

<Card
  label={tracker.string.NewProcess}
  okAction={createIssueTemplate}
  {canSave}
  okLabel={tracker.string.SaveProcess}
  gap={'gapV-4'}
  on:close={() => {
    dispatch('close')
  }}
  on:changeContent
>
  <svelte:fragment slot="header">
    <SpaceSelector
      _class={tracker.class.Project}
      label={tracker.string.Project}
      bind:space={_space}
      kind={'regular'}
      size={'large'}
      component={ProjectPresenter}
      defaultIcon={tracker.icon.Home}
    />
  </svelte:fragment>
  <svelte:fragment slot="title" let:label>
    <div class="flex-row-center gap-2 pt-1 pb-1 pr-1">
      <span class="overflow-label">
        <Label {label} />
      </span>
      <TaskKindSelector
        projectType={currentProject?.type}
        bind:value={kind}
        baseClass={tracker.class.Issue}
        size={'small'}
      />
    </div>
  </svelte:fragment>

  <EditBox
    bind:value={object.title}
    placeholder={tracker.string.IssueTitlePlaceholder}
    kind={'large-style'}
    autoFocus
  />
  <StyledTextBox
    alwaysEdit
    showButtons={false}
    kind={'emphasized'}
    bind:content={object.description}
    placeholder={tracker.string.IssueDescriptionPlaceholder}
  />
  <SubIssueTemplates
    bind:children={object.children}
    project={_space}
    maxHeight="limited"
    on:create-issue={({ detail }) => (object.children = [...object.children, detail])}
  />
  <svelte:fragment slot="pool">
    <PriorityEditor
      value={object}
      shouldShowLabel
      isEditable
      kind={'regular'}
      size={'large'}
      justify="center"
      on:change={({ detail }) => (object.priority = detail)}
    />
    <AssigneeEditor
      object={{ ...object, space }}
      kind={'regular'}
      size={'large'}
      on:change={({ detail }) => (object.assignee = detail)}
    />
    <Component
      is={tags.component.TagsDropdownEditor}
      props={{
        items: labelRefs,
        key,
        targetClass: tracker.class.Issue,
        countLabel: tracker.string.NumberLabels,
        kind: 'regular',
        size: 'large'
      }}
      on:open={(evt) => {
        addTagRef(evt.detail)
      }}
      on:delete={(evt) => {
        labels = labels.filter((it) => it._id !== evt.detail)
      }}
    />
    <EstimationEditor kind={'regular'} size={'large'} value={object} />
  </svelte:fragment>
</Card>
