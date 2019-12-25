// external imports
import * as React from 'react'
import { connect } from 'react-redux'
import { typeToString } from '../types'

// ivy imports
import { getItemMap as getAssetMap } from '../../assets/selectors'
import { getItemMap as getAccountMap } from '../../accounts/selectors'
import { getChild, getParameterIdentifier,
         getGenerateStringInputValue, computeDataForInput } from '../../inputs/data'
import { Input, ParameterInput, NumberInput, BooleanInput, StringInput, ProvideStringInput,
         GenerateStringInput, HashInput, TimeInput, TimestampTimeInput, PublicKeyInput,
         GeneratePublicKeyInput, ProvidePublicKeyInput, GenerateHashInput, ProvideHashInput,
         InputType, ComplexInput, ValueInput, AssetAliasInput, AccountAliasInput, AssetInput,
         AmountInput, ProgramInput } from '../../inputs/types'

// internal imports
import { getInputMap, getInputSelector, getSpendContractValueId, getParameterIds } from '../selectors'

function getChildWidget(input: ComplexInput) {
  return getWidget(getChild(input))
}

function ParameterWidget(props: { input: ParameterInput }) {
  return <div key={props.input.name}>
    <label>{getParameterIdentifier(props.input)}: <span className='type-label'>{typeToString(props.input.valueType)}</span></label>
    <div>{getChildWidget(props.input)}</div>
  </div>
}

function GeneratePublicKeyWidget(props: { input: GeneratePublicKeyInput, computedValue: string }) {
  return <div>
      <pre>{props.computedValue}</pre>
      <div className="nested">
      <div className="description">derived from:</div>
      <label className="type-label">PrivateKey</label>
    {getChildWidget(props.input)}
  </div></div>
}

function ValueWidget(props: { input: ValueInput }) {
  return <div>
    {getWidget(props.input.name + ".assetInput")}
    {getWidget(props.input.name + ".amountInput")}
  </div>
}

function AssetWidget(props: { input: string }) {
  return <div className="form-group">
    <div className="input-group">
      <div className="input-group-prepend">
        <span className="input-group-text">Asset</span>
      </div>
      <input type="text" className="form-control" value={props.input} disabled />
    </div>
  </div>
}

function AssetAliasWidgetUnconnected(props: { input: AssetInput, lang: string, assetMap: {[s: string]: any}}) {
  const asset = props.assetMap[props.input.computedData]
  return <div className="form-group">
    <div className="input-group">
      <div className="input-group-prepend"><span className="input-group-text">{props.lang==='zh'?'存证方':'Asset'}</span></div>
      <input type="text" className="form-control" value={asset !== undefined ? asset.alias : props.input.computedData} disabled />
    </div>
  </div>
}

const AssetAliasWidget = connect(
  (state) => ({ assetMap: getAssetMap(state) })
)(AssetAliasWidgetUnconnected)

function AccountAliasWidgetUnconnected(props: { input: AccountAliasInput, accountMap: {[s: string]: any}}) {
  return <pre>{props.accountMap[props.input.value].alias}</pre>
}

const AccountAliasWidget = connect(
  (state) => ({ accountMap: getAccountMap(state) })
)(AccountAliasWidgetUnconnected)

function AmountWidget(props: { input: Input, lang: string }) {
return <div className="form-group">
  <div className="input-group">
    <div className="input-group-prepend">
      <span className="input-group-text">{props.lang==='zh'?'数量':'Amount'}</span>
    </div>
    <input type="text" className="form-control" value={props.input.value} disabled />
  </div>
</div>
}

function TextWidget(props: { input: Input }) {
  return <div><pre>{props.input.value}</pre></div>
}

function ComputedWidget(props: { input: ProgramInput }) {
  return <div>
    <pre>{props.input.computedData}</pre>
  </div>
}

function GenerateHashWidget(props: { input: GenerateHashInput, computedValue: string }) {
  return <div>
    <pre>{props.computedValue}</pre>
    <div className="nested">
      <div className="description">{props.input.hashType.hashFunction} of:</div>
      <label className="type-label">{typeToString(props.input.hashType.inputType)}</label>
      {getChildWidget(props.input)}
    </div>
  </div>
}

function ParentWidget(props: { input: ComplexInput }) {
  return getChildWidget(props.input)
}

function TimestampTimeWidget(props: { input: TimestampTimeInput }) {
  return <pre>{props.input.value}</pre> // super lazy for now!
}

function GenerateStringWidget(props: { input: GenerateStringInput }) {
  return <div><pre>{getGenerateStringInputValue(props.input)}</pre></div>
}

function getWidgetType(type: InputType): ((props: { input: Input }) => JSX.Element) {
  switch (type) {
    case "stringInput":
    case "hashInput":
    case "timeInput":
      return ParentWidget
    case "generatePublicKeyInput": return GeneratePublicKeyWidget
    case "generateHashInput": return GenerateHashWidget
    case "timestampTimeInput": return TimestampTimeWidget
    case "generateStringInput": return GenerateStringWidget
    case "valueInput": return ValueWidget
    case "amountInput": return AmountWidget
    case "accountInput": return AccountAliasWidget
    case "assetInput": return AssetAliasWidget
    case "programInput":
    case "publicKeyInput": return ComputedWidget
    case "numberInput":
    case "booleanInput":
    case "provideStringInput":
    case "providePublicKeyInput":
    case "provideHashInput":
    case "generatePrivateKeyInput":
    case "providePrivateKeyInput":
    case "accountInput":
    case "providePrivateKeyInput":
    case "amountInput": return AmountWidget
    default: return ParameterWidget
  }
}

function getWidget(id: string): JSX.Element {
  let type = id.split(".").pop() as InputType
  let widgetTypeConnected = connect(
    (state) => ({ input: getInputSelector(id)(state), lang: state.lang })
  )(getWidgetType(type))
  if (type === "generateHashInput" || type === "generatePublicKeyInput") {
    widgetTypeConnected = connect(
      (state) => {
        return {
          input: getInputSelector(id)(state),
          lang: state.lang,
          computedValue: computeDataForInput(id, getInputMap(state))
        }
      }
    )(getWidgetType(type))
  }
  return React.createElement(widgetTypeConnected, { key: "connect(" + id + ")", id: id })
}

function mapStateToContractValueProps(state) {
  return {
    lang: state.lang,
    valueId: getSpendContractValueId(state)
  }
}

function ContractValueUnconnected(props: { valueId: string , lang: string}) {
  return (
    <section style={{wordBreak: 'break-all'}}>
      <h5>{props.lang ==='zh'?'锁定存证方':'Locked Value'}</h5>
      <form className="form">
        <div className="argument">{getWidget(props.valueId)}</div>
      </form>
    </section>
  )
}

export const ContractValue = connect(
  mapStateToContractValueProps
)(ContractValueUnconnected)

function SpendInputsUnconnected(props: { spendInputIds: string[] , lang: string}) {
  if (props.spendInputIds.length === 0) return <div />
  const spendInputWidgets = props.spendInputIds.map((id) => {
    return <div key={id} className="argument">
      {getWidget(id)}
      </div>
  })
  return (
    <section style={{ wordBreak: 'break-all'}}>
      <h5>{props.lang ==='zh'?'合约参数':'Contract Arguments'}</h5>
      <form className="form">
        {spendInputWidgets}
      </form>
    </section>
  )
}

const SpendInputs = connect(
  (state) => ({ spendInputIds: getParameterIds(state), lang: state.lang })
)(SpendInputsUnconnected)

export default SpendInputs
