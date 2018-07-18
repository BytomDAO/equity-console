import { ContractsState } from './types'
import { CompiledTemplate } from '../templates/types'
import {ClauseParameterType, Input, InputMap, HashFunction, ContractParameterType} from '../inputs/types'
import { addParameterInput } from '../inputs/data'
import { INITIAL_SOURCE_PRGRAM } from './constants'

// ivy imports
import { AppState } from '../app/types'
import { addDefaultInput, getPublicKeys } from '../inputs/data'
import { Contract } from './types'

// internal imports
import { CREATE_CONTRACT, UPDATE_IS_CALLING, SET_UTXO_ID, SET_CONTRACT_NAME,
  SET_UTXO_INFO,  UPDATE_CLAUSE_INPUT, SET_CLAUSE_INDEX,  UPDATE_UNLOCK_ERROR, SHOW_UNLOCK_INPUT_ERRORS, } from './actions'
import { generateInputMap } from './selectors';

export const INITIAL_STATE: ContractsState = {
  contractMap: {},
  firstTime: true,
  spendContractId: "",
  idList: [],
  selectedClauseIndex: 0,
  isCalling: false,
  showUnlockInputErrors: false,
  error: undefined,
  utxoId: '',
  selectedContractName: 'LockWithPublicKey',
  selectedContractProgram: 'ae7cac'
}

