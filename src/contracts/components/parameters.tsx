import * as React from 'react'
import { connect } from 'react-redux'

function mapStateToContractValueProps(state) {
  return {
    valueId: null
  }
}

export const ContractValue = connect(
  mapStateToContractValueProps
)(ContractValueUnconnected)

function ContractValueUnconnected(props: { valueId: string }) {
  if (props.valueId === undefined) {
    return <div></div>
  }
  return (
    <section style={{wordBreak: 'break-all'}}>
      <form className="form">
        <div className="argument">hello world</div>
      </form>
    </section>
  )
}
