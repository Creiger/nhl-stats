// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  clubsDataValidator,
  clubsPatchValidator,
  clubsQueryValidator,
  clubsResolver,
  clubsExternalResolver,
  clubsDataResolver,
  clubsPatchResolver,
  clubsQueryResolver
} from './clubs.schema'

import type { Application } from '../../declarations'
import { ClubsService, getOptions } from './clubs.class'
import { clubsPath, clubsMethods } from './clubs.shared'

// @ts-ignore
import cors_proxy from 'cors-anywhere';
import axios from "axios";

export * from './clubs.class'
export * from './clubs.schema'

// A configure function that registers the service and its hooks via `app.configure`

const fetchMatches = async (app: Application) => {
  const matchTypes = ['club_private'];
  const eaUrl = 'https://proclubs.ea.com/api/nhl/clubs/matches';
  try {
    const clubs = (<any>await app.service('clubs').find({
      query: {
        fetchData: true,
        $select: ['clubId']
      }
    }))?.map((club: any) => club.clubId);
    const newMatches: any = [];
    for (const clubId of clubs) {
      for (const matchType of matchTypes) {
        const clubUrl = `${eaUrl}?platform=common-gen5&matchType=${matchType}&clubIds=${clubId}`;
        try {
          const response = await axios.get(clubUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
              'Accept-Encoding': 'gzip, deflate, br',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive'
            },
          });
          let matches = response.data;
          for (const match of matches) {
            match.createdAt = new Date(match.timestamp * 1000);
            match.matchType = matchType;
            match.clubIds = Object.keys(match.clubs);
            match.playerIds = match.clubIds.map((clubId: any) => Object.keys(match.players[clubId])).flat();
          }
          newMatches.push(...matches.filter((m: any ) => !(new Set(newMatches.map((nm: any) => nm.matchId)).has(m.matchId))));
        } catch (error) {
        }
      }
    }
    const existingMatches: any = await app.service('matches').find({
      paginate: false,
      query: {
        matchId: {$in: newMatches.map((match: any) => match.matchId)},
        $select: ['matchId']
      }
    });
    const insertMatches = newMatches.filter((m: any) => !existingMatches.find((em: any) => em.matchId === m.matchId));
    try {
      if (insertMatches.length) {
        await app.service('matches').create(insertMatches);
      }
    } catch (e) {
    }
  } catch (e) {
    console.log(e);
  }
}

export const clubs = (app: Application) => {
  // Register our service on the Feathers application
  app.use(clubsPath, new ClubsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: clubsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(clubsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(clubsExternalResolver),
        schemaHooks.resolveResult(clubsResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(clubsQueryValidator), schemaHooks.resolveQuery(clubsQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(clubsDataValidator), schemaHooks.resolveData(clubsDataResolver)],
      patch: [schemaHooks.validateData(clubsPatchValidator), schemaHooks.resolveData(clubsPatchResolver)],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
  fetchMatches(app);
  setInterval(() => fetchMatches(app), 1000 * 60 * 2);
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [clubsPath]: ClubsService
  }
}
