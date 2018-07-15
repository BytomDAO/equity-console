// external imports
import { push } from 'react-router-redux'
import React from 'react'

import { getItemMap } from '../assets/selectors';
import { getItem } from '../accounts/selectors';
import { fetch } from '../accounts/actions';
import {
  setSource,
  updateLockMessage,
  showLockInputMessages,
  fetchCompiled
} from '../templates/actions'
import {
  areInputsValid,
  getSource,
  getSourceMap,
  getContractValue,
  getInputMap,
  getContractArgs,
} from '../templates/selectors'

import {
  getUtxoId,
  getSpendContract,
  getSpendUnspentOutputAction,
  getRequiredValueAction,
  getUnlockAction,
  getClauseWitnessComponents, getSpendInputMap, getContractTemplateName, generateInputMap, getSpendContractId,
} from './selectors'

import {
  Contract
} from './types'

import {
  Action,
  ControlWithAddress,
  ControlWithProgram,
  DataWitness,
  KeyId,
  Receiver,
  SignatureWitness,
  SpendUnspentOutput,
  WitnessComponent
} from '../core/types'

import { getPromisedInputMap, getPromiseCompiled } from '../inputs/data'

import { client, prefixRoute, createLockingTx, createUnlockingTx } from '../core'
import { ProgramInput } from "../inputs/types"
import { CompiledTemplate } from '../templates/types';

export const SHOW_UNLOCK_INPUT_ERRORS = 'contracts/SHOW_UNLOCK_INPUT_ERRORS'

export const showUnlockInputErrors = (result: boolean) => {
  return {
    type: SHOW_UNLOCK_INPUT_ERRORS,
    result
  }
}

export const UPDATE_UNLOCK_ERROR = 'contracts/UPDATE_UNLOCK_ERROR'

export const updateUnlockError = (error?) => {
  return {
    type: UPDATE_UNLOCK_ERROR,
    error
  }
}

export const SET_CLAUSE_INDEX = 'contracts/SET_CLAUSE_INDEX'

export const setClauseIndex = (selectedClauseIndex: number) => {
  return {
    type: SET_CLAUSE_INDEX,
    selectedClauseIndex: selectedClauseIndex
  }
}


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
      dispatch(showLockInputMessages(true))
      return dispatch(updateLockMessage({ _error: 'One or more arguments to the contract are invalid.' }))
    }

    const inputMap = getInputMap(state)
    if (inputMap === undefined) throw "create should not have been called when inputMap is undefined"

    const source = getSource(state)
    const spendFromAccount = getContractValue(state)
    if (spendFromAccount === undefined) throw "spendFromAccount should not be undefined here"
    const assetId = spendFromAccount.assetId
    const amount = spendFromAccount.amount
    const password = spendFromAccount.password

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
      return client.compile(source, args)
    })
    const promisedUtxo = promisedTemplate.then(resp => {
      if (resp.status === 'fail') {
        throw resp.data
      }
      const controlProgram = resp.data.program
      const controlWithProgram: ControlWithProgram = {
        type: "controlWithProgram",
        controlProgram,
        assetId,
        amount
      }
      const gas = {
        accountId: spendFromAccount.accountId,
        amount: 20000000,
        type: 'spendFromAccount',
        assetId: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      }
      const actions: Action[] = [spendFromAccount, controlWithProgram, gas]
      return createLockingTx(actions, password) // TODO: implement createLockingTx
    })

    Promise.all([promisedInputMap, promisedTemplate, promisedUtxo]).then(([inputMap, template, utxo]) => {
      // dispatch({
      //   type: CREATE_CONTRACT,
      //   controlProgram: template.program,
      //   source,
      //   template,
      //   inputMap,
      //   utxo
      // })
      // dispatch(fetch())
      dispatch(setSource(source))
      dispatch(updateIsCalling(false))
      dispatch(updateLockMessage(
        {
          _success: [
            "transactions has been submited successfully.",
            <a key='transactionID' href={"/dashboard/transactions/" + utxo.transactionId} target="_blank"> {utxo.transactionId}</a>
          ]
        }))
      dispatch(showLockInputMessages(true))
      // dispatch(push(prefixRoute('/unlock')))
    }).catch(err => {
      console.log(err)
      dispatch(updateIsCalling(false))
      dispatch(updateLockMessage({ _error: err }))
      dispatch(showLockInputMessages(true))
    })
  }
}

export const SPEND_CONTRACT = "contracts/SPEND_CONTRACT"

