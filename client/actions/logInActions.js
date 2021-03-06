'use strict'

import assert from 'assert'
import fetch from 'isomorphic-fetch'

import { history } from './../config/history'
import { ENDPOINTS } from './../constants/endpoints'
import { 
  LOG_IN_START,
  LOG_IN_SUCCESS,
  LOG_IN_ERROR 
} from './../constants/actionTypes'
import * as ERRORS from './../constants/errorTypes'

import { setAppError, unsetAppError } from './appErrorActions'
import { fJSON, fPost, handleUnauthorized } from './../utils/api'


// LOG_IN Action Creators

function logInStart(data) {
  return {
    type: LOG_IN_START,
    payload: data
  }
}

function logInSuccess(data) {
  return {
    type: LOG_IN_SUCCESS,
    payload: data
  }
}

function logInError(err) {
  return {
    type: LOG_IN_ERROR,
    payload: err,
    error: true
  }
}

export function logIn(pendingUser) {
  const body = {
    email: pendingUser.email,
    password: pendingUser.password
  }

  return (dispatch) => {
    dispatch(logInStart(pendingUser))
    dispatch(unsetAppError(ERRORS.LOG_IN))

    return fPost(ENDPOINTS.LOG_IN, body)
      .then(fJSON)
      .then((data) => {
        dispatch(logInSuccess(data.payload))
        history.push('/investments')
      })
      .catch(handleUnauthorized(dispatch))
      .catch((err) => {
        dispatch(logInError(err.payload))
        dispatch(setAppError(err.payload, ERRORS.LOG_IN))
      })
  }
}
