import * as React from 'react'
import DocumentTitle from 'react-document-title'
import { connect } from 'react-redux'

import Section from '../../app/components/section'

import UnlockButton from './unlockButton'
import { DisplaySpendContract } from './display'

import {getContractTemplateName, getUtxoId} from '../selectors'

const mapStateToProps = (state) => {
  const contractName = getContractTemplateName(state)
  const utxoId = getUtxoId(state)
  return { error: null, display: contractName && utxoId }
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
        {/*<ContractValue />*/}
        {/*<SpendInputs />*/}
      </div>
    )

    details = (
      <div className="form-wrapper with-subsections">
        {/*<ClauseSelect />*/}
        {/*<ClauseValue />*/}
        {/*<ClauseParameters />*/}
        {/*<UnlockDestination />*/}
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
