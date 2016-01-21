'use strict'

import fetch from 'isomorphic-fetch'

import { ENDPOINTS } from './../constants/endpoints'
import { 
  LOG_OUT_START,
  LOG_OUT_SUCCESS,
  LOG_OUT_ERROR 
} from './../constants/actionTypes'
import * as ERRORS from './../constants/errorTypes'

import { setAppError, unsetAppError } from './appErrorActions'
import { fJSON, fPost } from './../utils/api'
import { history } from './../config/history'


// LOG_OUT Action Creators

export function logOutStart() {
  return {
    type: LOG_OUT_START
  }
}

export function logOutSuccess(data) {
  return {
    type: LOG_OUT_SUCCESS,
    payload: data
  }
}

export function logOutError(err) {
  return {
    type: LOG_OUT_ERROR,
    payload: err,
    error: true
  }
}

export function logOut() {
  return (dispatch) => {
    console.log('triggered!')
    dispatch(logOutStart())
    dispatch(unsetAppError(ERRORS.LOG_OUT))

    return fPost(ENDPOINTS.LOG_OUT)
    .then(fJSON)
    .then((data) => {
      dispatch(logOutSuccess(data))
      history.push('/')
    })
    .catch((err) => {
      dispatch(logOutError(err))
      dispatch(setAppError(err, ERRORS.LOG_OUT))
    })
  }
}
