export type DataWitness = {
  type: "data",
  raw_data?
}

export type KeyId = {
  xpub: string,
  derivationPath: string[]
}

export type SignatureWitness = {
  type: "signature",
  accountId: string,
  password: string
}

export type RawTxSignatureWitness = {
  type: "raw_tx_signature",
  raw_data?,
}

export type WitnessComponent = DataWitness | SignatureWitness | RawTxSignatureWitness

export type SigningInstruction = {
  position: number,
  witnessComponents: WitnessComponent[]
}

export type SpendFromAccount = {
  type: "spendFromAccount",
  accountId: string,
  assetId: string,
  amount: number
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
