import * as React from 'react'
import { connect } from 'react-redux'
import LoadTemplate from './loadTemplate'

import Ace from './ace'

const mapStateToProps = (state) => {
  return {
    source: state.templates.source
  }
}

const Editor = ({source}) => {
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

export default connect(mapStateToProps)(Editor)
