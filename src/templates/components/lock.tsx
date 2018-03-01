import * as React from 'react'
import { connect } from 'react-redux'
import DocumentTitle from 'react-document-title'

import Section from '../../app/components/section'
import Editor from './editor'

import { ContractValue } from '../../contracts/components/parameters'

import { getSource, getContractParameters, getCompiled } from '../selectors'

const mapStateToProps = (state) => {
  const compiled = getCompiled(state)
  const instantiable = compiled && compiled.error === ''
  const contractParameters = getContractParameters(state)
  const hasParams = contractParameters && contractParameters.length > 0
  return { instantiable, hasParams }
}

const Lock = (instantiable, hasParams) => {
  let instantiate
  if (instantiable) {
    instantiate = (
      <div>
        <Section name="Value to Lock">
          <div className="form-wrapper">
            <ContractValue />
          </div>
        </Section>
      </div>
    )
  } else {
    instantiate = ( <div /> )
  }

  return (
    <DocumentTitle title="Lock Value">
      <div>
        <Editor />
        {instantiate}
      </div>
    </DocumentTitle>
  )
}

export default connect(
  mapStateToProps,
)(Lock)
