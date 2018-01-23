import React from "react"
import { render } from "react-dom"
import { Provider } from "react-redux"
import reducer from './app/reducer'
import {
  applyMiddleware,
  compose,
  createStore
} from "redux"
import thunk from "redux-thunk"

import './static/playground.css'

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
    <p>hello world</p>
  </Provider>,
  document.getElementById("root")
)
