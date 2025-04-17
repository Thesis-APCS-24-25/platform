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
  import contact, { Contact } from '@hcengineering/contact'
  import type { ButtonKind, ButtonSize, LabelAndProps, PopupResult } from '@hcengineering/ui'
  import { Button, ButtonShape, Label, SelectPopup, eventToHTMLElement, showPopup, themeStore } from '@hcengineering/ui'
  import performance from '../plugin'

  export let value: Ref<Contact> | undefined
  export let space: Ref<Space>
  export let shouldShowLabel: boolean = true
  export let isEditable: boolean = true
  export let onChange: ((newContactId: Ref<Contact> | undefined) => void) | undefined = undefined
  export let popupPlaceholder: IntlString = performance.string.AssignEmployee
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

  let selectedContact: Contact | undefined
  let defaultContactLabel = ''

  const query = createQuery()
  let rawContacts: Contact[] = []
  $: query.query(
    contact.class.Contact,
    {
      // space
    },
    (res) => {
      rawContacts = res
    },
    {
      sort: { createdOn: SortingOrder.Descending }
    }
  )

  const handleSelectedContactIdUpdated = async (
    newContactId: Ref<Contact> | null | undefined,
    contacts: Contact[]
  ): Promise<void> => {
    if (newContactId === null || newContactId === undefined) {
      selectedContact = undefined

      return
    }

    selectedContact = contacts.find((it) => it._id === newContactId)
  }

  $: void handleSelectedContactIdUpdated(value, rawContacts)

  $: translateCB(contact.string.Contacts, {}, $themeStore.language, (result) => (defaultContactLabel = result))
  const contactIcon = contact.icon.Contacts
  $: contactText = shouldShowLabel ? selectedContact?.name ?? defaultContactLabel : undefined

  const getContactInfo = (rawContacts: Contact[], sp: Contact | undefined): {
    id: Ref<Contact>
    icon: Asset
    text: string
    isSelected: boolean
  }[] => {
    return rawContacts.map((p) => ({
      id: p._id,
      icon: contact.icon.Contacts,
      text: p.name,
      isSelected: (sp != null) ? p._id === sp._id : false
    }))
  }

  $: contacts = getContactInfo(rawContacts, selectedContact)

  let contactPopup: PopupResult | undefined
  const handleContactEditorOpened = async (event: MouseEvent): Promise<void> => {
    event.stopPropagation()
    if (!isEditable) {
      return
    }

    contactPopup = showPopup(
      SelectPopup,
      { value: contacts, placeholder: popupPlaceholder, searchable: true },
      eventToHTMLElement(event),
      (evt) => {
        onChange?.(evt)
        contactPopup = undefined
      }
    )
  }

  $: contactPopup?.update({ value: contacts })
</script>

{#if isAction}
  <SelectPopup
    value={contacts}
    placeholder={popupPlaceholder}
    searchable
    on:close={(evt) => {
      if (onChange !== undefined) onChange(evt.detail)
    }}
  />
{:else if onlyIcon || contactText === undefined}
  <Button
    id="contact"
    {focusIndex}
    {kind}
    {size}
    {shape}
    {width}
    {justify}
    {showTooltip}
    icon={contactIcon}
    disabled={!isEditable}
    {short}
    on:click={handleContactEditorOpened}
  />
{:else}
  <Button
    id="contact"
    {focusIndex}
    {kind}
    {size}
    {shape}
    {width}
    {justify}
    {showTooltip}
    icon={contactIcon}
    disabled={!isEditable}
    notSelected={value == null}
    {short}
    on:click={handleContactEditorOpened}
  >
    <svelte:fragment slot="content">
      <span class="label {enlargedText ? 'text-base' : 'text-md'} overflow-label pointer-events-none">
        <Label label={getEmbeddedLabel(contactText)} />
      </span>
    </svelte:fragment>
  </Button>
{/if}
