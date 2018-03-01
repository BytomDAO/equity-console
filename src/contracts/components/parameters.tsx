import * as React from 'react'
import { connect } from 'react-redux'

import { getShowLockInputErrors, getParameterIds, getInputMap, getContractValueId } from '../../templates/selectors'

import { updateInput } from '../actions'
import { Item as Asset } from '../../assets/types'
import { getItemMap as getAssetMap, getItemList as getAssets } from '../../assets/selectors'
import { Item as Account } from '../../accounts/types'
import { getBalanceMap, getItemList as getAccounts, getBalanceSelector } from '../../accounts/selectors'
import { getState as getContractsState } from '../../contracts/selectors'
import {
  Input, InputContext, ParameterInput, NumberInput, BooleanInput, StringInput,
  ProvideStringInput, GenerateStringInput, HashInput,
  TimeInput, TimestampTimeInput,
  PublicKeyInput, GeneratePublicKeyInput, ProvidePublicKeyInput, GeneratePrivateKeyInput, GenerateHashInput,
  ProvideHashInput, InputType, ComplexInput, SignatureInput, GenerateSignatureInput,
  ProvideSignatureInput, ProvidePrivateKeyInput,
  ValueInput, AccountAliasInput, AssetAliasInput, AssetInput, AmountInput,
  ProgramInput, ChoosePublicKeyInput, KeyData
} from '../../inputs/types'
import { validateInput, computeDataForInput, getChild,
  getParameterIdentifier, getInputContext } from '../../inputs/data'

function getChildWidget(input: ComplexInput) {
  return getWidget(getChild(input))
}

function ParameterWidget(props: { input: ParameterInput, handleChange: (e)=>undefined }) {
  // handle the fact that clause arguments look like spend.sig rather than sig
  const parameterName = getParameterIdentifier(props.input)
  // const valueType = typeToString(props.input.valueType)
  return (
    <div key={props.input.name}>
      <label>{parameterName}: <span className='type-label'>{'test'}</span></label>
      {getChildWidget(props.input)}
    </div>
  )
}

function mapToInputProps(showError: boolean, inputsById: {[s: string]: Input}, id: string) {
  const input = inputsById[id]
  if (input === undefined) {
    throw "bad input ID: " + id
  }

  let errorClass = ''
  const hasInputError = !validateInput(input)
  if (showError && hasInputError) {
    errorClass = 'has-error'
  }
  if (input.type === "generateSignatureInput") {
    return {
      input,
      errorClass,
      computedValue: "",
    }
  }

  return {
    input,
    errorClass
  }
}

function mapStateToContractInputProps(state, ownProps: { id: string }) {
  const inputMap = getInputMap(state)
  if (inputMap === undefined) {
    throw "inputMap should not be undefined when contract inputs are being rendered"
  }
  const showError = getShowLockInputErrors(state)
  return mapToInputProps(showError, inputMap, ownProps.id)
}

const AccountAliasWidget = connect(
  (state) => ({ accounts: getAccounts(state) })
)(AccountAliasWidgetUnconnected)

function AccountAliasWidgetUnconnected(props: {
  input: AccountAliasInput,
  errorClass: string,
  handleChange: (e) => undefined,
  accounts: Account[]
}) {
  const options = props.accounts.map(account => <option key={account.id} value={account.id}>{account.alias}</option>)
  if (options.length === 0) {
    options.push(<option key="" value="">No Accounts Available</option>)
  } else {
    options.unshift(<option key="" value="">Select Account</option>)
  }
  return (
    <div className={"form-group " + props.errorClass}>
      <div className="input-group">
        <div className="input-group-addon">Account</div>
        <select id={props.input.name} className="form-control with-addon"
                value={props.input.value} onChange={props.handleChange}>
          {options}
        </select>
      </div>
    </div>
  )
}

const AssetAliasWidget = connect(
  (state) => ({ assets: getAssets(state) })
)(AssetAliasWidgetUnconnected)

function AssetAliasWidgetUnconnected(props: {
  input: AssetAliasInput,
  errorClass: string,
  handleChange: (e) => undefined,
  assets: Asset[]
}) {
  const options = props.assets.map(asset => <option key={asset.id} value={asset.id}>{asset.alias}</option>)
  if (options.length === 0) {
    options.push(<option key="" value="">No Assets Available</option>)
  } else {
    options.unshift(<option key="" value="">Select Asset</option>)
  }
  return (
    <div className={"form-group " + props.errorClass}>
      <div className="input-group">
        <div className="input-group-addon">Asset</div>
        <select id={props.input.name} className="form-control with-addon"
                value={props.input.value} onChange={props.handleChange}>
          {options}
        </select>
      </div>
    </div>
  )
}

function NumberWidget(props: { input: NumberInput | AmountInput,
  handleChange: (e)=>undefined }) {
  return <input type="text" className="form-control" style={{width: 200}} key={props.input.name}
                value={props.input.value} onChange={props.handleChange} />
}

function AmountWidget(props: { input: AmountInput,
  errorClass: string,
  handleChange: (e)=>undefined }) {
  return (
    <div className={"form-group " + props.errorClass}>
      <div className="input-group">
        <div className="input-group-addon">Amount</div>
        <NumberWidget input={props.input} handleChange={props.handleChange} />
      </div>
    </div>
  )
}

