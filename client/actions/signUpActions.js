'use strict'

import fetch from 'isomorphic-fetch'

import { URL } from './../constants/api'
import { SIGN_UP_START,
         SIGN_UP_SUCCESS,
         SIGN_UP_ERROR } from './../constants/actionTypes'
import { CURRENT_USER_ERROR } from './../constants/errorTypes'

import { setAppError, unsetAppError } from './appErrorActions'
import handleJSON from './../utils/api'


// Action Creators

export function signUpStart(newUser) {
  return {
    type: SIGN_UP_START,
    payload: newUser.email
  }
}

export function signUpSuccess(newUser) {
  return {
    type: SIGN_UP_SUCCESS,
    payload: newUser
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
  return (dispatch) => {
    dispatch(signUpStart(newUser))
    dispatch(unsetAppError(CURRENT_USER_ERROR))

    return window.fetch(URL.SIGN_UP, {
      method: 'post',
      body: {
        email: newUser.email,
        password: newUser.password
      }
    })
    .then(handleJSON)
    .then((newUser) => {
      dispatch(signUpSuccess(newUser))
    })
    .catch((err) => {
      dispatch(signUpError(err))
      dispatch(setAppError(err, CURRENT_USER_ERROR))
    })
  }
}
