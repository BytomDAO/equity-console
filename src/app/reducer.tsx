import { combineReducers } from 'redux'

import accounts from '../accounts'
import assets from '../assets'
import contracts from '../contracts'
import templates from '../templates'

export default function (state, action) {
  return combineReducers({
    accounts: accounts.reducer,
    assets: assets.reducer,
    contracts: contracts.reducer,
    templates: templates.reducer
  })(state, action)
}
