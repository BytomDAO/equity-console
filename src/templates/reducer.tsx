import { UPDATE_INPUT } from '../contracts/actions'
import { TemplateState, CompiledTemplate } from './types'
import { INITIAL_SOURCE_MAP, INITIAL_ID_LIST } from './constants'
import { SHOW_LOCK_INPUT_ERRORS, UPDATE_LOCK_ERROR, SET_SOURCE, FETCH_COMPILED } from './actions'
import { InputMap } from '../inputs/types'

const INITIAL_STATE: TemplateState = {
  sourceMap: INITIAL_SOURCE_MAP,
  idList: INITIAL_ID_LIST,
  protectedIdList: [],

  // The first ID corresponds to the base template.
  source: INITIAL_SOURCE_MAP[INITIAL_ID_LIST[1]],
  compiled: undefined,
  showLockInputErrors: false,
}

export default function (state: TemplateState = INITIAL_STATE, action): TemplateState {
  switch (action.type) {
    case UPDATE_INPUT: {
      const name = action.name
      const newValue = action.newValue
      if (state.inputMap === undefined) return state
      return {
        ...state,
        inputMap: {
          ...state.inputMap,
          [name]: {
            ...state.inputMap[name],
            value: newValue
          }
        }
      }
    }
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
    case UPDATE_LOCK_ERROR: {
      return {
        ...state,
        error: action.error
      }
    }
    case SHOW_LOCK_INPUT_ERRORS: {
      return {
        ...state,
        showLockInputErrors: action.result
      }
    }
    case "@@router/LOCATION_CHANGE":
      return {
        ...state,
        showLockInputErrors: false,
        error: undefined
      }
    default:
      return state
  }
}
