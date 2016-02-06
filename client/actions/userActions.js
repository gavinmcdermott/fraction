'use strict'

import _ from 'lodash'
import assert from 'assert'
import fetch from 'isomorphic-fetch'

import { ENDPOINTS } from './../constants/endpoints'
import { 
  CURRENT_USER_FETCH_START,         
  CURRENT_USER_FETCH_SUCCESS,
  CURRENT_USER_FETCH_ERROR 
} from './../constants/actionTypes'
import * as ERRORS from './../constants/errorTypes'

import { setAppError, unsetAppError } from './appErrorActions'
import { fJSON, fGet, handleUnauthorized } from './../utils/api'


// CURRENT_USER_FETCH Action Creators

export function currentUserFetchStart() {
  return {
    type: CURRENT_USER_FETCH_START
  }
}

export function currentUserFetchSuccess(data) {
  return {
    type: CURRENT_USER_FETCH_SUCCESS,
    payload: data
  }
}

export function currentUserFetchError(err) {
  return {
    type: CURRENT_USER_FETCH_ERROR,
    payload: err,
    error: true
  }
}

export function currentUserFetch() {
  return (dispatch) => {
    const fetchUrl = ENDPOINTS.USER_FETCH + '/me'

    dispatch(currentUserFetchStart())
    dispatch(unsetAppError(ERRORS.CURRENT_USER_FETCH))

    return fGet(fetchUrl)
      .then(fJSON)
      .then((data) => {
        dispatch(currentUserFetchSuccess(data.payload))
      })
      .catch(handleUnauthorized(dispatch))
      .catch((err) => {
        dispatch(currentUserFetchError(err.payload))
        dispatch(setAppError(err.payload, ERRORS.CURRENT_USER_FETCH))
      })
  }
}
