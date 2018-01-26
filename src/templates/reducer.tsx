import { TemplateState } from './types'
import { INITIAL_SOURCE_MAP, INITIAL_ID_LIST } from './constants'
import { SET_SOURCE } from './actions'

const INITIAL_STATE: TemplateState = {
  sourceMap: INITIAL_SOURCE_MAP,
  idList: INITIAL_ID_LIST,
  protectedIdList: [],

  // The first ID corresponds to the base template.
  source: INITIAL_SOURCE_MAP[INITIAL_ID_LIST[1]]
}

export default function (state: TemplateState = INITIAL_STATE, action): TemplateState {
  switch (action.type) {
    case SET_SOURCE: {
      const source = action.source
      return {
        ...state,
        source
      }
    }
    default:
      return state
  }
}
