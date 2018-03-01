import { CompiledTemplate } from '../templates/types'

import {
  HashFunction,
  ClauseParameterType,
  Input,
  InputMap,
  ProgramInput,
  ValueInput
} from '../inputs/types'
import { AppState } from '../app/types'

import {
  Contract,
  ContractsState,
  ContractMap,
} from './types'

import {
  isValidInput,
  getData,
  addParameterInput,
} from '../inputs/data'

export const getState = (state: AppState): ContractsState => state.contracts

export const generateInputMap = (compiled: CompiledTemplate): InputMap => {
  let inputs: Input[] = []
  for (const param of compiled.params) {
    switch(param.type) {
      case "Sha3(PublicKey)": {
        const hashParam = {
          type: "hashType",
          inputType: "PublicKey",
          hashFunction: "sha3" as HashFunction
        }
        addParameterInput(inputs, hashParam as ClauseParameterType, "contractParameters." + param.name)
        break
      }
      case "Sha3(String)": {
        const hashParam = {
          type: "hashType",
          inputType: "String",
          hashFunction: "sha3" as HashFunction
        }
        addParameterInput(inputs, hashParam as ClauseParameterType, "contractParameters." + param.name)
        break
      }
      case "Sha256(PublicKey)": {
        const hashParam = {
          type: "hashType",
          inputType: "PublicKey",
          hashFunction: "sha256" as HashFunction
        }
        addParameterInput(inputs, hashParam as ClauseParameterType, "contractParameters." + param.name)
        break
      }
      case "Sha256(String)": {
        const hashParam = {
          type: "hashType",
          inputType: "String",
          hashFunction: "sha256" as HashFunction
        }
        addParameterInput(inputs, hashParam as ClauseParameterType, "contractParameters." + param.name)
        break
      }
      default:
        addParameterInput(inputs, param.type as ClauseParameterType, "contractParameters." + param.name)
    }
  }

  if (compiled.value !== "") {
    addParameterInput(inputs, "Value", "contractValue." + compiled.value)
  }

  const inputMap = {}
  for (let input of inputs) {
    inputMap[input.name] = input
  }
  return inputMap
}
