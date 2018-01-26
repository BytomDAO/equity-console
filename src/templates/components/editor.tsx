import * as React from 'react'
import LoadTemplate from './loadTemplate'

import Ace from './ace'

export default () => {
  const source = `contract ContractName() locks value {
  clause clauseName() {
    unlock value
  }
}`

  return (
    <div>
      <div className="panel panel-default">
        <div className="panel-heading clearfix">
          <h1 className="panel-title pull-left">Contract Template</h1>
          <ul className="panel-heading-btns pull-right">
            <li><LoadTemplate /></li>
          </ul>
        </div>
        <Ace source={source} />
      </div>
    </div>
  )
}
