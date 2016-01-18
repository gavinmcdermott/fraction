'use strict'

// Globals
import React from 'react'
import ReactDOM from 'react-dom'
import Routes from './config/routes'
import { Router } from 'react-router'
import { Provider } from 'react-redux'
import { createHistory } from 'history'
import { syncReduxAndRouter, routeReducer } from 'redux-simple-router'
import thunkMiddleware from 'redux-thunk'
import { reducer as formReducer } from 'redux-form';

import currentUserReducer from './reducers/currentUserReducers'
import appErrorReducer from './reducers/appErrorReducers'
import { attemptSignUp } from './actions/signUpActions'


import { compose, combineReducers, createStore, applyMiddleware } from 'redux'




let reducer = combineReducers({
  form: formReducer,
  appErrors: appErrorReducer,
  currentUser: currentUserReducer,
  routing: routeReducer
})



const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware // lets us dispatch() functions
)(createStore)


const store = createStoreWithMiddleware(reducer)
const history = createHistory()


syncReduxAndRouter(history, store)


ReactDOM.render(
  <Provider store={ store }>
    <Router history={ history }>
      { Routes }
    </Router>
  </Provider>, 
  document.getElementById('root')
)



// use sentry: https://getsentry.com/welcome/
// Regarding smart and dumb components
// https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0

// https://github.com/rackt/redux-simple-router/blob/1.0.2/examples/basic/app.js