export default function reducer(state: ContractsState = INITIAL_STATE, action): ContractsState {
  switch (action.type) {
    case CREATE_CONTRACT: // reset keys etc. this is safe (the action already has this stuff)
    const controlProgram = action.controlProgram
    const template: CompiledTemplate = action.template
    const clauseNames = template.clause_info.map(clause => clause.name)
    const clauseParameterIds = {}
    const inputs: Input[] = []
    for (const clause of template.clause_info) {
      if (!clause.params) {
        clause.params = []
      }
      clauseParameterIds[clause.name] = clause.params.map(param => "clauseParameters." + clause.name + "." + param.name)
      for (let param of clause.params) {
        switch(param.type) {
          case "Sha3(PublicKey)": {
            const hashParam = {
              type: "hashType",
              inputType: "PublicKey",
              hashFunction: "sha3" as HashFunction
            }
            addParameterInput(inputs, hashParam as ClauseParameterType, "clauseParameters." + clause.name + "." + param.name)
            break
          }
          case "Sha3(String)": {
            const hashParam = {
              type: "hashType",
              inputType: "String",
              hashFunction: "sha3" as HashFunction
            }
            addParameterInput(inputs, hashParam as ClauseParameterType, "clauseParameters." + clause.name + "." + param.name)
            break
          }
          case "Sha256(PublicKey)": {
            const hashParam = {
              type: "hashType",
              inputType: "PublicKey",
              hashFunction: "sha256" as HashFunction
            }
            addParameterInput(inputs, hashParam as ClauseParameterType, "clauseParameters." + clause.name + "." + param.name)
            break
          }
          case "Sha256(String)": {
            const hashParam = {
              type: "hashType",
              inputType: "String",
              hashFunction: "sha256" as HashFunction
            }
            addParameterInput(inputs, hashParam as ClauseParameterType, "clauseParameters." + clause.name + "." + param.name)
            break
          }
          default:
            addParameterInput(inputs, param.type as ClauseParameterType, "clauseParameters." + clause.name + "." + param.name)
        }
      }

      for (const value of clause.values) {
        if (value.name === template.value) {
          // This is the unlock statement.
          // Do not add it to the spendInputMap.
          continue
        }
        addParameterInput(inputs, "Value", "clauseValue." + clause.name + "." + value.name)
      }
    }
    addDefaultInput(inputs, "accountInput", "unlockValue") // Unlocked value destination. Not always used.
    addDefaultInput(inputs, "passwordInput", "unlockValue")
    addDefaultInput(inputs, "gasInput", "unlockValue")

    const spendInputMap = {}
    const keyMap = getPublicKeys(action.inputMap)
    for (const input of inputs) {
      spendInputMap[input.name] = input
      if (input.value === "choosePublicKeyInput") {
        input.value = "argInput"
      }
    }
    const contract: Contract = {
      id: action.utxo.id,
      assetId: action.utxo.asset_id,
      amount: action.utxo.amount,
      template,
      inputMap: action.inputMap,
      contractProgram: action.contractProgram,
      controlProgram,
      clauseList: clauseNames,
      clauseMap: clauseParameterIds,
      spendInputMap,
      contractArgs: action.contractArg
    }
    return {
      ...state,
      idList: [contract.id, ...state.idList],
      contractMap: {
        ...state.contractMap,
        [contract.id]: contract
      },
      error: undefined
    }
    case UPDATE_IS_CALLING: {
      return {
        ...state,
        isCalling: action.isCalling
      }
    }
    case SET_UTXO_ID: {
      return {
        ...state,
        utxoId: action.id
      }
    }
    case SET_CONTRACT_NAME: {
      const contractName = action.name
      const contractProgram = INITIAL_SOURCE_PRGRAM[contractName]
      return {
        ...state,
        selectedContractName: contractName,
        selectedContractProgram: contractProgram,
      }
    }
    case SET_CLAUSE_INDEX: {
      return {
        ...state,
        selectedClauseIndex: action.selectedClauseIndex,
        error: undefined,
        showUnlockInputErrors: false
      }
    }
    case UPDATE_UNLOCK_ERROR: {
      return {
        ...state,
        error: action.error
      }
    }
    case SHOW_UNLOCK_INPUT_ERRORS: {
      return {
        ...state,
        showUnlockInputErrors: action.result
      }
    }
    case UPDATE_CLAUSE_INPUT: {
      // gotta find a way to make this logic shorter
      // maybe further normalizing it; maybe Immutable.js or cursors or something
      let oldContract = state.contractMap[action.contractId]
      let oldSpendInputMap = oldContract.spendInputMap
      let oldInput = oldSpendInputMap[action.name]
      if (oldInput === undefined) throw "unexpectedly undefined clause input"
      let newInput = {
        ...oldInput,
        value: action.newValue
      }
      let newSpendInputMap = {
        ...oldSpendInputMap,
        [action.name]: newInput
      }
      newSpendInputMap[action.name] = newInput
      return {
        ...state,
        ...state,
        contractMap: {
          ...state.contractMap,
          [action.contractId]: {
            ...oldContract,
            spendInputMap: newSpendInputMap
          }
        }
      }
    }
    case SET_UTXO_INFO: {
      // const utxoInfo = action.info
      // const id = utxoInfo.id
      // const assetId = utxoInfo.asset_id
      // const assetAlias = utxoInfo.asset_alias
      // const amount = utxoInfo.amount
      // const controlProgram = utxoInfo.program
      //
      // const instructions = action.instructions.split(/\n/)
      // const contractArg = []
      //
      // for (const param of instructions){
      //   const arr = param.split(/(\s+)/)
      //   if(!param.startsWith("DEPTH")){
      //     contractArg.push(arr[2])
      //   }else{
      //     break
      //   }
      // }
      // const contractProgram = instructions[contractArg.length+1].split(/(\s+)/)[2]
      // const inputs: Input[] = []
      // // const inputs = []
      // const inputMap = {}
      // const params = []
      //
      //
      // ///compile.params=[] ==> inputMap
      // contractArg.map(value => {
      //   const pubkeyParam = {
      //     type: "programInput",
      //     value: "accountInput",
      //     name: "contractParameters.Hash.programInput",
      //     computedData: value,
      //   }
      //   inputMap["contractParameters.Hash.programInput"] = pubkeyParam
      //   // inputs.push(pubkeyParam)
      //   params.push({name: "Hash.programInput", type: "Sha3(PublicKey)"})
      // })
      //
      // addDefaultInput(inputs, "passwordInput", "unlockValue")
      // addDefaultInput(inputs, "accountInput", "unlockValue")
      //
      // addDefaultInput(inputs, "argInput", "clauseParameters")
      // // addDefaultInput(inputs, "xpubInput", "clauseParameters")
      // // addDefaultInput(inputs, "pathInput", "clauseParameters.path1")
      // // addDefaultInput(inputs, "pathInput", "clauseParameters.path2")
      // const spendInputMap = {}
      // for (const input of inputs) {
      //   spendInputMap[input.name] = input
      // }
      //
      // const contract: Contract = {
      //   id,
      //   assetId,
      //   assetAlias,
      //   amount,
      //   controlProgram,
      //   contractProgram,
      //   inputMap,
      //   params,
      //   spendInputMap
      // }
      // return {
      //   ...state,
      //   contract,
      // }
    }
    case "@@router/LOCATION_CHANGE":
      const path = action.payload.pathname.split("/")
      if (path[1] === "ivy") {
        path.shift()
      }
      if (path.length > 2 && path[1] === "unlock") {
        return {
          ...state,
          utxoId: path[2],
          showUnlockInputErrors: false,
          error: undefined
        }
      }
      return {
        ...state,
        showUnlockInputErrors: false,
        error: undefined
      }
    default:
      return state
  }

}
