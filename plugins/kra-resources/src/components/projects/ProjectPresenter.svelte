<!--
// Copyright © 2023 Hardcore Engineering Inc.
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
  import presentation, { isAdminUser } from '@hcengineering/presentation'
  import { Project } from '@hcengineering/kra'
  import {
    Icon,
    IconWithEmoji,
    Label,
    getPlatformColorDef,
    getPlatformColorForTextDef,
    themeStore
  } from '@hcengineering/ui'
  import view from '@hcengineering/view'
  import { NavLink } from '@hcengineering/view-resources'
  import tracker from '../../plugin'
  import { getCurrentAccount } from '@hcengineering/core'

  export let value: Project | undefined
  export let inline: boolean = false
  export let accent: boolean = false
  export let colorInherit: boolean = false
  export let openIssues: boolean
</script>

{#if value}
  <div class="flex-presenter cursor-default" class:inline-presenter={inline} class:colorInherit>
    <div class="icon" class:emoji={value.icon === view.ids.IconWithEmoji}>
      <Icon
        icon={value.icon === view.ids.IconWithEmoji ? IconWithEmoji : value.icon ?? tracker.icon.Home}
        iconProps={value.icon === view.ids.IconWithEmoji
          ? { icon: value.color }
          : {
              fill:
                value.color !== undefined
                  ? getPlatformColorDef(value.color, $themeStore.dark).icon
                  : getPlatformColorForTextDef(value.name, $themeStore.dark).icon
            }}
        size="small"
      />
    </div>
    <span class="label no-underline nowrap" class:fs-bold={accent}>
      {#if openIssues && (isAdminUser() || value.members.includes(getCurrentAccount()._id))}
        <NavLink space={value._id} special={'issues'} noUnderline={false}>
          {value.name}
        </NavLink>
      {:else}
        {value.name}
      {/if}
      {#if value.archived}
        <Label label={presentation.string.Archived} />
      {/if}
    </span>
  </div>
{/if}
