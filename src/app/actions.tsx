// external imports
import * as React from 'react'
import accounts from '../accounts'
import assets from '../assets'

export const SEED: string = "app/SEED"

export const seed = () => {
  return (dispatch, getState) => {
    dispatch(accounts.actions.fetch())
    dispatch(assets.actions.fetch())
  }
}

export const SETLANG: string = "app/SET_LANG"

export const setlang = (lang: string) => {
  return (dispath) => {
    dispath({
      type: SETLANG,
      param: lang
    })
  }
}
