// external imports
import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

// ivy imports
import { prefixRoute } from '../../core'
import {setlang} from "../actions"

const logo = require('../../static/images/logo.svg')

const mapStateToProps = (state) => {
  const location = state.routing.location
  const lang = state.lang
  const pathnames = location.pathname.split("/")
  return { path: pathnames[1], lang }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setlang: (e) => {
      e.preventDefault()
      dispatch(setlang(e.target.dataset.value.toString()))
    }
  }
}

const Navbar = (props: { path: string , lang: string, setlang: (e)=>undefined}) => {
  return (
    <nav className="navbar navbar-dark bg-dark navbar-static-top fixed-top navbar-expand-md">
      <div className="container fixedcontainer">
        <div className="navbar-header">
          <a className="navbar-brand" href={prefixRoute('/')}>
            <img src={logo} />
          </a>
        </div>
        <ul className="nav navbar-nav ml-auto">
          <li className={`nav-item ${props.path === 'unlock' ? '' : 'active'}`} ><Link className="nav-link" to={prefixRoute('/')}>{props.lang === 'zh'? '合约锁定':'Lock Value'}</Link></li>
          <li className={`nav-item ${props.path === 'unlock' ? 'active' : ''}`} ><Link className="nav-link" to={prefixRoute('/unlock')}>{props.lang === 'zh'? '合约解锁':'Unlock Value'}</Link></li>

          <li className=" nav-item dropdown">
            <a href="#" className="dropdown-toggle nav-link" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
              {props.lang === 'zh'? '中文': 'English'} <span className="caret"></span>
            </a>
            <ul className="dropdown-menu">
              <li className="dropdown-item"><a href="#" data-value='en' onClick={props.setlang}>English</a></li>
              <li className="dropdown-item"><a href="#" data-value='zh' onClick={props.setlang}>中文</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Navbar)