export const spend = () => {
  return (dispatch, getState) => {
    dispatch(updateIsCalling(true))
    const state = getState()
    // if (!areSpendInputsValid(state)) {
    //   dispatch(updateIsCalling(false))
    //   dispatch(showUnlockInputErrors(true))
    //   return dispatch(updateUnlockError('One or more clause arguments are invalid.'))
    // }

    const contract = getSpendContract(state)
    const assetId = contract.assetId
    const amount = contract.amount

    const lockedValueAction = getSpendUnspentOutputAction(state)
    const spendInputMap = getSpendInputMap(state)
    const accountId = spendInputMap["unlockValue.accountInput"].value

    client.createReceiver(accountId).then((receiver) => {
      const controlProgram = receiver.control_program
      const lockActions: ControlWithProgram = {
        type: "controlWithProgram",
        assetId: assetId,
        amount: amount,
        controlProgram: controlProgram
      }

      const gas = {
        accountId: accountId,
        amount: 20000000,
        type: 'spendFromAccount',
        assetId: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      }

      const actions: Action[] = [lockedValueAction, lockActions, gas]// const lockActions: Action[] = getLockActions(state)

      // const witness: WitnessComponent[] = getClauseWitnessComponents(getState())
      // return createUnlockingTx(actions, witness)

      const password = spendInputMap["unlockValue.passwordInput"].value
      return createUnlockingTx(actions, password)

    }).then((result) => {
      dispatch({
        type: SPEND_CONTRACT,
        unlockTxid: result.id
      })
      dispatch(fetch())
      dispatch(updateIsCalling(false))
      dispatch(showUnlockInputErrors(false))
      dispatch(push(prefixRoute('/unlock')))
    }).catch(err => {
      console.log(err)
      dispatch(updateIsCalling(false))
      dispatch(updateUnlockError(err))
      dispatch(showUnlockInputErrors(true))
    })


    // const reqValueAction = getRequiredValueAction(state)
    // if (reqValueAction !== undefined) {
    //   actions.push(reqValueAction)
    // }
    // const unlockAction = getUnlockAction(state)
    // if (unlockAction !== undefined) {
    //   actions.push(unlockAction)
    // }

  }
}

export const SET_UTXO_ID = 'contracts/SET_UTXO_ID'

export const setUtxoID = (utxoId: string) => {
  return (dispath, getState) => {
    dispath({
      type: SET_UTXO_ID,
      id: utxoId
    })
  }
}

export const SET_CONTRACT_NAME = 'contracts/SET_CONTRACT_NAME'

export const setContractName = (templateName: string) => {
  return (dispath, getState) => {
    const sourceMap = getSourceMap(getState())
    dispath({
      type: SET_CONTRACT_NAME,
      name: templateName
    })
  }
}

const parseInstructions = (instructions: string) => {
  const contractArg = [];
  for (const param of instructions.split(/\n/)) {
    const arr = param.split(/(\s+)/)
    if (param.startsWith("DATA")) {
      contractArg.push(arr[2])
    } else {
      break
    }
  }
  const contractProgram = instructions[contractArg.length + 1].split(/(\s+)/)[2]
  contractArg.reverse()
  return { contractArg, contractProgram }
}

const updateContractInputMap = (inputMap, name, newValue, type = "") => {
  let input;
  while (input = inputMap[name]) {
    if (input.value) {
      name += "." + input.value
    } else {
      if (type) {
        name += "." + type + "Input"
        type = ""
      } else {
        inputMap[name] = { ...inputMap[name], value: newValue }
        break;
      }
    }
  }
}

export const SET_UTXO_INFO = 'contracts/SET_UTXO_INFO'

export const fetchUtxoInfo = () => {
  return (dispatch, getState) => {
    const state = getState()
    const utxoId = getUtxoId(state)
    const source = getSourceMap(state)[getContractTemplateName(state)]

    client.listUpspentUtxos({
      id: utxoId,
      smart_contract: true
    }).then(data => {
      const utxo = data[0];
      client.decodeProgram(data[0].program).then(resp => {

        const { contractArg, contractProgram } = parseInstructions(resp.instructions);

        const promisedCompiled = getPromiseCompiled(contractArg, source)

        const promisedInputMap = promisedCompiled.then(result => {
          if (result.status === 'fail') {
            throw new Error(result.data)
          }
          const format = (tpl: CompiledTemplate) => {
            if (tpl.error !== '') {
              tpl.clause_info = tpl.params = []
            }
            return tpl
          }
          const compiled = format(result.data)
          const inputMap = generateInputMap(compiled)
          for (let i = 0; i < compiled.params.length; i++) {
            const params = compiled.params;
            let newValue = contractArg[i];
            if (params[i].type === "PublicKey" || params[i].type === "Program") {
              // TODO shenao mock accountId
              newValue = "0G1R52O1G0A02";
            }
            updateContractInputMap(inputMap, "contractParameters." + params[i].name, newValue);
          }
          updateContractInputMap(inputMap, "contractValue." + compiled.value, utxo.asset_id, "asset");
          updateContractInputMap(inputMap, "contractValue." + compiled.value, utxo.amount, "amount");

          return getPromisedInputMap(inputMap)
        })

        Promise.all([promisedInputMap, promisedCompiled]).then(([inputMap, compiled]) => {
          if (compiled.status !== "success") {
            throw "compile failed";
          }
          const template = compiled.data;
          dispatch({
            type: CREATE_CONTRACT,
            controlProgram: template.program,
            contractProgram,
            source,
            template,
            inputMap,
            utxo
          })
        })
      })
    })
    dispatch(push(prefixRoute('/unlock/' + utxoId)))
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

export const UPDATE_CLAUSE_INPUT = 'contracts/UPDATE_CLAUSE_INPUT'

export const updateClauseInput = (name: string, newValue: string) => {
  return (dispatch, getState) => {
    const state = getState()
    const contractId = getSpendContractId(state)
    dispatch({
      type: UPDATE_CLAUSE_INPUT,
      contractId: contractId,
      name: name,
      newValue: newValue
    })
  }
}
