import { ContractsState } from './types'
import { CompiledTemplate } from '../templates/types'
import {ClauseParameterType, Input, InputMap, HashFunction, ContractParameterType} from '../inputs/types'
import { addParameterInput } from '../inputs/data'
import { INITIAL_SOURCE_PRGRAM } from './constants'

// ivy imports
import { AppState } from '../app/types'
import { addDefaultInput, getPublicKeys , addInputForType} from '../inputs/data'
import { Contract } from './types'

// internal imports
import { CREATE_CONTRACT, UPDATE_IS_CALLING, SET_UTXO_ID, SET_CONTRACT_NAME, SET_UTXO_INFO,  UPDATE_CLAUSE_INPUT} from './actions'

export const INITIAL_STATE: ContractsState = {
  // contractMap: {},
  contract: {},
  firstTime: true,
  spendContractId: "",
  selectedClauseIndex: 0,
  isCalling: false,
  showUnlockInputErrors: false,
  error: undefined,
  utxoId: '',
  utxoInfo: undefined,
  contractName: 'LockWithPublicKey',
  contractProgram: 'ae7cac'
}

export default function reducer(state: ContractsState = INITIAL_STATE, action): ContractsState {
  switch (action.type) {
    // case CREATE_CONTRACT: // reset keys etc. this is safe (the action already has this stuff)
    //   const controlProgram = action.controlProgram
    //   const hash = action.utxo.transactionId
    //   const template: CompiledTemplate = action.template
    //   const clauseNames = template.clauseInfo.map(clause => clause.name)
    //   const clauseParameterIds = {}
    //   const inputs: Input[] = []
    //   for (const clause of template.clauseInfo) {
    //     clauseParameterIds[clause.name] = clause.args.map(param => "clauseParameters." + clause.name + "." + param.name)
    //     for (let param of clause.args) {
    //       switch(param.type) {
    //         case "Sha3(PublicKey)": {
    //           const hashParam = {
    //             type: "hashType",
    //             inputType: "PublicKey",
    //             hashFunction: "sha3" as HashFunction
    //           }
    //           addParameterInput(inputs, hashParam as ClauseParameterType, "clauseParameters." + clause.name + "." + param.name)
    //           break
    //         }
    //         case "Sha3(String)": {
    //           const hashParam = {
    //             type: "hashType",
    //             inputType: "String",
    //             hashFunction: "sha3" as HashFunction
    //           }
    //           addParameterInput(inputs, hashParam as ClauseParameterType, "clauseParameters." + clause.name + "." + param.name)
    //           break
    //         }
    //         case "Sha256(PublicKey)": {
    //           const hashParam = {
    //             type: "hashType",
    //             inputType: "PublicKey",
    //             hashFunction: "sha256" as HashFunction
    //           }
    //           addParameterInput(inputs, hashParam as ClauseParameterType, "clauseParameters." + clause.name + "." + param.name)
    //           break
    //         }
    //         case "Sha256(String)": {
    //           const hashParam = {
    //             type: "hashType",
    //             inputType: "String",
    //             hashFunction: "sha256" as HashFunction
    //           }
    //           addParameterInput(inputs, hashParam as ClauseParameterType, "clauseParameters." + clause.name + "." + param.name)
    //           break
    //         }
    //         default:
    //           addParameterInput(inputs, param.type as ClauseParameterType, "clauseParameters." + clause.name + "." + param.name)
    //       }
    //     }
    //
    //     for (const value of clause.valueInfo) {
    //       if (value.name === template.value) {
    //         // This is the unlock statement.
    //         // Do not add it to the spendInputMap.
    //         continue
    //       }
    //       addParameterInput(inputs, "Value", "clauseValue." + clause.name + "." + value.name)
    //     }
    //   }
    //   addDefaultInput(inputs, "accountInput", "unlockValue") // Unlocked value destination. Not always used.
    //   const spendInputMap = {}
    //   const keyMap = getPublicKeys(action.inputMap)
    //   for (const input of inputs) {
    //     spendInputMap[input.name] = input
    //     if (input.type === "choosePublicKeyInput") {
    //       input.keyMap = keyMap
    //     }
    //   }
    //   const contract: Contract = {
    //     template: action.template,
    //     id: hash,
    //     unlockTxid: '',
    //     outputId: action.utxo.id,
    //     assetId: action.utxo.assetId,
    //     amount: action.utxo.amount,
    //     inputMap: action.inputMap,
    //     controlProgram: controlProgram,
    //     clauseList: clauseNames,
    //     clauseMap: clauseParameterIds,
    //     spendInputMap: spendInputMap
    //   }
    //   return {
    //     ...state,
    //     contractMap: {
    //       ...state.contractMap,
    //       [contract.id]: contract
    //     },
    //     error: undefined
    //   }
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
        contractName: contractName,
        contractProgram: contractProgram,
      }
    }
    case UPDATE_CLAUSE_INPUT: {
      // gotta find a way to make this logic shorter
      // maybe further normalizing it; maybe Immutable.js or cursors or something
      const oldContract = state.contract
      const oldSpendInputMap = oldContract.spendInputMap
      const oldInput = oldSpendInputMap[action.name]
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
        contract: {
          ...oldContract,
          spendInputMap: newSpendInputMap
        }
      }
    }
    case SET_UTXO_INFO: {
      const utxoInfo = action.info
      const id = utxoInfo.id
      const assetId = utxoInfo.asset_id
      const assetAlias = utxoInfo.asset_alias
      const amount = utxoInfo.amount
      const controlProgram = utxoInfo.program

      const instructions = action.instructions.split(/\n/)
      const contractArg = []

      for (const param of instructions){
        const arr = param.split(/(\s+)/)
        if(param.startsWith("DATA")){
          contractArg.push(arr[2])
        }else{
          break
        }
      }
      const contractProgram = instructions[contractArg.length+1].split(/(\s+)/)[2]
      const inputs: Input[] = []
      // const inputs = []
      const inputMap = {}
      const params = []

      contractArg.map(value => {
        const pubkeyParam = {
          type: "programInput",
          value: "accountInput",
          name: "contractParameters.Hash.programInput",
          computedData: value,
        }
        inputMap["contractParameters.Hash.programInput"] = pubkeyParam
        // inputs.push(pubkeyParam)
        params.push({name: "Hash.programInput", type: "Sha3(PublicKey)"})
      })

      addDefaultInput(inputs, "accountInput", "unlockValue") // Unlocked value destination. Not always used.
      const spendInputMap = {}
      for (const input of inputs) {
        spendInputMap[input.name] = input
      }

      const contract: Contract = {
        id: id,
        assetId: assetId,
        assetAlias: assetAlias,
        amount: amount,
        controlProgram: controlProgram,
        contractProgram: contractProgram,
        inputMap: inputMap,
        params: params,
        spendInputMap: spendInputMap
      }
      return {
        ...state,
        contract,
        utxoInfo: utxoInfo,
      }
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
