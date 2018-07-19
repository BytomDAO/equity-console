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
  setClauseIndex: (number) => undefined, spendIndex: number
}) => {
  return (
    <section>
      <h4>Clause</h4>
      {/*<select className="form-control" value={props.spendIndex} onChange={(e) => props.setClauseIndex(e.target.value)}>*/}
        {/*{props.clauses.map((clause, i) => <option key={clause.name} value={i}>{clause.name}</option>)}*/}
      {/*</select>*/}
      {getWidget("clauseParameters.argInput")}
      {/*{getWidget("clauseParameters.xpubInput")}*/}
      {/*{getWidget("clauseParameters.path1.pathInput")}*/}
      {/*{getWidget("clauseParameters.path2.pathInput")}*/}
    </section>
  )
}

export default connect(
  (state) => ({
    spendIndex: getSelectedClauseIndex(state),
    clauses: getSpendContract(state).template.clause_info,
    contractId: getSpendContractId(state)
  }),
  { setClauseIndex }
)(ClauseSelect)
