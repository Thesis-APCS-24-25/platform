<script lang="ts">
  import { Project } from '@hcengineering/kra'
  import { Icon, IconWithEmoji, getPlatformColorDef, getPlatformColorForTextDef, themeStore } from '@hcengineering/ui'
  import view from '@hcengineering/view'
  import kra from '../../plugin'

  export let value: Project | undefined
  export let inline: boolean = false
  export let accent: boolean = false
</script>

{#if value}
  <div class="flex-presenter cursor-default" class:inline-presenter={inline}>
    <div class="icon" class:emoji={value.icon === view.ids.IconWithEmoji}>
      <Icon
        icon={value.icon === view.ids.IconWithEmoji ? IconWithEmoji : value.icon ?? kra.icon.Kra}
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
      {value.name}
    </span>
  </div>
{/if}
