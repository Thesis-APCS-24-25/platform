<script lang="ts">
  import { Team } from '@hcengineering/kra-team'

  export let value: Team | undefined
  // export let inline: boolean = false
  export let accent: boolean = false
</script>

{#if value}
  <!-- <div class="flex-presenter cursor-default" class:inline-presenter={inline}>
    <div class="icon" class:emoji={value.icon === view.ids.IconWithEmoji}>
      <Icon
        icon={value.icon === view.ids.IconWithEmoji ? IconWithEmoji : value.icon ?? kraTeam.icon.Teams}
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
    </div> -->
    <span class="label no-underline nowrap" class:fs-bold={accent}>
      {value.name}
    </span>
  <!-- </div> -->
{/if}
