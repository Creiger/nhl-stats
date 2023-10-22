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
  const clubs = (<any> await app.service('clubs').find({query: {fetchData: true, $select: ['eaId']}}))?.map((club: any) => club.eaId);
  const browser = await puppeteer.launch({headless: true});
  for (const eaId of clubs) {
    for (const matchType of matchTypes) {
      const clubUrl = `${eaUrl}?platform=common-gen5&matchType=${matchType}&clubIds=${eaId}`;
      try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');
        const response = await page.goto(clubUrl);
        const matches = JSON.parse(await response?.text() || '{}');
        for (const match of matches) {
          match.createdAt = new Date(match.timestamp * 1000);
          match.matchType = matchType;
          try {
            await app.service('matches').create(match);
          } catch (e) {

          }
        }
      } catch (error) {
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
  setInterval(() => fetchMatches(app), 1000 * 60 * 1);
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [clubsPath]: ClubsService
  }
}
