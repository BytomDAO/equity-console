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
  getCompiled,
  getContractArgs,
  getContractParameters,
  getTemplate,
} from '../templates/selectors'

import {
  getUtxoId,
  getSpendContract,
  getSpendUnspentOutputAction,
  getUnlockAction,
  getClauseWitnessComponents,
  getSpendInputMap,
  getContractTemplateName,
  generateUnlockInputMap,
  getSpendContractId,
  areSpendInputsValid
  getSelectedClause,
  getClauseName,
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
  SignatureWitness, SpendFromAccount,
  SpendUnspentOutput,
  WitnessComponent
} from '../core/types'

import { getPromisedInputMap, getPromiseCompiled } from '../inputs/data'

import { client, prefixRoute, createLockingTx, createUnlockingTx } from '../core'
import { CompiledTemplate } from '../templates/types';
import { ProgramInput } from "../inputs/types"
import templates from "../templates"
import { INITIAL_ID_LIST } from "../templates/constants"
import { getActionBuildTemplate } from './template';
import { INITIAL_PRGRAM_NAME } from './constants';

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
    const spendFromAccountArray = getContractValue(state) || []
    const spendFromAccount = spendFromAccountArray[2]
    if (spendFromAccount === undefined) throw "spendFromAccount should not be undefined here"
    const assetId = spendFromAccount.assetId
    const amount = spendFromAccount.amount
    const password = spendFromAccountArray[0]
    const gas = spendFromAccountArray[1]

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
      const gasAction: SpendFromAccount = {
        accountId: spendFromAccount.accountId,
        amount: gas,
        type: 'spendFromAccount',
        assetId: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      }
      const actions: Action[] = [spendFromAccount, controlWithProgram, gasAction]
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

    if (!areSpendInputsValid(state)) {
      dispatch(updateIsCalling(false))
      dispatch(showUnlockInputErrors(true))
      return dispatch(updateUnlockError('One or more clause arguments are invalid.'))
    }

    const templateName = getContractTemplateName(state)
    const clauseName = getClauseName(state)
    const contract = getSpendContract(state)

    const actionTemplate = getActionBuildTemplate(templateName + "." + clauseName, state)
    actionTemplate.buildActions().then(actions => {
      const spendInputMap = getSpendInputMap(state)
      const password = spendInputMap["unlockValue.passwordInput"].value
      return createUnlockingTx(actions, [password])
    }).then((result) => {
      if (result.status === "fail") {
        throw result.msg
      }

      if(result.status === 'sign') {
        dispatch(updateIsCalling(false))
        dispatch(updateUnlockError(
          ["Sign Compelete failed. It might be your passsword is wrong, or need more sign.",
            <div><a key='PopupModalGeneratedTransactionID' data-toggle="modal" data-target="#myModal" >Generated Transactions JSON</a></div>,
            <div className="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" style={{color: "#333"}}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 className="modal-title" id="myModalLabel">Generated Json</h4>
                  </div>
                  <div className="modal-body" style={{wordBreak: 'break-all'}}>
                    {result.hex}
                  </div>
                </div>
              </div>
            </div>,
            <div><a key='SubmitTransaction' href="/dashboard/transactions/create" target="_blank">Submit Transactions</a></div>
          ]
        ))
        dispatch(showUnlockInputErrors(true))
      }else {
        dispatch({
          type: SPEND_CONTRACT,
          id: contract.id,
          unlockTxid: result.id
        })
        dispatch(fetch())
        dispatch(updateIsCalling(false))
        dispatch(showUnlockInputErrors(false))
        dispatch(push(prefixRoute('/unlock')))
      }
    }).catch(err => {
      console.log(err)
      dispatch(updateIsCalling(false))
      dispatch(updateUnlockError(err))
      dispatch(showUnlockInputErrors(true))
    })
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
  const contractArg: string[] = []
  const instructionsArray = instructions.split(/\n/)

  for (const param of instructionsArray) {
    const arr = param.split(/(\s+)/)
    if (!param.startsWith("DEPTH")) {
      contractArg.push(arr[2])
    } else {
      break
    }
  }
  const contractProgram = instructionsArray[contractArg.length + 1].split(/(\s+)/)[2]
  contractArg.reverse()
  return { contractArg, contractProgram }
}

const updateContractInputMap = (inputMap, name, newValue, type = "") => {
  let input
  while (input = inputMap[name]) {
    if (input.value) {
      name += "." + input.value
    } else {
      if (type) {
        name += "." + type + "Input"
        type = ""
      } else {
        inputMap[name] = { ...inputMap[name], value: newValue }
        break
      }
    }
  }
}

export const SET_UTXO_INFO = 'contracts/SET_UTXO_INFO'

export const litterEndToBigEnd = (hexNum : string):string => {
  if (hexNum.length % 2 !== 0) {
    hexNum = "0" + hexNum
  }
  let newNum = ""
  for (let i = hexNum.length - 2; i >= 0; i -= 2) {
    newNum += hexNum.substr(i, 2)
  }
  return newNum
}

export const fetchUtxoInfo = () => {
  return (dispatch, getState) => {
    const state = getState()
    const utxoId = getUtxoId(state)

    client.listUpspentUtxos({
      id: utxoId,
      smart_contract: true
    }).then(data => {
      const utxo = data[0];
      client.decodeProgram(data[0].program).then(resp => {

        const { contractArg, contractProgram } = parseInstructions(resp.instructions);
        const contractName = INITIAL_PRGRAM_NAME[contractProgram]
        dispatch(setContractName(contractName))

        const source = getSourceMap(state)[contractName]

        const promisedCompiled = getPromiseCompiled(source)

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
          const inputMap = generateUnlockInputMap(compiled)
          for (let i = 0; i < compiled.params.length; i++) {
            const params = compiled.params
            let newValue = contractArg[i]
            switch (params[i].type) {
              case "PublicKey": {
                const inputId = "contractParameters." + params[i].name + "." + "publicKeyInput"
                inputMap[inputId] = { ...inputMap[inputId], computedData: newValue }
                break
              }
              case "Program":{
                const inputId = "contractParameters." + params[i].name + "." + "programInput"
                inputMap[inputId] = { ...inputMap[inputId], computedData: newValue }
                break
              }
              case "Sha3(PublicKey)":
              case "Sha3(String)":
              case "Sha256(PublicKey)":
              case "Sha256(String)":{
                const inputId = "contractParameters." + params[i].name + ".stringInput.generateStringInput"
                inputMap[inputId] = { ...inputMap[inputId], seed: newValue }
                break
              }
              case "Integer":
              case "Amount":{
                newValue = parseInt(litterEndToBigEnd(newValue), 16).toString()
                updateContractInputMap(inputMap, "contractParameters." + params[i].name, newValue);
                break
              }
              default:
                updateContractInputMap(inputMap, "contractParameters." + params[i].name, newValue);

            }
          }
          updateContractInputMap(inputMap, "contractValue." + compiled.value, utxo.asset_id, "asset");
          updateContractInputMap(inputMap, "contractValue." + compiled.value, utxo.amount, "amount");

          return inputMap
        })

        Promise.all([promisedInputMap, promisedCompiled]).then(([inputMap, compiled]) => {
          if (compiled.status !== "success") {
            throw "compile failed";
          }
          const template = compiled.data
          dispatch({
            type: CREATE_CONTRACT,
            controlProgram: template.program,
            contractProgram,
            source,
            template,
            inputMap,
            utxo,
            contractArg
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
