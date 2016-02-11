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

function signUpStart(data) {
  return {
    type: SIGN_UP_START,
    payload: data.email
  }
}

function signUpSuccess(data) {
  return {
    type: SIGN_UP_SUCCESS,
    payload: data.user
  }
}

function signUpError(err) {
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
      .then((data) => {
        dispatch(signUpSuccess(data.payload))
        history.push('/login')
      })
      .catch((err) => {
        dispatch(signUpError(err.payload))
        dispatch(setAppError(err.payload, ERRORS.SIGN_UP))
      })
  }
}
