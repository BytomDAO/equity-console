// external imports
import { push } from 'react-router-redux'

import { getItemMap } from '../assets/selectors';
import { getItem } from '../accounts/selectors';
import { fetch } from '../accounts/actions';
import {
  setSource,
  updateLockError,
  showLockInputErrors
} from '../templates/actions'
import {
  areInputsValid,
  getSource,
  getContractValue,
  getInputMap,
  getContractArgs
} from '../templates/selectors'

import {
  Action,
  ControlWithAccount,
  ControlWithReceiver,
  DataWitness,
  KeyId,
  Receiver,
  SignatureWitness,
  SpendUnspentOutput,
  WitnessComponent
} from '../core/types'

import { getPromisedInputMap } from '../inputs/data'

import { client, prefixRoute, createLockingTx } from '../core'

export const UPDATE_IS_CALLING = 'contracts/UPDATE_IS_CALLING'

export const updateIsCalling = (isCalling: boolean) => {
  const type = UPDATE_IS_CALLING
  return { type, isCalling }
}

export const CREATE_CONTRACT = 'contracts/CREATE_CONTRACT'

export const create = () => {
  return (dispatch, getState) => {
    dispatch(updateIsCalling(true))
    const state = getState()
    if (!areInputsValid(state)) {
      dispatch(updateIsCalling(false))
      dispatch(showLockInputErrors(true))
      return dispatch(updateLockError('One or more arguments to the contract are invalid.'))
    }

    const inputMap = getInputMap(state)
    if (inputMap === undefined) throw "create should not have been called when inputMap is undefined"

    const source = getSource(state)
    const spendFromAccount = getContractValue(state)
    if (spendFromAccount === undefined) throw "spendFromAccount should not be undefined here"
    const assetId = spendFromAccount.assetId
    const amount = spendFromAccount.amount
    const promisedInputMap = getPromisedInputMap(inputMap)
    const promisedTemplate = promisedInputMap.then((inputMap) => {
      const args = getContractArgs(state, inputMap).map(param => {
        if (param instanceof Buffer) {
          return { "string": param.toString('hex') }
        }

        if (typeof param === 'string') {
          return { "string": param }
        }

        if (typeof param === 'number') {
          return { "integer": param }
        }

        if (typeof param === 'boolean') {
          return { 'boolean': param }
        }
        throw 'unsupported argument type ' + (typeof param)
      })
      return client.compile({ contract: source, args: args })
    })

    let futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1000)
    const promisedUtxo = promisedTemplate.then(template => {
      const receiver: Receiver = {
        controlProgram: template.program,
        expiresAt: futureDate.toISOString()
      }
      const controlWithReceiver: ControlWithReceiver = {
        type: "controlWithReceiver",
        receiver,
        assetId,
        amount
      }
      const actions: Action[] = [spendFromAccount, controlWithReceiver]
      return createLockingTx(actions) // TODO: implement createLockingTx
    })

    Promise.all([promisedInputMap, promisedTemplate, promisedUtxo]).then(([inputMap, template, utxo]) => {
      dispatch({
        type: CREATE_CONTRACT,
        controlProgram: template.program,
        source,
        template,
        inputMap,
        utxo
      })
      dispatch(fetch())
      dispatch(setSource(source))
      dispatch(updateIsCalling(false))
      dispatch(showLockInputErrors(false))
      dispatch(push(prefixRoute('/unlock')))
    }).catch(err => {
      console.log(err)
      dispatch(updateIsCalling(false))
      dispatch(updateLockError(err))
      dispatch(showLockInputErrors(true))
    })
  }
}


export const UPDATE_INPUT = 'contracts/UPDATE_INPUT'

export const updateInput = (name: string, newValue: string) => {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_INPUT,
      name: name,
      newValue: newValue
    })
  }
}
