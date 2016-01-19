'use strict'

import fetch from 'isomorphic-fetch'

import { ENDPOINTS } from './../constants/endpoints'
import { 
  SIGN_UP_START,
  SIGN_UP_SUCCESS,
  SIGN_UP_ERROR 
} from './../constants/actionTypes'
import * as ERRORS from './../constants/errorTypes'

import { setAppError, unsetAppError } from './appErrorActions'
import { fJSON, fPost } from './../utils/api'
import { history } from './../config/history'

// SIGN_UP Action Creators

export function signUpStart(data) {
  return {
    type: SIGN_UP_START,
    payload: data.email
  }
}

export function signUpSuccess(data) {
  return {
    type: SIGN_UP_SUCCESS,
    payload: data.user
  }
}

export function signUpError(err) {
  return {
    type: SIGN_UP_ERROR,
    payload: err,
    error: true
  }
}

export function signUp(newUser) {
  const body = {
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    email: newUser.email,
    password: newUser.password
  }

  return (dispatch) => {
    dispatch(signUpStart(newUser))
    dispatch(unsetAppError(ERRORS.SIGN_UP))

    return fPost(ENDPOINTS.SIGN_UP, body)
    .then(fJSON)
    .then((newUser) => {
      dispatch(signUpSuccess(newUser))
      history.replaceState(null, '/login')
    })
    .catch((err) => {
      dispatch(signUpError(err))
      dispatch(setAppError(err, ERRORS.SIGN_UP))
    })
  }
}
