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
  import { generateId, Ref, WithLookup } from '@hcengineering/core'
  import { AttributeBarEditor, createQuery, getClient, KeyedAttribute } from '@hcengineering/presentation'
  import tags, { TagElement, TagReference } from '@hcengineering/tags'
  import task, { Project } from '@hcengineering/task'
  import { TaskKindSelector } from '@hcengineering/task-resources'
  import type { IssueTemplate } from '@hcengineering/kra'
  import { Component, Label } from '@hcengineering/ui'
  import { getFiltredKeys, isCollectionAttr } from '@hcengineering/view-resources'
  import tracker from '../../plugin'
  import AssigneeEditor from '../issues/AssigneeEditor.svelte'
  import PriorityEditor from '../issues/PriorityEditor.svelte'

  export let issue: WithLookup<IssueTemplate>

  const client = getClient()
  const hierarchy = client.getHierarchy()

  let keys: KeyedAttribute[] = []

  function updateKeys (ignoreKeys: string[]): void {
    const filtredKeys = getFiltredKeys(hierarchy, issue._class, ignoreKeys)
    keys = filtredKeys.filter((key) => !isCollectionAttr(hierarchy, key))
  }

  $: updateKeys(['title', 'description', 'priority', 'number', 'assignee', 'component', 'milestone', 'kind'])

  const key: KeyedAttribute = {
    key: 'labels',
    attr: client.getHierarchy().getAttribute(tracker.class.IssueTemplate, 'labels')
  }

  let labelRefs: TagReference[] = []

  $: labelIds = issue?.$lookup?.labels ?? []

  $: if (labelIds !== undefined) {
    labelRefs = (Array.isArray(labelIds) ? labelIds : [labelIds]).map(
      (it) => ({ ...(it as unknown as TagReference), _id: generateId(), tag: it._id }) as unknown as TagReference
    )
  }

  const onTagDelete = async (evt: CustomEvent<Ref<TagReference>>): Promise<void> => {
    const itm = labelRefs.find((it) => it._id === evt.detail)
    if (itm !== undefined) {
      await client.update(issue, {
        $pull: { labels: itm.tag as unknown as Ref<TagElement> }
      })
    }
  }

  let currentProject: Project | undefined
  const spaceQuery = createQuery()
  spaceQuery.query(tracker.class.Project, { _id: issue.space }, (res) => {
    currentProject = res[0]
  })
</script>

<div class="popupPanel-body__aside-grid">
  <span class="labelOnPanel">
    <Label label={task.string.TaskType} />
  </span>
  <TaskKindSelector
    projectType={currentProject?.type}
    value={issue.kind}
    baseClass={tracker.class.Issue}
    justify={'left'}
    width={'100%'}
    size={'medium'}
    kind={'link'}
    showAlways
    on:change={async (evt) => {
      if (evt.detail !== undefined) {
        await client.update(issue, { kind: evt.detail })
      }
    }}
  />
  <span class="labelOnPanel">
    <Label label={tracker.string.Priority} />
  </span>
  <PriorityEditor value={issue} size={'medium'} justify={'left'} width={'100%'} shouldShowLabel />

  <span class="labelOnPanel">
    <Label label={tracker.string.Assignee} />
  </span>
  <AssigneeEditor object={issue} size={'medium'} width="100%" />

  <span class="labelTop">
    <Label label={tracker.string.Labels} />
  </span>

  <Component
    is={tags.component.TagsDropdownEditor}
    props={{
      kind: 'link',
      size: 'medium',
      width: '100%',
      justify: 'left',
      items: labelRefs,
      key,
      targetClass: tracker.class.Issue,
      countLabel: tracker.string.NumberLabels
    }}
    on:open={async (evt) => {
      await client.update(issue, { $push: { labels: evt.detail._id } })
    }}
    on:delete={onTagDelete}
  />

  <div class="divider" />

  <span class="labelOnPanel">
    <Label label={tracker.string.Component} />
  </span>

  {#if keys.length > 0}
    <div class="divider" />
    {#each keys as key (typeof key === 'string' ? key : key.key)}
      <AttributeBarEditor {key} _class={issue._class} object={issue} size={'medium'} showHeader={true} />
    {/each}
  {/if}
</div>
