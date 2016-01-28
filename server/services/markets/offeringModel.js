'use strict'

import _ from 'lodash'
import mongoose from 'mongoose'


var backerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shares: [{
    count: { type: Number, required: true },
    dateBacked: { type: Date, required: true },
  }]
})


let offeringSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, required: true },
  filled: { type: Boolean, required: true },
  remaining: { type: Number, required: true },
  dateOpened: { type: Date, required: true },
  dateClosed: { type: Date, required: true },
  backers: [ backerSchema ]
})


offeringSchema.statics = {
  status: {
    open: 'open',
    closed: 'closed'
  }
}


offeringSchema.methods = {
  toPublicObject: function() {
    let publicObj = Object.assign({}, this)
    // clean up the id
    delete publicObj._id
    publicObj.id = this._id
    // return the sanitized object
    return publicObj
  }
}


offeringSchema.index({ 'property': 1 })
offeringSchema.index({ 'addedBy': 1 })

let Offering = mongoose.serviceDb.model('Offering', offeringSchema)

module.exports = Offering
