'use strict'

import assert from 'assert'
import moment from 'moment'
import _ from 'lodash'

import storage from './../vendor/store'
import { AUTH_TOKEN } from './../constants/storageKeys'
import { history } from './../config/history'

import * as logOutActions from './../actions/logOutActions'


const STATUS_UNAUTHORIZED = 401


export function fJSON(response) {
  assert(_.isObject(response))
  return response.json()
    .catch((err) => {
      const formattedError = {
        message: 'Unexpected network error',
        status: response.status
      }
      return Promise.reject(formattedError)
    })
    .then((json) => {
      if (!response.ok) {
        return Promise.reject({ payload: json, response })
      }
      return Promise.resolve({ payload: json, response })
    })
}

export function fPost(url, body={}) {
  assert(_.isString(url))
  return window.fetch(url, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + storage.get(AUTH_TOKEN)
    },
    body: JSON.stringify(body)
  })
}

export function fGet(url) {
  assert(_.isString(url))
  return window.fetch(url, {
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + storage.get(AUTH_TOKEN)
    }
  })
}

export function handleUnauthorized(dispatch) {
  assert(_.isFunction(dispatch))
  return (data) => {
    assert(data.payload)
    assert(data.response)
    let status = data.response.status
    // if the status is a 401, the token is invalid or the user
    // is not longer authorized to take some action - log them out
    if (status === STATUS_UNAUTHORIZED) {
      dispatch(logOutActions.logOut())
      return Promise.resolve(data)
    }
    // otherwise just pass the rejected promise through to the 
    // awaiting error handler
    return Promise.reject(data)
  }
}

export function useCacheFrom(dataStore) {
  assert(_.isObject(dataStore))
  let now = moment()
  let interval = dataStore.cacheInvalidationInterval
  let lastUpdated = dataStore.lastUpdated
  if (!lastUpdated || !interval) {
    return false
  }
  return now.diff(lastUpdated) < interval
}
