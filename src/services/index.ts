import { clubs } from './clubs/clubs'
import { user } from './users/users'
import { matches } from './matches/matches'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(clubs)
  app.configure(user)
  app.configure(matches)
  // All services will be registered here
}
