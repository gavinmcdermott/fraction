'use strict'

// Globals
import React from 'react'
import ReactDOM from 'react-dom'
import { Router } from 'react-router'
import { Provider } from 'react-redux'
import { syncReduxAndRouter, routeReducer } from 'redux-simple-router'
import thunkMiddleware from 'redux-thunk'
import { reducer as formReducer } from 'redux-form';
import { combineReducers, createStore, applyMiddleware } from 'redux'

import { history } from './config/history'
import getRoutes from './config/routes'
import currentUserReducer from './reducers/currentUserReducers'
import appErrorReducer from './reducers/appErrorReducers'

const appReducer = combineReducers({
  form: formReducer,
  appErrors: appErrorReducer,
  currentUser: currentUserReducer,
  routing: routeReducer
})

const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware
)(createStore)

const appStore = createStoreWithMiddleware(appReducer)

syncReduxAndRouter(history, appStore)

ReactDOM.render(
  <Provider store={ appStore }>
    <Router history={ history }>
      { getRoutes(appStore) }
    </Router>
  </Provider>, 
  document.getElementById('root')
)


// TEMP APP NOTES: 
// To use for error logs:
// use this: https://getsentry.com/welcome/

// Components and composition
// https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0
// https://github.com/rackt/redux-simple-router/blob/1.0.2/examples/basic/app.js

// FSA
// https://github.com/acdlite/flux-standard-action

// routing
// https://github.com/rackt/react-router/blob/master/docs/guides/advanced/NavigatingOutsideOfComponents.md