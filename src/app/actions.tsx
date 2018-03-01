// external imports
import * as React from 'react'
import accounts from '../accounts'

export const SEED: string = "app/SEED"

export const seed = () => {
  return (dispatch, getState) => {
    dispatch(accounts.actions.fetch())
  }
}
