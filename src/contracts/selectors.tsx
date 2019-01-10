// external imports
import { createSelector } from 'reselect'
import { sha3_256 } from 'js-sha3'
import { calGas } from './decimals'

// ivy imports
import { AppState } from '../app/types'
import { CompiledTemplate } from '../templates/types'
import {calculation, strToHexCharCode} from './util'

import {
  Contract,
  ContractsState,
  ContractMap,
} from './types'

import {
  HashFunction,
  ClauseParameterType,
  Input,
  InputMap,
} from '../inputs/types'

import {
  isValidInput,
  getData,
  addParameterInput,
} from '../inputs/data'

import {
  SignatureWitness,
  SpendFromAccount,
  WitnessComponent, SpendUnspentOutput
} from '../core/types'

import _ from "lodash"

export const getAllState = (state: AppState): ContractsState => state

export const getState = (state: AppState): ContractsState => state.contracts

export const getContractTemplateName = createSelector(getState, (state) => state.selectedContractName)

export const getContractProgram = createSelector(getState, (state) => state.selectedContractProgram)

export const getUtxoId = createSelector(getState, (state) => state.utxoId)

export const getContract = createSelector(
  getState,
  (state: ContractsState) => state.contract
)

export const getIsCalling = createSelector(
  getState,
  (state: ContractsState) => state.isCalling
)

export const getSpendContractId = createSelector(
  getState,
  (state: ContractsState): string => state.utxoId
)

export const getSelectedClauseIndex = createSelector(
  getState,
  (state: ContractsState): number => {
    let selectedClauseIndex = state.selectedClauseIndex
    if (typeof selectedClauseIndex === "number") {
      return selectedClauseIndex
    } else {
      return parseInt(selectedClauseIndex, 10)
    }
  }
)

export const getContractMap = createSelector(
  getState,
  (state: ContractsState) => state.contractMap
)

export const getSpendContract = createSelector(
  getContractMap,
  getSpendContractId,
  (contractMap: ContractMap, contractId: string) => {
    const spendContract = contractMap[contractId]
    if (spendContract === undefined)
      throw "no contract for ID " + contractId
    return spendContract
  }
)

export const getShowUnlockInputErrors = createSelector(
  getState,
  (state: ContractsState): boolean => state.showUnlockInputErrors
)

export const getInputSelector = (id: string) => {
  return createSelector(
    getInputMap,
    (inputMap: InputMap) => {
      const input = inputMap[id]
      if (input === undefined) {
        throw "bad input ID: " + id
      } else {
        return input
      }
    }
  )
}

export const getSpendInputSelector = (id: string) => {
  return createSelector(
    getSpendInputMap,
    (spendInputMap: InputMap) => {
      let spendInput = spendInputMap[id]
      if (spendInput === undefined) {
        throw "bad spend input ID: " + id
      } else {
        return spendInput
      }
    }
  )
}

export const getSpendContractArgs = createSelector(
  getSpendContract,
  (contract: Contract): string[] => contract.contractArgs
)

export const getSpendInputMap = createSelector(
  getSpendContract,
  spendContract => spendContract.spendInputMap
)

export const getInputMap = createSelector(
  getSpendContract,
  spendContract => spendContract.inputMap
)

export const getParameters = createSelector(
  getSpendContract,
  spendContract => spendContract.template.params
)

export const getParameterIds = createSelector(
  getSpendContract,
  spendContract => spendContract.template.params.map(param => "contractParameters." + param.name)
)

export const getSelectedClause = createSelector(
  getSpendContract,
  getSelectedClauseIndex,
  (spendContract, clauseIndex) => {
    return spendContract.template.clause_info[clauseIndex]
  }
)

export const getUnlockAction = createSelector(
  getSpendContract,
  getSelectedClauseIndex,
  (spendContract, clauseIndex) => {
    return spendContract.unlockActions[clauseIndex]
  }
)

export const getClauseName = createSelector(
  getSelectedClause,
  clause => clause.name
)

export const getClauseParameters = createSelector(
  getSelectedClause,
  (clause) => clause.params
)

export const getClauseParameterIds = createSelector(
  getClauseName,
  getClauseParameters,
  (clauseName, clauseParameters) => {
    if (!clauseParameters) {
      return []
    }
    return clauseParameters.map(param => "clauseParameters." + clauseName + "." + param.name)
  }
)

export const getClauseParameterPrefixed = createSelector(
  getClauseName,
  (clauseName) => {
    return "clauseParameters." + clauseName + "."
  }
)

export function dataToArgString(data: number | Buffer): string {
  if (typeof data === "number") {
    let buf = Buffer.alloc(8)
    buf.writeIntLE(data, 0, 8)
    return buf.toString("hex")
  } else {
    return data.toString("hex")
  }
}

