<!--
// Copyright © 2020 Anticrm Platform Contributors.
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
  import { getContext } from 'svelte'
  import { getMetadata } from '@hcengineering/platform'
  import ui, { showPopup, deviceOptionsStore as deviceInfo } from '../..'
  import LangPopup from './LangPopup.svelte'
  import Html from '../Html.svelte'

  let pressed: boolean = false

  const { currentLanguage, setLanguage } = getContext<{ currentLanguage: string, setLanguage: (lang: string) => void }>(
    'lang'
  )
  const uiLangs = new Set(getMetadata(ui.metadata.Languages))
  const langs = [
    { id: 'en', label: ui.string.English, logo: '&#x1F1FA;&#x1F1F8;' },
    { id: 'vn', label: ui.string.Vietnamese, logo: '&#x1f1fb;&#x1f1f3' },
    { id: 'pt', label: ui.string.Portuguese, logo: '&#x1F1F5;&#x1F1F9;' },
    { id: 'es', label: ui.string.Spanish, logo: '&#x1F1EA;&#x1F1F8;' },
    { id: 'ru', label: ui.string.Russian, logo: '&#x1F1F7;&#x1F1FA;' },
    { id: 'zh', label: ui.string.Chinese, logo: '&#x1F1E8;&#x1F1F3;' },
    { id: 'fr', label: ui.string.French, logo: '&#x1F1EB;&#x1F1F7;' },
    { id: 'it', label: ui.string.Italian, logo: '&#x1F1EE;&#x1F1F9;' },
    { id: 'cs', label: ui.string.Czech, logo: '&#x1F1E8;&#x1F1FF;' },
    { id: 'de', label: ui.string.German, logo: '&#x1F1E9;&#x1F1EA;' }
  ].filter((lang) => uiLangs.has(lang.id))
  if (langs.findIndex((l) => l.id === currentLanguage) < 0 && langs.length !== 0) {
    setLanguage(langs[0].id)
  }

  if (langs.length === 0) {
    console.error(
      `List of configured UI languages: [${getMetadata(ui.metadata.Languages)?.join(
        ', '
      )}] doesn't contain any languages available in the app. Please check you configuration.`
    )
  }

  const isSelectable = langs.length > 1

  $: selected = langs.find((item) => item.id === currentLanguage)

  const selectLanguage = (): void => {
    if (!isSelectable) {
      return
    }
    pressed = true

    showPopup(LangPopup, { langs, selected: selected?.id }, 'status', (result) => {
      if (result) {
        selected = langs.find((item) => item.id === result)
        setLanguage(result)
      }
      pressed = false
    })
  }
  $: $deviceInfo.language = selected?.id
</script>

<button
  class="antiButton ghost jf-center bs-none no-focus resetIconSize statusButton square"
  class:pressed
  on:click={selectLanguage}
>
  {#if selected}
    <Html value={selected.logo} />
  {/if}
</button>
