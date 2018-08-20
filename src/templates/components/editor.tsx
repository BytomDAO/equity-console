import * as React from 'react'
import { connect } from 'react-redux'
import LoadTemplate from './loadTemplate'
import Opcodes from './opcodes'
import { getCompiled, getSource } from '../selectors'

import Ace from './ace'

const mapStateToProps = (state) => {
  return {
    compiled: getCompiled(state),
    source: state.templates.source,
    lang: state.lang
  }
}

const Editor = ({ compiled, source, lang }) => {
  return (
    <div>
      <div className="panel panel-default">
        <div className="panel-heading clearfix">
          <h1 className="panel-title pull-left">{ lang ==='zh'? '合约模版' :'Contract Template' }</h1>
          <ul className="panel-heading-btns pull-right">
            <li><LoadTemplate /></li>
          </ul>
        </div>
        <Ace source={source} />
        { compiled && compiled.error === "" && <Opcodes />}
      </div>
    </div>
  )
}

export default connect(mapStateToProps)(Editor)
