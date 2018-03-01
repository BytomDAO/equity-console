import { combineReducers } from 'redux'

import accounts from '../accounts'
import templates from '../templates'

export default function (state, action) {
  return combineReducers({
    accounts: accounts.reducer,
    templates: templates.reducer
  })(state, action)
}
