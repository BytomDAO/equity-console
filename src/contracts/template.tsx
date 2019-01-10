import { Action, SpendFromAccount, SpendUnspentOutput, ControlWithProgram, RawTxSignatureWitness } from "../core/types"
import {
  getSpendInputMap, getSpendUnspentOutputAction, getGasAction, getSpendContract, getSpendContractArgs,
  getSelectedClause, getSpendContractSource, getUnlockAction, getParamValue, getClauseValueInfo, getRequiredPaymentInfo
} from "./selectors"
import { INITIAL_SOURCE_MAP } from '../templates/constants'
import { AppState } from "../app/types"
import { client } from "../core"
import {sha3_256} from "js-sha3"
import _ from "lodash"
import { calculation, addParamType } from './util'

abstract class AbstractTemplate {

    protected state: AppState

    public passwords: string[] = []

    constructor(state: AppState) {
        this.state = state
    }

    abstract buildActions(): Promise<Action[]>

    public buildGasAction(): SpendFromAccount {
        return getGasAction(this.state)
    }

    public getPublicKeyInfo(pubkeyInfos) {
      return new Promise((resolve, reject) => {
        const spendContract = getSpendContract(this.state)
        const compiled = spendContract.template
        const params = compiled.params
        for (const i in compiled.params) {
            if (params[i].type === "PublicKey") {
                const paramName = params[i].name
                const inputId = "contractParameters." + paramName + ".publicKeyInput"
                const pubKey = spendContract.inputMap[inputId].computedData
                if( pubkeyInfos[0].pubkey === pubKey ){
                  resolve(pubkeyInfos[0])
                }
            }else if (params[i].type === "Sha3(PublicKey)") {
              const paramName = params[i].name
              const inputId = "contractParameters." + paramName + ".stringInput.generateStringInput"
              const hash = spendContract.inputMap[inputId].seed
              const pubkeyHash = sha3_256(Buffer.from( pubkeyInfos[0].pubkey, "hex"))
              if(pubkeyHash === hash){
                resolve(pubkeyInfos[0])
              }
            }
        }
        reject( "can not find public key info")
      })
    }

    getProgram(lockAction): Promise<Action[]>{
      return new Promise((resolve) => {
        const state = this.state
        let amount

        // amount
        if(_.has(lockAction, 'amount_params')){
          amount = calculation(lockAction.amount_params, lockAction.amount, state)
        }
        else{
          amount = getParamValue(lockAction.amount)(state)
        }

        // asset
        const asset = getParamValue(lockAction.asset)(state)

        if(_.has(lockAction, 'program_info')){
          const programParams = []
          for( const programExp of lockAction.program_info.params ){
            let value;
            if(_.has(programExp, 'source')){
              value = calculation(programExp.params, programExp.source, state)
            }else {
              value = getParamValue(programExp.name)(state)
            }
            programParams.push(value)
          }

          const args = programParams.map(param => {
            return addParamType(param)
          })

          const source = INITIAL_SOURCE_MAP[lockAction.program_info.name]
          client.compile(source, args).then(result=> {
            if (result.status === 'fail') {
              throw new Error(result.data)
            }
            resolve(this.buildRecipientAction(asset, amount, result.data.program))
          })
        }
        else{
          resolve(this.buildRecipientAction(asset, amount, getParamValue(lockAction.program)(state)))
        }
      })
    }

    processArgument(argument): Promise<RawTxSignatureWitness> {
        if (argument.type === "signature") {
          let xpub
          return client.createAccountPubkey(argument.accountId)
            .then(resp => {
              xpub = resp.root_xpub
              return this.getPublicKeyInfo(resp.pubkey_infos)
            })
            .then(keyData=>{
               return {
                type: "raw_tx_signature",
                   raw_data: {
                   xpub, derivation_path: keyData.derivation_path
                }
               } as RawTxSignatureWitness
             })
            .catch((e) => {throw e})
        } else if (argument.type === "publickey_hash") {
          return client.createAccountPubkey(argument.accountId)
            .then(resp => this.getPublicKeyInfo(resp.pubkey_infos))
            .then(keyInfo =>{
              return {
                 type: "data", raw_data: {value: keyInfo.pubKey}
              }
            }).catch((e) => {throw e})
        } else {
            return new Promise(resolve => {
                resolve(argument)
            })
        }
    }

