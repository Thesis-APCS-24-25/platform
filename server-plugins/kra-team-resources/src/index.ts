//
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
//

import core, { AccountRole, Ref, RolesAssignment, Tx, TxCreateDoc, TxMixin, TxUpdateDoc } from '@hcengineering/core'
import { TriggerControl } from '@hcengineering/server-core'
import kraTeam, { Team, TeamType } from '@hcengineering/kra-team'
import contact, { Person, PersonAccount } from '@hcengineering/contact'
import { create } from 'domain'

/**
 * Get the roles assignment for a team, if `typeType` is not provided, the default team type will be used.
 */
export async function getRolesAssignment (
  control: TriggerControl,
  teamRef: Ref<Team>,
  typeType?: TeamType
): Promise<RolesAssignment> {
  const hierarchy = control.hierarchy
  if (typeType === undefined) {
    typeType = (
      await control.findAll(control.ctx, core.class.SpaceType, {
        _id: kraTeam.spaceType.TeamType
      })
    )[0]
    if (typeType === undefined) {
      throw Error('Default space type should always be present')
    }
  }

  const team = await control
    .findAll(control.ctx, kraTeam.class.Team, {
      _id: teamRef
    })
    .then((team) => team[0])

  const asMixin = hierarchy.as(team, typeType.targetClass)

  const roles = await control.findAll(control.ctx, core.class.Role, { attachedTo: typeType._id })
  return roles.reduce<RolesAssignment>((prev, { _id }) => {
    prev[_id] = (asMixin as any)[_id] ?? []

    return prev
  }, {})
}

async function assignWorkspaceOwnerToTeam (control: TriggerControl, tx: TxCreateDoc<Team>): Promise<Tx[]> {
  const account = await control
    .queryFind(control.ctx, contact.class.PersonAccount, {
      role: AccountRole.Owner
    })
    .then((account) => account[0])
  if (account === undefined) {
    throw new Error('Owner account not found')
  }
  if (tx.attributes.owners?.includes(account._id) === true) {
    return []
  }
  const addOwnerTx = control.txFactory.createTxUpdateDoc(tx.objectClass, tx.objectSpace, tx.objectId, {
    owners: [...(tx.attributes.owners ?? []), account._id]
  })
  return [addOwnerTx]
}

export async function OnTeamCreate (txes: Tx[], control: TriggerControl): Promise<Tx[]> {
  const result: Tx[] = []

  for (const tx of txes) {
    const createTx = tx as TxCreateDoc<Team>
    result.push(...(await assignWorkspaceOwnerToTeam(control, createTx)))
  }

  return result
}

export async function OnTeamRolesAssignmentUpdate (txes: Tx[], control: TriggerControl): Promise<Tx[]> {
  // Assign default role 'TeamMember' to the members with no role
  const result: Tx[] = []

  for (const tx of txes) {
    const mixinTx = tx as TxMixin<Team, Team>
    const team = await control
      .findAll(control.ctx, kraTeam.class.Team, {
        _id: mixinTx.objectId
      })
      .then((team) => team[0])
    if (team !== undefined) {
      const members = team.members
      const attr = mixinTx.attributes as any
      const managers = Array.from(attr[kraTeam.role.TeamManager] ?? [])
      const otherMembers = Array.from(attr[kraTeam.role.TeamMember] ?? [])
      const remainings = members.filter((m) => !managers.includes(m))
      if (managers.length + otherMembers.length === members.length) {
        continue
      }
      attr[kraTeam.role.TeamMember] = remainings
      const rtx = control.txFactory.createTxMixin(
        mixinTx.objectId,
        mixinTx.objectClass,
        mixinTx.objectSpace,
        mixinTx.mixin,
        attr
      )
      result.push(rtx)
    }
  }

  return result
}

export async function OnPersonCreate (txes: Tx[], control: TriggerControl): Promise<Tx[]> {
  const result: Tx[] = []

  for (const tx of txes) {
    if (control.hierarchy.isDerived(tx._class, core.class.TxCreateDoc)) {
      const createTx = tx as TxCreateDoc<Person>
      const mixinTx = control.txFactory.createTxMixin(
        createTx.objectId,
        contact.class.Person,
        contact.space.Contacts,
        kraTeam.mixin.Member,
        {}
      )
      result.push(mixinTx)
    }
  }

  return result
}

/**
 * @public
 */
export async function OnTeamMemberUpdate (txes: Tx[], control: TriggerControl): Promise<Tx[]> {
  const result: Tx[] = []

  for (const tx of txes) {
    const updateTx = tx as TxUpdateDoc<Team>
    const newMember = updateTx.operations.$push?.members as Ref<PersonAccount>
    if (newMember !== undefined) {
      const person = await control
        .findAll(control.ctx, contact.class.PersonAccount, {
          _id: newMember
        })
        .then((person) => person[0].person)

      const mixinTx = control.txFactory.createTxMixin(
        person,
        contact.class.Person,
        contact.space.Contacts,
        kraTeam.mixin.Member,
        {}
      )
      result.push(mixinTx)
      const rolesAssignment: RolesAssignment = await getRolesAssignment(control, updateTx.objectId)
      const isManager = (rolesAssignment[kraTeam.role.TeamManager] ?? []).includes(newMember)
      const members = rolesAssignment[kraTeam.role.TeamMember] ?? []
      if (!isManager && !members.includes(newMember)) {
        members.push(newMember)
        rolesAssignment[kraTeam.role.TeamMember] = members
      }

      const teamType = await control
        .findAll(control.ctx, kraTeam.class.TeamType, {
          _id: kraTeam.spaceType.TeamType
        })
        .then((tt) => tt[0])
      if (teamType === undefined) {
        continue
      }

      const rolesTx = control.txFactory.createTxMixin(
        updateTx.objectId,
        kraTeam.class.Team,
        core.space.Space,
        teamType.targetClass,
        rolesAssignment
      )
      result.push(rolesTx)
    }
  }

  return result
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async () => ({
  trigger: {
    OnTeamMemberUpdate,
    OnTeamCreate,
    OnPersonCreate,
    OnTeamRolesAssignmentUpdate
  }
})
