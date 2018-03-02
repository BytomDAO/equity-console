import Client from '../sdk'

import * as types from './types'

const isProd: boolean = process.env.NODE_ENV === 'production'

export const client = new Client({
  url: 'http://localhost:9888'
})

// Parses an error from Chain Core
export const parseError = (err) => {
  if (err === undefined) {
    return ''
  }

  switch(err.code) {
    case 'CH706': {
      const body = err.body
      if (body === undefined) {
        return err.message
      }

      const data = body.data
      if (data === undefined) {
        return err.message
      }

      const actions = data.actions
      if (actions === undefined || actions.length === 0) {
        return err.message
      }
      return actions[0].message
    }
    case 'CH707': {
      return (
        'The current time fails contract validation. ' +
        'Check arguments to before() and after() function calls.'
      )
    }
    case 'CH735': {
      return 'The transaction failed validation.'
    }
    default:
      return err.message
  }
}

// Prefixes the redux router route during production builds.
export const prefixRoute = (route: string): string => {
  if (isProd) {
    return "/ivy" + route
  }
  return route
}

export const createLockingTx = (actions: types.Action[]): Promise<Object> => {
  return Promise.resolve({})
}
