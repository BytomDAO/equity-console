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

export const SET_SOURCE = 'templates/SET_SOURCE'

export const setSource = (source: string) => {
  return (dispatch) => {
    const type = SET_SOURCE
    dispatch({ type, source })
    dispatch(fetchCompiled(source))
  }
}

export const FETCH_COMPILED = 'templates/FETCH_COMPILED'

export const fetchCompiled = (source: string) => {
  return (dispatch, getState) => {
    client.compile(source).then(result => {
      const type = FETCH_COMPILED
      const format = (tpl: CompiledTemplate) => {
        if (tpl.error !== '') {
          tpl.clauseInfo = tpl.params = []
        }
        return tpl
      }
      const compiled = format(result)
      const inputMap = generateInputMap(compiled)
      dispatch({ type, compiled, inputMap })
    }).catch((e) => {throw e})
  }
}
