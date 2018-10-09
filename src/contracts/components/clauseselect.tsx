// external imports
import * as React from 'react'
import { connect } from 'react-redux'

// internal imports
import { getSpendContract, getSpendContractId, getSelectedClauseIndex, getClauseUnlockInput } from '../selectors'
// import { setClauseIndex } from '../actions'
import { ClauseInfo } from '../../templates/types'
import { getWidget } from "./parameters"
import { setClauseIndex } from '../actions'
import { Input } from "../../inputs/types"

const ClauseSelect = (props: {
  contractId: string, clauses: ClauseInfo[],
  setClauseIndex: (number) => undefined, spendIndex: number,
  lang: string
}) => {
  return (
    <section>
      <h5>{props.lang==='zh'?'函数':'Clause'}</h5>
      <select className="form-control" value={props.spendIndex} onChange={(e) => props.setClauseIndex(e.target.value)}>
        {props.clauses.map((clause, i) => <option key={clause.name} value={i}>{clause.name}</option>)}
      </select>
    </section>
  )
}

export default connect(
  (state) => ({
    spendIndex: getSelectedClauseIndex(state),
    clauses: getSpendContract(state).template.clause_info,
    contractId: getSpendContractId(state),
    lang: state.lang
  }),
  { setClauseIndex }
)(ClauseSelect)
