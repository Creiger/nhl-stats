// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Clubs, ClubsData, ClubsPatch, ClubsQuery } from './clubs.schema'

export type { Clubs, ClubsData, ClubsPatch, ClubsQuery }

export interface ClubsParams extends MongoDBAdapterParams<ClubsQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class ClubsService<ServiceParams extends Params = ClubsParams> extends MongoDBService<
  Clubs,
  ClubsData,
  ClubsParams,
  ClubsPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    Model: app.get('mongodbClient').then((db) => db.collection('clubs'))
  }
}
