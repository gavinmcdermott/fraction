'use strict'

import assert from 'assert'
import fetch from 'isomorphic-fetch'

import { ENDPOINTS } from './../constants/endpoints'
import { 
  LOG_IN_START,
  LOG_IN_SUCCESS,
  LOG_IN_ERROR 
} from './../constants/actionTypes'
import * as ERRORS from './../constants/errorTypes'

import { setAppError, unsetAppError } from './appErrorActions'
import { fJSON, fPost } from './../utils/api'


// LOG_IN Action Creators

export function logInStart(data) {
  return {
    type: LOG_IN_START,
    payload: data.email
  }
}

export function logInSuccess(data) {
  return {
    type: LOG_IN_SUCCESS,
    payload: data
  }
}

export function logInError(err) {
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
      .then((currentUser) => {
        dispatch(logInSuccess(currentUser))
      })
      .catch((err) => {
        dispatch(logInError(err))
        dispatch(setAppError(err, ERRORS.LOG_IN))
      })
  }
}
