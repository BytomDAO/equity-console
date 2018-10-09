// external imports
import * as React from 'react'
import DocumentTitle from 'react-document-title'
import Section from '../../app/components/section'
import { Link } from 'react-router-dom'

import { connect } from 'react-redux'

import { setUtxoID, setContractName, fetchUtxoInfo } from '../actions'
import { Contract } from '../types'
import {getContractMap, getSpendContractId} from "../selectors"

const mapStateToProps = (state) => {
  const map = getContractMap(state)
  const id = getSpendContractId(state)
  const contract =  map[id]
  return {
    lang: state.lang,
    idList: state.templates.idList,
    contractName: state.contracts.selectedContractName,
    utxoId: state.contracts.utxoId,
    contract
  }
}

const mapDispatchToContractInputProps = (dispatch) => {
  return {
    handleUtxoChange: (e) => {
      dispatch(setUtxoID(e.target.value.toString()))
    },
    handleTemplateChange: (e) => {
      dispatch(setContractName(e.target.value.toString()))
    },
    fetch: () => {
      dispatch(fetchUtxoInfo())
    }
  }
}


const SuccessMessage = (props: {  contract: Contract }) => {
  let jsx = <small />
  const contract = props.contract
  if (contract && contract.unlockTxid) {
    jsx = (
      <div style={{margin: '25px 0'}} className="alert alert-success" role="success">
        <span className="sr-only">Success:</span>
        <span className="glyphicon glyphicon-ok" style={{marginRight: "5px"}}></span>
        <div>
          Lock Transaction UTXO Id: { contract.id }
        </div>
        <div>
          Unlock Transaction: <a href={"/dashboard/transactions/" + contract.unlockTxid} target="_blank">{ contract.unlockTxid }</a>
        </div>
      </div>
    )
  }
  return jsx
}


const LockedValueDisplay = (props: {
  idList: string[],
  lang:string,
  contractName: string,
  utxoId: string,
  contract: Contract,
  handleUtxoChange: (e)=>undefined,
  handleTemplateChange: (e)=>undefined,
  fetch: (e)=>undefined
}) => {
  const lang = props.lang
  const options = props.idList.slice(1).map(id => {
    return <option key={id} value={id}>{id}</option>
  })

  const td = <button className="btn btn-lg btn-primary" onClick={props.fetch}>{ lang==='zh'?'解锁资产':'Unlock'}</button>
  return (
    <DocumentTitle title={ lang==='zh'?'合约解锁':"Unlock Value"}>
      <div>
        <Section name="UTXO ID">
          <div className={"form-group"}>
            <input type="text" className="form-control string-input"
                   value={props.utxoId}
                   onChange={props.handleUtxoChange}/>
          </div>

          {/* <div className={"form-group"}>
            <div className="input-group">
              <div className="input-group-prepend">Contract Template</div>
              <select className="form-control with-addon" value={props.contractName} onChange={props.handleTemplateChange}>
                {options}
              </select>
            </div>
          </div> */}
        </Section>
        <div>{td}</div>
        <SuccessMessage contract={props.contract} />
      </div>
    </ DocumentTitle>
  )
}

export default connect(mapStateToProps, mapDispatchToContractInputProps)(LockedValueDisplay)
