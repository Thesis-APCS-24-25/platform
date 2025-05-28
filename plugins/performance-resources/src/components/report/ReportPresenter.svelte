<script lang="ts">
  import { WithLookup } from '@hcengineering/core'
  import type { PerformanceReport } from '@hcengineering/performance'
  import { DocNavLink, ObjectMention } from '@hcengineering/view-resources'

  import performance from '../../plugin'
  import { personAccountByIdStore, personAccountPersonByIdStore, UserInfo } from '@hcengineering/contact-resources'
  import { Person, PersonAccount } from '@hcengineering/contact'

  export let value: WithLookup<PerformanceReport> | undefined
  export let disabled: boolean = false
  export let onClick: (() => void) | undefined = undefined
  export let noUnderline: boolean = disabled
  export let colorInherit: boolean = false
  export let inline = false

  const personAccount: PersonAccount | undefined = value !== undefined
    ? $personAccountByIdStore.get(value?.reviewee)
    : undefined
  const person: Person | undefined = personAccount !== undefined
    ? $personAccountPersonByIdStore.get(personAccount.person)
    : undefined
</script>

{#if inline && value}
  <ObjectMention object={value} {disabled} {noUnderline} {onClick} component={performance.component.ReportPanel} />
{:else if value}
  {#if person !== undefined}
    <div class="flex-row-center">
      <DocNavLink
        object={value}
        {onClick}
        {disabled}
        {noUnderline}
        {inline}
        {colorInherit}
        component={performance.component.ReportPanel}
        shrink={0}
      >
        <UserInfo
          value={person}
          size={'small'}
        />
      </DocNavLink>
    </div>
  {/if}
{/if}

<style lang="scss">
  // .reportPresenterRoot {
  //   display: flex;
  //   align-items: center;
  //   flex-shrink: 0;

  //   &:not(.list) {
  //     color: var(--theme-content-color);
  //   }

  //   &.list {
  //     color: var(--theme-halfcontent-color);
  //   }

  //   .icon {
  //     margin-right: 0.5rem;
  //     color: var(--theme-dark-color);
  //   }
  // }
</style>
