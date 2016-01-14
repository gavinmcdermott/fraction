'use strict'

// Globals
import React from 'react'
import ReactDOM from 'react-dom'
import Routes from './config/routes'
import { Router, BrowserHistory } from 'react-router'
import { Provider } from 'react-redux'
import { createHistory } from 'history'

import thunkMiddleware from 'redux-thunk'

import rootReducer from './auth/reducers/signUpReducers'
import { attemptSignUp } from './auth/actions/signUpActions'


// import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'

const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware, // lets us dispatch() functions
)(createStore)

const store = createStoreWithMiddleware(rootReducer)



// store.dispatch(attemptSignUp({ email: 'sdf', password: 'dsfsd' }))





ReactDOM.render(
  <Provider store={ store }>
    <Router history={ createHistory() }>
      { Routes }
    </Router>
  </Provider>, 
  document.getElementById('root')
);

