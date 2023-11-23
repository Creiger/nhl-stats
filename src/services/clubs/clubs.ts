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
        console.log(clubUrl);
        try {
          const response = await axios.get(clubUrl, {
            withCredentials: true,
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
              'Accept-Encoding': 'gzip, deflate, br',
              'Accept-Language': 'cs-CZ,cs;q=0.9,en;q=0.8',
              'Cache-Control': 'max-age=0',
              'Cookie': 'ealocale=cs-cz; ak_bmsc=C2F49B2E13530289DBF9875946335E85~000000000000000000000000000000~YAAQEyhDF/yGrs+LAQAAIWvY/RXfM6MURDiB2Klg0ojWkZvoS75R/64PTd4O364QpOCF6t2AodAbLEctMgt/qnPdrMY70HaYv0nXkjIwNCPWFTDfBeTYdzyVuNZWws8NEjMRw0A/+lz91UAQgMZJxRLrwbJxtQk2mXT46kZgs4J63SHVrNyjszGvuMGbUQ1qZqot5ZkrYrdzti9ELLnzC5CW3CFn45c853yUY9GLtyPfrFb+3ysxC4NpfSR+b8+o4BaI2/AsugXdHTrQcRuHQPnJaJ7zDdKz/osCKGeI6aOCwKi1nCUN0y7Bw7Iea42VSHTjIWhRwoEnCUqGOshQhdWmfiGyE7VOryncUv1HjRyONavm6J9oP0n+Bkj1eTqzsEBBNXg=',
              'Sec-Ch-Ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
              'Sec-Ch-Ua-Mobile': '?0',
              'Sec-Ch-Ua-Platform': '"macOS"',
              'Sec-Fetch-Dest': 'document',
              'Sec-Fetch-Mode': 'navigate',
              'Sec-Fetch-Site': 'none',
              'Sec-Fetch-User': '?1',
              'Upgrade-Insecure-Requests': '1',
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
            },
          });
          let matches = response.data;
          console.log(matches);
          for (const match of matches) {
            match.createdAt = new Date(match.timestamp * 1000);
            match.matchType = matchType;
            match.clubIds = Object.keys(match.clubs);
            match.playerIds = match.clubIds.map((clubId: any) => Object.keys(match.players[clubId])).flat();
          }
          newMatches.push(...matches.filter((m: any ) => !(new Set(newMatches.map((nm: any) => nm.matchId)).has(m.matchId))));
        } catch (error) {
          console.log(error);
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
