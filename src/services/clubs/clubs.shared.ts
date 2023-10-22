// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Clubs, ClubsData, ClubsPatch, ClubsQuery, ClubsService } from './clubs.class'

export type { Clubs, ClubsData, ClubsPatch, ClubsQuery }

export type ClubsClientService = Pick<ClubsService<Params<ClubsQuery>>, (typeof clubsMethods)[number]>

export const clubsPath = 'clubs'

export const clubsMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const clubsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(clubsPath, connection.service(clubsPath), {
    methods: clubsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [clubsPath]: ClubsClientService
  }
}
