import { INITIAL_ID_LIST } from './constants'

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
  }
}
