// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  matchesDataValidator,
  matchesPatchValidator,
  matchesQueryValidator,
  matchesResolver,
  matchesExternalResolver,
  matchesDataResolver,
  matchesPatchResolver,
  matchesQueryResolver
} from './matches.schema'

import type { Application } from '../../declarations'
import { MatchesService, getOptions } from './matches.class'
import { matchesPath, matchesMethods } from './matches.shared'

export * from './matches.class'
export * from './matches.schema'
// https://proclubs.ea.com/api/nhl/clubs/matches?clubIds=39855&platform=ps4&matchType=club_private
// A configure function that registers the service and its hooks via `app.configure`
export const matches = (app: Application) => {
  // Register our service on the Feathers application
  app.use(matchesPath, new MatchesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: matchesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(matchesPath).hooks({
    around: {
      all: [
        // authenticate('jwt'),
        schemaHooks.resolveExternal(matchesExternalResolver),
        schemaHooks.resolveResult(matchesResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(matchesQueryValidator), schemaHooks.resolveQuery(matchesQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(matchesDataValidator), schemaHooks.resolveData(matchesDataResolver)],
      patch: [schemaHooks.validateData(matchesPatchValidator), schemaHooks.resolveData(matchesPatchResolver)],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [matchesPath]: MatchesService
  }
}
