import { client } from '../core'
import { FETCH } from './constants'
import { Item } from './types'

export const fetch = () => {
  let items: Item[] = []
  return (dispatch, getState) => {
    client.listAssets().then(result => {
      dispatch({
        type: FETCH,
        items: result.data
      })
    })
  }
}
