import * as React from 'react'
import DocumentTitle from 'react-document-title'

import Section from '../../app/components/section'
import Editor from './editor'

import { ContractValue } from '../../contracts/components/parameters'

export default () => {
  const instantiate = (
    <div>
      <Section name="Value to Lock">
        <div className="form-wrapper">
          <ContractValue />
        </div>
      </Section>
    </div>
  )

  return (
    <DocumentTitle title="Unlock Value">
      <div>
        <Editor />
        <span>Lock Value</span>
        {instantiate}
      </div>
    </DocumentTitle>
  )
}
