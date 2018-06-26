// external imports
import * as React from 'react'
import { connect } from 'react-redux'

// internal imports
import { areSpendInputsValid, getIsCalling } from '../selectors'

const mapStateToProps = (state) => ({
  isCalling: getIsCalling(state)
})

const mapDispatchToProps = (dispatch) => ({
  handleSpendClick() {
    window.console.log('spend')
  }
})

const UnlockButton = (props: {isCalling: boolean, handleSpendClick: (e)=>undefined} ) => {
  return <button className="btn btn-primary btn-lg form-button"
                 disabled={props.isCalling}
                 onClick={props.handleSpendClick}>Unlock Value</button>
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UnlockButton)
