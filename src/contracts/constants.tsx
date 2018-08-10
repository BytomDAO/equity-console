export const INITIAL_SOURCE_PRGRAM = {
  LockWithPublicKey: "ae7cac",
  LockWithPublicKeyHash: "5279aa887cae7cac",
  LockWithMultiSig: "537a547a526bae71557a536c7cad",
  TradeOffer: "547a6413000000007b7b51547ac1631a000000547a547aae7cac",
  Escrow: "537a641a000000537a7cae7cac6900c3c251557ac16328000000537a7cae7cac6900c3c251547ac1",
  RevealPreimage: "7caa87",
  LoanCollateral: "557a641b000000007b7b51557ac16951c3c251557ac163260000007bcd9f6900c3c251567ac1",
  CallOption: "557a6420000000547acda069547a547aae7cac69007c7b51547ac1632c000000547acd9f6900c3c251567ac1",
}

export const INITIAL_PROGRAM_CLAUSE = {
  LockWithPublicKey: {
      clauseMap:[
        { name:"Xpub", type:"xpubInput" },
        { name:"DerivationPath", type:"pathInput" }
      ],
      contractArgs:[
        { name : "pubKeyHash", type: "Sha3(PublicKey)" }
      ]
  },
  LockWithPublicKeyHash: "5279aa887cae7cac",
  LockWithMultiSig: "537a547a526bae71557a536c7cad",
  TradeOffer: "547a6413000000007b7b51547ac1631a000000547a547aae7cac",
  Escrow: "537a641a000000537a7cae7cac6900c3c251557ac16328000000537a7cae7cac6900c3c251547ac1",
  RevealPreimage: "7caa87",
}

export const INITIAL_PRGRAM_NAME = {
   "ae7cac": "LockWithPublicKey",
   "5279aa887cae7cac": "LockWithPublicKeyHash",
   "537a547a526bae71557a536c7cad": "LockWithMultiSig",
   "547a6413000000007b7b51547ac1631a000000547a547aae7cac": "TradeOffer",
   "537a641a000000537a7cae7cac6900c3c251557ac16328000000537a7cae7cac6900c3c251547ac1": "Escrow",
   "7caa87": "RevealPreimage",
   "557a641b000000007b7b51557ac16951c3c251557ac163260000007bcd9f6900c3c251567ac1": "LoanCollateral",
    "557a6420000000547acda069547a547aae7cac69007c7b51547ac1632c000000547acd9f6900c3c251567ac1": "CallOption"
}

export const BTM_ASSET_ID = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
