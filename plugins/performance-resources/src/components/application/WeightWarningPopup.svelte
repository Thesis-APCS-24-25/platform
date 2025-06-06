<script lang="ts">
  import { PersonAccount } from '@hcengineering/contact'
  import { Ref } from '@hcengineering/core'
  import performance from '../../plugin'
  import { PersonAccountRefPresenter } from '@hcengineering/contact-resources'
  import { Button, Icon, IconInfo, Label } from '@hcengineering/ui'
  import presentation from '@hcengineering/presentation'
  import { createEventDispatcher } from 'svelte'

  export let members: Ref<PersonAccount>[] = []

  const dispatch = createEventDispatcher()
</script>

<div class="msgbox-container">
  <div class="title font-medium-14 flex-row-center justify-left flex-gap-2">
    <Icon icon={IconInfo} size='large' fill='var(--theme-warning-color)'/>
    <Label label={performance.string.WeightWarningPopupTitle} />
  </div>

  <div class="flex-row-center justify-left m-4">
    {#each members as value}
      <div class="item">
        <PersonAccountRefPresenter {value} disabled/>
      </div>
    {/each}
  </div>
  <div class="footer">
    <Button
      focusIndex={1}
      size={'large'}
      kind="primary"
      label={presentation.string.Ok}
      on:click={() => {
        dispatch('close')
      }}
    />
  </div>
</div>

<style lang="scss">
  .msgbox-container {
    display: flex;
    flex-direction: column;
    padding: 2rem 1.75rem 1.75rem;
    width: 30rem;
    max-width: 40rem;
    background: var(--theme-popup-color);
    border-radius: 0.5rem;
    user-select: none;
    box-shadow: var(--theme-popup-shadow);

    .title {
      margin-bottom: 1rem;
    }
  }

  .item {
    padding: 0.5rem;
    margin: 0 0.25rem;
    border-radius: 0.25rem;
    border: 1px solid var(--theme-button-border);
  }

  .footer {
    flex-shrink: 0;
    display: grid;
    grid-auto-flow: column;
    direction: rtl;
    justify-content: flex-start;
    align-items: center;
    column-gap: 0.5rem;
    // mask-image: linear-gradient(90deg, rgba(0, 0, 0, 0) 1.25rem, rgba(0, 0, 0, 1) 2.5rem);
    // overflow: hidden;
  }
</style>
