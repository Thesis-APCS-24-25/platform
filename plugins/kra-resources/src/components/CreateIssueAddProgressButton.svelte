<script lang="ts">
  import { AddProgressPopup } from '@hcengineering/performance-resources'
  import { Button, eventToHTMLElement, SelectPopup, SelectPopupValueType, showPopup } from '@hcengineering/ui'
  import performance, { Progress, PTask } from '@hcengineering/performance'
  import { Asset, IntlString } from '@hcengineering/platform'
  import { createEventDispatcher } from 'svelte'
  import { Class, Ref } from '@hcengineering/core'
  import { Project } from '@hcengineering/task'
  import { getClient } from '@hcengineering/presentation'
  import kra from '../plugin'
  import EditKpi from './issues/goal/kpi/EditKpi.svelte'

  export let value: Ref<Progress> | undefined = undefined
  export let _class: Ref<Class<Progress>> = performance.class.Progress
  export let label: IntlString
  export let task: Ref<PTask>
  export let space: Ref<Project>
  export let focusIndex: number = -1
  export let icon: Asset = performance.icon.Progress

  const client = getClient()

  const dispatch = createEventDispatcher()

  function setProgress (): void {
    showPopup(
      AddProgressPopup,
      {
        task,
        space,
        canChangeTask: false
      },
      'top',
      (progress) => {
        if (progress !== undefined) {
          value = progress
          _class = performance.class.Progress
          dispatch('update', {
            _id: progress._id,
            _class: performance.class.Progress
          })
        }
      }
    )
  }

  function openProgressDropdown (ev: MouseEvent): void {
    showPopup(
      SelectPopup,
      {
        value: dropdownItems
      },
      eventToHTMLElement(ev),
      (res) => {
        if (res === 'kpi') {
          setKpi()
        } else if (res === 'progress') {
          setProgress()
        }
      }
    )
  }

  function setKpi (): void {
    showPopup(
      EditKpi,
      {
        kpi: value,
        issue: task,
        space,
        canEditIssue: false
      },
      'top',
      (res) => {
        if (res !== undefined) {
          value = res
          _class = performance.class.Kpi
          dispatch('update', {
            _id: res,
            _class: performance.class.Kpi
          })
        }
      }
    )
  }

  async function clearProgress (): Promise<void> {
    if (value === undefined) {
      return
    }
    await client.removeDoc(performance.class.Progress, space, value)
    value = undefined
    dispatch('change', undefined)
  }
  const dropdownItems: SelectPopupValueType[] = [
    {
      id: 'progress',
      label: kra.string.SetProgress,
      icon: performance.icon.Progress
    },
    {
      id: 'kpi',
      label: kra.string.SetKpi,
      icon: performance.icon.Kpi
    }
  ]
</script>

<Button
  justify='left'
  {focusIndex}
  {icon}
  {label}
  kind={'regular'}
  size={'large'}
  on:click={value != null ? clearProgress : openProgressDropdown}
/>
