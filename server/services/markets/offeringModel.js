'use strict'

import _ from 'lodash'
import mongoose from 'mongoose'


var backerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shares: [{
    count: { type: Number, required: true },
    dateBacked: { type: Date, required: true },
  }]
})


let offeringSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, required: true, default: 'open' },
  filled: { type: Number, required: true },
  remaining: { type: Number, required: true },
  dateOpened: { type: Date, required: true },
  dateClosed: { type: Date },
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
    return {
      property: this.property,
      addedBy: this.addedBy,
      price: this.price,
      quantity: this.quantity,
      status: this.status,
      filled: this.filled,
      remaining: this.remaining,
      dateOpened: this.dateOpened,
      dateClosed: this.dateClosed,
      backers: this.backers,
      id: this._id
    }
  }
}


offeringSchema.index({ 'property': 1 })
offeringSchema.index({ 'addedBy': 1 })

let Offering = mongoose.serviceDb.model('Offering', offeringSchema)

module.exports = Offering
