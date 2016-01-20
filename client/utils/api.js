'use strict'

import assert from 'assert'
import _ from 'lodash'
import storage from './../vendor/store'
import { AUTH_TOKEN } from './../constants/storageKeys'


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
        return Promise.reject(json)
      }
      return Promise.resolve(json)
    })
}

export function fPost(url, body) {
  assert(_.isString(url))
  assert(_.isObject(body))
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
