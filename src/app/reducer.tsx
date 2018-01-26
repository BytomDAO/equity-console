import { combineReducers } from 'redux'

import templates from '../templates'

export default function (state, action) {
  return combineReducers({
    templates: templates.reducer
  })(state, action)
}
