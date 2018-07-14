export type DataWitness = {
  type: "data",
  value: string
}

export type KeyId = {
  xpub: string,
  derivationPath: string[]
}

export type SignatureWitness = {
  type: "signature",
  quorum: 1,
  keys: KeyId[],
  signatures: string[]
}

export type RawTxSignatureWitness = {
  type: "raw_tx_signature",
  quorum: 1,
  keys: KeyId[],
  signatures: string[]
}

export type WitnessComponent = RawTxSignatureWitness | DataWitness | SignatureWitness

export type SigningInstruction = {
  position: number,
  witnessComponents: WitnessComponent[]
}

export type SpendFromAccount = {
  type: "spendFromAccount",
  accountId: string,
  assetId: string,
  amount: number
  password: string
}

export type SpendUnspentOutput = {
  type: "spendUnspentOutput",
  outputId: string,
  arguments?,
}

export type ControlWithAddress = {
  type: "controlWithAddress",
  accountId: string,
  assetId: string,
  amount: number
}

export type ControlWithProgram = {
  type: "controlWithProgram",
  controlProgram: string
  assetId: string,
  amount: number
}

export type Action = SpendFromAccount | ControlWithProgram | ControlWithAddress | SpendUnspentOutput
