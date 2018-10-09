import * as React from 'react'
import { connect } from 'react-redux'

import { getOpcodes } from '../selectors'

const mapStateToProps = (state) => {
  const opcodes = getOpcodes(state)
  const lang = state.lang
  if (opcodes === "") throw "uncaught compiler error"
  return { opcodes, lang }
}

const Opcodes = ({ opcodes, lang }) => {
  return (
    <div className="card-body inner">
      <h1>{lang==='zh'?'编译结果':'Compiled'}</h1>
      <pre className="wrap">
        { opcodes }
      </pre>
    </div>
  )
}

export default connect(
  mapStateToProps,
)(Opcodes)
