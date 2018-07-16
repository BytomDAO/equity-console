import * as React from 'react'
import DocumentTitle from 'react-document-title'
import { connect } from 'react-redux'

import Section from '../../app/components/section'

import UnlockButton from './unlockButton'
import { DisplaySpendContract } from './display'

import SpendInputs from './argsDisplay'
import UnlockDestination from './unlockDestination'
import UnlockValue from './unlockValue'
import ClauseSelect from './clauseselect'
import {getContractTemplateName, getContractProgram, getUtxoId, getUtxoInfo, getContract, getUnlockError, getContractMap, getSpendContractId} from '../selectors'
import { ContractValue } from './argsDisplay'
import {fetchUtxoInfo, setContractName, setUtxoID} from "../actions"
import { ClauseValue, ClauseParameters } from './parameters'

const mapStateToProps = (state) => {
  const error = getUnlockError(state)
  const contractProgram = getContractProgram(state)
  const map = getContractMap(state)
  const id = getSpendContractId(state)
  const display = map[id] !== undefined && map[id].contractProgram === contractProgram
  return { error, display }
}

export const Unlock = ({ error, display }) => {
  let summary = (<div className="table-placeholder">No Contract Found</div>)
  let details = (<div className="table-placeholder">No Details Found</div>)
  let button

  if (display) {
    summary = (
      <div className="form-wrapper with-subsections">
        <section>
          <h4>Contract Template</h4>
          <DisplaySpendContract />
        </section>
        <ContractValue />
        <SpendInputs />
      </div>
    )

    details = (
      <div className="form-wrapper with-subsections">
        <ClauseSelect />
        <ClauseValue />
        <ClauseParameters />
        <UnlockDestination />
        <UnlockValue />
      </div>
    )
  }

  return (
    <DocumentTitle title="Unlock Value">
      <div>
        <Section name="Contract Summary">
          {summary}
        </Section>
        <Section name="Unlocking Details">
          {details}
        </Section>
        <UnlockButton />
      </div>
    </DocumentTitle>
  )
}

export default connect(
  mapStateToProps
)(Unlock)