export const getClauseValueInfo = createSelector(
  getSelectedClause,
  getAllState,
  (clause, state) => {
    let value = clause.values
    if(!value){
      const valueInfo = clause.cond_values[0]

      const condition = calculation(valueInfo.condition.params, valueInfo.condition.source, state)
      if(condition) {
        value = valueInfo.true_body
      }else{
        value = valueInfo.false_body
      }
    }

    return value
  }
)

export const getRequiredPaymentInfo = createSelector(
  getSpendInputMap,
  getClauseValueInfo,
  getClauseName,
  (spendInputMap, clauseInfo, clauseName) => {
    if (clauseInfo.length < 2) {
      throw "the clause's value is invalid"
    }
    const paymentId = "clauseValue." + clauseName + "." + clauseInfo[0].name + ".valueInput."
    const paymentAccountId = spendInputMap[paymentId + "accountInput"].value
    const paymentAssetId = spendInputMap[paymentId + "assetInput"].value
    const paymentAmount = parseInt(spendInputMap[paymentId + "amountInput"].value)
    return {paymentAccountId, paymentAssetId, paymentAmount}
  }
)


export const getClauseUnlockInput = createSelector(
  // getSelectedClause,
  getSpendInputMap,
  // (clause, spendInputMap) => {
  (spendInputMap) => {
    let input
    // clause.valueInfo.forEach(value => {
    //   if (value.program === undefined) {
    input = spendInputMap["unlockValue.accountInput"]
    //   }
    // })
    return input
  }
)

// export const getUnlockAction = createSelector(
//   getSpendContract,
//   getClauseUnlockInput,
//   (contract, unlockInput) => {
//     if (unlockInput === undefined || unlockInput.value === '') {
//       return undefined
//     }
//     return {
//       type: "controlWithAddress",
//       accountId: unlockInput.value,
//       assetId: contract.assetId,
//       amount: contract.amount
//     } as ControlWithAddress
//   }
// // )
//
// export const getClauseFlag = (templateName, clausename) => {
//   const type = templateName + "." + clausename
//   switch (type) {
//     case "TradeOffer.trade":
//     case "Escrow.approve":
//     case "LoanCollateral.repay":
//     case "CallOption.exercise":
//     case "PriceChanger.changePrice":
//       return 0
//     case "TradeOffer.cancel":
//     case "Escrow.reject":
//     case "LoanCollateral.default":
//     case "CallOption.expire":
//     case "PriceChanger.redeem":
//       return 1
//     default:
//       throw "can not find the flag of clause type:" + type
//   }
// }

export const getClauseWitnessComponents = createSelector(
  getSpendInputMap,
  getClauseName,
  getClauseParameters,
  getSpendContract,
  getSelectedClause,
  getSelectedClauseIndex,
  (spendInputMap: InputMap, clauseName: string, clauseParameters, contract, clauseInfo, clauseIndex): WitnessComponent[] => {
    const witness: WitnessComponent[] = []
    clauseParameters.forEach(clauseParameter => {
      const clauseParameterPrefix = "clauseParameters." + clauseName + "." + clauseParameter.name
      switch (clauseParameter.type) {
        case "PublicKey": {
          const inputId = clauseParameterPrefix + ".publicKeyInput.provideStringInput"
          const input = spendInputMap[inputId]
          if (input !== undefined && input.type !== "provideStringInput" && input.value) {
            witness.push({ type: "data", raw_data: { value: input.value } })
          } else {
            const inputId = clauseParameterPrefix + ".publicKeyInput.accountInput"
            const input = spendInputMap[inputId]
            if (input == undefined || input.type !== "accountInput" || !input.value) {
              throw "publicKeyInput surprisingly not found for String clause parameter"
            }
            witness.push({type: "publickey_hash", accountId: input.value})
          }
          return
        }
        case "String": {
          let inputId = clauseParameterPrefix + ".stringInput.provideStringInput"
          let input = spendInputMap[inputId]
          if (input !== undefined) {
            witness.push({ type: "data", raw_data: { value: input.value } })
            return
          } else {
            inputId = clauseParameterPrefix + ".provideOriginInput"
            input = spendInputMap[inputId]
            if (input !== undefined) {
              witness.push({ type: "data", raw_data: { value: strToHexCharCode(input.value) } })
              return
            }
          }
          throw "surprisingly not found for String clause parameter"
        }
        case "Amount": {
          const inputId = clauseParameterPrefix + ".amountInput"
          const input = spendInputMap[inputId]
          if (input !== undefined) {
            witness.push({ type: "integer", raw_data: { value: parseInt(input.value) } })
            return
          }
          throw "surprisingly not found for Integer clause parameter"
        }
        case "Asset": {
          const inputId = clauseParameterPrefix + ".assetInput.assetAliasInput"
          const input = spendInputMap[inputId]
          if (input !== undefined) {
            witness.push({ type: "data", raw_data: { value: input.value } })
            return
          }
          throw "surprisingly not found for Integer clause parameter"
        }
        case "Signature": {
          const accountInputId = clauseParameterPrefix + ".signatureInput.accountInput"
          const accountinput = spendInputMap[accountInputId]
          if (accountinput === undefined || accountinput.type !== "accountInput") {
            throw "accountInput surprisingly not found"
          }
          // const passwordInputId = clauseParameterPrefix + ".signatureInput.passwordInput"
          // const passwordInput = spendInputMap[passwordInputId]
          // if (passwordInput === undefined || passwordInput.type !== "passwordInput") {
          //   throw "passwordInput surprisingly not found"
          // }
          const signatureWitness = {type: "signature", accountId: accountinput.value} as SignatureWitness
          witness.push(signatureWitness)
          return
        }
        default: {
          const val = dataToArgString(getData(clauseParameterPrefix, spendInputMap))
          witness.push({
            type: "data",
            raw_data: val
          })
          return
        }
      }
    })
    if (contract.template.clause_info.length > 1) {
      witness.push(
        { type: "integer",
          raw_data: { value: clauseIndex }
        })
    }
    return witness
  }
)

