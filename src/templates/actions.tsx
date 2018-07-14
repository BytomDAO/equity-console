import { INITIAL_ID_LIST } from './constants'
import { client } from '../core'
import { generateInputMap } from '../contracts/selectors'
import { CompiledTemplate } from './types'

export const loadTemplate = (selected: string) => {
  return (dispatch, getState) => {
    if (!selected) {
      selected = INITIAL_ID_LIST[1]
    }
    const state = getState()
    const source = state.templates.sourceMap[selected]
    dispatch(setSource(source))
  }
}

export const SHOW_LOCK_INPUT_MESSAGES = 'templates/SHOW_LOCK_INPUT_MESSAGES'

export const showLockInputMessages = (result: boolean) => {
  return {
    type: SHOW_LOCK_INPUT_MESSAGES,
    result
  }
}

export const UPDATE_LOCK_MESSAGE = 'templates/UPDATE_LOCK_MESSAGE'

export const updateLockMessage = (error?) => {
  return {
    type: UPDATE_LOCK_MESSAGE,
    error
  }
}

export const SET_SOURCE = 'templates/SET_SOURCE'

export const setSource = (source: string) => {
  return (dispatch) => {
    const type = SET_SOURCE
    dispatch({ type, source })
    dispatch(fetchCompiled(source))
    dispatch(updateLockMessage())
  }
}

export const FETCH_COMPILED = 'templates/FETCH_COMPILED'

export const fetchCompiled = (source: string) => {
  return (dispatch, getState) => {
    client.compile(source).then(result => {
      if(result.status ==='fail'){
        throw new Error(result.data)
      }
      const type = FETCH_COMPILED
      const format = (tpl: CompiledTemplate) => {
        if (tpl.error !== '') {
          tpl.clause_info = tpl.params = []
        }
        return tpl
      }
      const compiled = format(result.data)
      const inputMap = generateInputMap(compiled)
      dispatch({ type, compiled, inputMap })
    }).catch((e) => {throw e})
  }
}
