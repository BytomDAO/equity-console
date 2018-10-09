import * as React from 'react'
import { connect } from 'react-redux'

import {loadTemplate, showLockInputMessages} from '../actions'

import { INITIAL_ID_CHINESE_LIST } from '../constants'

const mapStateToProps = (state) => {
  return {
    idList: state.templates.idList,
    lang: state.lang
  }
}

const mapDispatchToProps = (dispatch) => ({
  handleClick: (e, id: string): void => {
    e.preventDefault()
    dispatch(loadTemplate(id))
  }
})

const LoadTemplate = ({idList, handleClick, lang}) => {
  const options = idList.slice(1).map(id => {
    return <li className="dropdown-item" key={id}><a onClick={(e) => handleClick(e, id)} href='#'>{lang ==='zh'?INITIAL_ID_CHINESE_LIST[id]:id}</a></li>
  })
  return (
    <div className="dropdown">
      <button className="btn btn-primary dropdown-toggle"
              type="button" id="dropdownMenu1"
              data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
        <span className="glyphicon glyphicon-open"></span>
        {lang ==='zh'? '加载模版' : 'Load'}
      </button>
      <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
        {options}
      </ul>
    </div>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadTemplate)
