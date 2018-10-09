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
      <div className="card panel-default">
        <div className="card-header clearfix">
          <h1 className="card-title float-left">{ lang ==='zh'? '合约模版' :'Contract Template' }</h1>
          <ul className="panel-heading-btns float-right">
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
