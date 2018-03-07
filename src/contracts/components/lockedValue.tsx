// external imports
import * as React from 'react'
import DocumentTitle from 'react-document-title'
import Section from '../../app/components/section'

import { connect } from 'react-redux'

import { createSample, setUtxoID, setContractName } from '../actions'

const mapStateToProps = (state) => {
  return {
    idList: state.templates.idList,
    contractName: state.contracts.contractName
  }
}

const mapDispatchToContractInputProps = (dispatch) => {
  return {
    handleUtxoChange: (e) => {
      dispatch(setUtxoID(e.target.value.toString()))
    },
    handleTemplateChange: (e) => {
      dispatch(setContractName(e.target.value.toString()))
    }
  }
}

const LockedValueDisplay = (props: {
  idList: string[],
  contractName: string,
  handleUtxoChange: (e)=>undefined,
  handleTemplateChange: (e)=>undefined,
}) => {
  const options = props.idList.slice(1).map(id => {
    return <option key={id} value={id}
                   selected={props.contractName == id ? 'selected' : ''}>{id}</option>
  })

  const td = <td><button className="btn btn-primary btn-lg form-button">Unlock</button></td>

  return (
    <DocumentTitle title="Unlock Value">
      <div>
        <Section name="UTXO Params">
          <div className={"form-group"}>
            <label>UTXO ID:</label>
            <input type="text" className="form-control string-input" onChange={props.handleUtxoChange}/>
          </div>

          <div className={"form-group"}>
            <div className="input-group">
              <div className="input-group-addon">Contract Template</div>
              <select className="form-control with-addon" onChange={props.handleTemplateChange}>
                {options}
              </select>
            </div>
          </div>
        </Section>
        <div><table><tbody><tr>{td}</tr></tbody></table></div>
      </div>
    </ DocumentTitle>
  )
}

export default connect(mapStateToProps, mapDispatchToContractInputProps)(LockedValueDisplay)
