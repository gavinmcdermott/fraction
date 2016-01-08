'use strict'

// Globals
import React from 'react'
import ReactDOM from 'react-dom'
import Routes from './config/routes'
import { Router, BrowserHistory } from 'react-router'
import { createHistory } from 'history'


// import { Provider } from 'react-redux'
// import { createStore, combineReducers } from 'redux'


ReactDOM.render(
  <Router history={ createHistory() }>{ Routes }</Router>, 
  document.getElementById('root')
);
