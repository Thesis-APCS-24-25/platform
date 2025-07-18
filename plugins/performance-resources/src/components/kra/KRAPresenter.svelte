<script lang="ts">
  import { WithLookup } from '@hcengineering/core'
  import { Asset } from '@hcengineering/platform'
  import type { KRA } from '@hcengineering/performance'
  import { AnySvelteComponent, getPlatformColorDef, Icon, themeStore, tooltip } from '@hcengineering/ui'

  import { DocNavLink, ObjectMention } from '@hcengineering/view-resources'
  import { ObjectPresenterType } from '@hcengineering/view'
  import performance from '../../plugin'

  export let value: WithLookup<KRA> | undefined
  export let disabled = false
  export let onClick: (() => void) | undefined = undefined
  export let shouldShowAvatar = true
  export let noUnderline = disabled
  export let colorInherit = false
  export let noSelect = false
  export let inline = false
  export let shrink = 0 // Set default to 0 because we want to show the title by default on ObjectPopup
  export let kind: 'list-header' | 'list' | 'link-bordered' = 'list'
  export let type: ObjectPresenterType = 'text'
  export let icon: Asset | AnySvelteComponent | undefined = undefined

  // Reactive variables
  $: colorDef = value?.color !== undefined ? getPlatformColorDef(value.color, $themeStore.dark) : undefined
  $: color = colorDef?.color

  $: shouldShowTitle = shrink === 0 || kind === 'list-header' || inline
  $: shouldShowIdentifier = true
</script>

{#if value}
  {#if inline}
    <ObjectMention object={value} {disabled} {noUnderline} {onClick} component={performance.component.EditKRA} />
  {:else if type === 'link'}
    <div class="flex-row-center" class:link-bordered={kind === 'link-bordered'}>
      <DocNavLink
        object={value}
        {onClick}
        {disabled}
        {noUnderline}
        {colorInherit}
        component={performance.component.EditKRA}
        shrink={2}
      >
        <div class="kraPresenterRoot" class:list={kind === 'list'} class:cursor-pointer={!disabled}>
          {#if shouldShowAvatar}
            <div class="icon" use:tooltip={{ label: performance.string.KRA }} aria-label="KRA Icon">
              <Icon icon={icon ?? performance.icon.KRA} size="medium" fill={color} />
            </div>
          {/if}
          <div
            class="kra-name"
            class:header={!noSelect && kind === 'list-header'}
            class:select-text={!noSelect}
            class:uppercase={kind === 'list-header'}
            class:font-medium-12={kind === 'list-header'}
            title={value?.title}
          >
            {#if shouldShowIdentifier}
              {value.identifier}
            {/if}
            {#if shouldShowTitle}
              {value.title}
            {/if}
          </div>
        </div>
      </DocNavLink>
    </div>
  {:else if type === 'text'}
    <div
      class="kraPresenterRoot"
      class:list={kind === 'list'}
      class:cursor-pointer={!disabled}
      class:link-bordered={kind === 'link-bordered'}
    >
      {#if shouldShowAvatar}
        <div class="icon" use:tooltip={{ label: performance.string.KRA }} aria-label="KRA Icon">
          <Icon icon={icon ?? performance.icon.KRA} size="medium" fill={color} />
        </div>
      {/if}
      <div
        class="kra-name"
        class:header={!noSelect && kind === 'list-header'}
        class:select-text={!noSelect}
        class:uppercase={kind === 'list-header'}
        class:font-medium-12={kind === 'list-header'}
        title={value?.title}
      >
        {#if shouldShowIdentifier}
          {value.identifier}
        {/if}
        {#if shouldShowTitle}
          {value.title}
        {/if}
      </div>
    </div>
  {/if}
{/if}

<style lang="scss">
  $theme-content-color: var(--theme-content-color);
  $theme-halfcontent-color: var(--theme-halfcontent-color);

  .link-bordered {
    border: 1px solid var(--theme-button-border);
    background-color: var(--theme-button-default);
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }

  .kraPresenterRoot {
    display: flex;
    align-items: center;
    justify-content: left;
    gap: 0.25rem;
    flex-shrink: 0;
    text-wrap: nowrap;
    text-overflow: ellipsis;

    &:not(.list) {
      color: $theme-content-color;
    }

    &.list {
      color: $theme-halfcontent-color;
    }
  }

  .kra-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--theme-text-primary-color);
  }

  .icon {
    display: flex;
    align-items: left;
    justify-content: left;
  }
</style>
