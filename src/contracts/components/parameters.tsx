import * as React from 'react'
import { connect } from 'react-redux'

import { Item as Asset } from '../../assets/types'
import { Item as Account } from '../../accounts/types'
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

const AccountAliasWidget = connect(
  (state) => ({
    accounts: [
      {
        alias: 'alice',
        id: 0
      },
      {
        alias: 'bob',
        id: 1
      }
    ]
  })
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
        <select id={'name'} className="form-control with-addon" value={'value'}>
          {options}
        </select>
      </div>
    </div>
  )
}

const AssetAliasWidget = connect(
  (state) => ({
    assets: [
      {
        alias: 'gold',
        id: 0
      },
      {
        alias: 'silver',
        id: 1
      }
    ]
  })
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
        <select id={'name'} className="form-control with-addon" value={'value'} // TODO: change id, value and handleChange
                >
          {options}
        </select>
      </div>
    </div>
  )
}

function NumberWidget(props: {}) {
  return <input type="text" className="form-control"
                style={{width: 200}}
                key={'name'} />
}

function AmountWidget(props: { input: AmountInput,
  errorClass: string,
  handleChange: (e)=>undefined }) {
  return (
    <div className={"form-group " + props.errorClass}>
      <div className="input-group">
        <div className="input-group-addon">Amount</div>
        <NumberWidget />
      </div>
    </div>
  )
}

function ValueWidget() {
  return (
    <div>
      <AccountAliasWidget/>
      <AssetAliasWidget/>
      <AmountWidget/>
    </div>
  )
}

function mapStateToContractValueProps(state) {
  return {
    valueId: "contractValue.valueInput"
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
          <ValueWidget/>
        </div>
      </form>
    </section>
  )
}
