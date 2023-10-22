// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'

// Main data model schema
export const matchesSchema = Type.Object({
    _id: ObjectIdSchema(),
    matchId: Type.String(),
    matchType: Type.String(),
    timestamp: Type.Number(),
    createdAt: Type.Union([Type.String({format: 'date-time'}), Type.Object({})]),
    clubs: Type.Object({}),
    players: Type.Object({}),
    aggregate: Type.Object({}),
    clubIds: Type.Union([Type.String(), Type.Array(Type.String())], {default: []}),
    playerIds: Type.Union([Type.String(), Type.Array(Type.String())], {default: []}),
    league: Type.String()
  },
  { $id: 'Matches', additionalProperties: false }
)
export type Matches = Static<typeof matchesSchema>
export const matchesValidator = getValidator(matchesSchema, dataValidator)
export const matchesResolver = resolve<Matches, HookContext>({})

export const matchesExternalResolver = resolve<Matches, HookContext>({})

// Schema for creating new entries
export const matchesDataSchema = Type.Partial(matchesSchema, {
  $id: 'MatchesData'
})
export type MatchesData = Static<typeof matchesDataSchema>
export const matchesDataValidator = getValidator(matchesDataSchema, dataValidator)
export const matchesDataResolver = resolve<Matches, HookContext>({})

// Schema for updating existing entries
export const matchesPatchSchema = Type.Partial(matchesSchema, {
  $id: 'MatchesPatch'
})
export type MatchesPatch = Static<typeof matchesPatchSchema>
export const matchesPatchValidator = getValidator(matchesPatchSchema, dataValidator)
export const matchesPatchResolver = resolve<Matches, HookContext>({})

// Schema for allowed query properties
export const matchesQueryProperties = Type.Partial(matchesSchema)
export const matchesQuerySchema = Type.Intersect(
  [
    querySyntax(matchesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: true })
  ],
  { additionalProperties: true }
)
export type MatchesQuery = Static<typeof matchesQuerySchema>
export const matchesQueryValidator = getValidator(matchesQuerySchema, queryValidator)
export const matchesQueryResolver = resolve<MatchesQuery, HookContext>({})
