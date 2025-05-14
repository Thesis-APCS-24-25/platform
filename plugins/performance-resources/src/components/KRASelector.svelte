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
  import { Ref, SortingOrder, Space } from '@hcengineering/core'
  import { Asset, IntlString, getEmbeddedLabel, translateCB } from '@hcengineering/platform'
  import { createQuery } from '@hcengineering/presentation'
  import { KRA } from '@hcengineering/performance'
  import type { ButtonKind, ButtonSize, LabelAndProps, PopupResult } from '@hcengineering/ui'
  import { Button, ButtonShape, Label, SelectPopup, eventToHTMLElement, showPopup, themeStore } from '@hcengineering/ui'
  import performance from '../plugin'

  export let value: Ref<KRA> | undefined
  export let space: Ref<Space>
  export let shouldShowLabel: boolean = true
  export let isEditable: boolean = true
  export let onChange: ((newKRAId: Ref<KRA> | undefined) => void) | undefined = undefined
  export let popupPlaceholder: IntlString = performance.string.AssignKRA
  export let kind: ButtonKind = 'no-border'
  export let size: ButtonSize = 'small'
  export let shape: ButtonShape = undefined
  export let justify: 'left' | 'center' = 'center'
  export let width: string | undefined = 'min-content'
  export let onlyIcon: boolean = false
  export let enlargedText: boolean = false
  export let short: boolean = false
  export let focusIndex: number | undefined = undefined
  export let isAction: boolean = false

  export let showTooltip: LabelAndProps | undefined = undefined

  let selectedKRA: KRA | undefined
  let defaultKRALabel = ''

  const query = createQuery()
  let rawKRAs: KRA[] = []
  $: query.query(
    performance.class.KRA,
    {
      space
    },
    (res) => {
      rawKRAs = res
    },
    {
      sort: { createdOn: SortingOrder.Descending }
    }
  )

  const handleSelectedKRAIdUpdated = async (
    newKRAId: Ref<KRA> | null | undefined,
    kras: KRA[]
  ): Promise<void> => {
    if (newKRAId === null || newKRAId === undefined) {
      selectedKRA = undefined

      return
    }

    selectedKRA = kras.find((it) => it._id === newKRAId)
  }

  $: void handleSelectedKRAIdUpdated(value, rawKRAs)

  $: translateCB(performance.string.KRA, {}, $themeStore.language, (result) => (defaultKRALabel = result))
  const kraIcon = performance.icon.KRA
  $: kraText = shouldShowLabel ? selectedKRA?.title ?? defaultKRALabel : undefined

  const getKRAInfo = (rawMilestones: KRA[], sp: KRA | undefined):
  ({
    id: Ref<KRA>
    icon: Asset
    text: string
    isSelected: boolean
  } | {
    id: null
    icon: Asset
    label: IntlString
    isSelected: boolean
  })[] => {
    return [
      {
        id: null,
        icon: performance.icon.KRA,
        label: performance.string.NoKRA,
        isSelected: sp === undefined
      },
      ...rawMilestones.map((p) => ({
        id: p._id,
        icon: performance.icon.KRA,
        text: p.title,
        isSelected: (sp != null) ? p._id === sp._id : false
      }))
    ]
  }

  $: kras = getKRAInfo(rawKRAs, selectedKRA)

  let kraPopup: PopupResult | undefined
  const handleKRAEditorOpened = async (event: MouseEvent): Promise<void> => {
    event.stopPropagation()
    if (!isEditable) {
      return
    }

    kraPopup = showPopup(
      SelectPopup,
      { value: kras, placeholder: popupPlaceholder, searchable: true },
      eventToHTMLElement(event),
      (evt) => {
        onChange?.(evt)
        kraPopup = undefined
      }
    )
  }

  $: kraPopup?.update({ value: kras })
</script>

{#if isAction}
  <SelectPopup
    value={kras}
    placeholder={popupPlaceholder}
    searchable
    on:close={(evt) => {
      if (onChange !== undefined) onChange(evt.detail)
    }}
  />
{:else if onlyIcon || kraText === undefined}
  <Button
    id="kra"
    {focusIndex}
    {kind}
    {size}
    {shape}
    {width}
    {justify}
    {showTooltip}
    icon={kraIcon}
    disabled={!isEditable}
    {short}
    on:click={handleKRAEditorOpened}
  />
{:else}
  <Button
    id="kra"
    {focusIndex}
    {kind}
    {size}
    {shape}
    {width}
    {justify}
    {showTooltip}
    icon={kraIcon}
    disabled={!isEditable}
    notSelected={value == null}
    {short}
    on:click={handleKRAEditorOpened}
  >
    <svelte:fragment slot="content">
      <span class="label {enlargedText ? 'text-base' : 'text-md'} overflow-label pointer-events-none">
        <Label label={getEmbeddedLabel(kraText)} />
      </span>
    </svelte:fragment>
  </Button>
{/if}
