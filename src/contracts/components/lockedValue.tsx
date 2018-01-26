// external imports
import * as React from 'react'
import DocumentTitle from 'react-document-title'

const LockedValueDisplay = (props: {contractIds: string[], spentContractIds: string[] }) => {
  return (
    <DocumentTitle title="Unlock Value">
      <div>
        <span>Unlock Value</span>
      </div>
    </ DocumentTitle>
  )
}

export default LockedValueDisplay
