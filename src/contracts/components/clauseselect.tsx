// external imports
import * as React from 'react'
import { connect } from 'react-redux'

// internal imports
import {getSpendContract, getSpendContractId, getSelectedClauseIndex, getClauseUnlockInput} from '../selectors'
// import { setClauseIndex } from '../actions'
import { ClauseInfo } from '../../templates/types'
import {getWidget} from "./parameters"
import {Input} from "../../inputs/types"

const ClauseSelect = (props: { unlockInput: Input}) => {
  return (
    <section>
      <h4>Clause</h4>
      {getWidget("clauseParameters.xpubInput")}
      {getWidget("clauseParameters.path1.pathInput")}
      {getWidget("clauseParameters.path2.pathInput")}
    </section>
  )
}

export default connect(
  (state) => ({
    unlockInput: getClauseUnlockInput(state),
    // spendIndex: getSelectedClauseIndex(state),
    // clauses: getSpendContract(state).template.clauseInfo,
  }),
  // { setClauseIndex }
)(ClauseSelect)
