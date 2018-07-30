import { Action, SpendFromAccount, SpendUnspentOutput, ControlWithProgram, RawTxSignatureWitness } from "../core/types"
import { getSpendInputMap, getSpendUnspentOutputAction, getGasAction, getSpendContract, getSpendContractArgs, getSelectedClause } from "./selectors";
import { AppState } from "../app/types";
import { client } from "../core";
import {sha3_256} from "js-sha3"

abstract class AbstractTemplate {

    protected state: AppState

    public passwords: string[] = []

    constructor(state: AppState) {
        this.state = state
    }

    abstract buildActions(): Promise<Action[]>

    buildGasAction(): SpendFromAccount {
        return getGasAction(this.state)
    }

    getPublicKeyInfo(pubkeyInfos) {
        const spendContract = getSpendContract(this.state)
        const compiled = spendContract.template
        const params = compiled.params
        for (const i in compiled.params) {
            if (params[i].type === "PublicKey") {
                const paramName = params[i].name
                const inputId = "contractParameters." + paramName + ".publicKeyInput"
                const pubKey = spendContract.inputMap[inputId].computedData
                if( pubkeyInfos[0].pubkey === pubKey ){
                  return pubkeyInfos[0]
                }
            }else if (params[i].type === "Sha3(PublicKey)") {
              const paramName = params[i].name
              const inputId = "contractParameters." + paramName + ".stringInput.generateStringInput"
              const hash = spendContract.inputMap[inputId].seed
              const pubkeyHash = sha3_256(Buffer.from( pubkeyInfos[0].pubkey, "hex"))
              if(pubkeyHash === hash){
                return pubkeyInfos[0]
              }
            }
        }
        throw "can not find public key info"
    }

    processArgument(argument): Promise<RawTxSignatureWitness> {
        if (argument.type === "signature") {
            return client.createAccountPubkey(argument.accountId).then(resp => {
                const xpub = resp.root_xpub
                const keyData = this.getPublicKeyInfo(resp.pubkey_infos)
                return {
                    type: "raw_tx_signature",
                    raw_data: {
                        xpub, derivation_path: keyData.derivation_path
                    }
                } as RawTxSignatureWitness
            })
        } else if (argument.type === "publickey_hash") {
            return client.createAccountPubkey(argument.accountId).then(resp => {
                const pubKey = this.getPublicKeyInfo(resp.pubkey_infos).pubkey
                return {
                    type: "data", raw_data: {value: pubKey}
                }
            })
        } else {
            return new Promise(resolve => {
                resolve(argument)
            })
        }
    }

    buildUnSpendOutputAction(): Promise<SpendUnspentOutput> {
        const output = getSpendUnspentOutputAction(this.state)
        const promisedArgs = output.arguments.map(arg => this.processArgument(arg))
        return Promise.all(promisedArgs).then(args => {
            output.arguments = args
            return output
        })
    }

    buildSpendAccountAction(asset_id: string, amount: number, account_id: string): SpendFromAccount {
        return {
            assetId: asset_id,
            amount: amount,
            accountId: account_id,
            type: "spendFromAccount"
        } as SpendFromAccount
    }

    buildRecipientAction(asset_id: string, amount: number, control_program: string): ControlWithProgram {
        return {
            assetId: asset_id,
            amount: amount,
            controlProgram: control_program,
            type: "controlWithProgram"
        } as ControlWithProgram
    }

    getPaymentInfo() {
        const clauseInfo = getSelectedClause(this.state)
        if (clauseInfo.values.length != 2) {
            throw "the clause's value is invalid"
        }
        const paymentId = "clauseValue." + clauseInfo.name + "." + clauseInfo.values[0].name + ".valueInput."
        const spendInputMap = getSpendInputMap(this.state)
        const paymentAccountId = spendInputMap[paymentId + "accountInput"].value
        const paymentAssetId = spendInputMap[paymentId + "assetInput"].value
        const paymentAmount = parseInt(spendInputMap[paymentId + "amountInput"].value)
        return { paymentAccountId, paymentAssetId, paymentAmount }
    }

    getDestinationInfo() {
        const contract = getSpendContract(this.state)
        const assetId = contract.assetId
        const amount = contract.amount
        const spendInputMap = getSpendInputMap(this.state)
        const accountId = spendInputMap["unlockValue.accountInput"].value
        return { accountId, assetId, amount }
    }
}

export class UnlockValueTemplate extends AbstractTemplate {

