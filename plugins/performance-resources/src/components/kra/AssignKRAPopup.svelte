<script lang="ts">
  import presentation, { Card, createQuery, getClient, MessageBox } from '@hcengineering/presentation'
  import performance from '../../plugin'
  import { ObjectBox, ObjectBoxPopup, ObjectPresenter } from '@hcengineering/view-resources'
  import { createClient, Data, Ref, Space } from '@hcengineering/core'
  import { EmployeeKRA, KRA, ReviewSession } from '@hcengineering/performance'
  import {
    personAccountByPersonId,
    PersonAccountRefPresenter,
    SelectUsersPopup
  } from '@hcengineering/contact-resources'
  import KraWeightEditorWithPopup from './KRAWeightEditorWithPopup.svelte'
  import { Button, Dialog, eventToHTMLElement, IconAdd, IconClose, IconDelete, showPopup } from '@hcengineering/ui'
  import kraTeam, { Member } from '@hcengineering/kra-team'
  import { createEventDispatcher } from 'svelte'

  export let kra: Ref<KRA> | undefined = undefined
  export let space: Ref<Space> | undefined = undefined
  export let assigns: Array<EmployeeKRA> | undefined = undefined
  let newAssigns: Array<Data<EmployeeKRA>> | undefined = undefined

  const client = getClient()
  const query = createQuery()
  const dispatch = createEventDispatcher()
  $: if (assigns === undefined && kra !== undefined) {
    query.query(
      performance.class.EmployeeKRA,
      {
        kra
      },
      (res) => {
        assigns = res
      }
    )
  } else {
    query.unsubscribe()
  }

  $: if (kra !== undefined) {
    void client
      .findOne(performance.class.KRA, {
        _id: kra
      })
      .then((kra) => {
        space = kra?.space
      })
  }

  function handleUpdate (data: Ref<Member>[] | undefined): void {
    console.log(data)
    if (kra !== undefined && data !== undefined) {
      const v = kra
      newAssigns = data
        .map((mem) => {
          const p = $personAccountByPersonId.get(mem)
          return p?.[0]
        })
        .filter((it) => it !== undefined)
        .map((it) => {
          return {
            kra: v,
            employee: it._id,
            weight: 0
          }
        })
    }
  }

  function handleClose (): void {}

  function newAssignWeightUpdate (assign: Data<EmployeeKRA>, weight: number): void {
    if (newAssigns !== undefined) {
      const index = newAssigns.findIndex((it) => it.employee === assign.employee)
      if (index !== -1) {
        newAssigns[index].weight = weight
      }
    }
  }

  $: canSave = true

  async function handleSave (): Promise<void> {
    if (kra !== undefined && newAssigns !== undefined && newAssigns.length > 0 && space !== undefined) {
      for (const assign of newAssigns) {
        await client.createDoc(performance.class.EmployeeKRA, space, {
          kra,
          employee: assign.employee,
          weight: assign.weight
        })
        newAssigns = []
      }
    }
    dispatch('close')
  }
</script>

<Card
  label={performance.string.AssignKRA}
  okAction={handleSave}
  okLabel={presentation.string.Save}
  width="small"
  {canSave}
>
  <svelte:fragment slot="header">
    <ObjectBox
      label={performance.string.KRA}
      showNavigate={false}
      kind="regular"
      value={kra}
      _class={performance.class.KRA}
    />
  </svelte:fragment>

  <div class="flex-row-center flex-gap-2 flex-wrap">
    {#if assigns !== undefined}
      {#each assigns as assign}
        <div class="flex-row-center assign-pill pl-1">
          <div class="flex-row-center flex-gap-1">
            <PersonAccountRefPresenter value={assign.employee} disabled />
            <KraWeightEditorWithPopup value={assign} />
          </div>
          <Button
            kind="ghost"
            shape="rectangle-left"
            icon={IconClose}
            iconProps={{
              size: 'small'
            }}
            on:click={() => {
              showPopup(
                MessageBox,
                {
                  label: performance.string.RemoveKRAAssignee,
                  message: performance.string.RemoveKRAAssigneeMessage
                },
                'center',
                async (confirmed) => {
                  if (confirmed === true) {
                    assigns = assigns?.filter((it) => it !== assign)
                    await client.remove(assign)
                  }
                }
              )
            }}
          />
        </div>
      {/each}
    {/if}
    {#if newAssigns !== undefined}
      {#each newAssigns as assign}
        <div class="flex-row-center assign-pill pl-1 new">
          <div class="flex-row-center flex-gap-1">
            <PersonAccountRefPresenter value={assign.employee} disabled />
            <KraWeightEditorWithPopup value={assign} onUpdate={newAssignWeightUpdate.bind(null, assign)} />
          </div>
          <Button
            kind="ghost"
            shape="rectangle-left"
            icon={IconClose}
            iconProps={{
              size: 'small'
            }}
            on:click={() => {
              newAssigns = newAssigns?.filter((it) => it !== assign)
            }}
          />
        </div>
      {/each}
    {/if}
    <Button
      label={performance.string.AssignTo}
      kind="regular"
      icon={IconAdd}
      on:click={(e) => {
        showPopup(
          ObjectBoxPopup,
          {
            _class: kraTeam.mixin.Member,
            multiSelect: true
          },
          eventToHTMLElement(e),
          handleClose,
          handleUpdate
        )
      }}
    />
  </div>
</Card>

<style lang="scss">
  .assign-pill {
    background-color: var(--theme-button-default);
    border-radius: 0.3rem;
    border: 1px solid var(--theme-button-border);
    font-size: var(--hc-font-size-2);
    color: var(--hc-color-text-primary);
    cursor: pointer;

    &.new {
      border: 1px dashed var(--theme-button-border);
    }
  }

  .assign-pill:hover {
    background-color: var(--theme-button-hovered);
  }
</style>
