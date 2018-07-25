import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { ConnectedRouter, routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'
import DocumentTitle from 'react-document-title'
import persistState from 'redux-localstorage'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
import reducer from './app/reducer'
import {
  applyMiddleware,
  compose,
  createStore,
} from 'redux'
import thunk from 'redux-thunk'
import LockedValue from './contracts/components/lockedValue'

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css'
import './static/playground.css'

// ivy imports
import app from './app'
import Lock from './templates/components/lock'
import templates from './templates'
import { prefixRoute } from './core'

import Unlock from './contracts/components/unlock'


interface ExtensionWindow extends Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any
}

const composeEnhancers =
  (window as ExtensionWindow).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const history = createHistory()
const store = createStore(
  reducer,
  composeEnhancers(
    applyMiddleware(thunk),
    applyMiddleware(routerMiddleware(history))
    ,persistState()
  )
)

const selected = templates.selectors.getSelectedTemplate(store.getState())
store.dispatch(templates.actions.loadTemplate(selected))

store.dispatch(app.actions.seed())

render(
  <Provider store={store}>
    <DocumentTitle title='Equity Contract'>
      <ConnectedRouter history={history}>
        <app.components.Root>
          <Route exact={true} path={prefixRoute('/')} component={Lock} />
          <Route exact path={prefixRoute('/unlock')}  component={LockedValue} />
          <Route path={prefixRoute('/unlock/:contractId')} component={Unlock} />
        </app.components.Root>
      </ConnectedRouter>
    </DocumentTitle>
  </Provider>,
  document.getElementById('root')
)