    buildActions(): Promise<Action[]> {
        return this.buildUnSpendOutputAction().then(action => {
            const actions: Action[] = []
            actions.push(action)
            const { accountId, assetId, amount } = this.getDestinationInfo()
            return client.createReceiver(accountId).then((receiver) => {
                actions.push(this.buildRecipientAction(assetId, amount, receiver.control_program))
                actions.push(this.buildGasAction())
                return actions
            })
        })
    }
}

export class LockValueWithProgramTemplate extends AbstractTemplate {

    private controlProgram: string

    constructor(state: AppState, controlProgram: string) {
        super(state)
        this.controlProgram = controlProgram
    }

    buildActions(): Promise<Action[]> {

        return this.buildUnSpendOutputAction().then(action => {
            const actions: Action[] = []
            actions.push(action)

            const contract = getSpendContract(this.state)
            const assetId = contract.assetId
            const amount = contract.amount

            actions.push(this.buildRecipientAction(assetId, amount, this.controlProgram))
            actions.push(this.buildGasAction())
            return actions
        })
    }
}

export class LockPaymentUnlockValueTemplate extends AbstractTemplate {

    private controlProgram: string

    constructor(state: AppState, controlProgram: string) {
        super(state)
        this.controlProgram = controlProgram
    }

    buildActions(): Promise<Action[]> {

        return this.buildUnSpendOutputAction().then(action => {
            const actions: Action[] = []
            actions.push(action)

            const { paymentAccountId, paymentAssetId, paymentAmount } = this.getPaymentInfo()
            actions.push(this.buildRecipientAction(paymentAssetId, paymentAmount, this.controlProgram))
            actions.push(this.buildSpendAccountAction(paymentAssetId, paymentAmount, paymentAccountId))

            actions.push(this.buildGasAction())

            const { accountId, assetId, amount } = this.getDestinationInfo()
            return client.createReceiver(accountId).then((receiver) => {
                actions.push(this.buildRecipientAction(assetId, amount, receiver.control_program))
                return actions
            })
        })
    }
}

export class LockPaymentLockValueTemplate extends AbstractTemplate {

    private lenderProgram: string
    private borrowerProgram: string

    constructor(state: AppState, lenderProgram: string, borrowerProgram: string) {
        super(state)
        this.lenderProgram = lenderProgram
        this.borrowerProgram = borrowerProgram
    }

    buildActions(): Promise<Action[]> {
        return this.buildUnSpendOutputAction().then(action => {
            const actions: Action[] = []
            actions.push(action)

            const { paymentAccountId, paymentAssetId, paymentAmount } = this.getPaymentInfo()
            actions.push(this.buildRecipientAction(paymentAssetId, paymentAmount, this.lenderProgram))

            const { accountId, assetId, amount } = this.getDestinationInfo()
            return client.createReceiver(accountId).then((receiver) => {
                actions.push(this.buildRecipientAction(assetId, amount, this.borrowerProgram))
                actions.push(this.buildSpendAccountAction(paymentAssetId, paymentAmount, paymentAccountId))
                actions.push(this.buildGasAction())
                return actions
            })
        })
    }
}

export function getActionBuildTemplate(type: string, state: AppState): AbstractTemplate {
    switch (type) {
        case "LockWithPublicKey.spend":
        case "LockWithPublicKeyHash.spend":
        case "LockWithMultiSig.spend":
        case "TradeOffer.cancel":
        case "RevealPreimage.reveal":
            return new UnlockValueTemplate(state)
        case "Escrow.approve":
            console.log("find template")
            return new LockValueWithProgramTemplate(state, getSpendContractArgs(state)[2])
        case "Escrow.reject":
            return new LockValueWithProgramTemplate(state, getSpendContractArgs(state)[1])
        case "CallOption.expire":
            return new LockValueWithProgramTemplate(state, getSpendContractArgs(state)[2])
        case "LoanCollateral.default":
            return new LockValueWithProgramTemplate(state, getSpendContractArgs(state)[3])
        case "TradeOffer.trade":
        case "CallOption.exercise":
            return new LockPaymentUnlockValueTemplate(state, getSpendContractArgs(state)[2])
        case "LoanCollateral.repay":
            return new LockPaymentLockValueTemplate(state, getSpendContractArgs(state)[3], getSpendContractArgs(state)[4])
        default:
            throw "can not find action build template. type:" + type
    }
}