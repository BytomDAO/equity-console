// external imports
import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

// ivy imports
import { prefixRoute } from '../../core'

const logo = require('../../static/images/logo.svg')

const mapStateToProps = (state) => {
  const location = state.routing.location
  const pathnames = location.pathname.split("/")
  return { path: pathnames[1] }
}

const Navbar = (props: { path: string }) => {
  return (
    <nav className="navbar navbar-inverse navbar-static-top navbar-fixed-top">
      <div className="container fixedcontainer">
        <div className="navbar-header">
          <a className="navbar-brand" href={prefixRoute('/')}>
            <img src={logo} />
          </a>
        </div>
        <ul className="nav navbar-nav navbar-right">
          <li className={props.path === 'unlock' ? '' : 'active'} ><Link to={prefixRoute('/')}>Lock Value</Link></li>
          <li className={props.path === 'unlock' ? 'active' : ''} ><Link to={prefixRoute('/unlock')}>Unlock Value</Link></li>
        </ul>
      </div>
    </nav>
  )
}

export default connect(
  mapStateToProps
)(Navbar)
