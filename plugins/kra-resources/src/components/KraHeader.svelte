<script lang="ts">
  import core, { Ref, Space } from '@hcengineering/core'
  import { Button, ButtonWithDropdown, IconAdd, IconDropdown, SelectPopupValueType, showPopup } from '@hcengineering/ui'

  import kra from '../plugin'
  import CreateOrEditGroup from './group/CreateOrEditGroup.svelte'
  import { IntlString } from '@hcengineering/platform'
  import NewTask from './task/NewTask.svelte'

  export let currentSpace: Ref<Space> | undefined

  const projectExists = true
  const label = '' as IntlString
  async function newTask () {
    showPopup(NewTask, { space: currentSpace, shouldSaveDraft: true }, 'top')
  }

  async function newGroup () {
    showPopup(CreateOrEditGroup, { space: core.space.Space, shouldSaveDraft: true }, 'top')
  }

  const dropdownItems: SelectPopupValueType[] = [
    {
      id: kra.string.NewGroup,
      label: kra.string.NewGroup
    },
    {
      id: kra.string.NewTask,
      label: kra.string.NewTask
    }
  ]

  async function dropdownItemSelected (res?: SelectPopupValueType['id']): Promise<void> {
    if (res == null) return

    if (res === kra.string.NewGroup) {
      showPopup(kra.component.CreateOrEditGroup, {}, 'top', () => {})
    } else {
      await newTask()
    }
  }

  const keys: string[] | undefined = undefined
</script>

<div class="antiNav-subheader">
  {#if projectExists}
    <ButtonWithDropdown
      icon={IconAdd}
      justify={'left'}
      kind={'primary'}
      label={kra.string.NewTask}
      on:click={newTask}
      {dropdownItems}
      dropdownIcon={IconDropdown}
      on:dropdown-selected={(ev) => {
        dropdownItemSelected(ev.detail)
      }}
      mainButtonId={'new-issue'}
      showTooltipMain={{
        direction: 'bottom',
        label,
        keys
      }}
    ></ButtonWithDropdown>
  {:else}
    <Button
      icon={IconAdd}
      justify="left"
      kind="primary"
      label={kra.string.Group}
      width="100%"
      on:click={() => {
        showPopup(kra.component.CreateOrEditGroup, {}, 'top', () => {
          closed = true
        })
      }}
    />
  {/if}
</div>