// export const getClauseMintimes = createSelector(
//   getSpendContract,
//   getSelectedClauseIndex,
//   (spendContract, clauseIndex) => {
//     const clauseName = spendContract.clauseList[clauseIndex]
//     const mintimes = spendContract.template.clause_info[clauseIndex].mintimes
//     return mintimes.map(argName => {
//       const inputMap = spendContract.inputMap
//       return new Date(inputMap["contractParameters." + argName + ".timeInput.timestampTimeInput"].value)
//     })
//   }
// )

// export const getClauseMaxtimes = createSelector(
//   getSpendContract,
//   getSelectedClauseIndex,
//   (spendContract, clauseIndex) => {
//     const clauseName = spendContract.clauseList[clauseIndex]
//     const maxtimes = spendContract.template.clause_info[clauseIndex].maxtimes
//     if (maxtimes === undefined)
//       return []
//
//     return maxtimes.map(argName => {
//       const inputMap = spendContract.inputMap
//       return new Date(inputMap["contractParameters." + argName + ".timeInput.timestampTimeInput"].value)
//     })
//   }
// )

export const areSpendInputsValid = createSelector(
  getSpendInputMap,
  getClauseParameterIds,
  getClauseUnlockInput,
  (spendInputMap, parameterIds, unlockInput) => {
    const invalid = parameterIds.filter(id => {
      return !isValidInput(id, spendInputMap)
    })
    return (invalid.length === 0) && (unlockInput === undefined || isValidInput('unlockValue.accountInput', spendInputMap))
  }
)

export const getSpendContractSource = createSelector(
  getSpendContract,
  (contract) => contract.template && contract.template.source
)

export const getSpendContractValueId = createSelector(
  getSpendContract,
  (contract) => contract.template && ("contractValue." + contract.template.value.name)
)

export const getSpendContractValue = createSelector(
  getSpendContract,
  (contract) => contract.template && contract.template.value
)

export const getClauseValueId = createSelector(
  getSpendInputMap,
  getClauseName,
  (spendInputMap, clauseName) => {
    for (const id in spendInputMap) {
      const input = spendInputMap[id]
      const inputClauseName = input.name.split('.')[1]
      if (clauseName === inputClauseName && input.value === "valueInput") {
        return input.name
      }
    }
    return undefined
  }
)

export const getRequiredAssetAmount = createSelector(
  getClauseParameterPrefixed,
  getClauseValueInfo,
  getInputMap,
  getSpendInputMap,
  (ClauseParameterPrefix, valueInfo, inputMap, spendInputMap) => {
    if (ClauseParameterPrefix === undefined) {
      return undefined
    }

    const name = ClauseParameterPrefix.split('.').pop()
    if (name === undefined) {
      return undefined
    }

    const valueArg = valueInfo.find(info => {
      return info.name === name
    })

    if (valueArg === undefined) {
      return undefined
    }

    const assetInput = inputMap["contractParameters." + valueArg.asset + ".assetInput"]
    const amountInput = inputMap["contractParameters." + valueArg.amount + ".amountInput"] || spendInputMap[ ClauseParameterPrefix+ valueArg.amount + ".amountInput" ]

    if (!(assetInput && amountInput)) {
      return undefined
    }
    return {
      assetId: assetInput.computedData,
      amount: amountInput.value
    }
  }
)

