// Predefined contract templates

export const BASE_TEMPLATE = `contract ContractName() locks value {
  clause clauseName() {
    unlock value
  }
}`

export const LOCK_WITH_PUBLIC_KEY = `contract LockWithPublicKey(publicKey: PublicKey) locks valueAmount of valueAsset {
  clause spend(sig: Signature) {
    verify checkTxSig(publicKey, sig)
    unlock valueAmount of valueAsset
  }
}`

export const LOCK_WITH_PUBLIC_KEY_HASH = `contract LockWithPublicKeyHash(pubKeyHash: Hash) locks valueAmount of valueAsset {
  clause spend(pubKey: PublicKey, sig: Signature) {
    verify sha3(pubKey) == pubKeyHash
    verify checkTxSig(pubKey, sig)
    unlock valueAmount of valueAsset
  }
}`

export const LOCK_WITH_MULTISIG = `contract LockWithMultiSig(publicKey1: PublicKey,
                          publicKey2: PublicKey,
                          publicKey3: PublicKey) locks valueAmount of valueAsset {
  clause spend(sig1: Signature, sig2: Signature) {
    verify checkTxMultiSig([publicKey1, publicKey2, publicKey3], [sig1, sig2])
    unlock valueAmount of valueAsset
  }
}`

export const TRADE_OFFER = `contract TradeOffer(assetRequested: Asset,
                    amountRequested: Amount,
                    seller: Program,
                    cancelKey: PublicKey) locks valueAmount of valueAsset {
  clause trade() {
    lock amountRequested of assetRequested with seller
    unlock valueAmount of valueAsset
  }
  clause cancel(sellerSig: Signature) {
    verify checkTxSig(cancelKey, sellerSig)
    unlock valueAmount of valueAsset
  }
}`

export const ESCROW = `contract Escrow(agent: PublicKey,
                sender: Program,
                recipient: Program) locks valueAmount of valueAsset {
  clause approve(sig: Signature) {
    verify checkTxSig(agent, sig)
    lock valueAmount of valueAsset with recipient
  }
  clause reject(sig: Signature) {
    verify checkTxSig(agent, sig)
    lock valueAmount of valueAsset with sender
  }
}`

export const LOAN_COLLATERAL =`contract LoanCollateral(assetLoaned: Asset,
                        amountLoaned: Amount,
                        blockHeight: Integer,
                        lender: Program,
                        borrower: Program) locks valueAmount of valueAsset {
  clause repay() {
    lock amountLoaned of assetLoaned with lender
    lock valueAmount of valueAsset with borrower
  }
  clause default() {
    verify above(blockHeight)
    lock valueAmount of valueAsset with lender
  }
}`

export const REVEAL_PREIMAGE = `contract RevealPreimage(hash: Hash) locks valueAmount of valueAsset {
  clause reveal(string: String) {
    verify sha3(string) == hash
    unlock valueAmount of valueAsset
  }
}`

export const REVEAL_FACTORS = `contract RevealFactors(product: Integer) locks value {
  clause reveal(factor1: Integer, factor2: Integer) {
    verify factor1 * factor2 == product
    unlock value
  }
}`

export const CALL_OPTION = `contract CallOption(strikePrice: Amount,
                    strikeCurrency: Asset,
                    seller: Program,
                    buyerKey: PublicKey,
                    blockHeight: Integer) locks valueAmount of valueAsset {
  clause exercise(buyerSig: Signature) {
    verify below(blockHeight)
    verify checkTxSig(buyerKey, buyerSig)
    lock strikePrice of strikeCurrency with seller
    unlock valueAmount of valueAsset
  }
  clause expire() {
    verify above(blockHeight)
    lock valueAmount of valueAsset with seller
  }
}`

export const INITIAL_SOURCE_MAP = {
  ContractName: BASE_TEMPLATE,
  LockWithPublicKey: LOCK_WITH_PUBLIC_KEY,
  LockWithPublicKeyHash: LOCK_WITH_PUBLIC_KEY_HASH,
  LockWithMultiSig: LOCK_WITH_MULTISIG,
  TradeOffer: TRADE_OFFER,
  Escrow: ESCROW,
  LoanCollateral: LOAN_COLLATERAL,
  RevealPreimage: REVEAL_PREIMAGE,
  RevealFactors: REVEAL_FACTORS,
  CallOption: CALL_OPTION
}

export const INITIAL_ID_LIST = [
  "ContractName",
  "LockWithPublicKey",
  "LockWithPublicKeyHash",
  "LockWithMultiSig",
  "TradeOffer",
  "Escrow",
  "LoanCollateral",
  "CallOption",
  "RevealPreimage",
]

export const INITIAL_ID_CHINESE_LIST = {
  LockWithPublicKey: '单签合约',
  LockWithPublicKeyHash: '单签地址合约',
  LockWithMultiSig: '多签合约',
  TradeOffer: '币币交易合约',
  Escrow: '第三方托管合约',
  LoanCollateral: '借贷合约',
  CallOption: '看涨合约',
  RevealPreimage: '猜谜合约'
}

