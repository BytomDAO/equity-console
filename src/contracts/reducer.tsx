import { ContractsState } from './types'
import { CompiledTemplate } from '../templates/types'
import { ClauseParameterType, Input, InputMap, HashFunction } from '../inputs/types'
import { addParameterInput } from '../inputs/data'

// ivy imports
import { AppState } from '../app/types'
import { addDefaultInput, getPublicKeys } from '../inputs/data'
import { Contract } from './types'

// internal imports
import { CREATE_CONTRACT, UPDATE_IS_CALLING } from './actions'

export const INITIAL_STATE: ContractsState = {
  contractMap: {},
  firstTime: true,
  spendContractId: "",
  selectedClauseIndex: 0,
  isCalling: false,
  showUnlockInputErrors: false,
  error: undefined
}

export default function reducer(state: ContractsState = INITIAL_STATE, action): ContractsState {
  switch (action.type) {
    case CREATE_CONTRACT: // reset keys etc. this is safe (the action already has this stuff)
      const controlProgram = action.controlProgram
      const hash = action.utxo.transactionId
      const template: CompiledTemplate = action.template
      const clauseNames = template.clauseInfo.map(clause => clause.name)
      const clauseParameterIds = {}
      const inputs: Input[] = []
      for (const clause of template.clauseInfo) {
        clauseParameterIds[clause.name] = clause.args.map(param => "clauseParameters." + clause.name + "." + param.name)
        for (let param of clause.args) {
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

        for (const value of clause.valueInfo) {
          if (value.name === template.value) {
            // This is the unlock statement.
            // Do not add it to the spendInputMap.
            continue
          }
          addParameterInput(inputs, "Value", "clauseValue." + clause.name + "." + value.name)
        }
      }
      addDefaultInput(inputs, "accountInput", "unlockValue") // Unlocked value destination. Not always used.
      const spendInputMap = {}
      const keyMap = getPublicKeys(action.inputMap)
      for (const input of inputs) {
        spendInputMap[input.name] = input
        if (input.type === "choosePublicKeyInput") {
          input.keyMap = keyMap
        }
      }
      const contract: Contract = {
        template: action.template,
        id: hash,
        unlockTxid: '',
        outputId: action.utxo.id,
        assetId: action.utxo.assetId,
        amount: action.utxo.amount,
        inputMap: action.inputMap,
        controlProgram: controlProgram,
        clauseList: clauseNames,
        clauseMap: clauseParameterIds,
        spendInputMap: spendInputMap
      }
      return {
        ...state,
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
    default:
      return state
  }

}