    buildUnSpendOutputAction(): Promise<SpendUnspentOutput> {
      return new Promise((resolve, reject) => {
        try {
          const output = getSpendUnspentOutputAction(this.state)
          const promisedArgs = output.arguments.map(arg => this.processArgument(arg).catch((e) => {reject (e)}))
          return Promise.all(promisedArgs).then(args => {
              output.arguments = args
              resolve(output)
          }).catch((e) => {
            reject (e)
          })
        } catch (e) {
          reject (e)
        }

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
        return getRequiredPaymentInfo(this.state)
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
            return client.listReceiver(accountId).then((receiver) => {
                actions.push(this.buildRecipientAction(assetId, amount, receiver.control_program))
                actions.push(this.buildGasAction())
                return actions
            }).catch((e) => {throw e})
        }).catch((e) => {
          throw e})
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

export class PriceChangerChangePrice extends AbstractTemplate {

    constructor(state: AppState) {
        super(state)
    }

    buildActions(): Promise<Action[]> {
      const state = this.state
      const source = getSpendContractSource(state)
      const spendContractArgs = getSpendContractArgs(state)

      const spendInputMap = getSpendInputMap(state)
      const newAmount = parseInt(spendInputMap["clauseParameters.changePrice.newAmount.amountInput"].value)
      const newAsset = spendInputMap["clauseParameters.changePrice.newAsset.assetInput.assetAliasInput"].value
      const sellerKey = spendContractArgs[2]
      const sellerProg = spendContractArgs[3]
      const args = [newAmount, newAsset, sellerKey, sellerProg].map(param => {
        if (param instanceof Buffer) {
          return { "string": param.toString('hex') }
        }

        if (typeof param === 'string') {
          return { "string": param }
        }

        if (typeof param === 'number') {
          return { "integer": param }
        }

        if (typeof param === 'boolean') {
          return { 'boolean': param }
        }
        throw 'unsupported argument type ' + (typeof param)
      })
      return client.compile(source, args).then(result=>{
        if(result.status ==='fail'){
          throw new Error(result.data)
        }
        const controlProgram = result.data.program
        return this.buildUnSpendOutputAction().then(action => {
          const actions: Action[] = []
          actions.push(action)

          const contract = getSpendContract(state)
          const assetId = contract.assetId
          const amount = contract.amount

          actions.push(this.buildRecipientAction(assetId, amount, controlProgram))
          actions.push(this.buildGasAction())
          return actions
        })
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
            return client.listReceiver(accountId).then((receiver) => {
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
            return client.listReceiver(accountId).then((receiver) => {
                actions.push(this.buildRecipientAction(assetId, amount, this.borrowerProgram))
                actions.push(this.buildSpendAccountAction(paymentAssetId, paymentAmount, paymentAccountId))
                actions.push(this.buildGasAction())
                return actions
            })
        })
    }
}

export class Repay extends AbstractTemplate {

  private state

  constructor(state: AppState) {
    super(state)
    this.state = state
  }

  buildActions(): Promise<Action[]> {
    return this.buildUnSpendOutputAction().then(action => {
      let actions: Action[] = []
      actions.push(action)

      const actionSets = getClauseValueInfo(this.state)
      const length = actionSets.length

      if(length === 1){

      }
      // type: lock lock
      else if(actionSets[length-1].type === 'lock') {
        const promisedArgs = actionSets.map(lockAction => this.getProgram(lockAction).catch((e) => { throw (e) }))

        return Promise.all(promisedArgs).then(actionArray => {
          actions =  actions.concat(actionArray)

          const { paymentAccountId, paymentAssetId, paymentAmount } = this.getPaymentInfo()
          actions.push(this.buildSpendAccountAction(paymentAssetId, paymentAmount, paymentAccountId))
          actions.push(this.buildGasAction())

          return actions
        }).catch((e) => {
          throw (e)
        })
      }
      // type: lock unlock
      else if(actionSets[length-1].type === 'unlock') {

      }

      return []
    })
  }
}

export function getActionBuildTemplate(type: string, state: AppState): AbstractTemplate {
  try{
    switch (type) {
      case "LockWithPublicKey.spend":
      case "LockWithPublicKeyHash.spend":
      case "LockWithMultiSig.spend":
      case "TradeOffer.cancel":
      case "RevealPreimage.reveal":
          return new UnlockValueTemplate(state)
      case "PriceChanger.changePrice":
          return new PriceChangerChangePrice(state)
      case "CallOption.expire":
      case "Escrow.approve":
          return new LockValueWithProgramTemplate(state, getSpendContractArgs(state)[2])
      case "Escrow.reject":
          return new LockValueWithProgramTemplate(state, getSpendContractArgs(state)[1])
      case "LoanCollateral.default":
      case "PartLoanCollateral.default":
        return new LockValueWithProgramTemplate(state, getSpendContractArgs(state)[3])
      case "PriceChanger.redeem":
          return new LockPaymentUnlockValueTemplate(state, getSpendContractArgs(state)[3])
      case "TradeOffer.trade":
      case "CallOption.exercise":
          return new LockPaymentUnlockValueTemplate(state, getSpendContractArgs(state)[2])
      case "LoanCollateral.repay":
          return new LockPaymentLockValueTemplate(state, getSpendContractArgs(state)[3], getSpendContractArgs(state)[4])
      case "PartLoanCollateral.repay":
        return new Repay(state)
      default:
          throw "can not find action build template. type:" + type
    }
  } catch (e){
    throw e
  }
}