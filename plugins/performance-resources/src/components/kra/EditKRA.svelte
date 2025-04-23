<script lang="ts">
  import { Class, Ref, WithLookup } from '@hcengineering/core'
  import { Panel } from '@hcengineering/panel'
  import presentation, { ActionContext, contextStore, createQuery, getClient } from '@hcengineering/presentation'
  import { taskTypeStore, typeStore } from '@hcengineering/task-resources'
  import { Button, EditBox, FocusHandler, IconMixin, IconMoreH, Label, createFocusManager } from '@hcengineering/ui'
  import view from '@hcengineering/view'
  import { DocNavLink, showMenu, RelationsEditor } from '@hcengineering/view-resources'
  import { InboxNotificationsClientImpl } from '@hcengineering/notification-resources'

  import { createEventDispatcher, onDestroy } from 'svelte'
  import performance from '../../plugin'
  import { KRA } from '@hcengineering/performance'
  import { getKRAIdByIdentifier } from '../../navigation'

  import KRAAssignees from './KRAAssignees.svelte'
  import KRAAssigneeTable from './KRAAssigneeTable.svelte'

  export let _id: Ref<KRA> | string
  export let _class: Ref<Class<KRA>>
  export let embedded: boolean = false
  export let readonly: boolean = false

  let lastId: Ref<KRA> | undefined

  const queryClient = createQuery()
  const dispatch = createEventDispatcher()
  const client = getClient()
  // const hierarchy = client.getHierarchy()

  let kra: WithLookup<KRA> | undefined
  let title = ''
  let description = ''
  let innerWidth: number
  let showAllMixins: boolean

  const inboxClient = InboxNotificationsClientImpl.getClient()

  let kraId: Ref<KRA> | undefined

  $: void getKRAIdByIdentifier(_id).then((res) => {
    kraId = res ?? (_id as Ref<KRA>)

    if (lastId === undefined) {
      lastId = kraId
    }
  })

  $: read(kraId)

  function read (_id?: Ref<KRA>): void {
    if (_id != null && lastId != null && lastId !== _id) {
      const prev = lastId
      lastId = _id
      void inboxClient.readDoc(prev)
    }
  }

  onDestroy(async () => {
    if (kraId === undefined) return
    void inboxClient.readDoc(kraId)
  })

  $: if (kraId !== undefined && _class !== undefined) {
    queryClient.query<KRA>(
      _class,
      { _id: kraId },
      async (result) => {
        if (lastId !== kraId) {
          await save()
        }
        ;[kra] = result
        if (kra !== undefined) {
          title = kra.title
          description = kra.description
        }
      },
      {
        limit: 1
      }
    )
  }

  $: canSave = title.trim().length > 0

  const saved = false
  async function save (): Promise<void> {
    if (kra === undefined || !canSave) {
      return
    }

    const trimmedTitle = title.trim()

    if (trimmedTitle.length > 0 && trimmedTitle !== kra.title?.trim()) {
      await client.update(kra, { title: trimmedTitle })
    }

    await client.update(kra, { description })
  }

  function showContextMenu (ev: MouseEvent): void {
    if (kra !== undefined) {
      showMenu(ev, { object: kra, excludedActions: [view.action.Open] })
    }
  }

  const manager = createFocusManager()

  // If it is embedded
  $: lastCtx = $contextStore.getLastContext()
  $: isContextEnabled = lastCtx?.mode === 'editor' || lastCtx?.mode === 'browser'

  // function getEditorFooter (
  //   _class?: Ref<Class<Doc>>
  // ): { footer: AnyComponent, props?: Record<string, any> } | undefined {
  //   if (_class === undefined) {
  //     return
  //   }
  //   const clazz = hierarchy.getClass(_class)
  //   const editorMixin = hierarchy.as(clazz, view.mixin.ObjectEditorFooter)
  //   if (editorMixin?.editor == null && clazz.extends != null) return getEditorFooter(clazz.extends)
  //   if (editorMixin.editor !== undefined) {
  //     return { footer: editorMixin.editor, props: editorMixin?.props }
  //   }
  //   return undefined
  // }
  // $: editorFooter = getEditorFooter(kra?._class)

  let content: HTMLElement

  $: taskType = kra?.kind !== undefined ? $taskTypeStore.get(kra?.kind) : undefined

  $: projectType = taskType?.parent !== undefined ? $typeStore.get(taskType.parent) : undefined
