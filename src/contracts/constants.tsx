export const INITIAL_SOURCE_PRGRAM = {
  LockWithPublicKey: "ae7cac",
  LockWithPublicKeyHash: "5279aa887cae7cac",
  LockWithMultiSig: "537a547a526bae71557a536c7cad",
  TradeOffer: "547a641300000000007251557ac1631a000000547a547aae7cac",
  Escrow: "537a641b000000537a7cae7cac690000c3c251567ac1632a000000537a7cae7cac690000c3c251557ac1",
  RevealPreimage: "7caa87",
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
  TradeOffer: "547a641300000000007251557ac1631a000000547a547aae7cac",
  Escrow: "537a641b000000537a7cae7cac690000c3c251567ac1632a000000537a7cae7cac690000c3c251557ac1",
  RevealPreimage: "7caa87",
}

export const INITIAL_PRGRAM_NAME = {
   "ae7cac": "LockWithPublicKey",
   "5279aa887cae7cac": "LockWithPublicKeyHash",
   "537a547a526bae71557a536c7cad": "LockWithMultiSig",
   "547a641300000000007251557ac1631a000000547a547aae7cac": "TradeOffer",
   "537a641b000000537a7cae7cac690000c3c251567ac1632a000000537a7cae7cac690000c3c251557ac1": "Escrow",
   "7caa87": "RevealPreimage",
}