export const getParamValue = (paramName) => {
  return createSelector(
    getClauseParameters,
    getParameters,
    getSpendContractValue,
    getInputMap,
    getSpendInputMap,
    getClauseParameterPrefixed,
    getSpendContract,
    (claseParams, contractParams, contractValue, inputMap, spendInputMap, clauseParameterPrefixed, contract) => {
      let param = _.find(claseParams, {'name': paramName})

      if(param){
        const value = getData(clauseParameterPrefixed+param.name, spendInputMap)
        if (value instanceof Buffer) {
          return value.toString('hex')
        }
        return value
      }else if( _.find(contractParams, {'name': paramName}) ){
        param =  _.find(contractParams, {'name': paramName})
        const value = getData('contractParameters.'+param.name, inputMap)
        if (value instanceof Buffer) {
          return value.toString('hex')
        }
        return value
      }else{
        if(contractValue.asset === paramName){
          return contract.assetId
        }else if(contractValue.amount === paramName){
          return contract.amount
        }else{
          throw 'Unknow Parameter type.'
        }
      }
    }
  )
}

// export const getSpendUnspentOutputAction = createSelector(
//   getSpendContract,
//   getSpendInputMap,
//   ( contract, spendInputMap ) => {
//     const outputId = contract.id
//     const clauseParameters = Object.keys(spendInputMap).filter(k => k.startsWith("clauseParameters"))
//     if (clauseParameters === undefined ) {
//       return undefined
//     }
//
//     const args = [{
//         "type": "raw_tx_signature",
//         "raw_data": {
//         "xpub": spendInputMap[clauseParameters[0]].value,
//           "derivation_path": [
//             spendInputMap[clauseParameters[1]].value,
//             spendInputMap[clauseParameters[2]].value
//           ]
//       }
//     }]
//
//     const spendUnspentOutput: SpendUnspentOutput = {
//       type: "spendUnspentOutput",
//       outputId,
//       arguments: args
//     }
//     return spendUnspentOutput
//   }
// )

export const getSpendUnspentOutputAction = createSelector(
  getSpendContract,
  getClauseWitnessComponents,
  (contract, witness) => {
    const outputId = contract.id
    const spendUnspentOutput: SpendUnspentOutput = {
      type: "spendUnspentOutput",
      outputId,
      arguments: witness
    }
    return spendUnspentOutput
  }
)

export const getGasAction = createSelector(
  getSpendInputMap,
  (spendInputMap) => {
    const accountId = spendInputMap["unlockValue.accountInput"].value
    const btmUnit = spendInputMap["unlockValue.gasInput.btmUnitInput"].value
    const gasAmount = spendInputMap["unlockValue.gasInput"].value

    const gas = calGas(gasAmount, btmUnit)
    const gasAction = {
      accountId: accountId,
      amount: gas,
      type: 'spendFromAccount',
      assetId: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    } as SpendFromAccount
    return gasAction
  }
)

// export const getLockActions = createSelector(
//   getSpendContract,
//   // getClauseValueInfo,
//   (contract) => {
//     const asset = contract.assetId
//     const amount = contract.amount
//
//
//     const action: ControlWithProgram = {
//       type: "controlWithProgram",
//       assetId: asset,
//       amount: amount,
//       controlProgram: controlProgram
//     }
//     return action
//   }
// )

export const getUnlockError = createSelector(
  getState,
  (state: ContractsState) => {
    const error = state.error
    // if (typeof error === 'string') {
      return error
    // }
    // return parseError(error)
  }
)

export const isFirstTime = createSelector(
  getState,
  state => state.firstTime
)

export const generateInputMap = (compiled: CompiledTemplate): InputMap => {
  let inputs: Input[] = []
  for (const param of compiled.params) {
    switch (param.type) {
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
    addParameterInput(inputs, "Value", "contractValue." + compiled.value.name)
  }

  const inputMap = {}
  for (let input of inputs) {
    inputMap[input.name] = input
  }
  return inputMap
}

export const generateUnlockInputMap = (compiled: CompiledTemplate): InputMap => {
  let inputs: Input[] = []
  for (const param of compiled.params) {
    switch (param.type) {
      case "Sha3(PublicKey)":
      case "Sha3(String)":
      case "Sha256(PublicKey)":
      case "Sha256(String)": {
        addParameterInput(inputs, "Hash" as ClauseParameterType, "contractParameters." + param.name)
        break
      }
      default:
        addParameterInput(inputs, param.type as ClauseParameterType, "contractParameters." + param.name)
    }
  }

  if (compiled.value !== "") {
    addParameterInput(inputs, "Value", "contractValue." + compiled.value.name)
  }

  const inputMap = {}
  for (let input of inputs) {
    inputMap[input.name] = input
  }
  return inputMap
}
