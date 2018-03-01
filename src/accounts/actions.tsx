// external imports
import * as React from 'react'

// ivy imports
import { client } from '../core'

// internal imports
import { FETCH } from './constants'
import { Item } from './types'

export const fetch = () => {
  return (dispatch, getState) => {
    let items: Item[] = []
    const type = FETCH

    const accountsPromise = client.listAccounts().then(result => {
      return result.data
    })
    const balancesPromise = client.listBalances().then(result => {
      return result.data
    })

    Promise.all([accountsPromise, balancesPromise]).then(([accounts, balances]) => {
      return dispatch({type, items: accounts, balances})
    })
  }
}
