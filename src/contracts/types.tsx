import { Input, InputMap } from '../inputs/types'

import { CompiledTemplate } from '../templates/types'

// export type Contract = {
//   // lock tx id
//   utxoId: string,
//   contractName: string,
//   contractProgram: string,
//   contractParameter: string,
//   utxoInfo?
// }
export type Contract = {
  // lock tx id
  id: string,
  unlockTxid: string,
  assetId: string,
  // assetAlias: string,
  amount: number,
  template: CompiledTemplate,
  controlProgram: string,
  contractProgram: string,
  contractArgs: string[],

  params?,

  // Map of UI Form inputs
  // used during locking tx.
  inputMap: InputMap,

  // Map of UI Form inputs
  // used during unlocking tx.
  spendInputMap: InputMap,

  // Details on the contract clauses.
  clauseList: string[],
  clauseMap: {
    [s: string]: string[]
  }
}

export type ContractMap = { [s: string]: Contract }

export type ContractsState = {
  contractMap: ContractMap,
  contract: Contract,
  firstTime: boolean,
  idList: string[],
  spendContractId: string,
  selectedClauseIndex: number,
  isCalling: boolean,
  showUnlockInputErrors: boolean,
  error?,
  utxoId: string,
  selectedContractName: string,
  selectedContractProgram: string,
}

export type HashFunction = "sha256" | "sha3"

export function hashFunctionToTypeName(hash: HashFunction): string {
  switch(hash) {
    case "sha256": return "Sha256"
    case "sha3": return "Sha3"
  }
}

export function isTypeClass(type) {
  return (type === "Primitive" || type === "TypeVariable" || type === "Hash" || type === "List")
}

export function typeToString(type): string {
  if (isTypeClass(type)) return type
  if (type === undefined) throw null
  if (typeof type === "object") {
    switch (type.type) {
      case "hashType":
        return hashFunctionToTypeName(type.hashFunction) + "<" + typeToString(type.inputType) + ">"
      case "listType":
        return "List<" + typeToString(type.elementType) + ">"
      case "typeVariable":
        return type.name
      default:
        throw new Error("unknown type")
    }
  } else {
    return type
  }
}
