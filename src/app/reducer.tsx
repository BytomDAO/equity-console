import { routerReducer } from 'react-router-redux'
import { combineReducers } from 'redux'

import accounts from '../accounts'
import assets from '../assets'
import contracts from '../contracts'
import templates from '../templates'

import { SETLANG } from './actions'

import { DefaultLang } from '../core/index'

export const lang = (state = DefaultLang, action) => {
  if (action.type === SETLANG) {
    return action.param
  }
  return state
}

export default function (state, action) {
  return combineReducers({
    accounts: accounts.reducer,
    assets: assets.reducer,
    contracts: contracts.reducer,
    templates: templates.reducer,
    routing: routerReducer,
    lang
  })(state, action)
}