</script>

{#if !embedded}
  <FocusHandler {manager} isEnabled={isContextEnabled} />
  <ActionContext
    context={{
      mode: 'editor'
    }}
  />
{/if}

{#if kra !== undefined}
  <Panel
    object={kra}
    isHeader={false}
    withoutInput={readonly}
    allowClose={!embedded}
    isAside={true}
    isSub={false}
    {embedded}
    withoutActivity={false}
    printAside={true}
    adaptive={'default'}
    bind:content
    bind:innerWidth
    on:open
    on:close={() => dispatch('close')}
    on:select
  >
    <svelte:fragment slot="title">
      {#if embedded}
        <DocNavLink noUnderline object={kra}>
          <div class="title">{kra.title}</div>
        </DocNavLink>
      {:else}
        <div class="title not-active">{kra.identifier}</div>
      {/if}

      {#if (projectType?.tasks.length ?? 0) > 1 && taskType !== undefined}
        ({taskType.name})
      {/if}
      <!-- <ComponentExtensions
        extension={performance.extensions.EditKRATitle}
        props={{ size: 'medium', kind: 'ghost', space: kra.space, value: kra, readonly }}
      /> -->
    </svelte:fragment>
    <svelte:fragment slot="pre-utils">
      <!-- <ComponentExtensions
        extension={performance.extensions.EditKRAHeader}
        props={{ size: 'medium', kind: 'ghost', space: kra.space, readonly, value: kra }}
      /> -->
      {#if saved}
        <Label label={presentation.string.Saved} />
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="utils">
      {#if !readonly}
        <Button
          icon={IconMoreH}
          iconProps={{ size: 'medium' }}
          kind={'icon'}
          dataId={'btnMoreActions'}
          on:click={showContextMenu}
        />
        <!-- <Button
          icon={setting.icon.Setting}
          kind={'icon'}
          iconProps={{ size: 'medium' }}
          showTooltip={{ label: setting.string.ClassSetting }}
          dataId={'btnClassSetting'}
          on:click={(ev) => {
            ev.stopPropagation()
            const loc = getCurrentResolvedLocation()
            loc.path[2] = settingId
            loc.path[3] = 'setting'
            loc.path[4] = 'classes'
            loc.path.length = 5
            loc.query = { _class }
            loc.fragment = undefined
            navigate(loc)
          }}
        /> -->
      {/if}
      <Button
        icon={IconMixin}
        iconProps={{ size: 'medium' }}
        kind={'icon'}
        selected={showAllMixins}
        dataId={'btnMixin'}
        on:click={() => {
          showAllMixins = !showAllMixins
        }}
      />
    </svelte:fragment>

    <EditBox
      focusIndex={1}
      bind:value={title}
      disabled={readonly}
      placeholder={performance.string.KRANamePlaceholder}
      kind="large-style"
      on:blur={save}
    />
    <div class="w-full mt-6">
      <EditBox
        focusIndex={2}
        bind:value={description}
        disabled={readonly}
        placeholder={performance.string.KRADescriptionPlaceholder}
        kind="large-style"
        on:blur={save}
      />
    </div>
    <div class="w-full mt-6">
      <KRAAssignees />
    </div>

    <RelationsEditor object={kra} {readonly} />

    <span slot="actions-label" class="select-text">
      {kra.identifier}
    </span>

    <!-- <svelte:fragment slot="custom-attributes">
      {#if kra !== undefined}
        <div class="space-divider" />
        <ControlPanel {kra} {showAllMixins} {readonly} />
      {/if}

      <div class="popupPanel-body__aside-grid">
        <div class="divider" />
        <KRAStatusActivity {kra} />
      </div>
    </svelte:fragment> -->
  </Panel>
{/if}
