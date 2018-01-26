import * as React from 'react'
import DocumentTitle from 'react-document-title'

import Editor from './editor'

export default () => {
  return (
    <DocumentTitle title="Unlock Value">
      <div>
        <Editor />
        <span>Lock Value</span>
      </div>
    </DocumentTitle>
  )
}
