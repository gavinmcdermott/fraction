'use strict'

import _ from 'lodash'
import assert from 'assert'
import fetch from 'isomorphic-fetch'

import { ENDPOINTS } from './../constants/endpoints'
import { 
  FETCH_CURRENT_USER_START,         
  FETCH_CURRENT_USER_SUCCESS,
  FETCH_CURRENT_USER_ERROR 
} from './../constants/actionTypes'
import * as ERRORS from './../constants/errorTypes'

import { setAppError, unsetAppError } from './appErrorActions'
import { fJSON, fGet, handleUnauthorized } from './../utils/api'


// FETCH_CURRENT_USER Action Creators

function fetchCurrentUserStart() {
  return {
    type: FETCH_CURRENT_USER_START
  }
}

function fetchCurrentUserSuccess(data) {
  return {
    type: FETCH_CURRENT_USER_SUCCESS,
    payload: data
  }
}

function fetchCurrentUserError(err) {
  return {
    type: FETCH_CURRENT_USER_ERROR,
    payload: err,
    error: true
  }
}

export function fetchCurrentUser() {
  return (dispatch) => {
    const fetchUrl = ENDPOINTS.USERS + '/me'

    dispatch(fetchCurrentUserStart())
    dispatch(unsetAppError(ERRORS.FETCH_CURRENT_USER))

    return fGet(fetchUrl)
      .then(fJSON)
      .then((data) => {
        dispatch(fetchCurrentUserSuccess(data.payload))
      })
      .catch(handleUnauthorized(dispatch))
      .catch((err) => {
        dispatch(fetchCurrentUserError(err.payload))
        dispatch(setAppError(err.payload, ERRORS.FETCH_CURRENT_USER))
      })
  }
}
