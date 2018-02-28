import { TemplateState, CompiledTemplate } from './types'
import { INITIAL_SOURCE_MAP, INITIAL_ID_LIST } from './constants'
import { SET_SOURCE, FETCH_COMPILED } from './actions'
import { InputMap } from '../inputs/types'

const INITIAL_STATE: TemplateState = {
  sourceMap: INITIAL_SOURCE_MAP,
  idList: INITIAL_ID_LIST,
  protectedIdList: [],

  // The first ID corresponds to the base template.
  source: INITIAL_SOURCE_MAP[INITIAL_ID_LIST[1]],
  compiled: undefined,
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
    case FETCH_COMPILED: {
      const compiled: CompiledTemplate = action.compiled
      const inputMap: InputMap = action.inputMap
      return {
        ...state,
        compiled,
        inputMap
      }
    }
    default:
      return state
  }
}
