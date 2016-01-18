'use strict'

import _ from 'lodash'
import { combineReducers } from 'redux'
import { SET_APP_ERROR, UNSET_APP_ERROR } from './../constants/actionTypes'


const placeholderAppErrors = []

export function errors(state=placeholderAppErrors, action) {
  let errorType
  let newErrors = _.cloneDeep(state)

  switch (action.type) {
    case SET_APP_ERROR:
      newErrors.unshift(action.payload)
      return newErrors
    case UNSET_APP_ERROR:
      errorType = action.payload.type
      return _.filter(newErrors, (error) => {
        return error.type !== errorType
      })
    default:
      return newErrors
  }
}

// const rootReducer = combineReducers({
//   errors
// })

export default errors
