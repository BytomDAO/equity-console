import * as React from 'react'
import { connect } from 'react-redux'
import { getContractTemplateName } from '../selectors'
import { getSourceMap } from '../../templates/selectors'

export const Display = (props: { source: string }) => {
  return <pre className="codeblock">{props.source}</pre>
}

export const DisplaySpendContract = connect(
  (state) => {
    const contract = getContractTemplateName(state)
    const sourceMap = getSourceMap(state)
    if (contract) {
      return { source: sourceMap[contract] }
    }
    return { source: '' }
  }
)(Display)
