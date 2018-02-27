import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import DocumentTitle from 'react-document-title'
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

import './static/playground.css'

// ivy imports
import app from './app'
import Lock from './templates/components/lock'

interface ExtensionWindow extends Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any
}

const composeEnhancers =
  (window as ExtensionWindow).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(
  reducer,
  composeEnhancers(
    applyMiddleware(thunk)
  )
)

render(
  <Provider store={store}>
    <DocumentTitle title='Ivy Editor'>
      <Router>
        <app.components.Root>
          <Route exact={true} path={'/'} component={Lock}/>
          <Route path={'/unlock'} component={LockedValue}/>
        </app.components.Root>
      </Router>
    </DocumentTitle>
  </Provider>,
  document.getElementById('root')
)
