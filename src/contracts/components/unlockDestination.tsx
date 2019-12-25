// external imports
import * as React from 'react'
import { connect } from 'react-redux'

// ivy imports
import { Input } from '../../inputs/types'
import { getWidget } from '../../contracts/components/parameters'
import { getItemMap as getAssetMap } from '../../assets/selectors'

// internal imports
import { getSpendContract, getClauseUnlockInput } from '../selectors'

// const UnlockDestination = (props: { assetMap, contract, unlockInput: Input }) => {
const UnlockDestination = (props: { assetMap, contract, lang }) => {
  // if ( props.contract === undefined || props.assetMap === undefined) {
  const lang = props.lang
  const asset = props.assetMap[props.contract.assetId]
  const assetAlias = asset ? asset.alias : props.contract.assetId
  if ( props.contract === undefined ) {
    return <div></div>
  } else {
    return (
      <section>
        <h5>{lang==='zh'?'存证方解锁目标账户':'Unlocked Value Destination'}</h5>
        {getWidget("unlockValue.accountInput")}
        <div className="form-group">
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">{lang==='zh'?'存证方':'Asset'}</span>
              </div>
            <input type="text" className="form-control" value={assetAlias} disabled />
          </div>
        </div>
        <div className="form-group">
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">{lang==='zh'?'数量':'Amount'}</span>
            </div>
            <input type="text" className="form-control" value={props.contract.amount} disabled />
          </div>
        </div>
      </section>
    )
  }
}

export default connect(
  (state) => ({ assetMap: getAssetMap(state), unlockInput: getClauseUnlockInput(state), contract: getSpendContract(state), lang: state.lang })
)(UnlockDestination)
