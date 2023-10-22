// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Matches, MatchesData, MatchesPatch, MatchesQuery, MatchesService } from './matches.class'

export type { Matches, MatchesData, MatchesPatch, MatchesQuery }

export type MatchesClientService = Pick<MatchesService<Params<MatchesQuery>>, (typeof matchesMethods)[number]>

export const matchesPath = 'matches'

export const matchesMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const matchesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(matchesPath, connection.service(matchesPath), {
    methods: matchesMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [matchesPath]: MatchesClientService
  }
}
