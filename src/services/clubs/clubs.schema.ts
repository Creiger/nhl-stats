// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'

// Main data model schema
export const clubsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    eaId: Type.Number(),
    name: Type.String(),
    fetchData: Type.Boolean()
  },
  { $id: 'Clubs', additionalProperties: false }
)
export type Clubs = Static<typeof clubsSchema>
export const clubsValidator = getValidator(clubsSchema, dataValidator)
export const clubsResolver = resolve<Clubs, HookContext>({})

export const clubsExternalResolver = resolve<Clubs, HookContext>({})

// Schema for creating new entries
export const clubsDataSchema = Type.Partial(clubsSchema, {
  $id: 'ClubsData'
})
export type ClubsData = Static<typeof clubsDataSchema>
export const clubsDataValidator = getValidator(clubsDataSchema, dataValidator)
export const clubsDataResolver = resolve<Clubs, HookContext>({})

// Schema for updating existing entries
export const clubsPatchSchema = Type.Partial(clubsSchema, {
  $id: 'ClubsPatch'
})
export type ClubsPatch = Static<typeof clubsPatchSchema>
export const clubsPatchValidator = getValidator(clubsPatchSchema, dataValidator)
export const clubsPatchResolver = resolve<Clubs, HookContext>({})

// Schema for allowed query properties
export const clubsQueryProperties = Type.Partial(clubsSchema)
export const clubsQuerySchema = Type.Intersect(
  [
    querySyntax(clubsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ClubsQuery = Static<typeof clubsQuerySchema>
export const clubsQueryValidator = getValidator(clubsQuerySchema, queryValidator)
export const clubsQueryResolver = resolve<ClubsQuery, HookContext>({})
