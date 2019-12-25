// external imports
import * as React from 'react'
import { connect } from 'react-redux'

// internal imports
import { spend } from '../actions'
import { areSpendInputsValid, getIsCalling } from '../selectors'

const mapStateToProps = (state) => ({
  isCalling: getIsCalling(state),
  lang: state.lang
})

const mapDispatchToProps = (dispatch) => ({
  handleSpendClick() {
    dispatch(spend())
  }
})

const UnlockButton = (props: {isCalling: boolean, lang: string, handleSpendClick: (e)=>undefined} ) => {
  return <button className="btn btn-primary btn-lg form-button"
                 disabled={props.isCalling}
                 onClick={props.handleSpendClick}> {props.lang==='zh'?'解锁存证方':'Unlock Value'}</button>
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UnlockButton)