function mapDispatchToContractInputProps(dispatch, ownProps: { id: string }) {
  return {
    handleChange: (e) => {
      dispatch(updateInput(ownProps.id, e.target.value.toString()))
    }
  }
}

export function getWidget(id: string): JSX.Element {
  let inputContext = id.split(".").shift() as InputContext
  let type = id.split(".").pop() as InputType
  let widgetTypeConnected
  if (inputContext === "contractParameters" || inputContext === "contractValue") {
    widgetTypeConnected = connect(
      mapStateToContractInputProps,
      mapDispatchToContractInputProps
    )(getWidgetType(type))
  } else {
    // widgetTypeConnected = connect(
    //   mapStateToSpendInputProps,
    //   mapDispatchToSpendInputProps
    // )(getWidgetType(type))
  }
  return (
    <div className="widget-wrapper" key={"container(" + id + ")"}>
      {React.createElement(widgetTypeConnected, { key: "connect(" + id + ")", id: id })}
    </div>
  )
}

function getWidgetType(type: InputType): ((props: { input: Input, handleChange: (e)=>undefined }) => JSX.Element) {
  switch (type) {
    case "numberInput": return NumberWidget
    // case "booleanInput": return BooleanWidget
    // case "stringInput": return StringWidget
    // case "generateStringInput": return GenerateStringWidget
    // case "provideStringInput": return TextWidget
    // case "publicKeyInput": return PublicKeyWidget
    // case "signatureInput": return SignatureWidget
    // case "generateSignatureInput": return GenerateSignatureWidget
    // case "generatePublicKeyInput": return GeneratePublicKeyWidget
    // case "generatePrivateKeyInput": return GeneratePrivateKeyWidget
    // case "providePublicKeyInput": return TextWidget
    // case "providePrivateKeyInput": return TextWidget
    // case "provideSignatureInput": return TextWidget
    // case "hashInput": return HashWidget
    // case "provideHashInput": return TextWidget
    // case "generateHashInput": return GenerateHashWidget
    // case "timeInput": return TimeWidget
    // case "timestampTimeInput": return TimestampTimeWidget
    // case "programInput": return ProgramWidget
    case "valueInput": return ValueWidget
    case "accountInput": return AccountAliasWidget
    case "assetInput": return AssetAliasWidget
    case "amountInput": return AmountWidget
    case "assetInput": return AssetAliasWidget
    case "amountInput": return AmountWidget
    case "amountInput": return AmountWidget
    // case "programInput": return ProgramWidget
    // case "choosePublicKeyInput": return ChoosePublicKeyWidget
    default: return ParameterWidget
  }
}

const InsufficientFundsAlert = connect(
  (state, ownProps: { namePrefix: string }) => ({
    balance: getBalanceSelector(ownProps.namePrefix)(state),
    inputMap: getInputMap(state),
    contracts: getContractsState(state)
  })
)(InsufficientFundsAlertUnconnected)

function InsufficientFundsAlertUnconnected({ namePrefix, balance, inputMap, contracts }) {
  let amountInput
  if (namePrefix.startsWith("contract")) {
    amountInput = inputMap[namePrefix + ".amountInput"]
  } else if (namePrefix.startsWith("clause")) {
    // THIS IS A HACK
    const spendInputMap = contracts.contractMap[contracts.spendContractId].spendInputMap
    amountInput = spendInputMap[namePrefix + ".valueInput.amountInput"]
  }
  let jsx = <small/>
  if (balance !== undefined && amountInput && amountInput.value) {
    if (balance < amountInput.value) {
      jsx = (
        <div style={{width: '300px'}}className="alert alert-danger" role="alert">
          Insufficient Funds
        </div>
      )
    }
  }
  return jsx
}

const BalanceWidget = connect(
  (state, ownProps: { namePrefix: string }) => ({ balance: getBalanceSelector(ownProps.namePrefix)(state) })
)(BalanceWidgetUnconnected)

function BalanceWidgetUnconnected({ namePrefix, balance }) {
  let jsx = <small/>
  if (balance !== undefined) {
    jsx = <small className="value-balance">{balance} available</small>
  }
  return jsx
}

function ValueWidget(props: { input: ValueInput, handleChange: (e)=>undefined }) {
  return (
    <div>
      {/*<EmptyCoreAlert />*/}
      <InsufficientFundsAlert namePrefix={props.input.name} />
      {getWidget(props.input.name + ".accountInput")}
      {getWidget(props.input.name + ".assetInput")}
      {getWidget(props.input.name + ".amountInput")}
      <BalanceWidget namePrefix={props.input.name} />
    </div>
  )
}

function mapStateToContractValueProps(state) {
  return {
    valueId: getContractValueId(state)
  }
}

export const ContractValue = connect(
  mapStateToContractValueProps
)(ContractValueUnconnected)

function ContractValueUnconnected(props: { valueId: string }) {
  if (props.valueId === undefined) {
    return <div></div>
  }
  return (
    <section style={{wordBreak: 'break-all'}}>
      <form className="form">
        <div className="argument">
          {getWidget(props.valueId)}
          {/*<ValueWidget/>*/}
        </div>
      </form>
    </section>
  )
}
