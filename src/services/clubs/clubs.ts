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

import puppeteer from 'puppeteer';
// @ts-ignore
import cors_proxy from 'cors-anywhere';

export * from './clubs.class'
export * from './clubs.schema'

// A configure function that registers the service and its hooks via `app.configure`

const fetchMatches = async (app: Application) => {
  const matchTypes = ['club_private'];
  const eaUrl = 'https://proclubs.ea.com/api/nhl/clubs/matches';
  const clubs = (<any> await app.service('clubs').find({query: {fetchData: true, $select: ['clubId']}}))?.map((club: any) => club.clubId);
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox']});
  for (const clubId of clubs) {
    for (const matchType of matchTypes) {
      const clubUrl = `${eaUrl}?platform=common-gen5&matchType=${matchType}&clubIds=${clubId}`;
      try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36');
        const response = await page.goto(clubUrl);
        const responseText = await response?.text();
        const matches = JSON.parse(responseText || '{}');
        for (const match of matches) {
          match.createdAt = new Date(match.timestamp * 1000);
          match.matchType = matchType;
          match.clubIds = Object.keys(match.clubs);
          match.playerIds = match.clubIds.map((clubId: any) => Object.keys(match.players[clubId])).flat();
          try {
            await app.service('matches').create(match);
          } catch (e) {
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
  await browser.close();
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
